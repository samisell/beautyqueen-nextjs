import { NextRequest } from 'next/server';
import { getUserFromRequest, success, error, rateLimit, getClientIp } from '@/lib/api-helpers';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 120/min
    const ip = getClientIp(request);
    if (!rateLimit(ip, 120)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const userData = await db.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isVerified: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return error('User not found', 404);
    }

    return success(userData);
  } catch (err) {
    console.error('Get current user error:', err);
    return error('An unexpected error occurred', 500);
  }
}
