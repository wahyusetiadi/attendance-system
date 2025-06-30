import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://dante.edunex.id:3305/api/:path*',
      },
    ]
  },
};

export default nextConfig;
