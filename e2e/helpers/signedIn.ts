import { expect, type Locator, type Page } from "@playwright/test";

/**
 * A signed-in player with no network behind them (qa-pass §3: no paid backend calls, no writes).
 * The session is a fake JWT in the supabase-js storage slot (`evolver-auth-token`); every request to
 * the backend is answered here, so nothing leaves the machine and nothing is written.
 */
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");

const USER = {
  id: "00000000-0000-0000-0000-000000000497",
  aud: "authenticated",
  role: "authenticated",
  email: "smoke@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00.000Z",
};

export async function signInAsMock(page: Page): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + 24 * 3600;
  const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated", email: USER.email })}.sig`;
  const session = { access_token: jwt, refresh_token: "mock", token_type: "bearer", expires_in: 24 * 3600, expires_at: exp, user: USER };
  await page.addInitScript((s) => window.localStorage.setItem("evolver-auth-token", JSON.stringify(s)), session);
  await page.route(/\.supabase\.co\/auth\/v1\/user/, (route) => route.fulfill({ json: USER }));
  await page.route(/\.supabase\.co\/rest\/v1\//, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", headers: { "content-range": "*/0" }, body: "[]" }),
  );
  await page.route(/\.supabase\.co\/functions\/v1\//, (route) => route.fulfill({ json: {} }));
}

/**
 * Playwright's `toBeVisible` counts an element at opacity 0, or one with another layer on top, as visible.
 * This is the stricter question a player asks: can I see it, and is it the thing under the pointer?
 * True when no ancestor fades it below 0.5 and the topmost element at its centre is it or inside it.
 */
export async function isSeen(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    el.scrollIntoView({ block: "center" });
    let opacity = 1;
    for (let n: Element | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return opacity > 0.5 && r.width > 0 && r.height > 0 && !!top && (el.contains(top) || top.contains(el));
  });
}

export async function expectSeen(locator: Locator, what: string): Promise<void> {
  await expect(locator.first(), `${what} should be on the page`).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => isSeen(locator.first()), { message: `${what} should be seen: not faded out, not covered by another layer`, timeout: 10_000 }).toBe(true);
}
