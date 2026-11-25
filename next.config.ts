import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Off on purpose: with Partial Prefetching, Next.js renders every dynamic page a second time
  // (an embedded "runtime prefetch") and that second render runs all the page's database
  // queries again. Our pages read the session first, so the prefetch can't use them anyway.
  // Links still prefetch each page's static shell (loading skeleton).
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
