import { openGuest, openPane, seriousAxe, shot, test } from "../helpers/guest";

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
