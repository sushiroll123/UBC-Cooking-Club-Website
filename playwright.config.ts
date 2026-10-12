import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL, browserName: "chromium" },
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
    url: `${baseURL}/menu`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
