import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'url';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const FRONTEND_URL: string = process.env.FRONTEND_URL || '';

dotenv.config({
  path: './.env.dev',
});

dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 2000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  maxFailures: 9,
  workers: process.env.CI ? 6 : undefined,
  reporter: [['html']],
  use: {
    trace: 'on-first-retry',
    locale: 'de-DE',
    timezoneId: 'Europe/Brussels',
    screenshot: 'only-on-failure',
    baseURL: FRONTEND_URL,
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
      },
    },
    /* Test against branded browsers. */
    {
      name: 'msedge',
      use: {
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
        viewport: { width: 1920, height: 1080 },
      },
    },
    /* Test against mobile viewports. */
    // {
    //   name: 'mobileChromeIphone12Pro',
    //   use: {
    //      ...devices['iPhone 12 Pro'],
    //      viewport: { width: 390, height: 844 },
    //     ignoreHTTPSErrors: true
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  outputDir: 'test-results/',
});
