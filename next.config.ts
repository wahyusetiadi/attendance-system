import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  
  // Build configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ PERBAIKI: App Router sudah stable di Next.js 15
  experimental: {
    // Tidak perlu appDir di Next.js 15
  },
  
  // Image optimization
  images: {
    // ✅ PERBAIKI: Gunakan remotePatterns untuk Next.js 15
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'development-pkkp-api.edunusa.co.id',
      },
      {
        protocol: 'https',
        hostname: 'staging-pkkp-api.edunusa.co.id',
      },
      {
        protocol: 'https',
        hostname: 'pkkp-api.edunusa.co.id',
      },
    ],
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    BUILD_ENV: process.env.BUILD_ENV || 'production',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Fix for module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
  
  // Output configuration
  trailingSlash: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;