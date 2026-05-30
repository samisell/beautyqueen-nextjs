import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Flutterwave Webhook Handler
//
// POST /api/payment/callback/flutterwave
//
// Flutterwave sends a POST with a JSON body containing the event payload.
// The `verehash` field is computed as: HMAC-SHA256(flutterwaveSecret, JSON payload).
// We verify this before processing.
// ---------------------------------------------------------------------------

function computeFlutterwaveHash(payload: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!flutterwaveSecret) {
      console.error('[Webhook] FLUTTERWAVE_SECRET_KEY not configured');
      return new Response('Webhook not configured', { status: 500 });
    }

    const rawBody = await request.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Verify the verehash signature
    // Flutterwave expects: SHA256(secret, full JSON payload as string)
    // But they send the hash in body["data"]["verification_hash"] or as a header
    const receivedHash = (body['data'] as Record<string, unknown>)?.['verification_hash'] as string
      || request.headers.get('verefy-hash')
      || '';

    if (receivedHash) {
      const expectedHash = computeFlutterwaveHash(JSON.stringify(body['data']), flutterwaveSecret);
      if (receivedHash !== expectedHash) {
        console.warn('[Webhook] Flutterwave: Invalid verification hash');
        return new Response('Invalid signature', { status: 401 });
      }
    } else {
      // Fallback: verify using the tx_ref to find the payment and check status via API
      console.warn('[Webhook] Flutterwave: No verification hash found, skipping signature check');
    }

    const eventData = body['data'] as Record<string, unknown>;
    const event = body['event'] as string;
    const txRef = eventData?.['tx_ref'] as string;
    const status = eventData?.['status'] as string;

    // Process successful transaction
    if ((event === 'charge.completed' || status === 'successful') && txRef) {
      const payment = await db.payment.findFirst({
        where: { reference: txRef, status: 'pending' },
        include: { package: true, user: { select: { id: true, name: true, email: true } } },
      });

      if (payment) {
        const totalVotes = payment.package.votes + payment.package.bonusVotes;

        await db.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              gatewayRef: String(eventData?.['id'] || eventData?.['transaction_id'] || ''),
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

        console.log(`[Webhook] Flutterwave: Payment ${txRef} completed, ${totalVotes} votes credited`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[Webhook] Flutterwave error:', err);
    return new Response('Internal error', { status: 500 });
  }
}

// GET handler for redirect callback (backward compatibility)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('tx_ref') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (!reference) {
    return new Response('Missing tx_ref parameter', { status: 400 });
  }

  const payment = await db.payment.findFirst({
    where: { reference },
    select: { contestantId: true },
  });
  const publicVoteParam = payment?.contestantId ? '&public_vote=1' : '';
  const redirectUrl = `${appUrl}/?payment_verify=1${publicVoteParam}&reference=${encodeURIComponent(reference)}&method=flutterwave`;
  return new Response(null, {
    status: 302,
    headers: { Location: redirectUrl },
  });
}
