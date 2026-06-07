import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Performance ────────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ── Images ─────────────────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ── Security & Caching HTTP Headers ────────────────────────────────────────
  async headers() {
    const devOrigins = process.env.NODE_ENV === 'development'
      ? " http://localhost:8000 http://127.0.0.1:8000 ws://localhost:* ws://127.0.0.1:*"
      : "";
    let envApiOrigin = "";
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        envApiOrigin = " " + new URL(process.env.NEXT_PUBLIC_API_URL).origin;
      } catch (e) {
        // Ignore invalid URL format
      }
    }

    return [
      {
        // Apply hardened headers to all routes
        source: '/:path*',
        headers: [
          // Force HTTPS for 2 years
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Prevent framing (clickjacking protection)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer info
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Basic CSP — tightened; allow Google Fonts, Supabase, Paystack, Vercel Live, and IP country lookup
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http:",
              `connect-src 'self' https://api.frontstore.app https://*.supabase.co https://*.supabase.in https://api.paystack.co https://fonts.googleapis.com https://ipapi.co https://vercel.live wss://ws-us3.pusher.com wss://*.vercel.live${devOrigins}${envApiOrigin}`,
              "frame-src https://checkout.paystack.com https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        // Long-lived cache for static assets
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|otf|css|js)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Never cache robots or sitemaps so crawlers always get fresh data
        source: '/(robots.txt|sitemap.xml|sitemap-:id.xml)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },

  // ── Redirects ──────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Normalise trailing slashes
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
