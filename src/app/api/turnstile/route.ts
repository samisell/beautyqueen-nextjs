import { NextRequest } from 'next/server';

// Cloudflare Turnstile secret key (keep this private!)
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!TURNSTILE_SECRET_KEY) {
      console.warn('[Turnstile] TURNSTILE_SECRET_KEY not configured');
      // In development, allow through if not configured
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify with Cloudflare
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);

    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await verificationResponse.json();

    if (data.success) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Turnstile verification failed',
          'error-codes': data['error-codes'] 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}