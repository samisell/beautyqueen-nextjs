import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalContestants,
      totalVotes,
      revenueResult,
      activeStage,
      activeTournament,
      votesToday,
      newUsersToday,
      topContestants,
      recentActivity,
      platformSettings,
    ] = await Promise.all([
      db.user.count(),
      db.contestant.count(),
      db.vote.count(),
      db.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
      db.tournamentStage.findFirst({
        where: { status: 'active' },
        include: {
          _count: { select: { contestants: true } },
          tournament: { select: { id: true, name: true } },
        },
      }),
      db.tournament.findFirst({
        where: { status: 'active' },
        select: { id: true, name: true, status: true },
      }),
      db.vote.count({ where: { createdAt: { gte: todayStart } } }),
      db.user.count({ where: { createdAt: { gte: todayStart } } }),
      db.contestant.findMany({
        orderBy: { totalVotes: 'desc' },
        take: 5,
        select: { id: true, name: true, imageUrl: true, status: true, totalVotes: true, category: true },
      }),
      db.vote.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          contestant: { select: { id: true, name: true, imageUrl: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.platformSetting.findMany(),
    ]);

    // Build settings map
    const settingsMap: Record<string, string> = {
      votePrice: '200',
      currency: 'NGN',
      platformName: 'Beauty Vote',
      votingEnabled: 'true',
    };
    for (const s of platformSettings) {
      settingsMap[s.key] = s.value;
    }

    return success({
      totalUsers,
      totalContestants,
      totalVotes,
      totalRevenue: revenueResult._sum.amount || 0,
      votesToday,
      newUsersToday,
      activeStage: activeStage
        ? {
            id: activeStage.id,
            name: activeStage.name,
            status: activeStage.status,
            contestantCount: activeStage._count.contestants,
            tournament: activeStage.tournament
              ? { name: activeStage.tournament.name }
              : null,
          }
        : null,
      activeTournament: activeTournament || null,
      settings: settingsMap,
      topContestants: topContestants.map((c, i) => ({ rank: i + 1, ...c })),
      recentActivity: recentActivity.map((v) => ({
        id: v.id,
        userId: v.userId,
        contestantId: v.contestantId,
        voteType: v.voteType,
        createdAt: v.createdAt,
        user: v.user ? { name: v.user.name } : null,
        contestant: v.contestant,
      })),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return error('Failed to load admin statistics', 500);
  }
}
