import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Navigation instrument, WP5: the ether face and the ink line (docs/specs/navigation-instrument/architecture.md §6,
 * sow.md WP5).
 *
 * Guest view: the instrument shows for anyone the shell gates in; the existing gate is satisfied by the
 * `fytt:ai-os-visited` latch, and a guest's one next move is the Entry Portal (find your top talent), whose
 * pin glows. No sign-in, no backend write. Self-contained on purpose (same as instrument.spec.ts).
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/ink-line.spec.ts
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
const faceOf = (page: Page) => page.getByRole("region", { name: "Path" });
const lineOf = (page: Page) => page.getByTestId("ink-line");

async function openVillage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("fytt:ai-os-visited", "true");
    window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
  });
  const res = await page.goto("/village", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  await expect(glyphOf(page)).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => !!document.querySelector(".vl-move__card, .vl-place.is-on h2, nav[aria-label='Village']"), undefined, { timeout: 20_000 });
  // The rail and the map draw `loading` until the save has loaded; the glow settles after that.
  await page.waitForFunction(() => !document.querySelector('[data-place-state="loading"]'), undefined, { timeout: 20_000 });
}

/** Raise the instrument and turn the ether body forward. */
async function openEtherFace(page: Page) {
  await glyphOf(page).click();
  await expect(dialogOf(page)).toBeVisible();
  await page.waitForTimeout(800);
  // Since #513 the instrument opens on the Console; the bodies are inert until the player steps back to it.
  await page.getByRole("button", { name: "Back to the instrument" }).click();
  const body = page.getByTestId("instrument-body-ether");
  await expect(body).toHaveAttribute("data-lit", "true");
  await body.getByRole("button").click();
  await expect(faceOf(page)).toBeVisible();
  await page.waitForTimeout(800);
}

test.describe("ether face and ink line", () => {
  test("DoD 4 · the line is not there by default; choosing the move closes the instrument and draws it, then it fades", async ({ page }, info) => {
    test.skip(info.project.name === "reduced-motion", "the reduced-motion project has its own case below");
    await openVillage(page);
    await expect(lineOf(page)).toHaveCount(0);

    await openEtherFace(page);
    await expect(lineOf(page)).toHaveCount(0);
    const move = faceOf(page).getByTestId("ether-next-move");
    await expect(move).toHaveCount(1);
    await move.click();

    await expect(dialogOf(page)).toHaveCount(0);
    const line = lineOf(page);
    await expect(line).toBeVisible();
    await expect(line).toHaveAttribute("data-mode", "draw");
    // One line, one stroke; it ends at a point on screen.
    await expect(line.locator("path")).toHaveCount(1);
    // Drawn, then faded away: about 3 s in all.
    await expect(line).toHaveCount(0, { timeout: 8_000 });
  });

  test("DoD 4 · reduced motion: a static dotted line, no drawing and no fade", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      await openVillage(page);
      await openEtherFace(page);
      await faceOf(page).getByTestId("ether-next-move").click();
      const line = lineOf(page);
      await expect(line).toBeVisible();
      await expect(line).toHaveAttribute("data-mode", "dotted");
      await expect(line.locator("path")).toHaveAttribute("stroke-dasharray", "1 9");
      expect(await line.locator("path").getAttribute("stroke-dashoffset")).toBeNull();
      expect(await line.evaluate((el) => getComputedStyle(el).transitionDuration)).toMatch(/^0s(, 0s)*$/);
      await expect(line).toHaveCount(0, { timeout: 10_000 });
    } finally {
      await context.close();
    }
  });

  test("DoD 4 · three non-advancing entries offer the line; accepting draws it", async ({ page }) => {
    await openVillage(page);
    await expect(page.getByTestId("ink-offer")).toHaveCount(0);
    // Three places entered, none of them the Entry Portal that holds the next move.
    for (const key of ["academy", "cafe", "fire-circle"]) {
      await page.evaluate((k) => {
        window.history.pushState({}, "", `/village/${k}`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, key);
      await page.waitForTimeout(150);
    }
    const offer = page.getByTestId("ink-offer");
    await expect(offer).toBeVisible();
    await expect(lineOf(page)).toHaveCount(0);
    await offer.getByRole("button").first().click();
    await expect(offer).toHaveCount(0);
    await expect(lineOf(page)).toBeVisible();
  });
});

test.describe("phone, 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("DoD 5 · no overlap at 390x844: the ether face, the offer, the glyph, the chat pill and the next-move card keep apart", async ({ page }) => {
    await openVillage(page);
    const chat = page.getByRole("button", { name: "Chat with us" });
    const card = page.locator(".vl-move__card").first();

    // The offer, on signs of being lost.
    for (const key of ["academy", "cafe", "fire-circle"]) {
      await page.evaluate((k) => {
        window.history.pushState({}, "", `/village/${k}`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, key);
      await page.waitForTimeout(150);
    }
    const offer = page.getByTestId("ink-offer");
    await expect(offer).toBeVisible();
    const o = await box(offer);
    expect(o.left, "offer inside the screen (left)").toBeGreaterThanOrEqual(0);
    expect(o.right, "offer inside the screen (right)").toBeLessThanOrEqual(390);
    expect(intersects(o, await box(glyphOf(page))), "offer overlaps the glyph").toBe(false);
    if (await chat.isVisible()) expect(intersects(o, await box(chat)), "offer overlaps the chat pill").toBe(false);
    if (await card.isVisible()) expect(intersects(o, await box(card)), "offer overlaps the next-move card").toBe(false);
    await offer.getByRole("button").nth(1).click();
    await expect(offer).toHaveCount(0);

    // The face.
    await openEtherFace(page);
    const f = await box(faceOf(page));
    expect(f.left).toBeGreaterThanOrEqual(0);
    expect(f.right).toBeLessThanOrEqual(390);
    expect(f.top).toBeGreaterThanOrEqual(0);
    expect(intersects(f, await box(glyphOf(page))), "face overlaps the glyph").toBe(false);
    if (await chat.isVisible()) expect(intersects(f, await box(chat)), "face overlaps the chat pill").toBe(false);
    const m = await box(faceOf(page).getByTestId("ether-next-move"));
    expect(m.bottom - m.top, "next move is a 44 px target").toBeGreaterThanOrEqual(44);
  });
});
