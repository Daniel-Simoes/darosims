import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  serverExternalPackages: ['@supabase/supabase-js'],
  async rewrites() {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: '/index.html',
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: corsOrigin },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
          { key: 'Vary', value: 'Authorization' },
        ],
      },
      {
        source: '/((?!assets/).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
