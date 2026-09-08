import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheHandler: require.resolve("./cache-handler.js"),

  serverExternalPackages: ["ioredis"],

  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@hugeicons/react"],
  },
};

export default nextConfig;
