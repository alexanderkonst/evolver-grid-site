import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Issue #443 wave 3: contracts of the shell fixes that need a rendered browser to see, pinned in
 * the source so a later edit cannot bring the glitch back unnoticed. (Same idiom as
 * journeyLabels.test.ts.) Hark's visual pass is still the check.
 */
const read = (p: string) => readFileSync(resolve(__dirname, "../../..", p), "utf8");

describe("wave 3 shell contracts", () => {
  it("item 1: the lunar seam has no repeating marks and no breathing thread", () => {
    const css = read("styles/lunar-panels.css");
    const seams = css.slice(css.indexOf("/* ── 3. Seams"), css.indexOf("/* ── 4. Pane 3"));
    expect(seams).not.toMatch(/repeating-linear-gradient/);
    expect(seams).not.toMatch(/animation:/);
  });

  it("items 1 and 2: a closed pane 2 keeps one seam strip and no hide control", () => {
    const shell = read("components/game/GameShellV2.tsx");
    expect(shell).toMatch(/showRailSeam = sectionsPanelOpen \|\| railMinimized \|\| isAuthRoute/);
    expect(shell).toMatch(/onClose=\{sectionsPanelOpen \? toggleSectionsPanel : undefined\}/);
    expect(shell).toMatch(/setAttribute\("inert", ""\)/);
  });

  it("item 2: the Quest Board opens pane 2 by default", () => {
    const shell = read("components/game/GameShellV2.tsx");
    expect(shell).toMatch(/const isLandingPage = p === '\/';/);
  });

  it("items 3 and 4: rail chips are aria-disabled (never `disabled`) and the current one is never locked", () => {
    const rail = read("components/game/SpacesRail.tsx");
    expect(rail).toMatch(/const closed = rawState === "closed" && !active;/);
    expect(rail).toMatch(/aria-disabled=\{closed \|\| \(loading && !active\)/);
    expect(rail).not.toMatch(/\sdisabled=\{/);
  });

  it("item 5: no pt-4 above the Quest Board's full-bleed banner", () => {
    const shell = read("components/game/GameShellV2.tsx");
    expect(shell).toMatch(/isFullBleedHeroRoute = path === "\/game\/journey"/);
    expect(shell.match(/isImmersiveDarkRoute \|\| isFullBleedHeroRoute\) \? "" : "pt-4"/g)).toHaveLength(2);
  });

  it("item 6: the global lockup stays off /build/mastermind", () => {
    expect(read("components/SiteLogo.tsx")).toMatch(/"\/build\/mastermind"/);
  });

  it("item 8: the selected Café tab is not a white pill", () => {
    const events = read("pages/spaces/EventsSpace.tsx");
    expect(events).not.toMatch(/bg-foreground text-background/);
  });

  it("item 9: the page mounts in one layout only, so the DOM has one h1", () => {
    const shell = read("components/game/GameShellV2.tsx");
    expect(shell).toMatch(/isDesktopLayout \? \(children \?\? <Outlet \/>\) : null/);
    expect(shell).toMatch(/isDesktopLayout \? null : \(children \?\? <Outlet \/>\)/);
  });
});
