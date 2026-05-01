import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Output untuk Docker deployment
  output: 'standalone',
  
  // Telemetry is controlled via env (NEXT_TELEMETRY_DISABLED)
  
  // API rewrites
  async rewrites() {
    const apiMode = process.env.NEXT_PUBLIC_API_MODE || "mock";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Default aman untuk demo / Vercel: tidak melakukan proxy ke backend
    if (apiMode !== "real") return [];

    if (!apiUrl) {
      console.warn("[next.config] NEXT_PUBLIC_API_MODE=real tapi NEXT_PUBLIC_API_URL kosong. Rewrites dimatikan.");
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // TypeScript & ESLint
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    // Next.js build uses child_process workers by default; on some Windows setups this can fail with `spawn EPERM`.
    // Switching to worker_threads avoids spawning processes.
    workerThreads: true,
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
    NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE || "mock",
    NEXT_PUBLIC_ENABLE_MOCK_DEVTOOLS: process.env.NEXT_PUBLIC_ENABLE_MOCK_DEVTOOLS || "false",
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
