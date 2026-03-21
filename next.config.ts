import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/v1/shipments/calculate": [
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
  },
  images: {
    remotePatterns: [
      new URL("https://*.public.blob.vercel-storage.com/**"),
    ],
  },
};

export default nextConfig;
