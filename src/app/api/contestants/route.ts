import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, parsePagination, error } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }
    if (status) {
      if (!['active', 'eliminated', 'winner'].includes(status)) {
        return error('Invalid status filter. Must be one of: active, eliminated, winner', 400);
      }
      where.status = status;
    }
    if (search) {
      // SQLite LIKE is case-insensitive by default — no mode option needed
      where.name = { contains: search.trim() };
    }

    const [contestants, total] = await Promise.all([
      db.contestant.findMany({
        where,
        include: {
          categoryRel: true,
          stage: true,
        },
        orderBy: { totalVotes: 'desc' },
        skip,
        take: limit,
      }),
      db.contestant.count({ where }),
    ]);

    return paginated(contestants, { page, limit, total });
  } catch (err) {
    console.error('List contestants error:', err);
    return error('Failed to load contestants', 500);
  }
}
