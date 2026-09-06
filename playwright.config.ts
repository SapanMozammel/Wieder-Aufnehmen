import { defineConfig, devices } from '@playwright/test';

const apiPort = process.env.E2E_API_PORT ?? '4400';
const webPort = process.env.E2E_WEB_PORT ?? '3400';
const apiOrigin = `http://127.0.0.1:${apiPort}`;
const webOrigin = `http://127.0.0.1:${webPort}`;
const mongo = new URL(
  process.env.MONGODB_TEST_URI ?? 'mongodb://127.0.0.1:27018/?replicaSet=rs0&directConnection=true',
);
if (
  mongo.protocol !== 'mongodb:' ||
  !['127.0.0.1', 'localhost', '[::1]'].includes(mongo.hostname) ||
  mongo.username ||
  mongo.password
)
  throw new Error('Browser tests require a credential-free local MongoDB test URI.');
mongo.pathname = `/aufnehmen_browser_test_${process.pid}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['line']],
  outputDir: './test-results',
  use: { baseURL: webOrigin, screenshot: 'off', trace: 'off', video: 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'pnpm run build:api && pnpm run build:web && node --import tsx tooling/dev/run-services.ts all browser-test',
    url: `${webOrigin}/system-status`,
    reuseExistingServer: false,
    timeout: 180_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 18_000 },
    env: {
      HOST: '127.0.0.1',
      PORT: apiPort,
      WEB_PORT: webPort,
      NEXT_PUBLIC_API_BASE_URL: apiOrigin,
      CORS_ALLOWED_ORIGINS: webOrigin,
      TRUST_PROXY: 'false',
      MONGODB_URI: mongo.toString(),
    },
  },
});
