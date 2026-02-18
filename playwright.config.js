// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  timeout: 30 * 60 * 1800, // 30 minutes
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ✅ HTML + Allure reporter
  reporter: [
    ['html', { open: 'always' }],
    ['allure-playwright']
  ],

  use: {

    slowMo: 300,
    viewport: null,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on'
    
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});