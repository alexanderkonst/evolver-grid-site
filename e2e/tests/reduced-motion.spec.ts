import { expect, openGuest, openPane, test } from "../helpers/guest";

/**
 * `prefers-reduced-motion: reduce` (qa-pass §6, GoBY §25.11). Runs in the `reduced-motion` project only;
 * the other projects skip it so the table has no empty cells.
 */
// eslint-disable-next-line no-empty-pattern -- Playwright needs the fixtures argument to reach testInfo
test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "reduced-motion", "reduced-motion project only");
});

test("the browser reports reduced motion", async ({ page }) => {
  await openGuest(page, "/village");
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
});

test("the glowing next row holds still and the pane does not slide", async ({ page }) => {
  await openGuest(page, "/village/reception");
  await openPane(page);
  const row = page.locator('#vl-rooms .vl-rooms__row[data-room-state="next"] a');
  await expect(row).toHaveCount(1);
  expect(await row.evaluate((el) => getComputedStyle(el).animationName), "next row animation").toBe("none");
  expect(await page.locator("#vl-rooms").evaluate((el) => getComputedStyle(el).transitionDuration), "pane slide").toMatch(/^0s(, 0s)*$/);
  const infinite = await page.evaluate(() =>
    document.getAnimations().filter((a) => (a.effect?.getComputedTiming().iterations ?? 0) === Infinity && !!(a.effect as KeyframeEffect | null)?.target?.closest?.("#vl-rooms")).length,
  );
  expect(infinite, "looping animations inside the pane").toBe(0);
});

test("the rail's next-move glow holds still", async ({ page }) => {
  await openGuest(page, "/game/journey");
  const glow = page.locator('nav[aria-label="Village"] [data-next-move="true"]').first();
  await expect(glow).toHaveCount(1);
  expect(await glow.evaluate((el) => getComputedStyle(el).animationName), "rail glow animation").toBe("none");
});
