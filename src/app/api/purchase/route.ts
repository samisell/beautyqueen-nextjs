import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, getUserFromRequest, getClientIp, rateLimit } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';

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
    const { packageId } = body;

    // Validate input
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

    // Generate unique transaction ID
    const transactionId = `TXN-${randomUUID().slice(0, 8).toUpperCase()}`;

    // Atomic transaction: create payment + purchased vote + notification
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

      const notification = await tx.notification.create({
        data: {
          userId: user.userId,
          title: 'Vote Package Purchased!',
          message: `You purchased the ${votePackage.name} package with ${totalVotes} votes (${votePackage.bonusVotes} bonus votes included!).`,
          type: 'success',
        },
      });

      return { payment, purchasedVote, notification };
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
      },
      201,
      { message: 'Vote package purchased successfully' }
    );
  } catch (err) {
    // Handle unique constraint violation for transactionId
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique')) {
      return error('Purchase processing error. Please try again.', 409);
    }

    console.error('Purchase error:', err);
    return error('Failed to process purchase. Please try again.', 500);
  }
}
