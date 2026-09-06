import type { NextConfig } from 'next';
import { parsePublicWebConfig } from './src/lib/api/public-config';

// Next loads its own environment files. Validate public configuration before
// serving or building so deployment mistakes cannot silently target localhost.
parsePublicWebConfig({ NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL });

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@aufnehmen/contracts'],
  webpack(config, { dev }) {
    if (dev) {
      // Shared NodeNext source uses the .js paths emitted by tsc. Resolve those
      // imports to TypeScript during development without changing build output.
      config.resolve.extensionAlias = {
        ...config.resolve.extensionAlias,
        '.js': ['.ts', '.tsx', '.js'],
      };
    }
    return config;
  },
  // Repository-owned AI instructions must not be overwritten by next dev.
  agentRules: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default config;
