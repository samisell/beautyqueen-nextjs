import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const category = searchParams.get('category');

    const where: Record<string, unknown> = { status: 'active' };
    if (category) {
      where.category = category;
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

    return NextResponse.json({
      success: true,
      data: leaderboard,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
