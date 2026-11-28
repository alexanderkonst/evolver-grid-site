import { expect, test } from "../helpers/guest";

/**
 * Course landing template (docs/templates/course-landing.md), applied to ADP (issue #523), guest view.
 * The links checklist as a walk: Academy → landing → start → course page → «About this mini-training» → landing.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/course-landing.spec.ts
 */

const LANDING = "/academy/activate-your-dormant-potential";
const COURSE = "/grow/activate-your-dormant-potential";
const SECTIONS = ["title", "promise", "start", "for-whom", "inside", "practice", "price", "related"];

test.describe("Course landing, ADP", () => {
  test("DoD 1 · the landing renders every template section, in order", async ({ page }) => {
    const res = await page.goto(LANDING, { waitUntil: "load" });
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    const order = await page
      .locator("[data-landing-section]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-landing-section")));
    // The series section is optional (only once a published infographic is set in courseSales.ts).
    expect(order.filter((s) => s !== "teaser")).toEqual(SECTIONS);
  });

  test("DoD 2 · landing → start → course page → back to the landing", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "load" });
    const start = page.locator('[data-landing-section="start"]').getByRole("link", { name: "Start the mini-training" });
    await expect(start).toBeVisible({ timeout: 20_000 });
    await start.click();
    await expect(page).toHaveURL(new RegExp(`${COURSE}(\\?|$)`));

    const about = page.getByRole("link", { name: "About this mini-training" });
    await expect(about).toBeVisible({ timeout: 20_000 });
    await about.click();
    await expect(page).toHaveURL(new RegExp(`${LANDING}$`));
    await expect(page.locator('[data-landing-section="title"]')).toBeVisible();
  });

  test("DoD 3 · the Related row opens other courses' landings", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "load" });
    const related = page.locator('[data-landing-section="related"]').getByRole("link");
    await expect(related.first()).toBeVisible({ timeout: 20_000 });
    const hrefs = await related.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/academy\/[a-z0-9-]+$/);
      expect(href).not.toBe(LANDING);
    }
    await related.first().click();
    await expect(page).toHaveURL(new RegExp(`${hrefs[0]}$`));
    await expect(page.locator('[data-landing-section="title"]')).toBeVisible();
  });

  test("DoD 4 · the Academy (/game/learn) opens the ADP landing", async ({ page }) => {
    await page.goto("/game/learn", { waitUntil: "load" });
    const card = page.locator(`a[href="${LANDING}"]`).first();
    await expect(card).toBeVisible({ timeout: 20_000 });
    await card.click();
    await expect(page).toHaveURL(new RegExp(`${LANDING}$`));
  });

  test("DoD 5 · an unknown course slug goes back to the Academy", async ({ page }) => {
    await page.goto("/academy/no-such-course", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/game\/learn$/, { timeout: 20_000 });
  });
});
