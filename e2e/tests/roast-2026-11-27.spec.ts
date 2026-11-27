import { expect, intersects, launcher, box, seriousAxe, shot, test } from "../helpers/guest";
import type { Locator, Page } from "@playwright/test";

/**
 * Roast fixes 2026-11-27 (issue #562; findings: docs/02-strategy/research/qa/roast-2026-11-27.md).
 * Etalon line for every spec: the item number of the issue's section A or B.
 *
 * Guest view. `guard` (helpers/guest.ts) refuses every `**\/functions\/v1\/*` request, `generate-*` included,
 * and every database write, and fails the spec if one is attempted: no paid AI call can leave this file.
 */

const AA = 4.5;

/** WCAG contrast of `fg` over `bg` (both [r,g,b] 0-255). */
const lum = ([r, g, b]: number[]) => {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Worst-case contrast of a control's text over its own background, whatever picture is behind it:
 * the background colour (with its alpha) is composited over pure white and over pure black, the text over that.
 */
async function worstContrast(loc: Locator): Promise<number> {
  const [fg, bg, bgA] = await loc.evaluate((el) => {
    const cs = getComputedStyle(el);
    const parse = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 1];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p[3] ?? 1];
    };
    const f = parse(cs.color);
    const b = parse(cs.backgroundColor);
    return [f, b.slice(0, 3), b[3]] as [number[], number[], number];
  });
  const over = (c: number[], a: number, under: number[]) => c.map((v, i) => v * a + under[i] * (1 - a));
  let worst = Infinity;
  for (const base of [[0, 0, 0], [255, 255, 255]]) {
    const back = over(bg, bgA, base);
    const text = over(fg.slice(0, 3), fg[3] ?? 1, back);
    worst = Math.min(worst, ratio(text, back));
  }
  return worst;
}

const bigEnough = async (loc: Locator, px = 44) => {
  const b = await loc.boundingBox();
  expect(b, "has a box").not.toBeNull();
  expect(b!.width).toBeGreaterThanOrEqual(px - 0.5);
  expect(b!.height).toBeGreaterThanOrEqual(px - 0.5);
};

test.describe("1 · title: PRESS START is the primary action", () => {
  test("AA on any art, 44px, never under the Chat bubble", async ({ page }, info) => {
    await page.goto("/", { waitUntil: "load" });
    const start = page.getByRole("button", { name: "PRESS START" });
    await expect(start).toBeVisible();
    await page.waitForTimeout(600);
    expect(await worstContrast(start), "PRESS START text contrast, worst case behind it").toBeGreaterThanOrEqual(AA);
    await bigEnough(start);
    // Full strength at every moment of its pulse: no opacity dip that reads as disabled.
    for (const wait of [0, 600, 1200]) {
      await page.waitForTimeout(wait);
      const op = await start.evaluate((el) => Number(getComputedStyle(el).opacity));
      expect(op).toBeGreaterThanOrEqual(0.95);
    }
    const chat = launcher(page);
    await expect(chat).toBeVisible();
    expect(intersects(await box(start), await box(chat)), "PRESS START and the Chat bubble do not overlap").toBe(false);
    await shot(page, info, "title");
  });
});

/** Starts NEW GAME from the title: the first visit plays the intro on the way to the Entry Portal. */
async function startIntro(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.getByRole("link", { name: /New Game/i }).click();
  await expect(page.getByRole("dialog", { name: "Intro" })).toBeVisible({ timeout: 20_000 });
}

test.describe("2 · intro: Skip from the first frame, words separated", () => {
  test("Skip intro: visible at once, 44px, AA, and it ends the intro", async ({ page }, info) => {
    await startIntro(page);
    const skip = page.getByRole("button", { name: "Skip intro" });
    // No wait: the first frame.
    await expect(skip).toBeVisible({ timeout: 1000 });
    await expect(skip).toHaveText(/Skip intro/i);
    await bigEnough(skip);
    expect(await worstContrast(skip)).toBeGreaterThanOrEqual(AA);
    await shot(page, info, "intro-first-frame");
    await skip.click();
    await expect(page.getByRole("dialog", { name: "Intro" })).toHaveCount(0, { timeout: 5000 });
  });

  test("element name and element are separate words: 'Body · Earth'", async ({ page }) => {
    await startIntro(page);
    const items = page.locator(".intro-elements li");
    await expect(items).toHaveCount(5);
    const first = ((await items.first().textContent()) ?? "").replace(/\s+/g, " ").trim();
    expect(first).toMatch(/^Body · Earth Vitality/);
    for (const text of await items.allTextContents()) expect(text).not.toMatch(/[a-z]{3}(Earth|Water|Aether|Air|Fire)/i);
  });
});

/** The reveal's paste screen, as a first-time guest: Reception → «Find my top talent» → «I've got my AI's answer». */
async function openPasteScreen(page: Page) {
  await page.goto("/zone-of-genius/entry", { waitUntil: "load" });
  const find = page.getByRole("button", { name: "Find my top talent", exact: true });
  await find.click({ timeout: 15_000 });
  await expect(page.getByText("Which way?")).toBeVisible();
  await page.waitForTimeout(800);
  // The primary breathes (cta-breath), so Playwright's stability check never settles: press it by force.
  await find.click({ force: true });
  await page.getByRole("button", { name: "I've got my AI's answer" }).click({ force: true, timeout: 15_000 });
  await expect(page.getByPlaceholder(/Paste your AI/i)).toBeVisible();
}

test.describe("3 · paste screen: the warning and the button agree", () => {
  test("short answer: warning says why and the button is disabled; a full answer enables it", async ({ page }, info) => {
    await openPasteScreen(page);
    const box = page.getByPlaceholder(/Paste your AI/i);
    const reveal = page.getByRole("button", { name: /Reveal my top talent/i });
    const hint = page.getByTestId("paste-short-hint");

    await expect(reveal).toBeDisabled();

    await box.fill("I like to help people.");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText(/too short/i);
    await expect(hint).toContainText("200");
    await expect(reveal, "warning showing → button disabled").toBeDisabled();
    await shot(page, info, "paste-screen-short");

    await box.fill("A".repeat(199));
    await expect(reveal).toBeDisabled();
    await box.fill("A".repeat(200));
    await expect(hint, "answer passes the check → warning gone").toHaveCount(0);
    await expect(reveal, "answer passes the check → button enabled").toBeEnabled();

    // Never press it: a reveal is a paid AI call. Back to short: the button follows.
    await box.fill("too short again");
    await expect(hint).toBeVisible();
    await expect(reveal).toBeDisabled();
  });
});
