import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Images are stored inline as data URLs, so allow larger action payloads.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;

// Exposes Cloudflare bindings (local D1) to `next dev`.
initOpenNextCloudflareForDev();
