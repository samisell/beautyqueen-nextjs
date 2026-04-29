import { NextRequest } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return error('Refresh token not found', 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return error('Invalid or expired refresh token', 401);
    }

    // Verify user still exists in DB
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isVerified: true },
    });

    if (!user) {
      return error('User account not found', 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = success({ token: newAccessToken }, 200, { message: 'Token refreshed successfully' });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Token refresh error:', err);
    return error('An unexpected error occurred. Please try again.', 500);
  }
}
