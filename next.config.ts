import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://*.telegram.org https://challenges.cloudflare.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com https://lh3.googleusercontent.com https://*.googleapis.com https://api.dicebear.com",
      "font-src 'self' data:",
      "connect-src 'self' https://beauty.venihost.com.ng wss: ws: https://challenges.cloudflare.com https://*.telegram.org https://api.paystack.co",
      "frame-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'self' https://*.telegram.org https://telegram.org https://web.telegram.org",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",

  // Strict type checking — DO NOT disable in production
  typescript: {
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,

  // Security headers applied to all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // API routes: stricter CSP, no inline scripts
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },

  // Body size limit: 10MB (for file uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
