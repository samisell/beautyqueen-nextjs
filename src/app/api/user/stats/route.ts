import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, rateLimit, getClientIp } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 60/min
    const ip = getClientIp(request);
    if (!rateLimit(ip, 60)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const userId = user.userId;

    // Run all independent queries in parallel
    const [
      totalVotes,
      purchasedVotesResult,
      referralResult,
      recentVotes,
    ] = await Promise.all([
      // Total votes cast by this user
      db.vote.count({ where: { userId } }),

      // Purchased votes stats
      db.purchasedVote.aggregate({
        where: { userId },
        _sum: { votesAmount: true, votesUsed: true },
      }),

      // Referral stats
      db.referral.aggregate({
        where: { referrerId: userId },
        _count: true,
        _sum: { bonusVotes: true },
      }),

      // Recent 5 votes with contestant name
      db.vote.findMany({
        where: { userId },
        include: {
          contestant: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const purchasedVotes = purchasedVotesResult._sum.votesAmount || 0;
    const votesUsed = purchasedVotesResult._sum.votesUsed || 0;

    return success({
      totalVotes,
      purchasedVotes,
      votesUsed,
      availableVotes: purchasedVotes - votesUsed,
      referralCount: referralResult._count || 0,
      referralBonusVotes: referralResult._sum.bonusVotes || 0,
      recentVotes: recentVotes.map((v) => ({
        id: v.id,
        contestantId: v.contestantId,
        contestantName: v.contestant.name,
        contestantImage: v.contestant.imageUrl,
        voteType: v.voteType,
        createdAt: v.createdAt,
      })),
    });
  } catch (err) {
    console.error('User stats error:', err);
    return error('Failed to load user statistics', 500);
  }
}
