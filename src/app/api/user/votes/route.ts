import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, parsePagination, getUserFromRequest, error } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const voteTypeFilter = searchParams.get('voteType');

    // Validate voteType filter if provided
    if (voteTypeFilter && !['free', 'paid', 'referral'].includes(voteTypeFilter)) {
      return error('Invalid voteType filter. Must be one of: free, paid, referral', 400);
    }

    const where: Record<string, unknown> = { userId: user.userId };
    if (voteTypeFilter) {
      where.voteType = voteTypeFilter;
    }

    const [votes, total] = await Promise.all([
      db.vote.findMany({
        where,
        include: {
          contestant: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.vote.count({ where }),
    ]);

    const votesWithInfo = votes.map((v) => ({
      id: v.id,
      contestantId: v.contestantId,
      contestantName: v.contestant.name,
      contestantImage: v.contestant.imageUrl,
      voteType: v.voteType,
      createdAt: v.createdAt,
    }));

    return paginated(votesWithInfo, { page, limit, total });
  } catch (err) {
    console.error('Get user votes error:', err);
    return error('Failed to load vote history', 500);
  }
}
