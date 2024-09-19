import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import * as path from "node:path";

dotenv.config({
  path: "./.env.dev",
});

dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 2000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  maxFailures: 9,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"]],
  use: {
    // trace: "on-first-retry",
    locale: "de-DE",
    timezoneId: "Europe/Brussels",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    /*
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
    */
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    //    {
    //      name: 'Microsoft Edge',
    //      use: { channel: 'msedge' },
    //    },
    // {
    //   name: 'Google Chrome',
    //   use: { channel: 'chrome' },
    // },
  ],
  outputDir: "test-results/",
});
