import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify contestant exists
    const contestant = await db.contestant.findUnique({
      where: { id },
      select: { id: true, totalVotes: true },
    });

    if (!contestant) {
      return error('Contestant not found', 404);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [freeVotes, paidVotes, referralVotes, todayVotes] = await Promise.all([
      db.vote.count({ where: { contestantId: id, voteType: 'free' } }),
      db.vote.count({ where: { contestantId: id, voteType: 'paid' } }),
      db.vote.count({ where: { contestantId: id, voteType: 'referral' } }),
      db.vote.count({
        where: {
          contestantId: id,
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    // Check if current user has voted for this contestant today
    let userVoted = false;
    const { user } = await getUserFromRequest(request);
    if (user) {
      const userVoteToday = await db.vote.count({
        where: {
          contestantId: id,
          userId: user.userId,
          createdAt: { gte: todayStart },
        },
      });
      userVoted = userVoteToday > 0;
    }

    return success({
      contestantId: id,
      totalVotes: contestant.totalVotes,
      freeVotes,
      paidVotes,
      referralVotes,
      todayVotes,
      userVoted,
    });
  } catch (err) {
    console.error('Vote stats error:', err);
    return error('Failed to load vote statistics', 500);
  }
}
