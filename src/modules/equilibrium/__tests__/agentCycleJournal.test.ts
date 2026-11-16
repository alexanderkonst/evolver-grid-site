/**
 * Cycle Journal operations for equilibrium-agent-write (issue #331):
 * add_cycle_entry validation + write, the tolerant read_state slice, the
 * best-effort snapshot, and the server cycle clock agreeing with the app's
 * cycleStartMs() to the minute. Fixtures are synthetic.
 */

import { describe, expect, it } from "vitest";
import { getLunarState } from "@/lib/equilibrium-cycles";
import { cycleStartMs, semanticPositionFromLunarIndex } from "../phasePlan";
import {
  addCycleEntry,
  cleanEntryText,
  cleanJournalKind,
  cleanResourceTag,
  cycleClock,
  cycleStartFrom,
  readCycleEntries,
  recordSnapshot,
} from "../../../../supabase/functions/equilibrium-agent-write/cycleJournal";

type Row = Record<string, any>;
const USER = "00000000-0000-4000-8000-000000000001";
const segmentAt = (ms: number) => getLunarState(ms).segmentIndex;
const T0 = Date.UTC(2026, 10, 16, 12, 0, 0);
const CLOCK = cycleClock(segmentAt, T0);

/** Minimal chainable fake of the Supabase query builder for one table. */
function fakeAdmin(rows: Row[] = [], opts: { missingTable?: boolean } = {}) {
  const table = rows;
  const from = (_name: string) => {
    let op: "select" | "insert" = "select";
    let payload: Row | undefined;
    const filters: [string, unknown][] = [];
    let limit: number | undefined;
    let newestFirst = false;
    const run = () => {
      if (opts.missingTable) {
        return { data: null, error: { code: "42P01", message: 'relation "equilibrium_cycle_entries" does not exist' } };
      }
      if (op === "insert") {
        const row = { id: `20000000-0000-4000-8000-${String(table.length + 1).padStart(12, "0")}`, created_at: new Date().toISOString(), ...payload };
        table.push(row);
        return { data: row, error: null };
      }
      let out = table.filter((r) => filters.every(([c, v]) => r[c] === v));
      if (newestFirst) out = [...out].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      if (limit !== undefined) out = out.slice(0, limit);
      return { data: out, error: null };
    };
    const b: any = {
      select: () => b,
      insert: (row: Row) => { op = "insert"; payload = row; return b; },
      eq: (c: string, v: unknown) => { filters.push([c, v]); return b; },
      order: (_c: string, o: { ascending: boolean }) => { newestFirst = !o.ascending; return b; },
      limit: (n: number) => { limit = n; return b; },
      single: () => Promise.resolve(run()).then((r) => ({ data: Array.isArray(r.data) ? r.data[0] : r.data, error: r.error })),
      then: (resolve: (v: any) => unknown, reject?: (e: unknown) => unknown) => Promise.resolve(run()).then(resolve, reject),
    };
    return b;
  };
  return { from, table };
}

describe("payload validation", () => {
  it("accepts only the three journal kinds (snapshots are not agent-writable)", () => {
    expect(cleanJournalKind("clearing")).toBe("clearing");
    expect(cleanJournalKind("resource")).toBe("resource");
    expect(cleanJournalKind("celebration")).toBe("celebration");
    expect(() => cleanJournalKind("focus_snapshot")).toThrow(/must be one of/);
    expect(() => cleanJournalKind(undefined)).toThrow();
  });

  it("allows a tag on resources only, from the fixed list", () => {
    expect(cleanResourceTag("money", "resource")).toBe("money");
    expect(cleanResourceTag(undefined, "resource")).toBeNull();
    expect(cleanResourceTag("", "resource")).toBeNull();
    expect(() => cleanResourceTag("gold", "resource")).toThrow(/must be one of/);
    expect(() => cleanResourceTag("money", "clearing")).toThrow(/only valid for kind resource/);
  });

  it("trims text and rejects empty / oversized", () => {
    expect(cleanEntryText("  a call from Maya  ")).toBe("a call from Maya");
    expect(() => cleanEntryText("   ")).toThrow(/empty/);
    expect(() => cleanEntryText("x".repeat(2001))).toThrow(/too long/);
    expect(() => cleanEntryText(42)).toThrow(/string/);
  });
});

describe("server cycle clock", () => {
  it("returns the same cycle start as the app's cycleStartMs()", () => {
    for (let i = 0; i < 30; i++) {
      const now = T0 + i * 1.3 * 86_400_000;
      expect(cycleStartFrom(segmentAt, now)).toBe(cycleStartMs(now));
    }
  });

  it("reports the semantic phase and an ISO cycle start", () => {
    expect(CLOCK.position).toBe(semanticPositionFromLunarIndex(segmentAt(T0)));
    expect(CLOCK.cycleStartIso).toBe(new Date(cycleStartMs(T0)).toISOString());
  });
});

describe("add_cycle_entry", () => {
  it("writes a resource row for the current cycle, stamped with the agent name", async () => {
    const admin = fakeAdmin();
    const { result, summary } = await addCycleEntry(admin, USER, {
      kind: "resource",
      text: "Intro to a grant officer",
      tag: "people",
      agentName: "hark",
      clock: CLOCK,
      dryRun: false,
    });
    expect(admin.table).toHaveLength(1);
    expect(admin.table[0]).toMatchObject({
      user_id: USER,
      kind: "resource",
      text: "Intro to a grant officer",
      tag: "people",
      created_by: "hark",
      cycle_start: CLOCK.cycleStartIso,
      phase: CLOCK.position,
    });
    expect(result).toMatchObject({ kind: "resource", cycle_start: CLOCK.cycleStartIso });
    expect(summary).toBe("added resource entry");
  });

  it("dry_run validates but writes nothing", async () => {
    const admin = fakeAdmin();
    const { result } = await addCycleEntry(admin, USER, {
      kind: "clearing",
      text: "an old commitment",
      tag: null,
      agentName: "hark",
      clock: CLOCK,
      dryRun: true,
    });
    expect(admin.table).toHaveLength(0);
    expect(result.entry_id).toBe("dry-run-cycle-entry-id");
  });

  it("surfaces a clear error when the table is missing", async () => {
    const admin = fakeAdmin([], { missingTable: true });
    await expect(
      addCycleEntry(admin, USER, { kind: "celebration", text: "x", tag: null, agentName: "hark", clock: CLOCK, dryRun: false }),
    ).rejects.toThrow(/Could not add cycle entry/);
  });
});

describe("readCycleEntries (read_state slice)", () => {
  it("lists this cycle's entries by kind, newest first, ignoring other cycles", async () => {
    const admin = fakeAdmin([
      { id: "1", user_id: USER, cycle_start: CLOCK.cycleStartIso, kind: "clearing", text: "fear", tag: null, phase: 3, created_by: "human", created_at: "2026-11-01T00:00:00Z" },
      { id: "2", user_id: USER, cycle_start: CLOCK.cycleStartIso, kind: "resource", text: "older", tag: "money", phase: 4, created_by: "human", created_at: "2026-11-02T00:00:00Z" },
      { id: "3", user_id: USER, cycle_start: CLOCK.cycleStartIso, kind: "resource", text: "newer", tag: null, phase: 4, created_by: "hark", created_at: "2026-11-03T00:00:00Z" },
      { id: "4", user_id: USER, cycle_start: "2020-01-01T00:00:00.000Z", kind: "resource", text: "other cycle", tag: null, phase: 4, created_by: "human", created_at: "2026-11-04T00:00:00Z" },
      { id: "5", user_id: USER, cycle_start: CLOCK.cycleStartIso, kind: "focus_snapshot", text: "snap", tag: null, phase: 1, created_by: "human", created_at: "2026-11-05T00:00:00Z" },
    ]);
    const out = await readCycleEntries(admin, USER, CLOCK);
    expect(out.available).toBe(true);
    expect(out.resources.map((r: any) => r.text)).toEqual(["newer", "older"]);
    expect(out.clearing).toHaveLength(1);
    expect(out.celebration).toEqual([]);
  });

  it("does not fail the whole read when the table is missing", async () => {
    const out = await readCycleEntries(fakeAdmin([], { missingTable: true }), USER, CLOCK);
    expect(out).toMatchObject({ available: false, clearing: [], resources: [], celebration: [] });
  });
});

describe("recordSnapshot", () => {
  it("writes a snapshot, then skips an identical re-save", async () => {
    const admin = fakeAdmin();
    const base = { kind: "strategy_snapshot" as const, slot: "1", agentName: "hark", clock: CLOCK };
    await recordSnapshot(admin, USER, { ...base, text: "Sell the offer" });
    await recordSnapshot(admin, USER, { ...base, text: "Sell the offer" });
    expect(admin.table).toHaveLength(1);
    await recordSnapshot(admin, USER, { ...base, text: "Sell the offer to 10 people" });
    expect(admin.table).toHaveLength(2);
    expect(admin.table[0]).toMatchObject({ kind: "strategy_snapshot", tag: "1", cycle_start: CLOCK.cycleStartIso });
  });

  it("never throws when the table is missing", async () => {
    await expect(
      recordSnapshot(fakeAdmin([], { missingTable: true }), USER, {
        kind: "focus_snapshot",
        text: "Launch",
        slot: null,
        agentName: "hark",
        clock: CLOCK,
      }),
    ).resolves.toBeUndefined();
  });
});
