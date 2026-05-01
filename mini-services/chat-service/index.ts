// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote Chat Service — Live Support via Telegram
// ─────────────────────────────────────────────────────────────────────────────
// This service handles:
// 1. WebSocket connections from web chat widget
// 2. Message persistence in SQLite database
// 3. Forwarding user messages to admin via Telegram bot
// 4. Receiving admin replies from Telegram and forwarding to users
// 5. Online/offline admin status tracking
//
// Port: 3011
//
// Architecture:
//   Web User → WebSocket → Chat Service → Telegram Bot API → Admin
//   Admin → Telegram → Webhook → Chat Service → WebSocket → Web User
//
// Reply Routing:
//   - When admin replies to a specific message in Telegram (using native
//     reply feature), the service looks up which user session it belongs to
//   - When admin sends a new message without replying, it goes to the last
//     active user session
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

const PORT = 3011;
const SUPPORT_BOT_TOKEN = process.env.TELEGRAM_SUPPORT_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

// Admin is considered "online" if they sent a reply within this time
const ADMIN_ONLINE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// Active WebSocket connections keyed by session ID
const clients = new Map<string, WebSocket>();

// Telegram message_id → chat sessionId (for reply routing)
const telegramMsgToSession = new Map<number, string>();

// Track admin last activity (timestamp of last admin message)
let adminLastActivity = 0;

// Last session that sent a message (fallback for admin messages without reply_to)
let lastActiveSession = '';

// Store session metadata when connecting
interface ClientData {
  sessionId: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
}

// Attach data to WebSocket instances (Bun allows arbitrary properties)
declare module 'bun' {
  interface WebSocket {
    data?: ClientData;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAdminOnline(): boolean {
  return SUPPORT_BOT_TOKEN !== '' && Date.now() - adminLastActivity < ADMIN_ONLINE_TIMEOUT_MS;
}

function sendToClient(sessionId: string, payload: Record<string, unknown>) {
  const ws = clients.get(sessionId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastAdminStatus() {
  const online = isAdminOnline();
  const status = { type: 'status', adminOnline: online };
  for (const [sessionId] of clients) {
    sendToClient(sessionId, status);
  }
}

// ---------------------------------------------------------------------------
// Telegram Bot API
// ---------------------------------------------------------------------------

const TELEGRAM_API = SUPPORT_BOT_TOKEN
  ? `https://api.telegram.org/bot${SUPPORT_BOT_TOKEN}`
  : '';

async function sendToTelegram(
  text: string,
  replyToMessageId?: number
): Promise<number | null> {
  if (!TELEGRAM_API || !ADMIN_CHAT_ID) return null;

  try {
    const body: Record<string, unknown> = {
      chat_id: ADMIN_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    if (replyToMessageId) {
      body.reply_to_message_id = replyToMessageId;
    }

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.ok) {
      return data.result.message_id as number;
    }
    console.error('[Chat] Telegram API error:', data.description);
    return null;
  } catch (err) {
    console.error('[Chat] Failed to send to Telegram:', err);
    return null;
  }
}

function formatUserMessageForTelegram(
  name: string,
  email: string | null,
  sessionShort: string,
  text: string
): string {
  let header = `👤 <b>${escapeHtml(name)}</b>`;
  if (email) header += `\n📧 ${escapeHtml(email)}`;
  header += `\n🔐 <code>${sessionShort}</code>`;
  return `${header}\n\n${escapeHtml(text)}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// Telegram Webhook Handler
// ---------------------------------------------------------------------------

async function handleTelegramUpdate(update: Record<string, unknown>) {
  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return;

  // Only process messages from the configured admin chat
  const chat = message.chat as Record<string, unknown> | undefined;
  if (!chat) return;
  if (String(chat.id) !== String(ADMIN_CHAT_ID)) {
    console.log(`[Chat] Ignored message from chat ${chat.id} (admin is ${ADMIN_CHAT_ID})`);
    return;
  }

  const text = message.text as string | undefined;
  if (!text) return;

  // Update admin activity timestamp
  adminLastActivity = Date.now();

  // Determine target session
  let targetSession = '';

  const replyTo = message.reply_to_message as Record<string, unknown> | undefined;
  if (replyTo) {
    // Admin replied to a specific message → route to that user's session
    const repliedMsgId = replyTo.message_id as number;
    targetSession = telegramMsgToSession.get(repliedMsgId) || '';
    if (!targetSession) {
      console.warn(`[Chat] No session found for replied message ${repliedMsgId}`);
    }
  } else {
    // No reply context → route to last active session
    targetSession = lastActiveSession;
  }

  if (!targetSession) {
    console.warn('[Chat] No target session for admin reply');
    return;
  }

  // Save admin message to database
  try {
    await db.chatMessage.create({
      data: {
        sessionId: targetSession,
        sender: 'admin',
        message: text,
        senderName: 'Support Team',
        isAdminRead: true,
      },
    });
  } catch (err) {
    console.error('[Chat] Failed to save admin message:', err);
  }

  // Forward to user via WebSocket
  sendToClient(targetSession, {
    type: 'message',
    sender: 'admin',
    message: text,
    timestamp: new Date().toISOString(),
  });

  // Broadcast updated online status to all clients
  broadcastAdminStatus();

  console.log(`[Chat] Admin reply → session ${targetSession.substring(0, 8)}: ${text.substring(0, 50)}`);
}

// ---------------------------------------------------------------------------
// HTTP + WebSocket Server
// ---------------------------------------------------------------------------

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);

    // ── WebSocket Upgrade ──
    if (req.headers.get('upgrade') === 'websocket') {
      const sessionId = url.searchParams.get('sessionId') || crypto.randomUUID();
      const userId = url.searchParams.get('userId') || null;
      const userName = url.searchParams.get('userName') || 'Anonymous';
      const userEmail = url.searchParams.get('userEmail') || null;

      const clientData: ClientData = { sessionId, userId, userName, userEmail };

      // Upgrade the request to WebSocket — clientData is passed to ws.data
      if (server.upgrade(req, { data: clientData })) {
        return; // upgrade successful, websocket.open() will be called next
      }
      return new Response('WebSocket upgrade failed', { status: 500 });
    }

    // ── Health Check ──
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'beautyvote-chat-service',
        activeConnections: clients.size,
        adminOnline: isAdminOnline(),
        telegramConfigured: !!SUPPORT_BOT_TOKEN,
      });
    }

    // ── Get Chat History ──
    if (url.pathname === '/history' && req.method === 'GET') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        return Response.json({ error: 'sessionId required' }, { status: 400 });
      }

      try {
        const messages = await db.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: 'asc' },
          take: 100,
          select: {
            id: true,
            sender: true,
            message: true,
            senderName: true,
            createdAt: true,
          },
        });

        // Mark admin messages as read (user opened the chat)
        await db.chatMessage.updateMany({
          where: { sessionId, sender: 'admin', isUserRead: false },
          data: { isUserRead: true },
        });

        return Response.json({
          messages: messages.map((m) => ({
            ...m,
            timestamp: m.createdAt.toISOString(),
          })),
        });
      } catch (err) {
        console.error('[Chat] Failed to fetch history:', err);
        return Response.json({ error: 'Failed to fetch history' }, { status: 500 });
      }
    }

    // ── Get Unread Count ──
    if (url.pathname === '/unread' && req.method === 'GET') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        return Response.json({ error: 'sessionId required' }, { status: 400 });
      }

      try {
        const count = await db.chatMessage.count({
          where: { sessionId, sender: 'admin', isUserRead: false },
        });
        return Response.json({ unread: count });
      } catch (err) {
        return Response.json({ unread: 0 });
      }
    }

    // ── Mark Messages as Read ──
    if (url.pathname === '/read' && req.method === 'POST') {
      try {
        const body = await req.json();
        await db.chatMessage.updateMany({
          where: { sessionId: body.sessionId, sender: 'admin', isUserRead: false },
          data: { isUserRead: true },
        });
        return Response.json({ ok: true });
      } catch {
        return Response.json({ ok: true });
      }
    }

    // ── Telegram Webhook ──
    if (url.pathname === '/telegram-webhook' && req.method === 'POST') {
      try {
        const update = await req.json() as Record<string, unknown>;
        // Process asynchronously to respond quickly
        handleTelegramUpdate(update).catch((err) => {
          console.error('[Chat] Webhook handler error:', err);
        });
        return Response.json({ ok: true });
      } catch {
        return Response.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
      }
    }

    // ── Set Telegram Webhook (admin utility) ──
    if (url.pathname === '/set-webhook' && req.method === 'POST') {
      try {
        const body = await req.json();
        const webhookUrl = body.webhookUrl;
        if (!webhookUrl) {
          return Response.json({ error: 'webhookUrl required' }, { status: 400 });
        }

        const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ['message'],
          }),
        });
        const data = await res.json();
        return Response.json(data);
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 500 });
      }
    }

    // ── Get Webhook Info ──
    if (url.pathname === '/webhook-info' && req.method === 'GET') {
      try {
        const res = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
        const data = await res.json();
        return Response.json(data);
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 500 });
      }
    }

    return new Response('BeautyVote Chat Service', { status: 404 });
  },

  websocket: {
    open(ws) {
      const clientData = ws.data;
      if (clientData) {
        clients.set(clientData.sessionId, ws);
        lastActiveSession = clientData.sessionId;
        console.log(`[Chat] Connected: ${clientData.sessionId.substring(0, 8)} (${clientData.userName})`);

        // Send admin online status
        setTimeout(() => {
          sendToClient(clientData.sessionId, {
            type: 'status',
            adminOnline: isAdminOnline(),
          });
        }, 50);
      }
    },

    async message(ws, rawMessage) {
      try {
        const data = JSON.parse(rawMessage.toString());
        const clientData = ws.data;
        if (!clientData) return;

        if (data.type === 'message') {
          const text = (data.message as string)?.trim();
          if (!text || text.length > 2000) return;

          // Save to database
          const savedMsg = await db.chatMessage.create({
            data: {
              sessionId: clientData.sessionId,
              userId: clientData.userId || null,
              sender: 'user',
              message: text,
              senderName: clientData.userName || 'Anonymous',
              senderEmail: clientData.userEmail || null,
            },
          });

          // Forward to admin via Telegram
          const sessionShort = clientData.sessionId.substring(0, 8);
          const telegramText = formatUserMessageForTelegram(
            clientData.userName || 'Anonymous',
            clientData.userEmail,
            sessionShort,
            text
          );

          const telegramMsgId = await sendToTelegram(telegramText);

          // Store telegram message ID mapping for reply routing
          if (telegramMsgId) {
            telegramMsgToSession.set(telegramMsgId, clientData.sessionId);
            await db.chatMessage.update({
              where: { id: savedMsg.id },
              data: { telegramMessageId: telegramMsgId },
            });
          }

          // Echo message back to user (confirmation)
          sendToClient(clientData.sessionId, {
            type: 'message',
            id: savedMsg.id,
            sender: 'user',
            message: text,
            timestamp: savedMsg.createdAt.toISOString(),
          });

          // Update last active session
          lastActiveSession = clientData.sessionId;
        }
      } catch (err) {
        console.error('[Chat] Message handling error:', err);
      }
    },

    close(ws, code, reason) {
      const clientData = ws.data;
      if (clientData) {
        clients.delete(clientData.sessionId);
        console.log(`[Chat] Disconnected: ${clientData.sessionId.substring(0, 8)} (${clientData.userName})`);
      } else {
        console.log(`[Chat] Disconnected (no data)`);
      }
    },
  },
});

// ---------------------------------------------------------------------------
// Custom WebSocket Upgrade Logic
// ---------------------------------------------------------------------------
// Bun doesn't have a separate upgrade handler, so we handle it in fetch().
// The server.upgrade() call is made from within the fetch handler above.
// However, since we need to pass the upgrade with data, we use a modified
// approach: intercept the upgrade in fetch().
// ---------------------------------------------------------------------------

console.log(`💬 BeautyVote Chat Service running on port ${PORT}`);
console.log(`   WebSocket: ws://localhost:${PORT}/`);
console.log(`   Health:    http://localhost:${PORT}/health`);
console.log(`   History:   http://localhost:${PORT}/history?sessionId=xxx`);
console.log(`   Webhook:   http://localhost:${PORT}/telegram-webhook`);
console.log('');
if (SUPPORT_BOT_TOKEN && ADMIN_CHAT_ID) {
  console.log(`   ✅ Telegram support bot configured (admin: ${ADMIN_CHAT_ID})`);
} else {
  console.log(`   ⚠️  Telegram support bot NOT configured`);
  console.log(`      Set TELEGRAM_SUPPORT_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID in .env`);
}
