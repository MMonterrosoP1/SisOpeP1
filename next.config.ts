import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@hugeicons/react"],
  },
};

export default nextConfig;
