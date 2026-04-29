import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, rateLimit, getClientIp } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 10)) {
      return error('Too many attempts. Please slow down.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { otp } = body;

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return error('A valid 6-digit OTP is required', 400);
    }

    const trimmedOTP = otp.trim();

    // Find verification record
    const verification = await db.emailVerification.findUnique({
      where: { userId: user.userId },
    });

    if (!verification) {
      return error('No verification request found. Please request a new OTP.', 404);
    }

    if (verification.verifiedAt) {
      return error('Email is already verified', 400);
    }

    // Check expiry
    if (new Date() > verification.expiresAt) {
      return error('OTP has expired. Please request a new one.', 400);
    }

    // Check OTP
    if (verification.otp !== trimmedOTP) {
      return error('Invalid OTP. Please check and try again.', 400);
    }

    // Mark as verified
    await db.$transaction([
      db.emailVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
      db.user.update({
        where: { id: user.userId },
        data: { isVerified: true },
      }),
    ]);

    return success(null, 200, { message: 'Email verified successfully!' });
  } catch (err) {
    console.error('Verify email error:', err);
    return error('Failed to verify email', 500);
  }
}
