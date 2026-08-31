import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Firebase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
