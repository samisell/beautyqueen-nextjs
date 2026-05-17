// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote — Live Chat Widget
// ─────────────────────────────────────────────────────────────────────────────
// Floating chat widget at bottom-right corner.
// Connects to the chat service via WebSocket for real-time messaging.
// Admin replies come through Telegram and are forwarded via the chat service.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minus, Loader2, Headphones, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_KEY = 'bv-chat-session';
const CHAT_SERVICE_PORT = 3011;

interface ChatMessageData {
  id?: string;
  type: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
}

interface StatusData {
  type: 'status';
  adminOnline: boolean;
}

type IncomingData = ChatMessageData | StatusData;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = useAuthStore((s) => s.user);

  // ── Get or create session ID ──
  const getSessionId = useCallback(() => {
    let sessionId = '';
    if (typeof window !== 'undefined') {
      sessionId = localStorage.getItem(SESSION_KEY) || '';
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
      }
    }
    return sessionId;
  }, []);

  // ── Scroll to bottom of messages ──
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Fetch unread count ──
  const fetchUnreadCount = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(
        `/unread?sessionId=${sessionId}&XTransformPort=${CHAT_SERVICE_PORT}`
      );
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Load chat history ──
  const loadHistory = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(
        `/history?sessionId=${sessionId}&XTransformPort=${CHAT_SERVICE_PORT}`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 100);
        // Mark admin messages as read
        await fetch(
          `/read?sessionId=${sessionId}&XTransformPort=${CHAT_SERVICE_PORT}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
        );
        setUnreadCount(0);
      }
    } catch {
      // ignore
    }
  }, [scrollToBottom]);

  // ── Connect to WebSocket ──
  // Using a ref to hold the connect function so onclose can call it without circular deps
  const connectRef = useRef<() => void>(() => {});
  const isOpenRef = useRef(isOpen);
  const isMinimizedRef = useRef(isMinimized);

  // Keep refs in sync
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { isMinimizedRef.current = isMinimized; }, [isMinimized]);

  const connectWebSocket = useCallback(() => {
    const sessionId = getSessionId();
    const userId = user?.id || '';
    const userName = user?.name || '';
    const userEmail = user?.email || '';

    setIsConnecting(true);

    // Build WebSocket URL through the gateway
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const params = new URLSearchParams({
      XTransformPort: String(CHAT_SERVICE_PORT),
      sessionId,
      userName,
    });
    if (userId) params.set('userId', userId);
    if (userEmail) params.set('userEmail', userEmail);

    const wsUrl = `${protocol}//${window.location.host}/?${params.toString()}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        console.log('[Chat] WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: IncomingData = JSON.parse(event.data);

          if (data.type === 'status') {
            setAdminOnline((data as StatusData).adminOnline);
            return;
          }

          if (data.type === 'message') {
            // If chat is closed or minimized, increment unread
            if (!isOpenRef.current || isMinimizedRef.current) {
              if (data.sender === 'admin') {
                setUnreadCount((prev) => prev + 1);
              }
            }
            // Add message to list (avoid duplicates by id)
            setMessages((prev) => {
              if (data.id && prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data];
            });
            setTimeout(scrollToBottom, 50);

            // Mark admin messages as read if chat is open
            if (data.sender === 'admin' && isOpenRef.current && !isMinimizedRef.current) {
              fetch(
                `/read?sessionId=${sessionId}&XTransformPort=${CHAT_SERVICE_PORT}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
              );
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
        console.log('[Chat] WebSocket disconnected', event.code, event.reason);

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[Chat] Reconnecting...');
          connectRef.current();
        }, 3000);
      };

      ws.onerror = () => {
        // Error is followed by onclose, which handles reconnection
      };

      wsRef.current = ws;
    } catch {
      setIsConnecting(false);
      // Retry after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectRef.current();
      }, 5000);
    }
  }, [getSessionId, scrollToBottom, user]);

  // Update the connect ref so reconnect uses the latest version
  useEffect(() => {
    connectRef.current = connectWebSocket;
  }, [connectWebSocket]);

  // ── Send message ──
  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: 'message', message: text }));
    setInputValue('');
    inputRef.current?.focus();
  }, [inputValue]);

  // ── Handle Enter key ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ── Open/close chat panel ──
  const toggleChat = useCallback(() => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    setIsMinimized(false);

    if (nextOpen) {
      // Load history when opening
      const sessionId = getSessionId();
      loadHistory(sessionId);
      setUnreadCount(0);
    }
  }, [isOpen, getSessionId, loadHistory]);

  // ── Minimize chat panel ──
  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  // ── Initialize WebSocket on mount ──
  useEffect(() => {
    const sessionId = getSessionId();

    // Defer initialization to avoid synchronous setState in effect
    const initTimeout = setTimeout(() => {
      connectWebSocket();
      fetchUnreadCount(sessionId);
    }, 50);

    return () => {
      clearTimeout(initTimeout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  // ── Scroll to bottom when messages change ──
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Focus input when chat opens ──
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  // ── Format timestamp ──
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ── Show unread badge on floating button ──
  const showBadge = !isOpen && unreadCount > 0;

  return (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed z-50 bottom-24 right-4 sm:right-6
              w-[calc(100vw-2rem)] sm:w-[380px]
              h-[70vh] sm:h-[500px]
              bg-card border border-border rounded-2xl shadow-2xl shadow-black/20
              flex flex-col overflow-hidden
              ${isMinimized ? 'h-auto' : ''}`}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Live Support</h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        adminOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-300'
                      }`}
                    />
                    <span className="text-xs text-white/80">
                      {adminOnline ? 'Online' : 'Away'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isMinimized && (
                  <button
                    onClick={minimizeChat}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Minimize"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={toggleChat}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Chat Body (hidden when minimized) ── */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
                  {/* Welcome message */}
                  {messages.length === 0 && (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Welcome to BeautyVote Support</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {adminOnline
                            ? 'Our team is online. How can we help you?'
                            : 'Our team is currently away. Leave a message and we\'ll reply soon!'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message list */}
                  {messages.map((msg, idx) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-card border border-border rounded-bl-md shadow-sm'
                          }`}
                        >
                          {/* Admin name label */}
                          {!isUser && (
                            <p className="text-[10px] font-semibold text-primary mb-1">
                              Support Team
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Connection status */}
                  {!isConnected && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Reconnecting...'
                      )}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ── Input Area ── */}
                <div className="p-3 border-t border-border bg-card shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      disabled={!isConnected}
                      className="flex-1 h-10 px-4 rounded-xl bg-muted border-0 text-sm
                        placeholder:text-muted-foreground
                        focus:outline-none focus:ring-2 focus:ring-primary/30
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      maxLength={2000}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!isConnected || !inputValue.trim()}
                      className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground
                        flex items-center justify-center transition-colors
                        disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Minimized header bar ── */}
            {isMinimized && (
              <div
                className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsMinimized(false)}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span>Chat with Support</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <motion.button
        onClick={toggleChat}
        className="fixed z-50 bottom-5 right-4 sm:right-6
          w-14 h-14 rounded-full
          bg-gradient-to-br from-primary via-orange-500 to-amber-500
          hover:from-primary/90 hover:via-orange-500/90 hover:to-amber-500/90
          text-white shadow-lg shadow-primary/30
          flex items-center justify-center
          transition-shadow hover:shadow-xl hover:shadow-primary/40
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {showBadge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1
              min-w-[20px] h-5 px-1
              bg-red-500 text-white text-[11px] font-bold
              rounded-full flex items-center justify-center
              shadow-sm border-2 border-background"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}

        {/* Connecting indicator */}
        {!isConnected && !isOpen && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-background" />
        )}
      </motion.button>
    </>
  );
}
