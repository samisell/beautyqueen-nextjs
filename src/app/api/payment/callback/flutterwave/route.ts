import { NextRequest } from 'next/server';

/**
 * GET /api/payment/callback/flutterwave?tx_ref=xxx&status=xxx
 *
 * Webhook/redirect endpoint for Flutterwave.
 * Redirects to the SPA for frontend verification.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('tx_ref') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (!reference) {
    return new Response('Missing tx_ref parameter', { status: 400 });
  }

  const redirectUrl = `${appUrl}/?payment_verify=1&reference=${encodeURIComponent(reference)}&method=flutterwave`;

  return new Response(null, {
    status: 302,
    headers: { Location: redirectUrl },
  });
}
