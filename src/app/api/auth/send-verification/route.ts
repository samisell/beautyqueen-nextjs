import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, rateLimit, getClientIp } from '@/lib/api-helpers';
import { generateOTP, sendVerificationOTP } from '@/lib/email';

const OTP_EXPIRY_MINUTES = 10;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 3)) {
      return error('Too many verification requests. Please try again in a minute.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    // Check if already verified
    if (user.role === 'admin' || (await db.user.findUnique({ where: { id: user.userId } }))?.isVerified) {
      return error('Email is already verified', 400);
    }

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert verification record
    await db.emailVerification.upsert({
      where: { userId: user.userId },
      update: { otp, expiresAt, verifiedAt: null },
      create: { userId: user.userId, otp, expiresAt },
    });

    // Send email (fire-and-forget in dev mode)
    const emailUser = await db.user.findUnique({ where: { id: user.userId }, select: { name: true, email: true } });
    if (emailUser) {
      // Don't await — send in background
      sendVerificationOTP(user.userId, emailUser.name, emailUser.email, otp).catch(() => {});
    }

    return success(null, 200, {
      message: `Verification OTP sent to your email. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
  } catch (err) {
    console.error('Send verification error:', err);
    return error('Failed to send verification email', 500);
  }
}
