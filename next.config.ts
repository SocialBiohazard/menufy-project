import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      // Uploads are capped and decoded again in lib/image-processing.ts.
      // Leave room above the 8 MB source limit for multipart form metadata.
      bodySizeLimit: "9mb",
    },
  },
  images: {
    // Generated menu images have content-addressed URLs, so optimized variants
    // can remain cached for a long time at the browser/CDN boundary.
    minimumCacheTTL: 31_536_000,
    qualities: [60, 70, 75, 80],
    remotePatterns: [
      // Sample/demo imagery.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
