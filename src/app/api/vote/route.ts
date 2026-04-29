import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, getUserFromRequest, getClientIp, rateLimit } from '@/lib/api-helpers';

const FREE_VOTE_DAILY_LIMIT = 3;
const VALID_VOTE_TYPES = ['free', 'paid', 'referral'] as const;

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30/min/IP (voting is high-frequency)
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many vote requests. Please slow down.', 429);
    }

    const body = await request.json();
    const { contestantId, voteType } = body;

    // --- Input validation ---
    if (!contestantId || typeof contestantId !== 'string') {
      return error('Contestant ID is required');
    }

    // Basic cuid format check
    if (!/^c[a-z0-9]{20,}$/i.test(contestantId)) {
      return error('Invalid contestant ID format', 400);
    }

    if (!voteType || typeof voteType !== 'string') {
      return error('Vote type is required');
    }
    if (!VALID_VOTE_TYPES.includes(voteType as typeof VALID_VOTE_TYPES[number])) {
      return error('Invalid vote type. Must be one of: free, paid, referral', 400);
    }

    // --- Verify contestant exists and is active ---
    const contestant = await db.contestant.findUnique({
      where: { id: contestantId },
      select: { id: true, status: true, totalVotes: true, name: true },
    });
    if (!contestant) {
      return error('Contestant not found', 404);
    }
    if (contestant.status !== 'active') {
      return error('Voting is not available for this contestant', 400);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // ===== FREE VOTE =====
    if (voteType === 'free') {
      // Check IP daily limit per contestant
      const ipVotesToday = await db.vote.count({
        where: {
          contestantId,
          ipAddress: ip,
          voteType: 'free',
          createdAt: { gte: todayStart },
        },
      });

      if (ipVotesToday >= FREE_VOTE_DAILY_LIMIT) {
        return error(
          `Daily free vote limit (${FREE_VOTE_DAILY_LIMIT}) reached for this contestant`,
          429,
          { remainingFreeVotes: 0 }
        );
      }

      // Atomic transaction: create vote + increment totalVotes
      await withTransaction(async (tx) => {
        // Double-check count inside transaction to prevent race conditions
        const currentIpVotes = await tx.vote.count({
          where: {
            contestantId,
            ipAddress: ip,
            voteType: 'free',
            createdAt: { gte: todayStart },
          },
        });

        if (currentIpVotes >= FREE_VOTE_DAILY_LIMIT) {
          throw new Error('DAILY_LIMIT_REACHED');
        }

        await tx.vote.create({
          data: {
            contestantId,
            voteType: 'free',
            ipAddress: ip,
          },
        });

        await tx.contestant.update({
          where: { id: contestantId },
          data: { totalVotes: { increment: 1 } },
        });
      });

      return success(
        {
          voteType: 'free',
          remainingFreeVotes: FREE_VOTE_DAILY_LIMIT - ipVotesToday - 1,
        },
        201,
        { message: 'Free vote cast successfully' }
      );
    }

    // ===== PAID VOTE =====
    if (voteType === 'paid') {
      const { user, error: authError } = await getUserFromRequest(request);
      if (authError) return authError;

      const result = await withTransaction(async (tx) => {
        // Find first PurchasedVote with remaining votes
        const purchasedVote = await tx.purchasedVote.findFirst({
          where: {
            userId: user.userId,
            votesUsed: { lt: tx.purchasedVote.fields.votesAmount },
          },
        });

        if (!purchasedVote) {
          throw new Error('NO_PURCHASED_VOTES');
        }

        // Create the vote
        await tx.vote.create({
          data: {
            contestantId,
            userId: user.userId,
            voteType: 'paid',
            ipAddress: ip,
          },
        });

        // Increment votes used
        await tx.purchasedVote.update({
          where: { id: purchasedVote.id },
          data: { votesUsed: { increment: 1 } },
        });

        // Increment contestant totalVotes
        await tx.contestant.update({
          where: { id: contestantId },
          data: { totalVotes: { increment: 1 } },
        });

        return {
          purchasedVoteId: purchasedVote.id,
          votesRemaining: purchasedVote.votesAmount - purchasedVote.votesUsed - 1,
        };
      }).catch((txErr: unknown) => {
        const msg = txErr instanceof Error ? txErr.message : '';
        if (msg === 'NO_PURCHASED_VOTES') {
          return null; // Signal: no votes available
        }
        throw txErr;
      });

      if (!result) {
        return error('No purchased votes available. Please buy a vote package.', 400);
      }

      return success(
        {
          voteType: 'paid',
          purchasedVoteId: result.purchasedVoteId,
          votesRemaining: result.votesRemaining,
        },
        201,
        { message: 'Paid vote cast successfully' }
      );
    }

    // ===== REFERRAL VOTE =====
    if (voteType === 'referral') {
      const { user, error: authError } = await getUserFromRequest(request);
      if (authError) return authError;

      const result = await withTransaction(async (tx) => {
        // Find a referral-type PurchasedVote with remaining votes
        const referralPurchase = await tx.purchasedVote.findFirst({
          where: {
            userId: user.userId,
            votesUsed: { lt: tx.purchasedVote.fields.votesAmount },
          },
          include: { package: true },
        });

        // Check if user has any referral bonus available
        // (from Referrals where referrerId = userId and bonusVotes > 0)
        const referralBonus = await tx.referral.aggregate({
          where: { referrerId: user.userId },
          _sum: { bonusVotes: true },
        });
        const totalReferralBonus = referralBonus._sum.bonusVotes || 0;

        if (!referralPurchase && totalReferralBonus <= 0) {
          throw new Error('NO_REFERRAL_VOTES');
        }

        if (referralPurchase) {
          // Use existing purchased vote
          await tx.vote.create({
            data: {
              contestantId,
              userId: user.userId,
              voteType: 'referral',
              ipAddress: ip,
            },
          });

          await tx.purchasedVote.update({
            where: { id: referralPurchase.id },
            data: { votesUsed: { increment: 1 } },
          });

          await tx.contestant.update({
            where: { id: contestantId },
            data: { totalVotes: { increment: 1 } },
          });

          return {
            votesRemaining: referralPurchase.votesAmount - referralPurchase.votesUsed - 1,
          };
        }

        // No existing purchase — create one from referral bonus
        const newPurchase = await tx.purchasedVote.create({
          data: {
            userId: user.userId,
            packageId: '', // No package — referral bonus
            votesAmount: totalReferralBonus,
            votesUsed: 1, // Using one now
          },
        });

        await tx.vote.create({
          data: {
            contestantId,
            userId: user.userId,
            voteType: 'referral',
            ipAddress: ip,
          },
        });

        await tx.contestant.update({
          where: { id: contestantId },
          data: { totalVotes: { increment: 1 } },
        });

        return {
          votesRemaining: totalReferralBonus - 1,
        };
      }).catch((txErr: unknown) => {
        const msg = txErr instanceof Error ? txErr.message : '';
        if (msg === 'NO_REFERRAL_VOTES') {
          return null;
        }
        throw txErr;
      });

      if (!result) {
        return error('No referral votes available. Refer friends to earn bonus votes.', 400);
      }

      return success(
        {
          voteType: 'referral',
          votesRemaining: result.votesRemaining,
        },
        201,
        { message: 'Referral vote cast successfully' }
      );
    }

    return error('Invalid vote type', 400);
  } catch (err) {
    // Handle known transaction errors gracefully
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'DAILY_LIMIT_REACHED') {
      return error(
        `Daily free vote limit (${FREE_VOTE_DAILY_LIMIT}) reached for this contestant`,
        429,
        { remainingFreeVotes: 0 }
      );
    }

    console.error('Vote error:', err);
    return error('Failed to cast vote. Please try again.', 500);
  }
}
