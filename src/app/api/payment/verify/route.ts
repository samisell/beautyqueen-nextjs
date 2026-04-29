import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, getUserFromRequest, getClientIp, rateLimit } from '@/lib/api-helpers';
import { verifyPayment, type PaymentMethod } from '@/lib/payment-gateways';
import { sendPaymentSuccessfulEmail } from '@/lib/email';

/**
 * GET /api/payment/verify?reference=xxx&method=flutterwave|paystack
 *
 * Verifies a payment after the user is redirected back from the gateway.
 * Can be called by the frontend OR as a redirect callback.
 *
 * - If payment is verified as successful → creates PurchasedVote (linked to payment), marks payment completed, sends email
 * - If payment is pending → returns pending status
 * - If payment failed → marks payment as failed
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const methodInput = searchParams.get('method') as string;
    const isDemo = searchParams.get('demo') === '1';

    if (!reference) {
      return error('Reference is required');
    }

    const validMethods: PaymentMethod[] = ['flutterwave', 'paystack'];
    const method = validMethods.includes(methodInput as PaymentMethod)
      ? (methodInput as PaymentMethod)
      : null;

    if (!method) {
      return error('Payment method is required (flutterwave or paystack)');
    }

    // Rate limit
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many verification requests. Please try again later.', 429);
    }

    // Find the payment by reference
    const payment = await db.payment.findFirst({
      where: { reference },
      include: {
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!payment) {
      return error('Payment record not found', 404);
    }

    // Already completed — return success
    if (payment.status === 'completed') {
      const purchasedVote = await db.purchasedVote.findFirst({
        where: { userId: payment.userId, packageId: payment.packageId, paymentId: payment.id },
      });

      return success({
        paymentId: payment.id,
        status: 'completed',
        message: 'Payment already verified and votes credited.',
        votesCredited: purchasedVote?.votesAmount || 0,
        paymentMethod: payment.paymentMethod,
      });
    }

    // Already failed or rejected
    if (payment.status === 'failed' || payment.status === 'rejected') {
      return success({
        paymentId: payment.id,
        status: payment.status,
        message: `Payment was previously marked as ${payment.status}.`,
        paymentMethod: payment.paymentMethod,
      });
    }

    // Verify with gateway
    const result = await verifyPayment({ reference, paymentMethod: method });

    if (result.success && result.status === 'completed') {
      const totalVotes = payment.package.votes + payment.package.bonusVotes;

      // Complete the payment atomically
      const purchasedVote = await withTransaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            gatewayRef: result.gatewayTransactionId || null,
          },
        });

        const pv = await tx.purchasedVote.create({
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
            title: 'Payment Successful! 🎉',
            message: `Your payment for ${payment.package.name} (${totalVotes} votes) has been confirmed. Your votes are now available!`,
            type: 'success',
          },
        });

        return pv;
      });

      // Send success email (fire-and-forget)
      const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$' };
      const currency = process.env.DEFAULT_CURRENCY || 'NGN';
      const symbol = currencySymbols[currency] || '₦';
      const methodLabel = method.charAt(0).toUpperCase() + method.slice(1);

      sendPaymentSuccessfulEmail(
        payment.userId,
        payment.user.name,
        payment.user.email,
        {
          packageName: payment.package.name,
          votes: String(totalVotes),
          amount: `${symbol}${payment.amount.toLocaleString()}`,
          method: methodLabel,
          reference: payment.reference || payment.transactionId || 'N/A',
        }
      ).catch(() => { /* fire-and-forget */ });

      return success({
        paymentId: payment.id,
        status: 'completed',
        message: 'Payment verified successfully! Votes have been credited to your account.',
        votesCredited: totalVotes,
        totalVotes,
        packageName: payment.package.name,
        paymentMethod: payment.paymentMethod,
      });
    }

    if (result.status === 'pending') {
      return success({
        paymentId: payment.id,
        status: 'pending',
        message: result.message || 'Payment is still being processed. Please check back shortly.',
        paymentMethod: payment.paymentMethod,
      });
    }

    // Payment failed
    await db.payment.update({
      where: { id: payment.id },
      data: { status: 'failed' },
    });

    await db.notification.create({
      data: {
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your payment for ${payment.package.name} was not successful. Please try again or contact support.`,
        type: 'error',
      },
    });

    return success({
      paymentId: payment.id,
      status: 'failed',
      message: result.message || 'Payment verification failed.',
      paymentMethod: payment.paymentMethod,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    return error('Failed to verify payment. Please try again.', 500);
  }
}
