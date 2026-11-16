/**
 * Cycle Journal (issue #331): the pure helpers behind the This-Cycle strip
 * and the Past-cycles list — grouping, latest-snapshot-wins, story shaping,
 * and the "table is missing" detector that makes the UI degrade quietly.
 */

import { describe, expect, it } from "vitest";
import {
  buildCycleStory,
  entriesForCycle,
  groupByCycle,
  isMissingTableError,
  latestSnapshotsBySlot,
  phaseHasStory,
  sortNewestFirst,
  storyHasContent,
} from "../lib/cycleJournal";
import type { CycleEntry, CycleEntryKind } from "../types";

const C1 = "2026-10-20T08:00:00.000Z";
const C2 = "2026-11-18T08:00:00.000Z";

let n = 0;
function entry(over: Partial<CycleEntry> & { kind: CycleEntryKind; text: string }): CycleEntry {
  n += 1;
  return {
    id: `e${n}`,
    user_id: "u1",
    cycle_start: C1,
    phase: 3,
    tag: null,
    created_by: "human",
    created_at: `2026-10-2${n % 10}T10:00:00.000Z`,
    updated_at: `2026-10-2${n % 10}T10:00:00.000Z`,
    ...over,
  };
}

describe("isMissingTableError", () => {
  it("recognises a missing table in the shapes PostgREST / Postgres use", () => {
    expect(isMissingTableError({ code: "42P01", message: "relation does not exist" })).toBe(true);
    expect(isMissingTableError({ code: "PGRST205", message: "x" })).toBe(true);
    expect(
      isMissingTableError({ message: "Could not find the table 'public.equilibrium_cycle_entries' in the schema cache" }),
    ).toBe(true);
  });
  it("does not treat other errors as a missing table", () => {
    expect(isMissingTableError({ code: "23505", message: "duplicate key" })).toBe(false);
    expect(isMissingTableError(null)).toBe(false);
    expect(isMissingTableError("nope")).toBe(false);
  });
});

describe("latestSnapshotsBySlot", () => {
  it("keeps the latest snapshot per slot (strategy position)", () => {
    const rows = [
      entry({ kind: "strategy_snapshot", tag: "1", text: "old one", created_at: "2026-10-21T10:00:00Z" }),
      entry({ kind: "strategy_snapshot", tag: "1", text: "new one", created_at: "2026-10-25T10:00:00Z" }),
      entry({ kind: "strategy_snapshot", tag: "2", text: "second", created_at: "2026-10-22T10:00:00Z" }),
    ];
    const latest = latestSnapshotsBySlot(rows, "strategy_snapshot");
    expect(latest.map((e) => e.text).sort()).toEqual(["new one", "second"]);
  });

  it("treats a null tag as one slot (Moon Focus)", () => {
    const rows = [
      entry({ kind: "focus_snapshot", text: "Launch", created_at: "2026-10-21T10:00:00Z" }),
      entry({ kind: "focus_snapshot", text: "Launch the mastermind", created_at: "2026-10-24T10:00:00Z" }),
    ];
    expect(latestSnapshotsBySlot(rows, "focus_snapshot").map((e) => e.text)).toEqual(["Launch the mastermind"]);
  });
});

describe("buildCycleStory", () => {
  const rows = [
    entry({ kind: "focus_snapshot", text: "Ship it", created_at: "2026-10-21T10:00:00Z" }),
    entry({ kind: "strategy_snapshot", tag: "2", text: "B", created_at: "2026-10-22T10:00:00Z" }),
    entry({ kind: "strategy_snapshot", tag: "1", text: "A", created_at: "2026-10-22T11:00:00Z" }),
    entry({ kind: "workstream_snapshot", tag: "w1", text: "Offer", created_at: "2026-10-23T10:00:00Z" }),
    entry({ kind: "clearing", text: "old fear", created_at: "2026-10-24T10:00:00Z" }),
    entry({ kind: "resource", tag: "money", text: "a $500 deposit", created_at: "2026-10-25T10:00:00Z" }),
    entry({ kind: "resource", text: "intro from Maya", created_at: "2026-10-26T10:00:00Z" }),
    entry({ kind: "celebration", text: "first client", created_at: "2026-11-10T10:00:00Z" }),
  ];

  it("reads a past cycle from its snapshots, strategies in slot order", () => {
    const story = buildCycleStory(rows);
    expect(story.focus).toBe("Ship it");
    expect(story.strategies).toEqual([
      { position: 1, text: "A" },
      { position: 2, text: "B" },
    ]);
    expect(story.workstreams).toEqual(["Offer"]);
    expect(story.clearing.map((e) => e.text)).toEqual(["old fear"]);
    expect(story.celebration.map((e) => e.text)).toEqual(["first client"]);
  });

  it("lists entries newest first", () => {
    const story = buildCycleStory(rows);
    expect(story.resources.map((e) => e.text)).toEqual(["intro from Maya", "a $500 deposit"]);
  });

  it("lets live layers win over snapshots (current cycle)", () => {
    const story = buildCycleStory(rows, {
      focus: "Rest",
      strategies: [{ position: 1, text: "Live A" }],
      workstreams: [],
    });
    expect(story.focus).toBe("Rest");
    expect(story.strategies).toEqual([{ position: 1, text: "Live A" }]);
    expect(story.workstreams).toEqual([]);
  });

  it("an empty cycle has no content", () => {
    expect(storyHasContent(buildCycleStory([]))).toBe(false);
    expect(storyHasContent(story1(rows))).toBe(true);
  });
});

function story1(rows: CycleEntry[]) {
  return buildCycleStory(rows);
}

describe("phaseHasStory — which dots carry the quiet marker", () => {
  it("marks only phases with something written", () => {
    const empty = buildCycleStory([]);
    for (let p = 1; p <= 8; p++) expect(phaseHasStory(p, empty)).toBe(false);

    const story = buildCycleStory([entry({ kind: "resource", text: "a call" })]);
    expect(phaseHasStory(4, story)).toBe(true);
    expect(phaseHasStory(3, story)).toBe(false);
    expect(phaseHasStory(7, story, ["Send the offer"])).toBe(true);
    expect(phaseHasStory(6, story, ["x"])).toBe(false); // Prep for Harvest writes nothing
  });
});

describe("groupByCycle / entriesForCycle", () => {
  const rows = [
    entry({ kind: "clearing", text: "a", cycle_start: C1 }),
    entry({ kind: "clearing", text: "b", cycle_start: C2 }),
    entry({ kind: "resource", text: "c", cycle_start: C1 }),
  ];
  it("groups by cycle_start, newest cycle first", () => {
    const groups = groupByCycle(rows);
    expect(groups.map((g) => g.cycleStartMs)).toEqual([Date.parse(C2), Date.parse(C1)]);
    expect(groups[1].entries).toHaveLength(2);
  });
  it("selects one cycle's entries", () => {
    expect(entriesForCycle(rows, Date.parse(C1)).map((e) => e.text).sort()).toEqual(["a", "c"]);
  });
  it("sortNewestFirst is stable for equal timestamps", () => {
    const same = [
      { id: "1", created_at: "2026-10-20T00:00:00Z" },
      { id: "2", created_at: "2026-10-20T00:00:00Z" },
    ];
    expect(sortNewestFirst(same).map((r) => r.id)).toEqual(["1", "2"]);
  });
});
