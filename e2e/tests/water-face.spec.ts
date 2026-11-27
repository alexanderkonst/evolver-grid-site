import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Navigation instrument, WP3: the water face, Time (docs/specs/navigation-instrument/architecture.md §6,
 * sow.md WP3). Same self-contained setup as instrument.spec.ts (guest, the AI OS latch opens the gate).
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/water-face.spec.ts
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
const faceOf = (page: Page) => page.getByTestId("water-face");

async function openWaterFace(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("fytt:ai-os-visited", "true");
    window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
  });
  const res = await page.goto("/village", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  await expect(glyphOf(page)).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => !!document.querySelector(".vl-move__card, .vl-place.is-on h2, nav[aria-label='Village']"), undefined, { timeout: 20_000 });
  await glyphOf(page).click();
  await expect(dialogOf(page)).toBeVisible();
  await page.waitForTimeout(800);
  // Since WP8 polish the instrument opens on the five bodies: no step back is needed.
  // The Café is open to guests, so the water body is lit and is a door.
  await page.getByTestId("instrument-body-water").getByRole("button").click();
  await expect(page.getByRole("region", { name: "Time" })).toBeVisible();
  await page.waitForTimeout(800);
}

test("water face shows the moon with the day of the cycle, the next FMF, and at most three items", async ({ page }) => {
  await openWaterFace(page);
  const items = page.getByTestId("water-items").locator("> li");
  expect(await items.count()).toBeLessThanOrEqual(3);
  await expect(page.getByTestId("water-item-moon")).toContainText(/Day \d+ of the lunar cycle/);
  await expect(page.getByTestId("water-item-fmf")).toBeVisible();
  // Phase 6 has written nothing yet: "This cycle" is hidden, not an empty box.
  await expect(page.getByTestId("water-item-changes")).toHaveCount(0);
});

test("DoD 3 · FMF button goes to the FMF page and closes the instrument", async ({ page }) => {
  await openWaterFace(page);
  await page.getByTestId("water-go-fmf").click();
  await expect(page).toHaveURL(/\/build\/fmf$/);
  await expect(dialogOf(page)).toHaveCount(0);
});

test("DoD 3 · Café button goes to the Café and closes the instrument", async ({ page }) => {
  await openWaterFace(page);
  await page.getByTestId("water-go-cafe").click();
  await expect(page).toHaveURL(/\/game\/meet$/);
  await expect(dialogOf(page)).toHaveCount(0);
});

test("Back returns to the arc and Esc closes with focus on the glyph", async ({ page }) => {
  await openWaterFace(page);
  await page.getByRole("button", { name: "Back to the instrument" }).click();
  await expect(page.getByTestId("your-ai-overlay")).toHaveAttribute("data-state", "open");
  await page.getByTestId("instrument-body-water").getByRole("button").click();
  await expect(faceOf(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogOf(page)).toHaveCount(0);
  await expect(glyphOf(page)).toBeFocused();
});

test.describe("phone, 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("DoD 4 · 3-second test: the face reads at 390x844, inside the screen, with no overlap", async ({ page }) => {
    await openWaterFace(page);
    const face = await box(faceOf(page));
    expect(face.left).toBeGreaterThanOrEqual(0);
    expect(face.right).toBeLessThanOrEqual(390);
    expect(face.top).toBeGreaterThanOrEqual(0);
    expect(face.bottom).toBeLessThanOrEqual(844);

    // Every item sits inside the face, and no two items touch.
    const kinds = ["moon", "fmf", "gathering"];
    const boxes: Record<string, Box> = {};
    for (const k of kinds) {
      boxes[k] = await box(page.getByTestId(`water-item-${k}`));
      expect(boxes[k].left, `${k} left`).toBeGreaterThanOrEqual(face.left);
      expect(boxes[k].right, `${k} right`).toBeLessThanOrEqual(face.right);
      expect(boxes[k].top, `${k} top`).toBeGreaterThanOrEqual(face.top);
      expect(boxes[k].bottom, `${k} bottom`).toBeLessThanOrEqual(face.bottom);
    }
    for (let i = 0; i < kinds.length; i++) {
      for (let j = i + 1; j < kinds.length; j++) {
        expect(intersects(boxes[kinds[i]], boxes[kinds[j]]), `${kinds[i]} overlaps ${kinds[j]}`).toBe(false);
      }
    }

    // The hand-back buttons are 44 px targets and do not cover each other or the header's controls.
    const controls = [
      page.getByRole("button", { name: "Back to the instrument" }),
      page.getByRole("button", { name: "Close your instrument" }).filter({ has: page.locator("svg") }).first(),
      page.getByTestId("water-go-fmf"),
      page.getByTestId("water-go-cafe"),
    ];
    const cbs: Box[] = [];
    for (const c of controls) {
      const b = await box(c);
      expect(b.bottom - b.top, "target height").toBeGreaterThanOrEqual(44);
      expect(b.right - b.left, "target width").toBeGreaterThanOrEqual(44);
      cbs.push(b);
    }
    for (let i = 0; i < cbs.length; i++) for (let j = i + 1; j < cbs.length; j++) expect(intersects(cbs[i], cbs[j]), `control ${i} overlaps ${j}`).toBe(false);

    // Nothing in the face is clipped sideways: no horizontal scroll inside it.
    const overflowX = await faceOf(page).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflowX).toBeLessThanOrEqual(0);
  });
});

test("axe: zero serious on the water face", async ({ page }, info) => {
  await openWaterFace(page);
  // Two serious `label-content-name-mismatch` hits on the map exist on main without the instrument (see instrument.spec.ts).
  const violations = (
    await new AxeBuilder({ page }).exclude(".bio-clock__dial").exclude("button[aria-label='Language']").analyze()
  ).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  if (violations.length) await info.attach("axe-water.json", { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
