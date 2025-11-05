import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  typedRoutes: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
