import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * End-to-end tests against the production build (`npm run build` first).
 * Two servers from the same build:
 *  - :3200 without e-mail configuration (honest WhatsApp fallback),
 *  - :3201 with the local test transport (QUOTE_TEST_OUTBOX_DIR) to prove the real form path
 *    without sending e-mails to the workshop.
 * WebGL runs on SwiftShader (software) in CI containers.
 */
// Each invocation gets a fresh transport directory; workers inherit the run ID.
// Old local test messages must not be counted as newly submitted requests.
process.env.DAL_E2E_RUN_ID ??= randomUUID();
export const OUTBOX = path.join(__dirname, 'test-results', `outbox-${process.env.DAL_E2E_RUN_ID}`);

const webglArgs = ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'];

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-report.json' }]],
  use: {
    baseURL: 'http://localhost:3200',
    trace: 'retain-on-failure',
    launchOptions: { args: webglArgs },
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
      testMatch: /mobile\.spec\.ts|screens\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'npx next start -H 127.0.0.1 -p 3200',
      url: 'http://localhost:3200',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { QUOTE_TEST_OUTBOX_DIR: '', RESEND_API_KEY: '', UPSTASH_REDIS_REST_URL: '' },
    },
    {
      command: 'npx next start -H 127.0.0.1 -p 3201',
      url: 'http://localhost:3201',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { QUOTE_TEST_OUTBOX_DIR: OUTBOX },
    },
  ],
});
