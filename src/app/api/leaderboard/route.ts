import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, parsePagination, error } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');

    // Validate status filter
    const validStatuses = ['active', 'eliminated', 'winner', 'all'];
    if (!validStatuses.includes(status)) {
      return error('Invalid status filter. Must be one of: active, eliminated, winner, all', 400);
    }

    const where: Record<string, unknown> = {};
    if (status !== 'all') {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    const [contestants, total] = await Promise.all([
      db.contestant.findMany({
        where,
        include: {
          categoryRel: true,
        },
        orderBy: { totalVotes: 'desc' },
        skip,
        take: limit,
      }),
      db.contestant.count({ where }),
    ]);

    // Add rank numbers
    const leaderboard = contestants.map((c, index) => ({
      rank: skip + index + 1,
      contestant: c,
      votes: c.totalVotes,
    }));

    return paginated(leaderboard, { page, limit, total });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return error('Failed to load leaderboard', 500);
  }
}
