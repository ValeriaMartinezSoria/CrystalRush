import { defineConfig, devices } from '@playwright/test'

const environment = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const baseURL = environment.BASE_URL ?? 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome']
  },
  ...(environment.BASE_URL
    ? {}
    : {
        webServer: {
          command: 'npm run build && npm run start --workspace backend',
          url: 'http://127.0.0.1:3000',
          reuseExistingServer: !environment.CI,
          timeout: 120000
        }
      })
})
