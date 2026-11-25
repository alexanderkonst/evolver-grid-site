import { defineConfig, devices } from "@playwright/test";
import { BYPASS_STATE } from "./global-setup";

/**
 * QA as code (docs/templates/qa-pass.md).
 *
 * The suite checks a deployed URL: the PR's Vercel preview in CI, or a local dev server.
 *   PREVIEW_URL=https://<preview>.vercel.app npx playwright test
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test --project=phone
 *
 * Fixed viewports (qa-pass §2): desktop 1440x900, tablet 768x1024, phone 390x844, plus the same
 * desktop with `prefers-reduced-motion: reduce`. Guest view only: no sign-in, no submits.
 *
 * A Vercel preview behind Deployment Protection needs the "Protection Bypass for Automation"
 * secret in VERCEL_AUTOMATION_BYPASS_SECRET; without it the preview answers 401 and the run says so.
 */
const baseURL = (process.env.PREVIEW_URL ?? process.env.E2E_BASE_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./tests",
  outputDir: "./artifacts/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry in CI for network jitter only; a layout assertion that fails twice is a real finding.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "artifacts/report.json" }],
    ["html", { outputFolder: "artifacts/html-report", open: "never" }],
  ],
  // Preflight (global-setup.ts): fails the whole run once, naming the cause, if the preview sits behind
  // Vercel login; with the bypass secret it stores the bypass cookie that every spec then uses.
  globalSetup: "./global-setup.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    // The cookie, not a header on every request: a header would also reach Supabase and other third parties.
    storageState: bypass ? BYPASS_STATE : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, hasTouch: true },
    },
    {
      name: "phone",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
    {
      name: "reduced-motion",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
    },
  ],
});
