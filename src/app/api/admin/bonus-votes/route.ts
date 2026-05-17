import { NextRequest, NextResponse } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { contestantId, votes, reason } = body;

    if (!contestantId || typeof contestantId !== 'string') {
      return error('Contestant ID is required', 400);
    }
    if (!votes || typeof votes !== 'number' || votes < 1) {
      return error('Votes must be a positive number', 400);
    }
    if (votes > 10000) {
      return error('Cannot add more than 10,000 votes at once', 400);
    }

    // Verify contestant exists
    const contestant = await db.contestant.findUnique({
      where: { id: contestantId },
      select: { id: true, name: true, status: true, totalVotes: true },
    });
    if (!contestant) {
      return error('Contestant not found', 404);
    }

    // Add bonus votes in transaction
    await withTransaction(async (tx) => {
      await tx.bonusVote.create({
        data: {
          contestantId,
          votesAdded: votes,
          reason: typeof reason === 'string' ? reason.trim() : null,
          addedById: admin.userId,
        },
      });

      await tx.contestant.update({
        where: { id: contestantId },
        data: { totalVotes: { increment: votes } },
      });
    });

    return success({
      contestantId,
      contestantName: contestant.name,
      votesAdded: votes,
      newTotal: contestant.totalVotes + votes,
    }, 201, {
      message: `${votes} bonus vote(s) added to ${contestant.name}`,
    });
  } catch (err) {
    console.error('Bonus vote error:', err);
    return error('Failed to add bonus votes', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;

    const [bonusVotes, total] = await Promise.all([
      db.bonusVote.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          contestant: { select: { id: true, name: true, imageUrl: true } },
          addedBy: { select: { id: true, name: true } },
        },
      }),
      db.bonusVote.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: bonusVotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get bonus votes error:', err);
    return error('Failed to load bonus votes', 500);
  }
}
