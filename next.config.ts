import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'playwright',
    'playwright-core',
    'playwright-extra',
    'puppeteer-extra-plugin-stealth',
    'puppeteer-extra',
  ],
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
