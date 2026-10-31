import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Issue #270 (Hark's UX audit, 2026-10-30): the route-level fixes, pinned at the source like
 * the other routing tests (App.tsx is too big to mount in a unit test).
 */
const app = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8");
const source = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

describe("issue #270: routes", () => {
  it("/grow goes to the Academy index; the course pages stay under /grow/*", () => {
    expect(app).toContain('<Route path="/grow" element={<Navigate to="/game/learn" replace />} />');
    for (const slug of ["activate-your-dormant-potential", "consciousness-meets-science", "activation-of-inner-vision"]) {
      expect(app).toContain(`<Route path="/grow/${slug}"`);
    }
  });

  it("the three mission URLs show the locked page, not a 404", () => {
    for (const path of ["/zone-of-genius/mission", "/mission", "/discover-mission"]) {
      expect(app).toContain(`<Route path="${path}" element={<MissionLocked />} />`);
    }
    const locked = source("../../pages/MissionLocked.tsx");
    expect(locked).toContain("Find your top talent first");
    expect(locked).toContain("ZOG_ENTRY_PATH");
  });

  it("the catch-all 404 sits outside the shell layout route", () => {
    const layoutStart = app.indexOf("<Route element={<SmartShellLayout />}>");
    const catchAll = app.indexOf('<Route path="*" element={<NotFound />} />');
    const layoutEnd = app.lastIndexOf("</Route>", catchAll);
    expect(layoutStart).toBeGreaterThan(-1);
    expect(layoutEnd).toBeGreaterThan(layoutStart);
    expect(catchAll).toBeGreaterThan(layoutEnd);
  });

  it("a missing /:username hides the shell instead of drawing the 404 inside it", () => {
    expect(app).toContain('<Route path="/:username" element={<PublicProfileRoute />} />');
    expect(source("../../pages/PublicProfile.tsx")).toContain("onMissing");
  });
});
