import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // Fix for Tesseract.js
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
