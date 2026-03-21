import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
  images: {
    remotePatterns: [
      new URL("https://*.public.blob.vercel-storage.com/**"),
    ],
  },
};

export default nextConfig;
