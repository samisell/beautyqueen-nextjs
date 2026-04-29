import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contestant = await db.contestant.findUnique({
      where: { id },
    });

    if (!contestant) {
      return NextResponse.json(
        { success: false, message: 'Contestant not found' },
        { status: 404 }
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [freeVotes, paidVotes, referralVotes, todayVotes] = await Promise.all([
      db.vote.count({
        where: { contestantId: id, voteType: 'free' },
      }),
      db.vote.count({
        where: { contestantId: id, voteType: 'paid' },
      }),
      db.vote.count({
        where: { contestantId: id, voteType: 'referral' },
      }),
      db.vote.count({
        where: {
          contestantId: id,
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalVotes: contestant.totalVotes,
        freeVotes,
        paidVotes,
        referralVotes,
        todayVotes,
      },
    });
  } catch (error) {
    console.error('Vote stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
