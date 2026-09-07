import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheHandler: require.resolve("./cache-handler.js"),
  serverExternalPackages: ["redis", "@neshca/cache-handler"],
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@hugeicons/react"],
  },
};

export default nextConfig;
