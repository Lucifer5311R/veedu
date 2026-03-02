import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.meesho.com",
      },

    ],
  },
};

export default nextConfig;
