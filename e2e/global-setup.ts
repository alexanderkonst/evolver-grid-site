import { request, type FullConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Preflight: can the suite see the app at all?
 *
 * A Vercel preview behind Deployment Protection answers every page with a 302 to vercel.com/sso-api.
 * A browser follows it and lands on Vercel's login page with a 200, so the status check in `openGuest`
 * passes and every spec then times out waiting for a village that never renders (PR #461, run 45663382469:
 * 107 failures, 40 minutes, all the same cause). This stops the run once, up front, and names the cause.
 *
 * With VERCEL_AUTOMATION_BYPASS_SECRET it also trades the secret for the bypass cookie, once, and hands
 * that cookie to every spec as storage state. The secret is sent to the preview origin only; it is never
 * attached to third-party requests (Supabase, fonts), unlike a blanket `extraHTTPHeaders`.
 */
export const BYPASS_STATE = path.join(path.dirname(fileURLToPath(import.meta.url)), "artifacts", ".auth", "vercel-bypass.json");

const blocked = (res: { status(): number; headers(): Record<string, string> }): string | null => {
  const location = res.headers()["location"] ?? "";
  if (res.status() === 401 || res.status() === 403) return `HTTP ${res.status()}`;
  if (res.status() >= 300 && res.status() < 400 && /vercel\.com\/(sso-api|login)/.test(location)) return `redirect to ${location.split("?")[0]}`;
  if (res.status() >= 400) return `HTTP ${res.status()}`;
  return null;
};

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0].use.baseURL;
  if (!baseURL) throw new Error("No baseURL: set PREVIEW_URL.");
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  const ctx = await request.newContext({ baseURL, maxRedirects: 0, ignoreHTTPSErrors: false });
  try {
    // 1. Trade the secret for the cookie (only when there is a secret).
    if (secret) {
      const first = await ctx.get("/", { headers: { "x-vercel-protection-bypass": secret, "x-vercel-set-bypass-cookie": "true" } });
      const why = blocked(first);
      if (why) {
        throw new Error(
          `The preview ${baseURL} refused the bypass secret (${why}). VERCEL_AUTOMATION_BYPASS_SECRET is set but Vercel did not accept it: ` +
            `check it matches "Protection Bypass for Automation" in the Vercel project settings (Settings → Deployment Protection).`,
        );
      }
    }
    // 2. A plain request, as the browser will make it (cookie only, no header), must reach the app.
    const plain = await ctx.get("/");
    const why = blocked(plain);
    if (why) {
      throw new Error(
        `The preview ${baseURL} is behind Vercel Deployment Protection (${why}); the specs would only see Vercel's login page. ` +
          (secret
            ? `The bypass secret was accepted but the cookie did not stick; check the project's "Protection Bypass for Automation" setting.`
            : `VERCEL_AUTOMATION_BYPASS_SECRET is empty in this run. Enable "Protection Bypass for Automation" in the Vercel project, ` +
              `store the value as the repository secret VERCEL_AUTOMATION_BYPASS_SECRET (Actions secrets), or turn Vercel Authentication off for previews.`),
      );
    }
    if (secret) {
      fs.mkdirSync(path.dirname(BYPASS_STATE), { recursive: true });
      await ctx.storageState({ path: BYPASS_STATE });
    }
  } finally {
    await ctx.dispose();
  }
}
