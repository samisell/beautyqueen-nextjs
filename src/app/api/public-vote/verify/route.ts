import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, getClientIp, rateLimit } from '@/lib/api-helpers';
import { sendPaymentSuccessfulEmail } from '@/lib/email';

/**
 * POST /api/public-vote/verify
 *
 * Verifies a completed public vote payment and credits votes.
 * No auth required.
 *
 * Body: { reference: string }
 *
 * Flow:
 * 1. Find payment by reference
 * 2. If already completed → return success with vote count
 * 3. If pending → for mock implementation, mark as completed and credit votes
 * 4. Create PurchasedVote + individual Vote records + increment contestant.totalVotes
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30/min/IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many verification requests. Please try again later.', 429);
    }

    const body = await request.json();
    const { reference } = body;

    if (!reference || typeof reference !== 'string') {
      return error('Payment reference is required');
    }

    // Find the payment by reference
    const payment = await db.payment.findFirst({
      where: { reference },
      include: {
        package: true,
        contestant: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payment) {
      return error('Payment record not found', 404);
    }

    // Already completed — return success with vote count
    if (payment.status === 'completed') {
      const purchasedVote = await db.purchasedVote.findFirst({
        where: {
          userId: payment.userId,
          packageId: payment.packageId,
          paymentId: payment.id,
        },
      });

      return success({
        paymentId: payment.id,
        status: 'completed',
        message: 'Payment already verified and votes credited.',
        votesCredited: purchasedVote?.votesAmount || 0,
        contestantId: payment.contestantId,
        contestantName: payment.contestant?.name || null,
      });
    }

    // Failed or rejected
    if (payment.status === 'failed' || payment.status === 'rejected') {
      return success({
        paymentId: payment.id,
        status: payment.status,
        message: `Payment was previously marked as ${payment.status}.`,
      });
    }

    // Validate contestant exists
    if (!payment.contestantId) {
      return error('Payment is not linked to a contestant', 400);
    }

    const contestant = payment.contestant;
    if (!contestant) {
      return error('Contestant not found for this payment', 404);
    }

    if (contestant.status !== 'active') {
      // Mark payment as failed if contestant is no longer active
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });

      return error('Voting is no longer available for this contestant', 400);
    }

    const totalVotes = payment.package.votes + payment.package.bonusVotes;

    // ────────────────────────────────────────────
    // For mock / demo: auto-complete the payment
    // ────────────────────────────────────────────
    // In production, you would verify with the actual payment gateway here.

    // Complete the payment atomically: credit votes, create records
    await withTransaction(async (tx) => {
      // Mark payment as completed
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' },
      });

      // Create PurchasedVote record
      const purchasedVote = await tx.purchasedVote.create({
        data: {
          userId: payment.userId,
          packageId: payment.packageId,
          paymentId: payment.id,
          votesAmount: totalVotes,
          votesUsed: 0,
        },
      });

      // Create individual Vote records for the contestant
      for (let i = 0; i < totalVotes; i++) {
        await tx.vote.create({
          data: {
            contestantId: contestant.id,
            userId: payment.userId,
            voteType: 'purchased',
            purchasedVoteId: purchasedVote.id,
          },
        });
      }

      // Increment contestant totalVotes
      await tx.contestant.update({
        where: { id: contestant.id },
        data: {
          totalVotes: { increment: totalVotes },
        },
      });
    });

    // Send success email (fire-and-forget)
    const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$' };
    const currencySetting = await db.platformSetting.findUnique({
      where: { key: 'currency' },
    });
    const currency = currencySetting?.value || 'NGN';
    const symbol = currencySymbols[currency] || '₦';

    sendPaymentSuccessfulEmail(
      payment.userId,
      payment.user.name,
      payment.user.email,
      {
        packageName: payment.package.name,
        votes: String(totalVotes),
        amount: `${symbol}${payment.amount.toLocaleString()}`,
        method: 'Paystack',
        reference: payment.reference || payment.transactionId || 'N/A',
      }
    ).catch(() => { /* fire-and-forget */ });

    return success({
      paymentId: payment.id,
      status: 'completed',
      message: `Payment verified! ${totalVotes} votes have been credited to ${contestant.name}.`,
      votesCredited: totalVotes,
      contestantId: contestant.id,
      contestantName: contestant.name,
    });
  } catch (err) {
    console.error('Public vote verify error:', err);
    return error('Failed to verify payment. Please try again.', 500);
  }
}
