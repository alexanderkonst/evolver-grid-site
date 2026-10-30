import { describe, expect, it } from "vitest";
import {
  FOUNDER_TOOLS,
  FOUNDER_TOOL_OPENS_WHEN,
  FOUNDER_TOOL_STAGES,
  type FounderToolStage,
} from "@/data/founderTools";
import { filterAdminOnlyRows } from "@/components/game/adminOnlyRows";
import { founderStage, resolveFounderTools } from "../founderTools";
import type { PlaceSave } from "../placeState";

/** The BUILD pane in its static order (SPACE_SECTIONS.build), headers included. */
const PANE = [
  { id: "build-header-founder-tools", isHeader: true },
  { id: "equilibrium-v2" },
  { id: "commercial-os" },
  { id: "ubb-v2" },
  { id: "founder-cockpit" },
  { id: "founder-cockpit-dashboard" },
  { id: "founder-mastermind" },
  { id: "build-header-incubation", isHeader: true },
  { id: "build-playbook" },
  { id: "build-path" },
  { id: "build-ignite" },
  { id: "build-products" },
  { id: "build-karime" },
  { id: "build-dashboard" },
  { id: "build-holomap" },
];

type Row = { id: string; isHeader?: boolean; locked?: boolean; lockedHint?: string };

const metAt = (stage: number): PlaceSave["met"] => {
  const met: PlaceSave["met"] = {};
  FOUNDER_TOOL_STAGES.slice(0, stage).forEach((req) => {
    met[req] = true;
  });
  return met;
};

const ids = (rows: Row[]) => rows.map((r) => r.id);
const tools = (rows: Row[]) => rows.filter((r) => !r.isHeader);
const open = (rows: Row[]) => tools(rows).filter((r) => !r.locked);
const NON_ADMIN = "someone@example.com";

describe("founder tools config", () => {
  it("gives every pane row a rule, so none is listed to everyone by accident", () => {
    const paneTools = PANE.filter((r) => !r.isHeader).map((r) => r.id);
    expect(Object.keys(FOUNDER_TOOLS).sort()).toEqual([...paneTools].sort());
  });

  it("has an «Opens when» line for every stage", () => {
    for (const req of FOUNDER_TOOL_STAGES) expect(FOUNDER_TOOL_OPENS_WHEN[req]).toMatch(/^Opens when /);
  });
});

describe("founderStage", () => {
  it("is 0 for a guest and counts the latest stage met", () => {
    expect(founderStage({})).toBe(0);
    expect(founderStage(metAt(2))).toBe(2);
    // The Market opens on a saved offer alone: that player has passed the stages before it.
    expect(founderStage({ "offer-saved": true })).toBe(4);
  });
});

describe("resolveFounderTools", () => {
  it("shows a fresh guest no Founder Tools and no headers", () => {
    for (const email of [null, undefined]) {
      expect(resolveFounderTools(PANE, { met: {}, email })).toEqual([]);
    }
  });

  it("shows a signed-in player with nothing saved no Founder Tools either", () => {
    expect(resolveFounderTools(PANE, { met: {}, email: NON_ADMIN })).toEqual([]);
  });

  it.each([1, 2, 3, 4, 5])(
    "at stage %i lists exactly the tools of stages <= %i, plus at most the next as «Opens when»",
    (n) => {
      const rows = resolveFounderTools(filterAdminOnlyRows(PANE, NON_ADMIN), {
        met: metAt(n),
        email: NON_ADMIN,
      });
      const shown = open(rows).map((r) => r.id);
      const expected = filterAdminOnlyRows(PANE, NON_ADMIN)
        .filter((r) => {
          const rule = FOUNDER_TOOLS[r.id as keyof typeof FOUNDER_TOOLS];
          return rule?.stage && FOUNDER_TOOL_STAGES.indexOf(rule.stage) + 1 <= n;
        })
        .map((r) => r.id);
      expect(shown).toEqual(expected);

      const closed = tools(rows).filter((r) => r.locked);
      expect(closed.length).toBeLessThanOrEqual(1);
      for (const row of closed) {
        const next = FOUNDER_TOOLS[row.id];
        expect(FOUNDER_TOOL_STAGES.indexOf(next.stage as FounderToolStage) + 1).toBe(n + 1);
        expect(row.lockedHint).toBe(FOUNDER_TOOL_OPENS_WHEN[next.stage as FounderToolStage]);
      }
    },
  );

  it("teases the first tool of the next stage in pane order, with the stage's own words", () => {
    const rows = resolveFounderTools(PANE, { met: metAt(1), email: NON_ADMIN });
    const closed = tools(rows).filter((r) => r.locked);
    expect(ids(closed)).toEqual(["ubb-v2"]);
    expect(closed[0].lockedHint).toBe("Opens when your mission is saved.");
  });

  it("uses the translated line when the pane passes one", () => {
    const rows = resolveFounderTools(PANE, {
      met: metAt(1),
      email: NON_ADMIN,
      opensWhen: (stage) => `T:${stage}`,
    });
    expect(tools(rows).find((r) => r.locked)?.lockedHint).toBe("T:discover-mission");
  });

  it("keeps a header while the next-stage tool sits under it", () => {
    // Stage 1 opens only incubation rows; the teased tool (ubb-v2) keeps the first header.
    const rows = resolveFounderTools(PANE, { met: metAt(1), email: NON_ADMIN });
    expect(ids(rows)).toEqual([
      "build-header-founder-tools",
      "ubb-v2",
      "build-header-incubation",
      "build-playbook",
      "build-path",
    ]);
  });

  it("drops a header with nothing under it", () => {
    const pane = [
      { id: "build-header-founder-tools", isHeader: true },
      { id: "equilibrium-v2" }, // stage 4: two stages ahead of a stage-1 player, not teased
      { id: "build-header-incubation", isHeader: true },
      { id: "build-playbook" },
    ];
    const rows = resolveFounderTools(pane, { met: metAt(1), email: NON_ADMIN });
    expect(ids(rows)).toEqual(["build-header-incubation", "build-playbook"]);
  });

  it("shows the personal row only to its owner, at any stage", () => {
    for (const n of [0, 3, 5]) {
      expect(ids(resolveFounderTools(PANE, { met: metAt(n), email: NON_ADMIN }))).not.toContain("build-karime");
      expect(ids(resolveFounderTools(PANE, { met: metAt(n), email: null }))).not.toContain("build-karime");
    }
    expect(ids(resolveFounderTools(PANE, { met: {}, email: "karimekurit@gmail.com" }))).toContain("build-karime");
    expect(ids(resolveFounderTools(PANE, { met: {}, email: "KarimeKurit@Gmail.com" }))).toContain("build-karime");
  });

  it("gives the admin account every tool it saw before, except other people's personal rows", () => {
    const rows = resolveFounderTools(PANE, { met: {}, email: "alexanderkonst@gmail.com" });
    expect(ids(rows)).toEqual(PANE.filter((r) => r.id !== "build-karime").map((r) => r.id));
    expect(tools(rows).every((r) => !r.locked)).toBe(true);
  });

  it("does not touch routes: rows keep their own fields", () => {
    const withPath = [{ id: "build-playbook", path: "/playbook" }];
    expect(resolveFounderTools(withPath, { met: metAt(1), email: NON_ADMIN })).toEqual(withPath);
  });
});
