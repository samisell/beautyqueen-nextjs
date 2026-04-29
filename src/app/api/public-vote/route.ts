import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getClientIp, rateLimit } from '@/lib/api-helpers';
import { generateReference, generateTransactionId } from '@/lib/payment-gateways';
import { randomUUID } from 'crypto';

/**
 * POST /api/public-vote
 *
 * Allows unauthenticated users to purchase votes for a contestant.
 * No login required — anyone can buy votes for any active contestant.
 *
 * Body: { contestantId: string, packageId: string, payerEmail: string, payerName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 15/min/IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 15)) {
      return error('Too many requests. Please try again later.', 429);
    }

    const body = await request.json();
    const { contestantId, packageId, payerEmail, payerName } = body;

    // Validate required fields
    if (!contestantId || typeof contestantId !== 'string') {
      return error('Contestant ID is required');
    }
    if (!packageId || typeof packageId !== 'string') {
      return error('Package ID is required');
    }
    if (!payerEmail || typeof payerEmail !== 'string') {
      return error('Payer email is required');
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return error('Invalid payer email address');
    }

    // Check contestant exists and is active
    const contestant = await db.contestant.findUnique({
      where: { id: contestantId },
      include: {
        stage: {
          include: { tournament: true },
        },
        categoryRel: true,
      },
    });

    if (!contestant) {
      return error('Contestant not found', 404);
    }

    if (contestant.status !== 'active') {
      return error('Voting is not available for this contestant', 400);
    }

    // Check vote package exists and is active
    const votePackage = await db.votePackage.findUnique({
      where: { id: packageId },
    });

    if (!votePackage) {
      return error('Vote package not found', 404);
    }

    if (!votePackage.isActive) {
      return error('This vote package is no longer available', 400);
    }

    // Find or create a placeholder user for the payer (if they don't have an account)
    // For public voting, we create a minimal record for tracking
    let payerUserId = '';
    const existingUser = await db.user.findUnique({
      where: { email: payerEmail },
      select: { id: true },
    });

    if (existingUser) {
      payerUserId = existingUser.id;
    } else {
      // Create a minimal user record for anonymous voters
      const newUser = await db.user.create({
        data: {
          email: payerEmail,
          name: payerName || payerEmail.split('@')[0],
          password: randomUUID(), // Placeholder password (won't be used for login)
          referralCode: `PV-${randomUUID().substring(0, 8).toUpperCase()}`,
        },
      });
      payerUserId = newUser.id;
    }

    // Calculate total votes
    const totalVotes = votePackage.votes + votePackage.bonusVotes;
    const reference = generateReference();
    const transactionId = generateTransactionId();

    // Create a pending payment record
    const payment = await db.payment.create({
      data: {
        userId: payerUserId,
        packageId: votePackage.id,
        contestantId: contestant.id,
        amount: votePackage.price,
        status: 'pending',
        paymentMethod: 'paystack',
        transactionId,
        reference,
        // Store payer info in reference-related fields
        depositorName: payerName || null,
      },
    });

    // Get platform settings
    const [
      votePriceSetting,
      currencySetting,
      platformNameSetting,
    ] = await Promise.all([
      db.platformSetting.findUnique({ where: { key: 'votePrice' } }),
      db.platformSetting.findUnique({ where: { key: 'currency' } }),
      db.platformSetting.findUnique({ where: { key: 'platformName' } }),
    ]);

    return success(
      {
        paymentUrl: null, // Mock — in production this would be a Paystack/Flutterwave URL
        reference: payment.reference,
        amount: payment.amount,
        votes: totalVotes,
        contestant: {
          id: contestant.id,
          name: contestant.name,
          imageUrl: contestant.imageUrl,
        },
        platform: {
          votePrice: votePriceSetting?.value || '100',
          currency: currencySetting?.value || 'NGN',
          platformName: platformNameSetting?.value || 'Beauty Vote',
        },
        message: 'Payment initiated. Complete the payment to credit votes.',
      },
      201,
      { message: 'Public vote payment initiated successfully' }
    );
  } catch (err) {
    console.error('Public vote error:', err);
    return error('Failed to initiate vote purchase. Please try again.', 500);
  }
}
