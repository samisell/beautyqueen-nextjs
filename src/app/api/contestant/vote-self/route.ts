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

/**
 * POST /api/contestant/vote-self
 *
 * Allows a contestant to purchase votes for themselves.
 * Body: { packageId: string, paymentMethod: 'flutterwave' | 'paystack' | 'offline' | 'mock' }
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 10)) {
      return error('Too many purchase requests. Please try again later.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const contestant = await db.contestant.findUnique({
      where: { userId: user.userId },
    });

    if (!contestant) {
      return error('You must be a contestant to vote for yourself. Join a tournament first.', 400);
    }

    if (contestant.status !== 'active') {
      return error(`Cannot vote with status: ${contestant.status}`, 400);
    }

    const votingSetting = await db.platformSetting.findUnique({
      where: { key: 'votingEnabled' },
    });
    if (votingSetting?.value === 'false') {
      return error('Voting is currently disabled by the administrator.', 400);
    }

    const body = await request.json();
    const { packageId, paymentMethod: methodInput } = body;

    const validMethods: PaymentMethod[] = ['flutterwave', 'paystack', 'offline', 'mock'];
    const paymentMethod: PaymentMethod =
      validMethods.includes(methodInput) ? methodInput : 'mock';

    if (!packageId || typeof packageId !== 'string') {
      return error('Package ID is required');
    }

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

    // ── MOCK PAYMENT (instant) ──
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
            contestantId: contestant.id,
          },
        });

        const votePromises = Array.from({ length: totalVotes }, () =>
          tx.vote.create({
            data: {
              contestantId: contestant.id,
              userId: user.userId,
              voteType: 'paid',
            },
          })
        );
        await Promise.all(votePromises);

        await tx.contestant.update({
          where: { id: contestant.id },
          data: { totalVotes: { increment: totalVotes } },
        });

        await tx.notification.create({
          data: {
            userId: user.userId,
            title: `You voted for yourself! +${totalVotes} votes`,
            message: `You purchased ${votePackage.name} and ${totalVotes} votes have been added to your profile.`,
            type: 'success',
          },
        });

        return { payment };
      });

      return success(
        {
          payment: {
            id: result.payment.id,
            amount: result.payment.amount,
            status: result.payment.status,
          },
          totalVotes,
          packageName: votePackage.name,
          contestantName: contestant.name,
          message: `${totalVotes} votes added to your profile!`,
        },
        201,
        { message: 'Self-vote completed successfully' }
      );
    }

    // ── OFFLINE PAYMENT ──
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
            contestantId: contestant.id,
          },
        });

        await tx.notification.create({
          data: {
            userId: user.userId,
            title: 'Self-Vote: Offline Payment Initiated',
            message: `Transfer the amount for ${votePackage.name} and upload proof to complete.`,
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
          },
          totalVotes,
          packageName: votePackage.name,
          paymentMethod: 'offline',
          bankDetails: paymentConfig.offline,
          nextStep: 'upload_proof',
          message: `Transfer to the bank details, then upload proof.`,
        },
        201,
        { message: 'Offline payment initiated.' }
      );
    }

    // ── FLUTTERWAVE / PAYSTACK ──
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
      return error(initResult.message || 'Failed to initialize payment.', 400);
    }

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
          contestantId: contestant.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: user.userId,
          title: 'Self-Vote: Payment Initiated',
          message: `Complete your payment for ${totalVotes} self-votes.`,
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
      { message: 'Payment initiated.' }
    );
  } catch (err) {
    console.error('Self-vote error:', err);
    return error('Failed to process purchase.', 500);
  }
}
