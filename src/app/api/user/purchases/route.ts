import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, parsePagination, getUserFromRequest, error } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const [purchases, total] = await Promise.all([
      db.purchasedVote.findMany({
        where: { userId: user.userId },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              votes: true,
              bonusVotes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.purchasedVote.count({ where: { userId: user.userId } }),
    ]);

    const purchasesWithStats = purchases.map((p) => ({
      id: p.id,
      packageName: p.package?.name || 'Referral Bonus',
      votesAmount: p.votesAmount,
      votesUsed: p.votesUsed,
      votesRemaining: p.votesAmount - p.votesUsed,
      createdAt: p.createdAt,
    }));

    return paginated(purchasesWithStats, { page, limit, total });
  } catch (err) {
    console.error('Get user purchases error:', err);
    return error('Failed to load purchase history', 500);
  }
}
