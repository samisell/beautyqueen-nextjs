import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request);
    if (error) return error;

    const userId = user!.userId;

    // Get total votes cast by this user
    const totalVotes = await db.vote.count({
      where: { userId },
    });

    // Get purchased votes (total amount)
    const purchasedVotesResult = await db.purchasedVote.aggregate({
      where: { userId },
      _sum: { votesAmount: true, votesUsed: true },
    });

    // Get referral stats
    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
    });

    const referralCount = referrals.length;
    const referralBonusVotes = referrals.reduce(
      (sum, r) => sum + r.bonusVotes,
      0
    );

    const purchasedVotes = purchasedVotesResult._sum.votesAmount || 0;
    const votesUsed = purchasedVotesResult._sum.votesUsed || 0;
    const availableVotes = purchasedVotes - votesUsed;

    return NextResponse.json({
      success: true,
      data: {
        totalVotes,
        purchasedVotes,
        availableVotes,
        referralCount,
        referralBonusVotes,
      },
    });
  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
