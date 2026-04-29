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
  isValidEmail,
  isValidPassword,
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests/min/IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5)) {
      return error('Too many registration attempts. Please try again later.', 429);
    }

    const body = await request.json();
    const { email, password, name, referralCode } = body;

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
    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      return error(passwordCheck.errors[0], 400);
    }
    if (!name || typeof name !== 'string') {
      return error('Name is required');
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return error('Name must be between 2 and 100 characters');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // --- Check email uniqueness ---
    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return error('An account with this email already exists', 409);
    }

    // --- Validate referral code if provided ---
    let referredBy: string | null = null;
    if (referralCode && typeof referralCode === 'string') {
      const trimmedCode = referralCode.trim();
      if (trimmedCode) {
        const referrer = await db.user.findUnique({ where: { referralCode: trimmedCode } });
        if (!referrer) {
          return error('Invalid referral code', 400);
        }
        referredBy = referrer.id;
      }
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 12);

    // --- Generate unique referral code ---
    let newReferralCode = generateReferralCode();
    let codeExists = await db.user.findUnique({ where: { referralCode: newReferralCode } });
    let attempts = 0;
    while (codeExists && attempts < 10) {
      newReferralCode = generateReferralCode();
      codeExists = await db.user.findUnique({ where: { referralCode: newReferralCode } });
      attempts++;
    }
    if (codeExists) {
      return error('Failed to generate unique referral code. Please try again.', 500);
    }

    // --- Create user + referral + notification in a transaction ---
    const user = await withTransaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: trimmedName,
          referralCode: newReferralCode,
          referredBy,
        },
      });

      if (referredBy) {
        await tx.referral.create({
          data: {
            referrerId: referredBy,
            referredId: newUser.id,
            bonusVotes: 5,
          },
        });

        await tx.notification.create({
          data: {
            userId: referredBy,
            title: 'New Referral!',
            message: `${trimmedName} signed up using your referral code. You earned 5 bonus votes!`,
            type: 'success',
          },
        });
      }

      return newUser;
    });

    // --- Generate tokens ---
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

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

    const response = success({ user: sanitizedUser, token: accessToken }, 201);

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
    console.error('Registration error:', err);
    return error('An unexpected error occurred. Please try again.', 500);
  }
}
