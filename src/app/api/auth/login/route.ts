import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { success, error, rateLimit, getClientIp, isValidEmail } from '@/lib/api-helpers';
import { sendLoginNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests/min/IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 10)) {
      return error('Too many login attempts. Please try again later.', 429);
    }

    const body = await request.json();
    const { email, password } = body;

    // --- Input validation ---
    if (!email || typeof email !== 'string') {
      return error('Email is required');
    }
    if (!isValidEmail(email.trim())) {
      return error('Please provide a valid email address');
    }
    if (!password || typeof password !== 'string') {
      return error('Password is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // --- Find user ---
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    // Generic message for both "not found" and "wrong password"
    if (!user) {
      return error('Invalid email or password', 401);
    }

    // --- Verify password ---
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return error('Invalid email or password', 401);
    }

    // --- Generate tokens ---
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // --- Send login notification email (fire-and-forget) ---
    setTimeout(() => {
      sendLoginNotification(user.id, user.name, user.email, ip).catch(() => {});
    }, 500);

    // --- Build response with cookies ---
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
    };

    const response = success({ user: sanitizedUser, token: accessToken });

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
    console.error('Login error:', err);
    return error('An unexpected error occurred. Please try again.', 500);
  }
}
