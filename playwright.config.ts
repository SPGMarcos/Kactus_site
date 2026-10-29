import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { viewport: { width: 360, height: 800 }, isMobile: true },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
