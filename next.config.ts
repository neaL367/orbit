import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.anilist.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    formats: ['image/webp'],
    minimumCacheTTL: 2678400, // 31 days
  },
  experimental: {
    ppr: 'incremental',
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
