import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, type TokenPayload } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Response helpers (consistent API response envelope)
// ---------------------------------------------------------------------------

export function success<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status });
}

export function error(message: string, status = 400, details?: unknown) {
  const body: Record<string, unknown> = { success: false, message };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

export function paginated<T>(data: T[], pagination: { page: number; limit: number; total: number }) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function getUserFromRequest(
  request: NextRequest
): Promise<{ user: TokenPayload; error: null } | { user: null; error: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: error('Authentication required — provide a Bearer token', 401) };
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  if (!payload) {
    return { user: null, error: error('Invalid or expired token', 401) };
  }
  return { user: payload, error: null };
}

export async function requireAdmin(request: NextRequest) {
  const result = await getUserFromRequest(request);
  if (result.error) return result;
  if (result.user.role !== 'admin') {
    return { user: null, error: error('Admin access required', 403) };
  }
  return { user: result.user, error: null };
}

// ---------------------------------------------------------------------------
// Input helpers
// ---------------------------------------------------------------------------

export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
}

export function parsePagination(searchParams: URLSearchParams, defaultLimit = 20) {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Simple in-memory rate limiter (keyed by IP).
 * For production you'd use Redis — this is adequate for single-server deploys.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute

export function rateLimit(ip: string, maxRequests = 60): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }
  entry.count++;
  return entry.count <= maxRequests;
}

// Cleanup stale entries every 5 min
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 300_000);
}

// ---------------------------------------------------------------------------
// Referral code generator
// ---------------------------------------------------------------------------

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must be at most 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  return { valid: errors.length === 0, errors };
}
