import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const rules: { source: string; destination: string }[] = [];
    const base = process.env.API_BASE_URL;
    const prefix = process.env.API_PREFIX || "";
    // If API_BASE_URL is set, expose proxy routes
    if (base) {
      // Safe opt-in path for backend: /backend/* -> backend
      rules.push({
        source: "/backend/:path*",
        destination: `${base}${prefix}/:path*`,
      });
      // Optional override: if API_PROXY=1 then route /api/* to backend too
      if (process.env.API_PROXY === "1") {
        rules.push({
          source: "/api/:path*",
          destination: `${base}${prefix}/:path*`,
        });
      }
    }
    return rules;
  },
};

export default nextConfig;
