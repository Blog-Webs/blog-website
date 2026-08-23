import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "https://httptechnex.onrender.com/api";
    const origin = backendUrl.replace(/\/api\/?$/, '');
    return [
      {
        source: "/api/:path*",
        destination: `${origin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

