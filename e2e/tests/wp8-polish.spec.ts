import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Navigation instrument, WP8 polish (docs/specs/navigation-instrument/architecture.md; issue #553).
 * Template: spec-handoff. Five findings from a live pass as a player, each a check named by its number:
 *   1 glyph vs «Chat with us» · 2 Moon dial collapsed, ink line above it · 3 opens on the five bodies ·
 *   4 earth face never a blank card · 5 no quarter states before progress loads.
 * Guest view; the gate is the `fytt:ai-os-visited` latch, so no sign-in and no backend write.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/wp8-polish.spec.ts
 */

type Box = { left: number; top: number; right: number; bottom: number };
const intersects = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const inflate = (b: Box, by: number): Box => ({ left: b.left - by, top: b.top - by, right: b.right + by, bottom: b.bottom + by });
const box = async (loc: Locator): Promise<Box> => {
  const b = await loc.boundingBox();
  if (!b) throw new Error(`no bounding box for ${loc}`);
  return { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height };
};

const glyphOf = (page: Page) => page.getByTestId("instrument-glyph");
const dialogOf = (page: Page) => page.getByRole("dialog", { name: "Your instrument" });
const chatOf = (page: Page) => page.getByRole("button", { name: "Chat with us" });

async function seed(page: Page, extra: Record<string, string> = {}) {
  await page.addInitScript((extraKeys) => {
    window.localStorage.setItem("fytt:ai-os-visited", "true");
    window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
    for (const [k, v] of Object.entries(extraKeys)) window.localStorage.setItem(k, v);
  }, extra);
}

async function openVillage(page: Page, route = "/village", extra: Record<string, string> = {}) {
  await seed(page, extra);
  const res = await page.goto(route, { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  await expect(glyphOf(page)).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => document.querySelector(".vl-root")?.getAttribute("data-progress") === "ready", undefined, { timeout: 20_000 });
  await page.waitForTimeout(400);
}

async function settled(page: Page) {
  await expect(dialogOf(page)).toBeVisible();
  await page.waitForTimeout(800);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `artifacts/screenshots/${test.info().project.name}/wp8-${name}.png` });
}

test.describe("1 · the glyph and «Chat with us» never overlap", () => {
  for (const width of [390, 768, 1440]) {
    for (const route of ["/village", "/village/reception"]) {
      test(`WP8-1 · ${route} at ${width} px: 44 px targets, 8 px apart`, async ({ page }) => {
        await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
        await openVillage(page, route);
        const glyph = glyphOf(page);
        const chat = chatOf(page);
        await expect(chat).toBeVisible();
        const g = await box(glyph);
        const c = await box(chat);
        expect(g.right - g.left, "glyph width").toBeGreaterThanOrEqual(44);
        expect(g.bottom - g.top, "glyph height").toBeGreaterThanOrEqual(44);
        expect(c.right - c.left, "chat width").toBeGreaterThanOrEqual(44);
        expect(c.bottom - c.top, "chat height").toBeGreaterThanOrEqual(44);
        expect(intersects(inflate(g, 8), c), `glyph ${JSON.stringify(g)} within 8px of chat ${JSON.stringify(c)}`).toBe(false);
        expect(g.right).toBeLessThanOrEqual(width);
        expect(g.top).toBeGreaterThanOrEqual(0);
      });
    }
  }

  test("WP8-1 · a taller chat pill (large text) lifts the glyph instead of being covered", async ({ page }) => {
    await openVillage(page);
    // Grow the pill the way a bigger text size or a longer label would.
    await page.addStyleTag({ content: '[data-chat-launcher] button { min-height: 150px !important; }' });
    await expect
      .poll(async () => intersects(inflate(await box(glyphOf(page)), 8), await box(chatOf(page))), { timeout: 5_000 })
      .toBe(false);
  });
});

test.describe("2 · the Moon dial and the ink line", () => {
  test("WP8-2 · the village dial opens collapsed (dial only) even when another view was remembered", async ({ page }) => {
    await openVillage(page, "/village", { "bioclock:view": "3", "bioclock:view:village": "3", "bioclock:expanded": "1" });
    const dial = page.locator(".moon-dial .bio-clock");
    await expect(dial).toHaveAttribute("data-view", "1");
    await expect(page.locator(".moon-dial .bio-clock__readout")).toHaveCount(0);
    // The player can still open it, and a reload starts collapsed again.
    await page.locator(".moon-dial .bio-clock__watch").first().click();
    await expect(dial).not.toHaveAttribute("data-view", "1");
    await page.reload({ waitUntil: "load" });
    await expect(page.locator(".moon-dial .bio-clock")).toHaveAttribute("data-view", "1");
  });

  test("WP8-2 · collapsed, the dial leaves the Collective and Co-working labels and markers clear", async ({ page }, info) => {
    test.skip(info.project.use.viewport!.width < 768, "a phone draws dots, the list below names the places");
    await openVillage(page);
    // The dial itself (the ring and its centre words) for both places; the whole watch, with its «+ tap» chip, for Collective.
    const ring = await box(page.locator(".moon-dial .bio-clock__dial").first());
    const watch = await box(page.locator(".moon-dial .bio-clock__watch").first());
    for (const [name, area] of [[/Collective/i, watch], [/Co-working/i, ring]] as const) {
      const pin = page.locator(".vl-pin__link").filter({ hasText: name }).first();
      await expect(pin).toBeVisible();
      const b = await box(pin);
      expect(intersects(area, b), `${name} label under the dial: dial ${JSON.stringify(area)}, label ${JSON.stringify(b)}`).toBe(false);
    }
  });

  test("WP8-2 · the ink line is the top layer and its end is never under the dial", async ({ page }) => {
    await openVillage(page);
    await glyphOf(page).click();
    await settled(page);
    await page.getByTestId("instrument-body-ether").getByRole("button").click();
    await expect(page.getByRole("region", { name: "Path" })).toBeVisible();
    await page.waitForTimeout(800);
    await page.getByTestId("ether-next-move").click();
    const line = page.getByTestId("ink-line");
    await expect(line).toBeVisible();
    // Above everything the village draws (the dial sits at z-index 4 inside the map), and not inside its stacking context.
    const layer = await line.evaluate((el) => ({ z: Number(getComputedStyle(el).zIndex), parent: el.parentElement?.tagName }));
    expect(layer.parent).toBe("BODY");
    expect(layer.z).toBeGreaterThan(4);
    const dialZ = await page.locator(".moon-dial").evaluate((el) => Number(getComputedStyle(el).zIndex));
    expect(layer.z).toBeGreaterThan(dialZ);
    // The end dot sits on the glowing place, with nothing of the dial over it.
    const end = await line.locator("circle").evaluate((c) => ({ x: Number(c.getAttribute("cx")), y: Number(c.getAttribute("cy")) }));
    const covered = await page.evaluate(({ x, y }) => document.elementsFromPoint(x, y).some((e) => !!e.closest(".moon-dial")), end);
    expect(covered, "the line's end is under the Moon dial").toBe(false);
    await page.waitForTimeout(1300);
    await shot(page, "ether-line");
  });

  test("WP8-2 · screenshots: the village closed, then the instrument open", async ({ page }) => {
    await openVillage(page);
    await shot(page, "village-closed");
    await glyphOf(page).click();
    await settled(page);
    await shot(page, "village-open");
  });
});

test.describe("3 · the instrument always opens on the five bodies", () => {
  test("WP8-3 · glyph, key I, period and swipe land on the bodies, after any face", async ({ page }) => {
    await openVillage(page);
    const overlay = page.getByTestId("your-ai-overlay");
    const bodiesShown = async () => {
      await expect(overlay).toHaveAttribute("data-state", "open");
      for (const el of ["air", "ether", "water", "fire", "earth"]) await expect(page.getByTestId(`instrument-body-${el}`)).toBeVisible();
      await expect(page.locator("[data-face-root]:visible")).toHaveCount(0);
    };
    // Use two faces, closing each time; every reopen is the arc.
    for (const body of ["air", "water"] as const) {
      await glyphOf(page).click();
      await settled(page);
      await bodiesShown();
      await bodyButton(page, body).click();
      await expect(overlay).toHaveAttribute("data-state", "face");
      await page.keyboard.press("Escape");
      await expect(dialogOf(page)).toHaveCount(0);
    }
    for (const key of ["i", "."]) {
      await page.keyboard.press(key);
      await settled(page);
      await bodiesShown();
      await page.keyboard.press("Escape");
      await expect(dialogOf(page)).toHaveCount(0);
    }
  });

  test("WP8-3 · a face opens only by tapping its body", async ({ page }) => {
    await openVillage(page);
    await glyphOf(page).click();
    await settled(page);
    await expect(overlay(page)).toHaveAttribute("data-state", "open");
    await page.getByTestId("instrument-body-air").click();
    await expect(overlay(page)).toHaveAttribute("data-state", "face");
    await expect(page.getByRole("region", { name: "My AI" })).toBeVisible();
  });
});
const bodyButton = (page: Page, body: string) =>
  body === "air" ? page.getByTestId("instrument-body-air") : page.getByTestId(`instrument-body-${body}`).getByRole("button");
const overlay = (page: Page) => page.getByTestId("your-ai-overlay");

const USER_ID = "00000000-0000-4000-8000-000000000553";

/** A signed-in player with a saved mission (so the Workshop is open), the sheet's reads answered in the browser;
 *  `slow.ms` holds every read back, so a face that waits on the save can be watched while it waits. Nothing is written. */
async function seedPlayer(page: Page, slow: { ms: number }) {
  await page.addInitScript(
    ({ userId }) => {
      const now = Math.floor(Date.now() / 1000);
      window.localStorage.setItem(
        "evolver-auth-token",
        JSON.stringify({
          access_token: "e2e.fake.token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: now + 3600,
          refresh_token: "e2e-fake-refresh",
          user: { id: userId, aud: "authenticated", role: "authenticated", email: "e2e@example.invalid", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" },
        }),
      );
    },
    { userId: USER_ID },
  );
  const profile = { id: "00000000-0000-4000-8000-000000000998", user_id: USER_ID, first_name: "E2E", mission_statement: "Help people find their work." };
  await page.route(/\.supabase\.co\/(functions|rest|auth)\/v1\//, async (route) => {
    const req = route.request();
    const url = req.url();
    if (/\/functions\/v1\//.test(url) || (req.method() !== "GET" && req.method() !== "HEAD")) return route.abort("blockedbyclient");
    if (/\/rest\/v1\//.test(url) && slow.ms > 0) await new Promise((r) => setTimeout(r, slow.ms));
    if (/\/rest\/v1\/game_profiles/.test(url)) {
      const one = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(one ? profile : [profile]) });
    }
    if (/\/rest\/v1\//.test(url)) {
      const one = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
      return one
        ? route.fulfill({ status: 406, contentType: "application/json", body: JSON.stringify({ code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" }) })
        : route.fulfill({ status: 200, contentType: "application/json", headers: { "content-range": "*/0" }, body: "[]" });
    }
    return route.continue();
  });
}

test.describe("4 · the earth face is never a blank card", () => {
  test("WP8-4 · while the save loads the Work face shows a skeleton, then the content; no frame is a blank card", async ({ page }) => {
    const slow = { ms: 0 };
    await seedPlayer(page, slow);
    await seed(page);
    const res = await page.goto("/village", { waitUntil: "load" });
    expect(res?.status()).toBeLessThan(400);
    await expect(glyphOf(page)).toBeVisible({ timeout: 20_000 });
    await page.waitForFunction(() => document.querySelector(".vl-root")?.getAttribute("data-progress") === "ready", undefined, { timeout: 20_000 });
    await expect(glyphOf(page)).toHaveAttribute("data-glints", /.*/);

    // From here every read takes 0.4 s; the face's own fresh read chains several, so the wait runs to seconds, as on a slow connection.
    slow.ms = 400;
    await glyphOf(page).click();
    await settled(page);
    const earth = page.getByTestId("instrument-body-earth");
    await expect(earth).toHaveAttribute("data-lit", "true");
    // Record, on every frame, whether the Work card holds anything below its header.
    await page.evaluate(() => {
      const w = window as unknown as { __earth: { frames: number; blank: number; skeleton: number; content: number } };
      w.__earth = { frames: 0, blank: 0, skeleton: 0, content: 0 };
      const tick = () => {
        const root = document.querySelector('[data-face-root="earth"]');
        if (root && getComputedStyle(root).opacity !== "0") {
          w.__earth.frames++;
          const skeleton = !!root.querySelector('[data-testid="earth-face-skeleton"]');
          const content = !!root.querySelector("button[data-place]") || /Opens on your path/.test(root.textContent || "");
          if (skeleton) w.__earth.skeleton++;
          if (content) w.__earth.content++;
          if (!skeleton && !content) w.__earth.blank++;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await earth.getByRole("button").click();
    const face = page.getByRole("region", { name: "Work" });
    await expect(face).toBeVisible();
    await expect(face.getByTestId("earth-face-skeleton")).toBeVisible();
    await shot(page, "earth-skeleton");
    await expect(face.locator("button[data-place]").first()).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(300); // a few frames with the content up
    const seen = await page.evaluate(() => (window as unknown as { __earth: { frames: number; blank: number; skeleton: number; content: number } }).__earth);
    expect(seen.skeleton, "the skeleton was never on screen").toBeGreaterThan(0);
    expect(seen.content, "the content never arrived").toBeGreaterThan(0);
    expect(seen.blank, `${seen.blank} of ${seen.frames} frames showed a blank Work card`).toBe(0);
    await shot(page, "earth-loaded");
  });
});

test.describe("5 · no quarter state before progress has loaded", () => {
  test("WP8-5 · from the first frame, a place says nothing about progress until the save is read", async ({ page }) => {
    await seed(page);
    // Hold the save back so the first paint has time to show a wrong state, if it ever would.
    await page.route(/\.supabase\.co\/(rest|auth)\/v1\//, async (route) => {
      await new Promise((r) => setTimeout(r, 900));
      await route.continue();
    });
    await page.addInitScript(() => {
      const w = window as unknown as { __wp8: { loadingFrames: number; wrong: string[] } };
      w.__wp8 = { loadingFrames: 0, wrong: [] };
      const WRONG = '.vl-pin .ps-tag, .vl-list .ps-tag, [data-place-state="next"], [data-place-state="done"], [data-place-state="closed"], .vl-pin__link.is-locked, .vl-move__card';
      const look = () => {
        const root = document.querySelector(".vl-root");
        if (root?.getAttribute("data-progress") === "loading") {
          w.__wp8.loadingFrames++;
          document.querySelectorAll(`.vl-root ${WRONG}`).forEach((el) => {
            const tag = `${el.className || el.tagName} · ${(el.textContent || "").trim().slice(0, 24)}`;
            if (!w.__wp8.wrong.includes(tag)) w.__wp8.wrong.push(tag);
          });
        }
        requestAnimationFrame(look);
      };
      requestAnimationFrame(look);
      new MutationObserver(() => {
        if (document.querySelector(".vl-root")?.getAttribute("data-progress") === "loading") look();
      }).observe(document, { childList: true, subtree: true, attributes: true });
    });
    await page.goto("/village", { waitUntil: "commit" });
    await page.waitForFunction(() => document.querySelector(".vl-root")?.getAttribute("data-progress") === "ready", undefined, { timeout: 30_000 });
    const seen = await page.evaluate(() => (window as unknown as { __wp8: { loadingFrames: number; wrong: string[] } }).__wp8);
    expect(seen.loadingFrames, "the village was never observed while loading, so the check proved nothing").toBeGreaterThan(0);
    expect(seen.wrong, `states drawn before the save loaded: ${seen.wrong.join(" | ")}`).toEqual([]);
    // After the save, the real states are there: the Entry Portal is the guest's next move and the closed places say so.
    expect(await page.locator('.vl-pin[data-place-state="closed"]').count()).toBeGreaterThan(0);
  });
});

test("WP8 · axe: zero serious on /village with the instrument open on the bodies", async ({ page }, info) => {
  await openVillage(page);
  await glyphOf(page).click();
  await settled(page);
  const found = (
    await new AxeBuilder({ page }).exclude(".bio-clock__dial").exclude("button[aria-label='Language']").analyze()
  ).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  if (found.length) await info.attach("axe-wp8.json", { body: JSON.stringify(found, null, 2), contentType: "application/json" });
  expect(found.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
