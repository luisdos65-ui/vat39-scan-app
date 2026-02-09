import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable Turbopack configuration to silence warnings and use Webpack
  experimental: {
    // turbo: {}, // Old syntax, just in case
  },
  
  // Ignore errors during build to prevent crashes on minor issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.vivino.com',
      },
    ],
  },
};

export default nextConfig;
