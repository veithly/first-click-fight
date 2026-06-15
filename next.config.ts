import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/**": ["./migrations/**"],
  },
};

export default nextConfig;

// Makes the Cloudflare bindings (D1, vars) available to `next dev`.
initOpenNextCloudflareForDev();
