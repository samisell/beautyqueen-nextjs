import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
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

    return NextResponse.json({
      success: true,
      data: contestants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List contestants error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
