import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': fromRoot('./apps/web/src'),
      '@aufnehmen/contracts': fromRoot('./packages/contracts/src/index.ts'),
      '@aufnehmen/testing': fromRoot('./packages/testing/src/index.ts'),
    },
  },
  test: {
    include: [
      'packages/**/src/**/*.test.ts',
      'apps/**/*.test.{ts,tsx}',
      'tooling/**/*.test.ts',
      'tests/**/*.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      'apps/api/tests/**/*.integration.test.ts',
    ],
    environment: 'node',
  },
});
