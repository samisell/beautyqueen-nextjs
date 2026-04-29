import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

// POST /api/admin/contestants/eliminate — Eliminate a contestant
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { contestantId, reason } = body;

    if (!contestantId || typeof contestantId !== 'string') {
      return error('Contestant ID is required', 400);
    }

    const contestant = await db.contestant.findUnique({
      where: { id: contestantId },
      select: { id: true, name: true, status: true },
    });

    if (!contestant) {
      return error('Contestant not found', 404);
    }

    if (contestant.status === 'eliminated') {
      return error('Contestant is already eliminated', 400);
    }

    if (contestant.status === 'winner') {
      return error('Cannot eliminate a winner', 400);
    }

    await db.contestant.update({
      where: { id: contestantId },
      data: {
        status: 'eliminated',
        eliminatedAt: new Date(),
        eliminationReason: typeof reason === 'string' ? reason.trim() : 'Manually eliminated by admin',
        eliminatedById: admin.userId,
      },
    });

    return success(null, 200, {
      message: `${contestant.name} has been eliminated`,
    });
  } catch (err) {
    console.error('Eliminate contestant error:', err);
    return error('Failed to eliminate contestant', 500);
  }
}

// PATCH /api/admin/contestants/eliminate — Undo elimination (restore contestant)
export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { contestantId } = body;

    if (!contestantId || typeof contestantId !== 'string') {
      return error('Contestant ID is required', 400);
    }

    const contestant = await db.contestant.findUnique({
      where: { id: contestantId },
      select: { id: true, name: true, status: true, eliminatedAt: true },
    });

    if (!contestant) {
      return error('Contestant not found', 404);
    }

    if (contestant.status !== 'eliminated') {
      return error('Contestant is not currently eliminated', 400);
    }

    await db.contestant.update({
      where: { id: contestantId },
      data: {
        status: 'active',
        eliminatedAt: null,
        eliminationReason: null,
        eliminatedById: null,
      },
    });

    return success(null, 200, {
      message: `${contestant.name} has been restored to active status`,
    });
  } catch (err) {
    console.error('Undo elimination error:', err);
    return error('Failed to restore contestant', 500);
  }
}
