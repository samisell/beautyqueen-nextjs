import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, getClientIp } from '@/lib/api-helpers';

const FREE_VOTE_DAILY_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestantId, voteType } = body;

    if (!contestantId || !voteType) {
      return NextResponse.json(
        { success: false, message: 'Contestant ID and vote type are required' },
        { status: 400 }
      );
    }

    if (!['free', 'paid'].includes(voteType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid vote type. Must be "free" or "paid"' },
        { status: 400 }
      );
    }

    // Verify contestant exists
    const contestant = await db.contestant.findUnique({
      where: { id: contestantId },
    });
    if (!contestant) {
      return NextResponse.json(
        { success: false, message: 'Contestant not found' },
        { status: 404 }
      );
    }

    const clientIp = getClientIp(request);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Handle free votes
    if (voteType === 'free') {
      // Check daily IP limit for this contestant
      const ipVotesToday = await db.vote.count({
        where: {
          contestantId,
          ipAddress: clientIp,
          createdAt: { gte: todayStart },
        },
      });

      if (ipVotesToday >= FREE_VOTE_DAILY_LIMIT) {
        return NextResponse.json(
          { success: false, message: `Daily free vote limit (${FREE_VOTE_DAILY_LIMIT}) reached for this contestant` },
          { status: 429 }
        );
      }

      // Create the vote
      await db.vote.create({
        data: {
          contestantId,
          voteType: 'free',
          ipAddress: clientIp,
        },
      });

      // Increment contestant votes
      await db.contestant.update({
        where: { id: contestantId },
        data: { totalVotes: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        message: 'Free vote cast successfully',
        data: { remainingFreeVotes: FREE_VOTE_DAILY_LIMIT - ipVotesToday - 1 },
      });
    }

    // Handle paid votes
    if (voteType === 'paid') {
      const { user, error } = await getUserFromRequest(request);
      if (error) return error;

      // Find available purchased votes
      const purchasedVote = await db.purchasedVote.findFirst({
        where: {
          userId: user!.userId,
          votesUsed: { lt: db.purchasedVote.fields.votesAmount },
        },
      });

      if (!purchasedVote) {
        return NextResponse.json(
          { success: false, message: 'No purchased votes available. Please buy a vote package.' },
          { status: 400 }
        );
      }

      // Create the vote
      await db.vote.create({
        data: {
          contestantId,
          userId: user!.userId,
          voteType: 'paid',
          ipAddress: clientIp,
        },
      });

      // Increment votes used
      await db.purchasedVote.update({
        where: { id: purchasedVote.id },
        data: { votesUsed: { increment: 1 } },
      });

      // Increment contestant votes
      await db.contestant.update({
        where: { id: contestantId },
        data: { totalVotes: { increment: 1 } },
      });

      const updatedPurchasedVote = await db.purchasedVote.findUnique({
        where: { id: purchasedVote.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Paid vote cast successfully',
        data: {
          votesRemaining: updatedPurchasedVote
            ? updatedPurchasedVote.votesAmount - updatedPurchasedVote.votesUsed
            : 0,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid vote type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
