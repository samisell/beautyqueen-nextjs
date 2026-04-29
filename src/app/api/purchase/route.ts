import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, getUserFromRequest, getClientIp, rateLimit } from '@/lib/api-helpers';
import {
  initializePayment,
  generateTransactionId,
  generateReference,
  paymentConfig,
  type PaymentMethod,
} from '@/lib/payment-gateways';
import { randomUUID } from 'crypto';

/**
 * POST /api/purchase
 *
 * Body: { packageId: string, paymentMethod: 'flutterwave' | 'paystack' | 'offline' | 'mock' }
 *
 * For flutterwave/paystack:
 *   - Creates a pending payment, returns payment URL for redirect
 *   - Votes are NOT credited until payment is verified via /api/payment/verify
 *
 * For offline:
 *   - Creates a pending payment, user must upload proof via /api/payment/upload-proof
 *   - Admin must approve via /api/admin/payments/[id]/approve
 *
 * For mock (testing):
 *   - Instantly completes payment (legacy behavior)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10/min/IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 10)) {
      return error('Too many purchase requests. Please try again later.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { packageId, paymentMethod: methodInput } = body;

    // Validate payment method
    const validMethods: PaymentMethod[] = ['flutterwave', 'paystack', 'offline', 'mock'];
    const paymentMethod: PaymentMethod =
      validMethods.includes(methodInput) ? methodInput : 'mock';

    // Validate packageId
    if (!packageId || typeof packageId !== 'string') {
      return error('Package ID is required');
    }

    // Find the vote package
    const votePackage = await db.votePackage.findUnique({
      where: { id: packageId },
    });

    if (!votePackage) {
      return error('Vote package not found', 404);
    }
    if (!votePackage.isActive) {
      return error('This vote package is no longer available', 400);
    }

    const totalVotes = votePackage.votes + votePackage.bonusVotes;
    const transactionId = generateTransactionId();

    // ────────────────────────────────────────────
    // MOCK PAYMENT (instant completion, for testing)
    // ────────────────────────────────────────────
    if (paymentMethod === 'mock') {
      const result = await withTransaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId: user.userId,
            packageId,
            amount: votePackage.price,
            status: 'completed',
            paymentMethod: 'mock',
            transactionId,
          },
        });

        const purchasedVote = await tx.purchasedVote.create({
          data: {
            userId: user.userId,
            packageId,
            votesAmount: totalVotes,
            votesUsed: 0,
          },
        });

        await tx.notification.create({
          data: {
            userId: user.userId,
            title: 'Vote Package Purchased!',
            message: `You purchased the ${votePackage.name} package with ${totalVotes} votes (${votePackage.bonusVotes} bonus votes included!).`,
            type: 'success',
          },
        });

        return { payment, purchasedVote };
      });

      return success(
        {
          payment: {
            id: result.payment.id,
            amount: result.payment.amount,
            status: result.payment.status,
            transactionId: result.payment.transactionId,
            paymentMethod: result.payment.paymentMethod,
            createdAt: result.payment.createdAt,
          },
          purchasedVote: {
            id: result.purchasedVote.id,
            votesAmount: result.purchasedVote.votesAmount,
            votesUsed: result.purchasedVote.votesUsed,
            votesRemaining: result.purchasedVote.votesAmount - result.purchasedVote.votesUsed,
          },
          totalVotes,
          packageName: votePackage.name,
          paymentMethod,
        },
        201,
        { message: 'Vote package purchased successfully' }
      );
    }

    // ────────────────────────────────────────────
    // OFFLINE PAYMENT (bank transfer, requires proof upload)
    // ────────────────────────────────────────────
    if (paymentMethod === 'offline') {
      const reference = generateReference();

      const payment = await withTransaction(async (tx) => {
        const p = await tx.payment.create({
          data: {
            userId: user.userId,
            packageId,
            amount: votePackage.price,
            status: 'pending',
            paymentMethod: 'offline',
            transactionId,
            reference,
          },
        });

        await tx.notification.create({
          data: {
            userId: user.userId,
            title: 'Offline Payment Initiated',
            message: `You've initiated a ${votePackage.name} purchase (₦${votePackage.price.toLocaleString()}). Please upload your payment proof to complete the transaction.`,
            type: 'info',
          },
        });

        return p;
      });

      return success(
        {
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            transactionId: payment.transactionId,
            paymentMethod: payment.paymentMethod,
            reference: payment.reference,
            createdAt: payment.createdAt,
          },
          totalVotes,
          packageName: votePackage.name,
          paymentMethod: 'offline',
          bankDetails: paymentConfig.offline,
          nextStep: 'upload_proof',
          message: `Transfer ${votePackage.price.toLocaleString()} to the provided bank details, then upload your payment proof.`,
        },
        201,
        { message: 'Offline payment initiated. Please upload payment proof.' }
      );
    }

    // ────────────────────────────────────────────
    // FLUTTERWAVE / PAYSTACK (online payment)
    // ────────────────────────────────────────────

    // Get user email for gateway
    const userRecord = await db.user.findUnique({
      where: { id: user.userId },
      select: { email: true },
    });

    if (!userRecord) {
      return error('User not found', 404);
    }

    const initResult = await initializePayment({
      email: userRecord.email,
      amount: votePackage.price,
      packageId,
      userId: user.userId,
      paymentMethod,
      packageName: votePackage.name,
    });

    if (!initResult.success || !initResult.paymentUrl) {
      return error(initResult.message || 'Failed to initialize payment. Please try again.', 400);
    }

    // Create pending payment record
    const payment = await withTransaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          userId: user.userId,
          packageId,
          amount: votePackage.price,
          status: 'pending',
          paymentMethod,
          transactionId: initResult.transactionId,
          reference: initResult.reference,
        },
      });

      await tx.notification.create({
        data: {
          userId: user.userId,
          title: 'Payment Initiated',
          message: `Your payment for ${votePackage.name} (${totalVotes} votes) has been initiated. Complete payment to receive your votes.`,
          type: 'info',
        },
      });

      return p;
    });

    return success(
      {
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
          reference: payment.reference,
          createdAt: payment.createdAt,
        },
        paymentUrl: initResult.paymentUrl,
        reference: initResult.reference,
        totalVotes,
        packageName: votePackage.name,
        paymentMethod,
        isDemo: !(
          paymentMethod === 'flutterwave'
            ? paymentConfig.flutterwave.isConfigured
            : paymentConfig.paystack.isConfigured
        ),
        demoMessage: initResult.message,
        message: initResult.message,
      },
      201,
      { message: 'Payment initiated. Complete the payment to receive your votes.' }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique')) {
      return error('Purchase processing error. Please try again.', 409);
    }

    console.error('Purchase error:', err);
    return error('Failed to process purchase. Please try again.', 500);
  }
}
