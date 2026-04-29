import { NextRequest } from 'next/server';

/**
 * GET /api/payment/callback/paystack?reference=xxx&trxref=xxx
 *
 * Webhook/redirect endpoint for Paystack.
 * Redirects to the SPA for frontend verification.
 */
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
