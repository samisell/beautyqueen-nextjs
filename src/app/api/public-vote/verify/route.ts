import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, getClientIp, rateLimit } from '@/lib/api-helpers';
import { verifyPayment, type PaymentMethod } from '@/lib/payment-gateways';
import { sendPaymentSuccessfulEmail } from '@/lib/email';

/**
 * POST /api/public-vote/verify
 *
 * Verifies a completed public vote payment and credits votes.
 * No auth required.
 *
 * Body: { reference: string, method: 'flutterwave' | 'paystack' }
 *
 * IMPORTANT: In production, this actually verifies with the payment gateway.
 * In development (when gateway keys are not configured), it requires a
 * `demo=1` flag to auto-complete.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30/min/IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many verification requests. Please try again later.', 429);
    }

    const body = await request.json();
    const { reference, method: methodInput, demo } = body;

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

    // Already completed — return success with vote count (idempotent)
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
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });
      return error('Voting is no longer available for this contestant', 400);
    }

    // ────────────────────────────────────────────
    // VERIFY WITH PAYMENT GATEWAY
    // ────────────────────────────────────────────
    const paymentMethod = payment.paymentMethod as PaymentMethod;
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, we MUST verify with the gateway
    if (isProduction && paymentMethod !== 'offline') {
      // Do NOT allow demo mode in production
      if (!paymentMethod || !['flutterwave', 'paystack'].includes(paymentMethod)) {
        return error('Invalid payment method for verification', 400);
      }

      const result = await verifyPayment({ reference, paymentMethod: paymentMethod as 'flutterwave' | 'paystack' });

      if (!result.success) {
        if (result.status === 'pending') {
          return success({
            paymentId: payment.id,
            status: 'pending',
            message: result.message || 'Payment is still being processed. Please check back shortly.',
          });
        }
        // Mark as failed if gateway says failed
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'failed' },
        });
        return error(result.message || 'Payment verification failed. Votes were not credited.', 400);
      }
    } else if (paymentMethod !== 'offline') {
      // Development mode: require demo flag to auto-complete
      if (demo !== '1' && demo !== 1 && demo !== true) {
        return error(
          'Payment not yet verified with gateway. In development, pass demo=1 to simulate.',
          400
        );
      }
      // Dev auto-complete continues below
    } else {
      // Offline payments must be approved by admin, not via this endpoint
      return error('Offline payments must be approved by an admin after proof upload.', 400);
    }

    const totalVotes = payment.package.votes + payment.package.bonusVotes;

    // Complete the payment atomically: credit votes, create records
    await withTransaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' },
      });

      const purchasedVote = await tx.purchasedVote.create({
        data: {
          userId: payment.userId,
          packageId: payment.packageId,
          paymentId: payment.id,
          votesAmount: totalVotes,
          votesUsed: 0,
        },
      });

      // Create individual Vote records in batch
      const voteData = Array.from({ length: totalVotes }, () => ({
        contestantId: contestant.id,
        userId: payment.userId,
        voteType: 'purchased' as const,
        purchasedVoteId: purchasedVote.id,
      }));

      // Use createMany for batch insert (much faster than individual inserts)
      await tx.vote.createMany({ data: voteData });

      await tx.contestant.update({
        where: { id: contestant.id },
        data: { totalVotes: { increment: totalVotes } },
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
        method: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
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
