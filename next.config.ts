import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // @sparticuz/chromium locates its .br binaries via a runtime-computed path,
  // so the file tracer misses them; include them explicitly for the PDF route.
  outputFileTracingIncludes: {
    "/api/quote-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./public/quote-art/flat/**/*",
    ],
  },
};

export default nextConfig;
