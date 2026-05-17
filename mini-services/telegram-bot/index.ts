// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote Telegram Bot — Main Server
// ─────────────────────────────────────────────────────────────────────────────
// This is a lightweight HTTP server that:
// 1. Receives webhook calls from Telegram
// 2. Handles /start and /help commands
// 3. Sends a message with the "Open App" button (Web App URL)
//
// The bot does NOT handle authentication — that's done by the Next.js app
// via initData validation in /api/auth/telegram.
//
// Port: 3010
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: '.env' });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.TELEGRAM_WEB_APP_URL || 'https://beautyvote.app';
const PORT = 3010;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set. Please add it to your .env file.');
  console.error('   Get a token from @BotFather on Telegram.');
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ---------------------------------------------------------------------------
// Helper: Send message via Telegram API
// ---------------------------------------------------------------------------

async function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Bot] Failed to send message: ${res.status} ${err}`);
    }
  } catch (err) {
    console.error('[Bot] Error sending message:', err);
  }
}

// ---------------------------------------------------------------------------
// Web App button markup
// ---------------------------------------------------------------------------

function getWebAppButton(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        {
          text: '🌟 Open BeautyVote',
          web_app: { url: WEB_APP_URL },
        },
      ],
    ],
  };
}

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

async function handleStart(chatId: number, startParam?: string): Promise<void> {
  const welcomeMessage = `
<b>Welcome to BeautyVote! 👑</b>

Vote for your favorite contestants and help them win amazing prizes.

🎉 <b>Get started:</b> Click the button below to open the app.

You'll be automatically signed in with your Telegram account — no registration needed!

${startParam ? `\n🎁 <b>Referral:</b> You were invited by a friend! Bonus votes have been added.` : ''}

Need help? Type /help for more information.
`.trim();

  await sendMessage(chatId, welcomeMessage, getWebAppButton());
}

async function handleHelp(chatId: number): Promise<void> {
  const helpMessage = `
<b>BeautyVote Bot Help 📖</b>

<b>How to use:</b>
1️⃣ Tap <b>"Open BeautyVote"</b> to launch the app
2️⃣ You're automatically logged in via Telegram
3️⃣ Browse contestants and cast your votes
4️⃣ Share your referral link to earn bonus votes

<b>Commands:</b>
/start — Open the BeautyVote app
/help — Show this help message
/vote — Open the voting page directly
/profile — Open your profile

<b>Features:</b>
🏆 Vote for your favorites
💰 Purchase vote packages
📊 View the leaderboard
🎁 Earn referral bonuses
📱 Works inside Telegram — no extra app needed

<b>Questions?</b>
Contact us through the app's Support page.
`.trim();

  await sendMessage(chatId, helpMessage);
}

async function handleVote(chatId: number): Promise<void> {
  await sendMessage(
    chatId,
    '<b>Open the app to start voting! 🗳️</b>',
    getWebAppButton()
  );
}

async function handleProfile(chatId: number): Promise<void> {
  const profileUrl = `${WEB_APP_URL}?tg_action=profile`;
  await sendMessage(
    chatId,
    '<b>Your Profile 👤</b>\nTap below to view your profile and voting history.',
    {
      inline_keyboard: [
        [
          {
            text: '👤 My Profile',
            web_app: { url: profileUrl },
          },
        ],
      ],
    }
  );
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

async function handleUpdate(update: Record<string, unknown>): Promise<void> {
  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return;

  const chatId = message.chat as Record<string, unknown>;
  const chat_id = chatId?.id as number;
  if (!chat_id) return;

  const text = (message.text as string) || '';
  const from = message.from as Record<string, unknown> | undefined;

  console.log(`[Bot] Message from ${from?.first_name || 'Unknown'} (@${from?.username || 'n/a'}): ${text}`);

  // Extract start_param (passed when user clicks a referral link)
  const startParam = message.start_parameter as string | undefined;

  switch (text) {
    case '/start':
      await handleStart(chat_id, startParam);
      break;
    case '/help':
      await handleHelp(chat_id);
      break;
    case '/vote':
      await handleVote(chat_id);
      break;
    case '/profile':
      await handleProfile(chat_id);
      break;
    default:
      // For any other message, show the web app button
      await sendMessage(
        chat_id,
        '👆 Click the button below to open BeautyVote and start voting!',
        getWebAppButton()
      );
  }
}

// ---------------------------------------------------------------------------
// HTTP Server (for webhooks)
// ---------------------------------------------------------------------------

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'beautyvote-telegram-bot' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Webhook endpoint
    if (url.pathname === '/webhook' && req.method === 'POST') {
      try {
        const update = await req.json() as Record<string, unknown>;
        // Process webhook asynchronously (don't block the response)
        handleUpdate(update).catch((err) => {
          console.error('[Bot] Error processing update:', err);
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('[Bot] Error parsing webhook:', err);
        return new Response(JSON.stringify({ ok: false, error: 'Invalid payload' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Get webhook info
    if (url.pathname === '/webhook-info') {
      try {
        const res = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
        const data = await res.json();
        return new Response(JSON.stringify(data, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('BeautyVote Telegram Bot', { status: 404 });
  },
});

console.log(`🤖 BeautyVote Telegram Bot running on port ${PORT}`);
console.log(`   Webhook URL: http://localhost:${PORT}/webhook`);
console.log(`   Health: http://localhost:${PORT}/health`);
console.log(`   Web App URL: ${WEB_APP_URL}`);
