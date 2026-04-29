import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    const [
      totalUsers,
      totalContestants,
      totalVotes,
      revenueResult,
      activeStage,
    ] = await Promise.all([
      db.user.count(),
      db.contestant.count(),
      db.vote.count(),
      db.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      db.tournamentStage.findFirst({
        where: { status: 'active' },
        include: {
          _count: { select: { contestants: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalContestants,
        totalVotes,
        totalRevenue: revenueResult._sum.amount || 0,
        activeStage: activeStage
          ? {
              ...activeStage,
              contestantCount: activeStage._count.contestants,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
