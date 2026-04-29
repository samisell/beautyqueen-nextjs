import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, getClientIp, rateLimit } from '@/lib/api-helpers';
import { sendPaymentApprovedEmail } from '@/lib/email';

/**
 * POST /api/admin/payments/approve
 *
 * Body: { paymentId: string }
 *
 * Admin approves an offline payment.
 * - Changes payment status to 'completed'
 * - Creates PurchasedVote with the package votes (linked to payment)
 * - Notifies the user via in-app notification
 * - Sends approval email
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
        paymentId: payment.id,
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
          paymentId: payment.id,
          votesAmount: totalVotes,
          votesUsed: 0,
        },
      });

      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: 'Payment Approved! 🎉',
          message: `Your offline payment for ${payment.package.name} (${totalVotes} votes, ₦${payment.amount.toLocaleString()}) has been approved. Your votes are now available!`,
          type: 'success',
        },
      });
    });

    // Send approval email (fire-and-forget)
    const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$' };
    const currency = process.env.DEFAULT_CURRENCY || 'NGN';
    const symbol = currencySymbols[currency] || '₦';

    sendPaymentApprovedEmail(
      payment.userId,
      payment.user.name,
      payment.user.email,
      {
        packageName: payment.package.name,
        votes: String(totalVotes),
        amount: `${symbol}${payment.amount.toLocaleString()}`,
        reference: payment.reference || payment.transactionId || 'N/A',
      }
    ).catch(() => { /* fire-and-forget */ });

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
