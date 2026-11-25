import { expect, openGuest, openPane, seriousAxe, shot, test } from "../helpers/guest";

/** axe-core on the guest village screens: no serious or critical violation (qa-pass §5). */
const SCREENS = ["/village", "/village/reception", "/village/quest-board", "/village/house"];

for (const route of SCREENS) {
  test(`DoD 8 · axe: ${route} has no serious or critical violations`, async ({ page }, info) => {
    await openGuest(page, route);
    if (route !== "/village") await openPane(page);
    // Let entrance motion settle so axe does not read a half-faded colour.
    await page.waitForTimeout(1500);
    const violations = await seriousAxe(page);
    if (violations.length) await info.attach("axe-violations.json", { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
    await shot(page, info, `axe${route.replace(/\//g, "-")}`);
    // One readable line per rule, so the PR comment says what failed without opening the report.
    if (violations.length) {
      throw new Error(`axe: ${violations.map((v) => `${v.rule} (${v.impact}) on ${v.nodes.join(", ")}`).join("; ")}`);
    }
  });
}

/**
 * #460 regressions (found by the DoD 8 axe check, fixed in the same PR).
 * The language chip names itself by what it shows («EN, Language») inside the game; the title screen
 * keeps its plain name by Sasha's scope. The moon-clock dial has a name that holds its visible words.
 */
test("DoD 9 · language chip inside the game is named by its visible code", async ({ page }, info) => {
  await openGuest(page, "/village");
  // The chip shows its code («EN», uppercased by CSS) and its accessible name starts with the same code.
  const chip = page.locator("button[aria-haspopup='menu']").filter({ hasText: /^[a-z]{2}$/i });
  await expect(chip).toBeVisible();
  const code = ((await chip.textContent()) ?? "").trim();
  expect(await chip.getAttribute("aria-label")).toMatch(new RegExp(`^${code}, `, "i"));
  await expect(page.getByRole("button", { name: new RegExp(`^${code}, `, "i") })).toBeVisible();
  await shot(page, info, "language-chip-in-game");
});

test("DoD 9 · title screen language chip is untouched (name stays «Language»)", async ({ page }, info) => {
  const res = await page.goto("/", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  const chip = page.getByRole("button", { name: "Language", exact: true });
  await expect(chip).toBeVisible();
  await shot(page, info, "language-chip-title");
});

test("DoD 9 · moon-clock dial has an accessible name that holds its visible words", async ({ page }, info) => {
  await openGuest(page, "/village");
  const dial = page.locator(".bio-clock__dial").first();
  await expect(dial).toBeVisible();
  const name = (await dial.getAttribute("aria-label")) ?? "";
  expect(name.length, "the dial has a name").toBeGreaterThan(8);
  const words = await dial.locator("text").allTextContents();
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  for (const w of words.map(norm).filter(Boolean)) {
    expect(norm(name), `dial name must contain its visible word «${w}»`).toContain(w);
  }
  await shot(page, info, "bio-clock-dial");
});
