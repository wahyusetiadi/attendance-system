import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Output untuk Docker deployment
  output: 'standalone',
  
  // Disable telemetry
  telemetry: false,
  
  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },

  // TypeScript & ESLint
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      'development-pkkp-api.edunusa.co.id',
      'staging-pkkp-api.edunusa.co.id',
      'pkkp-api.edunusa.co.id'
    ],
    unoptimized: true, // Add this if having issues with image optimization
  },

  // Environment
  env: {
    BUILD_ENV: process.env.BUILD_ENV || 'production',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Webpack: perbaikan alias + fallback
  webpack: (config, { dev, isServer }) => {
    // Alias "@" -> "src"
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
    };

    // Optional: fallback node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },

  // Output settings
  trailingSlash: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
