import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Navigation instrument, WP1 (docs/specs/navigation-instrument/architecture.md §4–§5.1, sow.md WP1).
 *
 * Guest view: the instrument shows for anyone the shell gates in; here the existing gate is satisfied
 * by the `fytt:ai-os-visited` latch, so no sign-in and no backend write is needed. Self-contained on
 * purpose: it needs only `@playwright/test` and `@axe-core/playwright`, so it runs before and after
 * the QA-as-code helpers (#461) land.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/instrument.spec.ts
 */

type Box = { left: number; top: number; right: number; bottom: number };
const intersects = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const box = async (loc: Locator): Promise<Box> => {
  const b = await loc.boundingBox();
  if (!b) throw new Error(`no bounding box for ${loc}`);
  return { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height };
};

const glyphOf = (page: Page) => page.getByTestId("instrument-glyph");
const dialogOf = (page: Page) => page.getByRole("dialog", { name: "Your instrument" });

async function openVillage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("fytt:ai-os-visited", "true");
    // The Your AI tour is a first-open nicety; the specs about the instrument itself do not need it.
    window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
  });
  const res = await page.goto("/village", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  await expect(glyphOf(page)).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => !!document.querySelector(".vl-move__card, .vl-place.is-on h2, nav[aria-label='Village']"), undefined, { timeout: 20_000 });
}

/** The open instrument has settled: dialog up and the scrim fully in. */
async function settled(page: Page) {
  await expect(dialogOf(page)).toBeVisible();
  await page.waitForTimeout(800);
}

test.describe("instrument opens and closes", () => {
  test("DoD 3 · open and close by click, Enter, I, Esc; focus returns", async ({ page }) => {
    await openVillage(page);
    const glyph = glyphOf(page);
    await expect(glyph).toHaveAttribute("aria-expanded", "false");
    await expect(dialogOf(page)).toHaveCount(0);

    // Click opens; Esc closes; focus is back on the glyph.
    await glyph.click();
    await settled(page);
    await expect(glyph).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(dialogOf(page)).toHaveCount(0);
    await expect(glyph).toBeFocused();

    // Enter on the focused glyph opens; Enter cannot reach the glyph while the dialog traps focus, so `I` closes.
    await glyph.focus();
    await page.keyboard.press("Enter");
    await settled(page);
    await page.keyboard.press("i");
    await expect(dialogOf(page)).toHaveCount(0);
    await expect(glyph).toBeFocused();

    // The same gesture closes: a second click on the glyph.
    await glyph.click();
    await settled(page);
    await glyph.click();
    await expect(dialogOf(page)).toHaveCount(0);
    await expect(glyph).toBeFocused();

    // A tap outside closes (the scrim, top-left corner of the world).
    await glyph.click();
    await settled(page);
    await page.mouse.click(8, 8);
    await expect(dialogOf(page)).toHaveCount(0);
    await expect(glyph).toBeFocused();
  });

  test("DoD 3 · key I opens from anywhere and focus returns to where it was", async ({ page }) => {
    await openVillage(page);
    // Park focus on a real control in the page (not the glyph), then use the key.
    const other = page.locator("main a[href], main button").first();
    await other.focus();
    await expect(other).toBeFocused();
    await page.keyboard.press("I");
    await settled(page);
    await page.keyboard.press("Escape");
    await expect(dialogOf(page)).toHaveCount(0);
    await expect(other).toBeFocused();
  });

  test("DoD 3 · key I stays a letter while typing", async ({ page }) => {
    await openVillage(page);
    await glyphOf(page).click();
    await settled(page);
    await page.getByTestId("instrument-body-air").click();
    const field = page.getByRole("textbox");
    await field.fill("");
    await field.press("i");
    await expect(field).toHaveValue("i");
    await expect(dialogOf(page)).toBeVisible();
  });

  test("open state: dialog semantics, live line, bodies in an arc, outlines say when they open", async ({ page }) => {
    await openVillage(page);
    const live = page.getByTestId("instrument-announce");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toHaveText("");
    await glyphOf(page).click();
    await settled(page);
    await expect(dialogOf(page)).toHaveAttribute("aria-modal", "true");
    await expect(live).toHaveText("Your instrument is open.");
    // Five bodies by label: air in the middle, the other four in the arc.
    await expect(page.getByTestId("instrument-body-air")).toBeVisible();
    for (const el of ["ether", "water", "fire", "earth"]) await expect(page.getByTestId(`instrument-body-${el}`)).toBeVisible();
    // A body that is not lit shows as an outline with its line; a lit one does not.
    const unlit = page.locator("[data-testid^='instrument-body-'][data-lit='false']");
    const unlitCount = await unlit.count();
    for (let i = 0; i < unlitCount; i++) await expect(unlit.nth(i)).toContainText("Opens on your path");
    const lit = page.locator("[data-testid^='instrument-body-'][data-lit='true']");
    for (let i = 0; i < (await lit.count()); i++) await expect(lit.nth(i)).not.toContainText("Opens on your path");
    // The world is dimmed lightly and stays live: the scrim is far from opaque, and the village is still in the DOM, visible.
    const alpha = await page.getByTestId("instrument-scrim").evaluate((el) => Number(getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.[3] ?? 1));
    expect(alpha).toBeLessThanOrEqual(0.12);
    await expect(page.locator("main").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(live).toHaveText("Your instrument is closed.");
  });

  test("open state: Tab stays inside the dialog", async ({ page }) => {
    await openVillage(page);
    await glyphOf(page).click();
    await settled(page);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("[role='dialog']"));
      expect(inside, `Tab #${i + 1} left the dialog`).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Shift+Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("[role='dialog']"));
      expect(inside, `Shift+Tab #${i + 1} left the dialog`).toBe(true);
    }
  });

  test("air body turns the Your AI face; Back returns to the arc; the glyph still closes it", async ({ page }) => {
    await openVillage(page);
    await glyphOf(page).click();
    await settled(page);
    await page.getByTestId("instrument-body-air").click();
    await expect(page.getByRole("region", { name: "Your AI" })).toBeVisible();
    await page.getByRole("button", { name: "Back to the instrument" }).click();
    await expect(page.getByTestId("your-ai-overlay")).toHaveAttribute("data-state", "open");
    await page.getByTestId("instrument-body-air").click();
    await glyphOf(page).click();
    await expect(dialogOf(page)).toHaveCount(0);
  });
});

test.describe("phone, 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("DoD 4 · no overlap at 390x844", async ({ page }) => {
    await openVillage(page);
    const glyph = await box(glyphOf(page));
    // 44 px target at the least, inside the viewport, at the bottom right.
    expect(glyph.right - glyph.left).toBeGreaterThanOrEqual(44);
    expect(glyph.bottom - glyph.top).toBeGreaterThanOrEqual(44);
    expect(glyph.right).toBeLessThanOrEqual(390);
    expect(glyph.bottom).toBeLessThanOrEqual(844);
    expect(glyph.left).toBeGreaterThan(390 / 2);
    expect(glyph.top).toBeGreaterThan(844 / 2);

    // Never over the chat pill.
    const chat = page.getByRole("button", { name: "Chat with us" });
    await expect(chat).toBeVisible();
    expect(intersects(glyph, await box(chat)), "glyph overlaps the chat pill").toBe(false);

    // Never over the next-move card.
    const card = page.locator(".vl-move__card").first();
    await expect(card).toBeVisible();
    expect(intersects(glyph, await box(card)), "glyph overlaps the next-move card").toBe(false);
  });

  test("DoD 4 · swipe up from the glyph opens it", async ({ page }) => {
    await openVillage(page);
    const b = await box(glyphOf(page));
    const x = (b.left + b.right) / 2;
    const y = (b.top + b.bottom) / 2;
    // A real touch swipe through the protocol, up by 80 px.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - 40 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - 80 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await settled(page);
  });

  test("DoD 4 · open instrument fits the phone: every body inside the viewport", async ({ page }) => {
    await openVillage(page);
    await glyphOf(page).tap();
    await settled(page);
    for (const el of ["ether", "water", "fire", "earth", "air"]) {
      const b = await box(page.getByTestId(`instrument-body-${el}`));
      expect(b.left, `${el} left edge`).toBeGreaterThanOrEqual(0);
      expect(b.right, `${el} right edge`).toBeLessThanOrEqual(390);
      expect(b.top, `${el} top edge`).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe("reduced motion", () => {
  test("opens with a crossfade: no rise, no rotation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openVillage(page);
    await glyphOf(page).click();
    await expect(dialogOf(page)).toBeVisible();
    const transform = await page.getByTestId("instrument-body-air").evaluate((el) => getComputedStyle(el).transform);
    expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialogOf(page)).toHaveCount(0);
  });
});

test("DoD 6 · axe: zero serious on /village with the instrument open", async ({ page }, info) => {
  await openVillage(page);
  await glyphOf(page).click();
  await settled(page);
  // Two serious `label-content-name-mismatch` hits on the map exist on main without the instrument: the
  // moon-clock dial and the language chip (named «Language», shows «en»). Both are fixed in #460/#461
  // (BiologicClock, LanguageSwitcher). They are not part of the instrument; drop these excludes once #461 is on main.
  const run = async () =>
    (await new AxeBuilder({ page }).exclude(".bio-clock__dial").exclude("button[aria-label='Language']").analyze()).violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

  const arc = await run();
  if (arc.length) await info.attach("axe-arc.json", { body: JSON.stringify(arc, null, 2), contentType: "application/json" });
  expect(arc.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);

  // And with the Your AI face forward.
  await page.getByTestId("instrument-body-air").click();
  await expect(page.getByRole("region", { name: "Your AI" })).toBeVisible();
  await page.waitForTimeout(800);
  const face = await run();
  if (face.length) await info.attach("axe-face.json", { body: JSON.stringify(face, null, 2), contentType: "application/json" });
  expect(face.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
