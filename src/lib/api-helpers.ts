import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Extract user from Authorization Bearer token
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ user: TokenPayload | null; error: NextResponse | null }> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  return { user: payload, error: null };
}

/**
 * Require admin role from authenticated user
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: TokenPayload; error: NextResponse | null }> {
  const result = await getUserFromRequest(request);

  if (result.error) return { user: result.user!, error: result.error };
  if (!result.user) {
    return {
      user: result.user!,
      error: NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (result.user.role !== 'admin') {
    return {
      user: result.user,
      error: NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { user: result.user, error: null };
}

/**
 * Get user's IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Parse pagination query params with defaults
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit = 20
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit), 10)));
  return { page, limit, skip: (page - 1) * limit };
}
