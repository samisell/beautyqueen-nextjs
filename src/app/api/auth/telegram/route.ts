// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote Platform — Telegram Auth API Endpoint
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/telegram
//
// Accepts Telegram Mini App initData, validates the cryptographic signature,
// and either logs in an existing user or auto-registers a new one.
//
// This endpoint is completely independent of the existing email/password auth.
// Users created via Telegram get a placeholder email and a random secure
// password they never see (they always log in via Telegram).
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, withTransaction } from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import {
  success,
  error,
  rateLimit,
  getClientIp,
  generateReferralCode,
} from '@/lib/api-helpers';
import {
  validateTelegramInitData,
  getTelegramBotToken,
  isTelegramAuthEnabled,
  telegramPlaceholderEmail,
  generateTelegramPassword,
} from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    // ── Check if Telegram auth is configured ──
    if (!isTelegramAuthEnabled()) {
      return error('Telegram authentication is not enabled', 503);
    }

    // ── Rate limit: 15 requests/min/IP ──
    const ip = getClientIp(request);
    if (!rateLimit(ip, 15)) {
      return error('Too many authentication attempts. Please try again later.', 429);
    }

    // ── Parse request body ──
    let body: { initData?: string };
    try {
      body = await request.json();
    } catch {
      return error('Invalid request body', 400);
    }

    const { initData } = body;
    if (!initData || typeof initData !== 'string') {
      return error('initData is required', 400);
    }

    // ── Validate Telegram initData ──
    const botToken = getTelegramBotToken();
    const validation = validateTelegramInitData(initData, botToken);

    if (!validation.valid) {
      return error(`Telegram authentication failed: ${validation.reason}`, 401);
    }

    const tgUser = validation.data.user!;

    // ── Check if user already exists by telegramId ──
    let user = await db.user.findUnique({
      where: { telegramId: String(tgUser.id) },
    });

    let isNewUser = false;

    if (user) {
      // ── Existing user — update Telegram profile info if changed ──
      const updates: Record<string, unknown> = {};
      if (tgUser.username && tgUser.username !== user.telegramUsername) {
        updates.telegramUsername = tgUser.username;
      }
      if (tgUser.photo_url && tgUser.photo_url !== user.telegramPhotoUrl) {
        updates.telegramPhotoUrl = tgUser.photo_url;
      }
      // Update name if it was previously auto-generated
      if (user.name.includes(' (Telegram)')) {
        const newName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') + ' (Telegram)';
        if (newName !== user.name) {
          updates.name = newName;
        }
      }

      if (Object.keys(updates).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    } else {
      // ── New user — auto-register ──
      isNewUser = true;

      const placeholderEmail = telegramPlaceholderEmail(tgUser.id, tgUser.username);
      const randomPassword = generateTelegramPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') + ' (Telegram)';

      // Generate unique referral code
      let newReferralCode = generateReferralCode();
      let codeExists = await db.user.findUnique({ where: { referralCode: newReferralCode } });
      let attempts = 0;
      while (codeExists && attempts < 10) {
        newReferralCode = generateReferralCode();
        codeExists = await db.user.findUnique({ where: { referralCode: newReferralCode } });
        attempts++;
      }

      user = await withTransaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: placeholderEmail,
            password: hashedPassword,
            name,
            referralCode: newReferralCode,
            telegramId: String(tgUser.id),
            telegramUsername: tgUser.username || null,
            telegramPhotoUrl: tgUser.photo_url || null,
            isVerified: true, // Telegram-verified users are pre-verified
          },
        });

        // Create a welcome notification
        await tx.notification.create({
          data: {
            userId: newUser.id,
            title: 'Welcome to BeautyVote! 🎉',
            message: `Welcome ${tgUser.first_name}! You've been automatically registered via Telegram. Start voting for your favorite contestants now!`,
            type: 'success',
          },
        });

        return newUser;
      });
    }

    // ── Generate JWT tokens (same as existing auth) ──
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // ── Build sanitized user response ──
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || user.telegramPhotoUrl || null,
      isVerified: user.isVerified,
      referralCode: user.referralCode,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      createdAt: user.createdAt,
    };

    // ── Build response with cookies (same pattern as existing auth) ──
    const response = success({
      user: sanitizedUser,
      token: accessToken,
      isNewUser,
      authMethod: 'telegram',
    }, isNewUser ? 201 : 200);

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[Telegram Auth] Error:', err);
    return error('An unexpected error occurred during Telegram authentication', 500);
  }
}
