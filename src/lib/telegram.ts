// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote Platform — Telegram Web App Auth Utilities
// ─────────────────────────────────────────────────────────────────────────────
// Validates Telegram Mini App initData using HMAC-SHA256 signature verification.
// Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac, createHash, timingSafeEqual as nodeTimingSafeEqual } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  chat_instance?: string;
  chat_type?: string;
  start_param?: string;
  can_send_after?: number;
}

// ---------------------------------------------------------------------------
// Parse initData string into a structured object
// ---------------------------------------------------------------------------

export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    const params = new URLSearchParams(initData);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });

    // Parse the user JSON field
    let user: TelegramUser | undefined;
    if (result.user) {
      try {
        user = JSON.parse(result.user) as TelegramUser;
      } catch {
        return null; // Invalid user JSON
      }
    }

    if (!result.auth_date || !result.hash) {
      return null; // Required fields missing
    }

    return {
      user,
      auth_date: parseInt(result.auth_date, 10),
      hash: result.hash,
      query_id: result.query_id,
      chat_instance: result.chat_instance,
      chat_type: result.chat_type,
      start_param: result.start_param,
      can_send_after: result.can_send_after ? parseInt(result.can_send_after, 10) : undefined,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Validate initData HMAC-SHA256 signature
// ---------------------------------------------------------------------------

/**
 * Validates Telegram initData by checking the HMAC-SHA256 signature.
 *
 * Algorithm:
 * 1. Create a data-check-string by sorting all fields (except hash) by key,
 *    then concatenating them as "key=value\n".
 * 2. Compute HMAC-SHA256 of the data-check-string using the bot token's
 *    SHA256 hash as the secret key.
 * 3. Compare the computed hash with the received hash (constant-time compare).
 *
 * @param initData - The raw initData string from Telegram.WebApp.initData
 * @param botToken - The bot's token from @BotFather
 * @param maxAgeSeconds - Maximum age of auth_date in seconds (default: 300 = 5 min)
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 300
): { valid: true; data: TelegramInitData } | { valid: false; reason: string } {
  // Step 1: Parse the initData
  const parsed = parseTelegramInitData(initData);
  if (!parsed) {
    return { valid: false, reason: 'Invalid initData format' };
  }

  // Step 2: Check that we have a user
  if (!parsed.user) {
    return { valid: false, reason: 'No user data in initData' };
  }

  // Step 3: Check auth_date is not too old (replay protection)
  const now = Math.floor(Date.now() / 1000);
  if (now - parsed.auth_date > maxAgeSeconds) {
    return { valid: false, reason: 'initData has expired — authentication too old' };
  }

  // Step 4: Build data-check-string
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  // Sort keys alphabetically
  const sortedKeys = Array.from(params.keys()).sort();
  const dataCheckString = sortedKeys
    .map((key) => `${key}=${params.get(key)}`)
    .join('\n');

  // Step 5: Compute HMAC-SHA256
  // Secret key = SHA256(bot_token)
  const secretKey = createHash('sha256').update(botToken).digest();
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Step 6: Compare hashes (constant-time via timingSafeEqual)
  if (!timingSafeEqual(computedHash, hash || '')) {
    return { valid: false, reason: 'Signature verification failed — data may be tampered' };
  }

  return { valid: true, data: parsed };
}

// ---------------------------------------------------------------------------
// Constant-time string comparison (prevents timing attacks)
// ---------------------------------------------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still compare to avoid leaking length info
    return false;
  }
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;

  // Use Node.js built-in timingSafeEqual
  try {
    return nodeTimingSafeEqual(bufA, bufB);
  } catch {
    // Fallback: manual constant-time comparison
    let result = 0;
    for (let i = 0; i < bufA.length; i++) {
      result |= bufA[i] ^ bufB[i];
    }
    return result === 0;
  }
}

// ---------------------------------------------------------------------------
// Get the bot token from environment
// ---------------------------------------------------------------------------

export function getTelegramBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN environment variable is not set. ' +
      'Create a bot via @BotFather and add the token to your .env file.'
    );
  }
  return token;
}

// ---------------------------------------------------------------------------
// Check if Telegram auth is enabled
// ---------------------------------------------------------------------------

export function isTelegramAuthEnabled(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

// ---------------------------------------------------------------------------
// Helper: generate a unique email placeholder for Telegram users
// ---------------------------------------------------------------------------

export function telegramPlaceholderEmail(telegramId: number, username?: string): string {
  const slug = username ? username.toLowerCase().replace(/[^a-z0-9]/g, '') : `user${telegramId}`;
  return `tg_${slug}_${telegramId}@telegram.beautyvote.app`;
}

// ---------------------------------------------------------------------------
// Helper: generate a secure random password for Telegram users
// ---------------------------------------------------------------------------

export function generateTelegramPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => chars[b % chars.length]).join('');
}
