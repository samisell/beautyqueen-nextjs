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
    ].join('; '),
  },
];

const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['beauty.venihost.com.ng'],

  typescript: {
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
