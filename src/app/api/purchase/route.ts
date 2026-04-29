import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request);
    if (error) return error;

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { success: false, message: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Find the vote package
    const votePackage = await db.votePackage.findUnique({
      where: { id: packageId },
    });

    if (!votePackage || !votePackage.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid or inactive vote package' },
        { status: 400 }
      );
    }

    const totalVotes = votePackage.votes + votePackage.bonusVotes;
    const transactionId = `TXN-${randomUUID().slice(0, 8).toUpperCase()}`;

    // Create payment record (mock - auto-complete)
    const payment = await db.payment.create({
      data: {
        userId: user!.userId,
        packageId,
        amount: votePackage.price,
        status: 'completed',
        paymentMethod: 'mock',
        transactionId,
      },
    });

    // Create purchased vote record
    const purchasedVote = await db.purchasedVote.create({
      data: {
        userId: user!.userId,
        packageId,
        votesAmount: totalVotes,
        votesUsed: 0,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: user!.userId,
        title: 'Vote Package Purchased!',
        message: `You purchased the ${votePackage.name} package with ${totalVotes} votes (${votePackage.bonusVotes} bonus votes included!).`,
        type: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
        },
        purchasedVote: {
          id: purchasedVote.id,
          votesAmount: purchasedVote.votesAmount,
          votesUsed: purchasedVote.votesUsed,
        },
        totalVotes,
      },
      message: 'Vote package purchased successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
