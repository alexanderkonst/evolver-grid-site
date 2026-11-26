import { expect, test } from "../helpers/guest";

/**
 * Course landing (docs/templates/course-landing.md, issue #523), guest view.
 * Round trip for ADP: Academy → landing → start → course page → «About this mini-training» → landing.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/course-landing.spec.ts
 */
const LANDING = "/academy/activate-your-dormant-potential";
const COURSE = "/grow/activate-your-dormant-potential";

test.describe("Course landing, ADP, guest view", () => {
  test("DoD 1 · the landing shows title, promise, modules, and one start button", async ({ page }) => {
    const res = await page.goto(LANDING, { waitUntil: "load" });
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Free mini-training")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What's inside" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start the mini-training" }).first()).toHaveAttribute("href", COURSE);
  });

  test("DoD 2 · landing → start → course page → About this mini-training → landing", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "load" });
    await page.getByRole("link", { name: "Start the mini-training" }).first().click();
    await expect(page).toHaveURL(new RegExp(`${COURSE}$`));
    const about = page.getByTestId("course-about-link");
    await expect(about).toHaveText("About this mini-training");
    await about.click();
    await expect(page).toHaveURL(new RegExp(`${LANDING}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("DoD 3 · Related lists the other courses and each opens its own landing", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "load" });
    const related = page.getByTestId("course-related");
    await expect(related).toBeVisible();
    const links = related.getByRole("link");
    expect(await links.count()).toBeGreaterThan(0);
    const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs).not.toContain(LANDING);
    for (const h of hrefs) expect(h).toMatch(/^\/academy\/[a-z0-9-]+$/);
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(`${hrefs[0]}$`));
  });

  test("DoD 4 · the Academy opens the ADP landing; «← Academy» goes back", async ({ page }) => {
    await page.goto("/game/learn", { waitUntil: "load" });
    const card = page.locator(`a[href="${LANDING}"]`).first();
    await expect(card).toBeVisible({ timeout: 20_000 });
    await card.click();
    await expect(page).toHaveURL(new RegExp(`${LANDING}$`));
    await page.getByRole("link", { name: "Academy" }).first().click();
    await expect(page).toHaveURL(/\/game\/learn$/);
  });
});
