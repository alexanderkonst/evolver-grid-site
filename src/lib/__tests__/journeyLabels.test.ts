import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { JOURNEY_MAIN } from "@/data/journeySequence";
import { journeyStepLine, journeyStepRows } from "../journeyLabels";

const source = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

// WP-4 (issue #161, item 4): one Journey source; every list reads it.
describe("journey step rows", () => {
  it("follow JOURNEY_MAIN: same ids, same order, same labels", () => {
    const rows = journeyStepRows();
    expect(rows.map((r) => r.id)).toEqual(JOURNEY_MAIN.map((i) => i.id));
    expect(rows.map((r) => r.label)).toEqual(JOURNEY_MAIN.map((i) => i.label));
    expect(rows.map((r) => r.no)).toEqual(JOURNEY_MAIN.map((_, i) => i + 1));
  });

  it("carry no ordinal in the label itself, so a reorder cannot leave a stale number", () => {
    for (const item of JOURNEY_MAIN) expect(item.label).not.toMatch(/^\d+\./);
  });

  it("give one answer on whether QoL is optional", () => {
    const rows = journeyStepRows();
    expect(rows.find((r) => r.id === "assess-qol")?.optional).toBe("optional");
    expect(rows.filter((r) => r.optional).map((r) => r.id)).toEqual(["assess-qol"]);
    expect(journeyStepLine(rows[2])).toBe("3. Assess your quality of life (optional)");
  });
});

describe("every list of Journey steps reads the one source", () => {
  it.each([
    ["the title screen's Chapter 01", "../../pages/GameTitle.tsx"],
    ["Your House", "../../pages/spaces/sections/ProfileOverview.tsx"],
    ["/ignite", "../../pages/IgniteSession.tsx"],
    ["the Quest Board pane", "../../components/game/SectionsPanel.tsx"],
  ])("%s", (_name, rel) => {
    expect(source(rel)).toMatch(/journeyStepRows/);
  });

  it("the title screen no longer carries its own four levels", () => {
    const title = source("../../pages/GameTitle.tsx");
    expect(title).not.toContain("Know your character");
    expect(title).not.toContain("Level 01");
  });
});

describe("no XP or level in the shell", () => {
  it("the shell and the rail do not mount or take XP and level", () => {
    for (const rel of ["../../components/game/GameShellV2.tsx", "../../components/game/SpacesRail.tsx"]) {
      const src = source(rel);
      expect(src).not.toContain("PlayerStatsBadge");
      expect(src).not.toMatch(/userXp|userLevel/);
    }
  });
});
