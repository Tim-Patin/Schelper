import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = false; // Disable caching
    }
    return config;
  },
};

export default nextConfig;
