import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stages = await db.tournamentStage.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    const stagesWithCount = stages.map((stage) => ({
      ...stage,
      contestantCount: stage._count.contestants,
    }));

    return NextResponse.json({
      success: true,
      data: stagesWithCount,
    });
  } catch (error) {
    console.error('Tournament error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
