import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Navigation instrument, WP2: the body-lit ritual and its sound
 * (docs/specs/navigation-instrument/architecture.md §5.2, §5.4; sow.md WP2).
 *
 * Self-contained like instrument.spec.ts: guest view, the instrument gated in by the `fytt:ai-os-visited`
 * latch, no sign-in and no backend write. The "seeded save" is the player's `litSeen` record
 * (`fytt:instrument-lit-seen:guest`): every lit body but fire is already seen, which is the save of a
 * player for whom Academy and FMF have just opened and fire is the one body not yet shown.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/instrument-ritual.spec.ts
 */

const FIRE_LINE = "Fire is lit. The Academy and FMF are open to you.";
const LIT_SEEN_KEY = "fytt:instrument-lit-seen:guest";
const MUTE_KEY = "fytt:instrument-sound-muted";

const ritualOf = (page: Page) => page.getByTestId("instrument-ritual");
const lineOf = (page: Page) => page.getByTestId("instrument-ritual-line");

/** Everything lit on a fresh guest village except fire has been shown already. */
async function seedFireUnseen(page: Page) {
  await page.addInitScript(
    ([seenKey]) => {
      window.localStorage.setItem("fytt:ai-os-visited", "true");
      window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
      if (!window.localStorage.getItem(seenKey)) window.localStorage.setItem(seenKey, JSON.stringify({ ether: true, water: true }));
    },
    [LIT_SEEN_KEY],
  );
}

/** Counts every AudioContext the page makes, so "no audio before a gesture" is observed, not assumed. */
async function countAudioContexts(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { AudioContext?: typeof AudioContext; __audioContexts?: number };
    const Original = w.AudioContext;
    w.__audioContexts = 0;
    if (!Original) return;
    w.AudioContext = class extends Original {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        w.__audioContexts = (w.__audioContexts ?? 0) + 1;
      }
    };
  });
}
const audioContexts = (page: Page) => page.evaluate(() => (window as unknown as { __audioContexts?: number }).__audioContexts ?? 0);

async function openVillage(page: Page) {
  const res = await page.goto("/village", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByTestId("instrument-glyph")).toBeVisible({ timeout: 20_000 });
}

const litSeen = (page: Page) => page.evaluate((k) => JSON.parse(window.localStorage.getItem(k) ?? "{}"), LIT_SEEN_KEY);

test.describe("body-lit ritual", () => {
  test("DoD 3 · seeded save that just opened Academy shows the fire ritual line", async ({ page }, info) => {
    // The full sequence, whatever project this runs in (the reduced-motion project has its own test below).
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await seedFireUnseen(page);
    await countAudioContexts(page);
    await openVillage(page);

    // It waits for the village to settle, then plays: the line names what opened.
    await expect(ritualOf(page)).toHaveAttribute("data-element", "fire", { timeout: 10_000 });
    await expect(lineOf(page)).toHaveText(FIRE_LINE, { timeout: 6_000 });
    await expect(page.getByRole("status").filter({ hasText: FIRE_LINE })).toHaveCount(1);
    await info.attach("fire-ritual-line.png", { body: await page.screenshot(), contentType: "image/png" });

    // The sequence ran in full: a thread of light flew from the quarter sign and the body drew itself in the glyph.
    await expect(ritualOf(page)).toHaveAttribute("data-variant", "full");

    // It is recorded once, and it fades away on its own.
    await expect.poll(() => litSeen(page).then((s) => s.fire)).toBe(true);
    await expect(ritualOf(page)).toHaveCount(0, { timeout: 8_000 });

    // No audio context was made: nobody had touched the page yet, so the tone stayed silent.
    expect(await audioContexts(page)).toBe(0);

    // A returning player never sees it twice.
    await page.reload({ waitUntil: "load" });
    await expect(page.getByTestId("instrument-glyph")).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(3_500);
    await expect(ritualOf(page)).toHaveCount(0);
  });

  test("DoD 3 · the full sequence draws a thread and the body, and a tap skips it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await seedFireUnseen(page);
    await openVillage(page);
    await expect(ritualOf(page)).toBeVisible({ timeout: 10_000 });
    // Frame-fast polling: the thread and the drawing live for under a second each.
    for (const part of ["instrument-ritual-thread", "instrument-ritual-body"]) {
      await page.waitForFunction((id) => !!document.querySelector(`[data-testid="${id}"]`), part, { polling: "raf", timeout: 6_000 });
    }

    // A tap on the world skips what is left; the body is recorded at once and nothing is held back.
    await page.mouse.click(8, 300);
    await expect(ritualOf(page)).toHaveCount(0, { timeout: 2_500 });
    expect((await litSeen(page)).fire).toBe(true);
  });

  test("DoD 4 · reduced motion variant", async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedFireUnseen(page);
    await openVillage(page);

    await expect(ritualOf(page)).toHaveAttribute("data-variant", "reduced", { timeout: 10_000 });
    // The line is there at once and the body is in the glyph; no flare, no thread flying through the world.
    await expect(lineOf(page)).toHaveText(FIRE_LINE, { timeout: 2_000 });
    await expect(page.getByTestId("instrument-ritual-body")).toHaveCount(1);
    await expect(page.getByTestId("instrument-ritual-thread")).toHaveCount(0);
    await expect(page.getByTestId("instrument-ritual-flare")).toHaveCount(0);
    await info.attach("fire-ritual-reduced.png", { body: await page.screenshot(), contentType: "image/png" });

    // Gone by itself, and still recorded.
    await expect(ritualOf(page)).toHaveCount(0, { timeout: 8_000 });
    expect((await litSeen(page)).fire).toBe(true);
  });

  test("DoD 5 · no audio before a gesture, and the first tap is a gesture", async ({ page }) => {
    await seedFireUnseen(page);
    await countAudioContexts(page);
    await openVillage(page);
    await expect(ritualOf(page)).toBeVisible({ timeout: 10_000 });
    await expect(ritualOf(page)).toHaveCount(0, { timeout: 8_000 });
    expect(await audioContexts(page)).toBe(0);

    // The player's own tap on the glyph unlocks sound, and the breath of the opening plays through one context.
    await page.getByTestId("instrument-glyph").click();
    await expect(page.getByRole("dialog", { name: "Your instrument" })).toBeVisible();
    await expect.poll(() => audioContexts(page)).toBe(1);
  });

  test("DoD 5 · a muted player gets no audio context at all", async ({ page }) => {
    await seedFireUnseen(page);
    await countAudioContexts(page);
    await page.addInitScript((k) => window.localStorage.setItem(k, "true"), MUTE_KEY);
    await openVillage(page);
    await page.getByTestId("instrument-glyph").click();
    await expect(page.getByRole("dialog", { name: "Your instrument" })).toBeVisible();
    await page.keyboard.press("Escape");
    expect(await audioContexts(page)).toBe(0);
  });

  test("never while the instrument is open", async ({ page }) => {
    await seedFireUnseen(page);
    await openVillage(page);
    // Open it as early as the page allows. If the ritual had already begun, opening stops it; either way
    // nothing plays for as long as the instrument is up, which outlasts the ritual's own rest and length.
    await page.getByTestId("instrument-glyph").click();
    await expect(page.getByRole("dialog", { name: "Your instrument" })).toBeVisible();
    await page.waitForTimeout(150);
    for (let i = 0; i < 12; i++) {
      await expect(ritualOf(page)).toHaveCount(0);
      await page.waitForTimeout(250);
    }
  });

  test("DoD 5 · the mute toggle in settings is remembered", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("fytt:ai-os-visited", "true"));
    await page.goto("/game/settings", { waitUntil: "load" });
    const row = page.getByTestId("instrument-sound-setting");
    const toggle = row.getByRole("switch", { name: "Instrument sound" });
    await expect(toggle).toBeVisible({ timeout: 20_000 });
    // Sound is on by default.
    await expect(toggle).toBeChecked();
    expect(await page.evaluate((k) => window.localStorage.getItem(k), MUTE_KEY)).toBeNull();

    await toggle.click();
    await expect(toggle).not.toBeChecked();
    expect(await page.evaluate((k) => window.localStorage.getItem(k), MUTE_KEY)).toBe("true");

    // Remembered after a reload; turning it back on is remembered too.
    await page.reload({ waitUntil: "load" });
    const again = page.getByTestId("instrument-sound-setting").getByRole("switch", { name: "Instrument sound" });
    await expect(again).not.toBeChecked({ timeout: 20_000 });
    await again.click();
    await expect(again).toBeChecked();
    expect(await page.evaluate((k) => window.localStorage.getItem(k), MUTE_KEY)).toBe("false");
  });

  test("axe: zero serious or critical while the ritual line is up", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedFireUnseen(page);
    await openVillage(page);
    await expect(lineOf(page)).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page }).include('[data-testid="instrument-ritual"]').analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    // And the page around it, with the line on screen.
    const page_ = await new AxeBuilder({ page }).analyze();
    const seriousPage = page_.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(seriousPage.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});

test.describe("phone, 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("the ritual line fits at 390 px and does not cover the glyph", async ({ page }) => {
    await seedFireUnseen(page);
    await openVillage(page);
    await expect(lineOf(page)).toBeVisible({ timeout: 10_000 });
    const line = await lineOf(page).boundingBox();
    const glyph = await page.getByTestId("instrument-glyph").boundingBox();
    expect(line && glyph).toBeTruthy();
    expect(line!.x).toBeGreaterThanOrEqual(0);
    expect(line!.x + line!.width).toBeLessThanOrEqual(390);
    const overlap = line!.x < glyph!.x + glyph!.width && line!.x + line!.width > glyph!.x && line!.y < glyph!.y + glyph!.height && line!.y + line!.height > glyph!.y;
    expect(overlap, "ritual line covers the glyph").toBe(false);
  });
});
