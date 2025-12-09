import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    domains: ['maps.google.com', 'maps.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
