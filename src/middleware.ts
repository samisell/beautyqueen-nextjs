import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — CORS for API routes
 *
 * In Next.js 16, this file uses the legacy "middleware" convention.
 * Security headers (CSP, X-Frame-Options, etc.) are configured in next.config.ts.
 * This middleware handles CORS preflight requests for API routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    const origin = request.headers.get('origin');
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  // Add CORS headers to API responses
  const response = NextResponse.next();
  const origin = request.headers.get('origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
