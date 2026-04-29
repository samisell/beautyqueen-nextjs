import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, getClientIp, rateLimit } from '@/lib/api-helpers';
import { sendPaymentRejectedEmail, sendFraudWarningEmail } from '@/lib/email';

/**
 * POST /api/admin/payments/reject
 *
 * Body: { paymentId: string, reason: string, isFraud?: boolean }
 *
 * Admin rejects a payment with a reason.
 *
 * For pending/awaiting_review payments:
 * - Changes payment status to 'failed'
 * - Notifies the user with rejection reason
 * - Sends rejection email
 *
 * For completed payments (isFraud flag):
 * - Removes the PurchasedVote associated with this payment
 * - Removes all votes cast from that purchase
 * - Decrements contestant totalVote counts
 * - Changes payment status to 'rejected'
 * - Sends fraud warning email with disqualification notice
 * - Creates urgent notification for the user
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please try again later.', 429);
    }

    const body = await request.json();
    const { paymentId, reason, isFraud } = body;

    if (!paymentId || typeof paymentId !== 'string') {
      return error('Payment ID is required');
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return error('Rejection reason is required (minimum 5 characters)');
    }

    // Find the payment with full details
    const payment = await db.payment.findFirst({
      where: { id: paymentId },
      include: {
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!payment) {
      return error('Payment not found', 404);
    }

    const isCompleted = payment.status === 'completed';
    const isPending = payment.status === 'awaiting_review' || payment.status === 'pending';

    if (!isCompleted && !isPending) {
      return error(`Cannot reject a payment with status: ${payment.status}`, 400);
    }

    // ═══════════════════════════════════════════════
    // COMPLETED PAYMENT → FRAUD REJECTION
    // Remove votes, purchased vote, send fraud warning
    // ═══════════════════════════════════════════════
    if (isCompleted) {
      // Find the PurchasedVote linked to this payment
      const purchasedVote = await db.purchasedVote.findFirst({
        where: {
          userId: payment.userId,
          packageId: payment.packageId,
          paymentId: payment.id,
        },
      });

      // Also try to find by createdAt proximity if paymentId not set (legacy data)
      let purchasedVoteId = purchasedVote?.id;
      if (!purchasedVote) {
        const fallback = await db.purchasedVote.findFirst({
          where: {
            userId: payment.userId,
            packageId: payment.packageId,
            createdAt: { gte: payment.createdAt },
          },
          orderBy: { createdAt: 'asc' },
        });
        purchasedVoteId = fallback?.id;
      }

      const totalVotesRemoved = await withTransaction(async (tx) => {
        let removedCount = 0;

        // Find and delete all votes linked to this purchased vote
        if (purchasedVoteId) {
          // Get all votes with this purchasedVoteId
          const votesToRemove = await tx.vote.findMany({
            where: { purchasedVoteId },
            select: { id: true, contestantId: true },
          });

          // Group by contestantId and count
          const contestantVoteCount = new Map<string, number>();
          for (const v of votesToRemove) {
            contestantVoteCount.set(v.contestantId, (contestantVoteCount.get(v.contestantId) || 0) + 1);
          }

          // Delete all linked votes
          if (votesToRemove.length > 0) {
            await tx.vote.deleteMany({ where: { purchasedVoteId } });
            removedCount = votesToRemove.length;

            // Decrement contestant totalVotes
            for (const [contestantId, count] of contestantVoteCount) {
              await tx.contestant.update({
                where: { id: contestantId },
                data: { totalVotes: { decrement: count } },
              });
            }
          }

          // Delete the purchased vote
          await tx.purchasedVote.delete({ where: { id: purchasedVoteId } });
        }

        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'rejected',
            adminNote: reason.trim(),
            reviewedBy: user.userId,
            reviewedAt: new Date(),
          },
        });

        // Create urgent notification
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: '⚠️ Payment Rejected — Fraud Warning',
            message: `Your payment for ${payment.package.name} (₦${payment.amount.toLocaleString()}) has been flagged as fraudulent and reversed. ${removedCount} votes have been removed. Reason: ${reason.trim()}. Repeated fraudulent activity will result in permanent disqualification.`,
            type: 'error',
          },
        });

        return removedCount;
      });

      // Send fraud warning email (fire-and-forget)
      const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$' };
      const currency = process.env.DEFAULT_CURRENCY || 'NGN';
      const symbol = currencySymbols[currency] || '₦';

      sendFraudWarningEmail(
        payment.userId,
        payment.user.name,
        payment.user.email,
        {
          packageName: payment.package.name,
          amount: `${symbol}${payment.amount.toLocaleString()}`,
          reference: payment.reference || payment.transactionId || 'N/A',
          reason: reason.trim(),
          votesRemoved: String(totalVotesRemoved),
        }
      ).catch(() => { /* fire-and-forget */ });

      return success(
        {
          paymentId: payment.id,
          status: 'rejected',
          userName: payment.user.name,
          packageName: payment.package.name,
          amount: payment.amount,
          votesRemoved: totalVotesRemoved,
          isFraud: true,
        },
        200,
        { message: `Payment rejected as fraudulent. ${totalVotesRemoved} votes removed.` }
      );
    }

    // ═══════════════════════════════════════════════
    // PENDING/AWAITING_REVIEW → STANDARD REJECTION
    // ═══════════════════════════════════════════════
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        adminNote: reason.trim(),
        reviewedBy: user.userId,
        reviewedAt: new Date(),
      },
    });

    // Notify the user
    await db.notification.create({
      data: {
        userId: payment.userId,
        title: 'Payment Rejected',
        message: `Your payment for ${payment.package.name} (₦${payment.amount.toLocaleString()}) was not approved. Reason: ${reason.trim()}. Please contact support if you believe this is an error.`,
        type: 'warning',
      },
    });

    // Send rejection email (fire-and-forget)
    const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$' };
    const currency = process.env.DEFAULT_CURRENCY || 'NGN';
    const symbol = currencySymbols[currency] || '₦';

    sendPaymentRejectedEmail(
      payment.userId,
      payment.user.name,
      payment.user.email,
      {
        packageName: payment.package.name,
        amount: `${symbol}${payment.amount.toLocaleString()}`,
        reference: payment.reference || payment.transactionId || 'N/A',
        reason: reason.trim(),
      }
    ).catch(() => { /* fire-and-forget */ });

    return success(
      {
        paymentId: payment.id,
        status: 'failed',
        userName: payment.user.name,
        packageName: payment.package.name,
        amount: payment.amount,
        isFraud: false,
      },
      200,
      { message: 'Payment rejected' }
    );
  } catch (err) {
    console.error('Reject payment error:', err);
    return error('Failed to reject payment. Please try again.', 500);
  }
}
