import { expect, test, type Page } from "@playwright/test";
import { expectSeen, signInAsMock } from "../helpers/signedIn";

/**
 * Issue #497 (P0): pages rendered only the moon background (plus the instrument, «Chat with us» and the
 * language chip), and Load Game → /village was blank. This is the smoke that would have caught it:
 * every main route shows a page-specific element, and shows it for real (not faded out, not under another
 * layer: `expectSeen`), as a guest and as a signed-in player. Backend calls are all stubbed.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/routes-render.spec.ts
 *
 * Route names from the issue, as they are in the router: Café /game/meet · People
 * /game/collaborate/people (sign-in gated) · Co-working /game/collaborate/matches (sign-in gated) ·
 * Mastermind /build/fmf (the FMF page) · Town Hall /game/coop.
 */

type Case = {
  name: string;
  route: string;
  /** A page-specific heading, per view. A gated route sends a guest to the sign-in page. */
  guest: { path: RegExp; heading: RegExp };
  signedIn: { path: RegExp; heading: RegExp };
};

const SIGN_IN = { path: /^\/auth/, heading: /Create your account/ };

const CASES: Case[] = [
  { name: "title screen", route: "/", guest: { path: /^\/$/, heading: /The Game of Being You/ }, signedIn: { path: /^\/$/, heading: /The Game of Being You/ } },
  { name: "village map", route: "/village", guest: { path: /^\/village$/, heading: /The Digital Village/ }, signedIn: { path: /^\/village$/, heading: /The Digital Village/ } },
  { name: "reception", route: "/village/reception", guest: { path: /^\/village\/reception$/, heading: /Entry Portal/ }, signedIn: { path: /^\/village\/reception$/, heading: /Entry Portal/ } },
  { name: "Café", route: "/game/meet", guest: { path: /^\/game\/meet$/, heading: /Café/ }, signedIn: { path: /^\/game\/meet$/, heading: /Café/ } },
  { name: "People", route: "/game/collaborate/people", guest: SIGN_IN, signedIn: { path: /^\/game\/collaborate\/people$/, heading: /People Directory/ } },
  { name: "Co-working", route: "/game/collaborate/matches", guest: SIGN_IN, signedIn: { path: /^\/game\/collaborate\/matches$/, heading: /Find collaborators and co-founders/ } },
  { name: "Town Hall", route: "/game/coop", guest: { path: /^\/game\/coop$/, heading: /Town Hall/ }, signedIn: { path: /^\/game\/coop$/, heading: /Town Hall/ } },
  { name: "Mastermind (FMF)", route: "/build/fmf", guest: { path: /^\/build\/fmf$/, heading: /FMF · Discover Founder-Market Fit/ }, signedIn: { path: /^\/build\/fmf$/, heading: /FMF · Discover Founder-Market Fit/ } },
  { name: "auth", route: "/auth", guest: SIGN_IN, signedIn: SIGN_IN },
  { name: "AI OS", route: "/ai-os", guest: { path: /^\/ai-os$/, heading: /One paste\. Permanent AI upgrade\./ }, signedIn: { path: /^\/ai-os$/, heading: /One paste\. Permanent AI upgrade\./ } },
];

const fail: string[] = [];
test.beforeEach(async ({ page }) => {
  fail.length = 0;
  page.on("pageerror", (e) => fail.push(e.message));
});
test.afterEach(() => {
  expect(fail, "no uncaught runtime error while the route renders").toEqual([]);
});

async function expectRoute(page: Page, c: Case["guest"], route: string, label: string) {
  const res = await page.goto(route, { waitUntil: "load" });
  expect(res?.status(), `${route} should answer 200`).toBeLessThan(400);
  await expect.poll(() => new URL(page.url()).pathname, { message: `${label}: ${route} should land where the router sends it` }).toMatch(c.path);
  await expectSeen(page.getByRole("heading", { name: c.heading }), `${label}: the heading ${c.heading}`);
}

test.describe("main routes render content, guest", () => {
  for (const c of CASES) {
    test(`DoD 3 · ${c.name} (${c.route}) shows its own page`, async ({ page }) => {
      await expectRoute(page, c.guest, c.route, c.name);
    });
  }
});

test.describe("main routes render content, signed in", () => {
  for (const c of CASES) {
    test(`DoD 3 · ${c.name} (${c.route}) shows its own page, signed in`, async ({ page }) => {
      await signInAsMock(page);
      await expectRoute(page, c.signedIn, c.route, c.name);
    });
  }
});

test.describe("navigating inside the app keeps the page on screen", () => {
  test("DoD 2 · signed in: title screen → Load Game → the village map with its places", async ({ page }) => {
    await signInAsMock(page);
    await page.goto("/", { waitUntil: "load" });
    const load = page.getByRole("link", { name: /Load Game/ });
    await expect(load).toBeVisible({ timeout: 20_000 });
    // The title screen decides the destination once it has read the session.
    await expect(load).toHaveAttribute("href", "/village", { timeout: 10_000 });
    await load.click();
    await expect(page).toHaveURL(/\/village$/);
    await expectSeen(page.getByRole("heading", { name: /The Digital Village/ }), "the village heading after Load Game");
    // The whole map is there, not one pin.
    expect(await page.locator(".vl-pins > li").count(), "the map carries its places").toBeGreaterThan(5);
    // A place marker, drawn on the map and not under another layer. On a phone the pins are dots and the list is the menu.
    const wide = (page.viewportSize()?.width ?? 0) >= 1024;
    if (wide) await expectSeen(page.locator(".vl-pins .vl-pin__name", { hasText: "Café" }), "the Café marker on the map");
  });

  test("DoD 2 · guest: Load Game still goes to the sign-in page, login tab", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const load = page.getByRole("link", { name: /Load Game/ });
    await expect(load).toHaveAttribute("href", "/auth?mode=login", { timeout: 10_000 });
    await load.click();
    await expect(page).toHaveURL(/\/auth\?mode=login/);
    await expectSeen(page.getByRole("heading", { level: 1 }), "the sign-in page heading");
  });

  // Root cause of #497: PageTransition held the new page at opacity 0 (`.page-transition-exit`, fill `forwards`)
  // until the browser reported `animationend`. Under `prefers-reduced-motion` the exit lasts 0 ms and the
  // event sometimes never comes, so after any route change the page stayed invisible while the shell
  // (moon background, instrument, Chat with us, EN) stayed. Here the event never comes, every time.
  test("DoD 3 · a route change completes even when the browser never reports animationend", async ({ page }) => {
    await signInAsMock(page);
    await page.goto("/", { waitUntil: "load" });
    // The fade runs and ends, and the event is swallowed before React can hear it.
    await page.evaluate(() => document.addEventListener("animationend", (e) => e.stopImmediatePropagation(), true));
    const load = page.getByRole("link", { name: /Load Game/ });
    await expect(load).toHaveAttribute("href", "/village", { timeout: 10_000 });
    await load.click();
    await expect(page).toHaveURL(/\/village$/);
    await expectSeen(page.getByRole("heading", { name: /The Digital Village/ }), "the village heading after Load Game");
    await expect
      .poll(() => page.evaluate(() => document.querySelector(".page-transition-exit") === null), { message: "no page wrapper is left in its exit fade" })
      .toBe(true);
  });

  test("DoD 3 · a client-side route change leaves the new page at full opacity (the page transition ends)", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "the map pins are links on a wide screen only; a phone uses the list below the map");
    await signInAsMock(page);
    await page.goto("/village", { waitUntil: "load" });
    await expectSeen(page.getByRole("heading", { name: /The Digital Village/ }), "the village heading");
    // The pins drift on the map, so Playwright never finds one "stable": the click is forced, the route change is real.
    await page.locator('.vl-pins a[href="/village/cafe"]').click({ force: true });
    await expect(page).toHaveURL(/\/village\/cafe$/);
    await expectSeen(page.getByRole("heading", { name: /Café/ }), "the Café heading after the route change");
    await expect
      .poll(() => page.evaluate(() => document.querySelector(".page-transition-exit") === null), { message: "no page wrapper is left in its exit fade" })
      .toBe(true);
  });
});
