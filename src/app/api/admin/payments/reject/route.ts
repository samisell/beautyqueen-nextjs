import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin, getClientIp, rateLimit } from '@/lib/api-helpers';

/**
 * POST /api/admin/payments/reject
 *
 * Body: { paymentId: string, reason: string }
 *
 * Admin rejects an offline payment with a reason.
 * - Changes payment status to 'failed'
 * - Notifies the user with the rejection reason
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
    const { paymentId, reason } = body;

    if (!paymentId || typeof paymentId !== 'string') {
      return error('Payment ID is required');
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return error('Rejection reason is required (minimum 5 characters)');
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
      return error(`Cannot reject a payment with status: ${payment.status}`, 400);
    }

    // Reject the payment
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
        message: `Your offline payment for ${payment.package.name} (${payment.amount.toLocaleString()}) was not approved. Reason: ${reason.trim()}. Please contact support if you believe this is an error.`,
        type: 'warning',
      },
    });

    return success(
      {
        paymentId: payment.id,
        status: 'failed',
        userName: payment.user.name,
        packageName: payment.package.name,
        amount: payment.amount,
      },
      200,
      { message: 'Payment rejected' }
    );
  } catch (err) {
    console.error('Reject payment error:', err);
    return error('Failed to reject payment. Please try again.', 500);
  }
}
