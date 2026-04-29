import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, getClientIp, rateLimit } from '@/lib/api-helpers';

/**
 * POST /api/admin/payments/approve
 *
 * Body: { paymentId: string }
 *
 * Admin approves an offline payment.
 * - Changes payment status to 'completed'
 * - Creates PurchasedVote with the package votes
 * - Notifies the user
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
    const { paymentId } = body;

    if (!paymentId || typeof paymentId !== 'string') {
      return error('Payment ID is required');
    }

    // Find the payment
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

    if (payment.status !== 'awaiting_review' && payment.status !== 'pending') {
      return error(`Cannot approve a payment with status: ${payment.status}`, 400);
    }

    const totalVotes = payment.package.votes + payment.package.bonusVotes;

    // Check if purchased votes already exist for this payment
    const existingPurchased = await db.purchasedVote.findFirst({
      where: {
        userId: payment.userId,
        packageId: payment.packageId,
        createdAt: { gte: payment.createdAt },
      },
    });

    if (existingPurchased) {
      return error('Votes have already been credited for this payment', 400);
    }

    // Approve in transaction
    await withTransaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          reviewedBy: user.userId,
          reviewedAt: new Date(),
        },
      });

      await tx.purchasedVote.create({
        data: {
          userId: payment.userId,
          packageId: payment.packageId,
          votesAmount: totalVotes,
          votesUsed: 0,
        },
      });

      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: 'Payment Approved! 🎉',
          message: `Your offline payment for ${payment.package.name} (${totalVotes} votes, ${payment.amount.toLocaleString()}) has been approved. Your votes are now available!`,
          type: 'success',
        },
      });
    });

    return success(
      {
        paymentId: payment.id,
        status: 'completed',
        votesCredited: totalVotes,
        userName: payment.user.name,
        packageName: payment.package.name,
        amount: payment.amount,
      },
      200,
      { message: 'Payment approved and votes credited successfully' }
    );
  } catch (err) {
    console.error('Approve payment error:', err);
    return error('Failed to approve payment. Please try again.', 500);
  }
}
