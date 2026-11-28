import { expect, openGuest, shot, test } from "../helpers/guest";

/**
 * Educational app store (issue #524), guest view: panel 2 (Learn) lists the courses under «Courses»,
 * panel 3 (/game/learn/courses) shows one tile per course with level and category filters.
 * Tile → course landing (/academy/<slug>); «Start» → the course page. No sign-in, no write.
 */

const store = "/game/learn/courses";

test.describe("#524 · courses in panel 2, store in panel 3", () => {
  test("panel 3 shows a tile per course with chips and a version", async ({ page }, info) => {
    await openGuest(page, store);
    const tiles = page.getByTestId("store-tile");
    await expect(tiles.first()).toBeVisible();
    expect(await tiles.count(), "one tile per course").toBeGreaterThanOrEqual(3);
    const adp = page.locator('[data-testid="store-tile"][data-slug="activate-your-dormant-potential"]');
    await expect(adp.getByTestId("chip-level")).toHaveText("Fundamental");
    await expect(adp.getByTestId("chip-category")).toHaveText("General");
    await expect(adp.getByTestId("tile-version")).toHaveText("v1.0");
    await shot(page, info, "course-store");
  });

  test("panel 2 lists the courses and its first sub-row opens the store (where the sections panel is on screen)", async ({ page }) => {
    await openGuest(page, "/game/learn");
    // Two copies exist (the desktop panel and the mobile drawer); only the one on screen counts.
    const panel = page.locator('nav[aria-label$=" path"]:visible').first();
    test.skip((await page.locator('nav[aria-label$=" path"]:visible').count()) === 0, "the sections panel is closed on this viewport");
    // «Courses» is a row with sub-rows: its first sub-row opens the store, the rest are the courses.
    await panel.getByText("Courses", { exact: true }).click(); // expands the row
    await expect(panel.getByRole("link", { name: /Your Unfolding Potential/ })).toBeVisible();
    await panel.getByRole("link", { name: /All courses/ }).click();
    await expect(page).toHaveURL(/\/game\/learn\/courses$/);
  });

  test("level and category chips filter the tiles client-side", async ({ page }) => {
    await openGuest(page, store);
    const tiles = page.getByTestId("store-tile");
    const all = await tiles.count();
    await page.getByTestId("store-filter-level").getByRole("button", { name: "Advanced" }).click();
    const advanced = await tiles.count();
    expect(advanced).toBeGreaterThan(0);
    expect(advanced).toBeLessThan(all);
    for (const chip of await page.getByTestId("chip-level").allTextContents()) expect(chip).toBe("Advanced");
    await page.getByTestId("store-filter-level").getByRole("button", { name: "All" }).click();
    expect(await tiles.count()).toBe(all);
    await page.getByTestId("store-filter-category").getByRole("button", { name: "General" }).click();
    const general = await tiles.count();
    expect(general).toBeGreaterThan(0);
    expect(general).toBeLessThan(all);
    for (const chip of await page.getByTestId("chip-category").allTextContents()) expect(chip).toBe("General");
  });

  test("tile tap opens the landing; Start opens the course page", async ({ page }) => {
    await openGuest(page, store);
    const adp = page.locator('[data-testid="store-tile"][data-slug="activate-your-dormant-potential"]');
    await adp.getByTestId("store-tile-link").click();
    await expect(page).toHaveURL(/\/academy\/activate-your-dormant-potential$/);

    await openGuest(page, store);
    await page.locator('[data-testid="store-tile"][data-slug="activate-your-dormant-potential"]').getByTestId("store-start").click();
    await expect(page).toHaveURL(/\/grow\/activate-your-dormant-potential/);
  });

  test("reduced motion: nothing on the store loops", async ({ page }, info) => {
    test.skip(info.project.name !== "reduced-motion", "reduced-motion project only");
    await openGuest(page, store);
    await expect(page.getByTestId("store-tile").first()).toBeVisible();
    const looping = await page.evaluate(() =>
      document.getAnimations().filter((a) => {
        const el = (a.effect as KeyframeEffect | null)?.target as Element | null;
        return (a.effect?.getComputedTiming().iterations ?? 0) === Infinity && !!el?.closest?.('[data-testid="store-tile"], [data-testid^="store-filter"]');
      }).length,
    );
    expect(looping).toBe(0);
  });
});
