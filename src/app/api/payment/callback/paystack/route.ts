import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success } from '@/lib/api-helpers';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Paystack Webhook Handler
//
// POST /api/payment/callback/paystack
//
// Paystack sends a POST with a JSON body. The `x-paystack-signature` header
// contains an HMAC-SHA512 hash of the raw body using your secret key.
// We verify this signature before processing the event.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      console.error('[Webhook] PAYSTACK_SECRET_KEY not configured');
      return new Response('Webhook not configured', { status: 500 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Verify signature
    const signature = request.headers.get('x-paystack-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const expectedHash = crypto
      .createHmac('sha512', paystackSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedHash) {
      console.warn('[Webhook] Paystack: Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = body.event as string;
    const data = body.data as Record<string, unknown>;

    // Process charge.success event
    if (event === 'charge.success') {
      const reference = data.reference as string;
      const status = data.status as string;

      if (status === 'success' && reference) {
        const payment = await db.payment.findFirst({
          where: { reference, status: 'pending' },
          include: { package: true, user: { select: { id: true, name: true, email: true } } },
        });

        if (payment) {
          const totalVotes = payment.package.votes + payment.package.bonusVotes;

          // Use transaction for atomicity
          await db.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'completed',
                gatewayRef: String(data.id || ''),
              },
            });

            const purchasedVote = await tx.purchasedVote.create({
              data: {
                userId: payment.userId,
                packageId: payment.packageId,
                paymentId: payment.id,
                votesAmount: totalVotes,
                votesUsed: 0,
              },
            });

            // Batch create votes
            if (payment.contestantId) {
              const voteData = Array.from({ length: totalVotes }, () => ({
                contestantId: payment.contestantId as string,
                userId: payment.userId,
                voteType: 'purchased' as const,
                purchasedVoteId: purchasedVote.id,
              }));
              if (voteData.length > 0) {
                await tx.vote.createMany({ data: voteData });
                await tx.contestant.update({
                  where: { id: payment.contestantId },
                  data: { totalVotes: { increment: totalVotes } },
                });
              }
            }

            await tx.notification.create({
              data: {
                userId: payment.userId,
                title: 'Payment Successful! 🎉',
                message: `Your payment for ${payment.package.name} (${totalVotes} votes) has been confirmed.`,
                type: 'success',
              },
            });
          });

          console.log(`[Webhook] Paystack: Payment ${reference} completed, ${totalVotes} votes credited`);
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[Webhook] Paystack error:', err);
    return new Response('Internal error', { status: 500 });
  }
}

// GET handler for redirect callback (keeps backward compatibility)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (!reference) {
    return new Response('Missing reference parameter', { status: 400 });
  }

  const redirectUrl = `${appUrl}/?payment_verify=1&reference=${encodeURIComponent(reference)}&method=paystack`;
  return new Response(null, {
    status: 302,
    headers: { Location: redirectUrl },
  });
}
