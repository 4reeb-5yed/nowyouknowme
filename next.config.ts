import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
      // Allow custom R2 public domain if configured (e.g., cdn.yourdomain.com)
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // 'unsafe-inline' is required in script-src so the next-themes
            // bootstrap <script> can run synchronously before first paint and
            // apply the persisted/system theme without a flash of unstyled
            // content (Requirement 7.5). A nonce-based policy would be stricter
            // but forces dynamic rendering, which disables the ISR strategy the
            // public pages rely on (Requirements 7.1, 17.2).
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
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
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },

      // Cache-control for static assets in /public (e.g., SVGs, favicons)
      // These are content-addressable in practice but may change on redeploy
      {
        source: "/(.*)\\.(svg|ico|png|jpg|jpeg|webp|gif|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },

      // Note: /_next/static/* assets are automatically served with
      // "Cache-Control: public, max-age=31536000, immutable" by Vercel/Next.js.
      // These are content-hashed and safe to cache indefinitely. No manual
      // configuration is needed for this path.

      // Cache-control for uploaded file API responses
      // Uploaded files served through the app (e.g., resume downloads) benefit from
      // caching with revalidation since file URLs change on re-upload
      {
        source: "/api/upload/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
