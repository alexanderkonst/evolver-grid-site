/**
 * Parked operations for equilibrium-agent-write (issue #66).
 *
 * Exercises park_strategy / park_item / unpark_strategy / read_state's
 * `parked` list against a tiny in-memory stand-in for the Supabase client.
 * Idempotency and audit logging live in index.ts and are shared with every
 * other operation; the dry_run, copy-then-delete and ownership behavior is
 * what these tests pin down. Fixtures are synthetic.
 */

import { describe, expect, it } from "vitest";
import {
  MAX_PARKED_READ,
  cleanParkedKind,
  parkItem,
  parkStrategy,
  readParked,
  titleFromStrategyText,
  unparkStrategy,
} from "../../../../supabase/functions/equilibrium-agent-write/parked";

type Row = Record<string, any>;

const USER = "00000000-0000-4000-8000-000000000001";
const OTHER_USER = "00000000-0000-4000-8000-000000000002";

/** Minimal chainable fake of the Supabase query builder. */
function fakeAdmin(seed: Record<string, Row[]> = {}, failOn?: { table: string; op: string }) {
  const tables: Record<string, Row[]> = {
    equilibrium_strategies: [],
    equilibrium_parked: [],
    ...JSON.parse(JSON.stringify(seed)),
  };
  let nextId = 1;

  const from = (table: string) => {
    let filters: [string, unknown][] = [];
    let op: "select" | "insert" | "delete" | "upsert" = "select";
    let payload: Row | undefined;
    let upsertKeys: string[] = [];
    let order: { col: string; asc: boolean } | undefined;
    let limit: number | undefined;
    let wantSingle = false;

    const matching = () => tables[table].filter((r) => filters.every(([c, v]) => r[c] === v));

    const run = (): { data: any; error: any } => {
      if (failOn && failOn.table === table && failOn.op === op) {
        return { data: null, error: { message: `forced ${op} failure` } };
      }
      if (op === "insert") {
        const row = { id: `10000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`, parked_at: new Date().toISOString(), ...payload };
        tables[table].push(row);
        return { data: row, error: null };
      }
      if (op === "upsert") {
        const existing = tables[table].find((r) => upsertKeys.every((k) => r[k] === payload![k]));
        if (existing) Object.assign(existing, payload);
        else tables[table].push({ ...payload });
        return { data: null, error: null };
      }
      if (op === "delete") {
        const doomed = new Set(matching());
        tables[table] = tables[table].filter((r) => !doomed.has(r));
        return { data: null, error: null };
      }
      let rows = matching();
      if (order) {
        rows = [...rows].sort((a, b) =>
          (a[order!.col] < b[order!.col] ? -1 : a[order!.col] > b[order!.col] ? 1 : 0) * (order!.asc ? 1 : -1));
      }
      if (limit !== undefined) rows = rows.slice(0, limit);
      return { data: wantSingle ? (rows[0] ?? null) : rows, error: null };
    };

    const builder: any = {
      select: () => builder,
      insert: (row: Row) => { op = "insert"; payload = row; return builder; },
      upsert: (row: Row, opts: { onConflict: string }) => {
        op = "upsert"; payload = row; upsertKeys = opts.onConflict.split(","); return builder;
      },
      delete: () => { op = "delete"; return builder; },
      eq: (col: string, val: unknown) => { filters.push([col, val]); return builder; },
      order: (col: string, o: { ascending: boolean }) => { order = { col, asc: o.ascending }; return builder; },
      limit: (n: number) => { limit = n; return builder; },
      maybeSingle: () => { wantSingle = true; return Promise.resolve(run()); },
      single: () => { wantSingle = true; return Promise.resolve(run()); },
      then: (resolve: (v: any) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(run()).then(resolve, reject),
    };
    return builder;
  };

  return { from, tables };
}

const strategy = (position: number, text: string, alignment_score: number | null = null): Row => ({
  user_id: USER, position, text, alignment_score,
});

describe("park_strategy", () => {
  it("copies the strategy into parked, then frees its slot", async () => {
    const admin = fakeAdmin({
      equilibrium_strategies: [strategy(2, "Ship the pilot\nwith three teams", 77), strategy(1, "Other")],
    });

    const { result } = await parkStrategy(admin, USER, { position: 2, agentName: "test-agent", dryRun: false });

    expect(admin.tables.equilibrium_strategies.map((s) => s.position)).toEqual([1]);
    expect(admin.tables.equilibrium_parked).toHaveLength(1);
    expect(admin.tables.equilibrium_parked[0]).toMatchObject({
      user_id: USER,
      kind: "strategy",
      title: "Ship the pilot",
      body: "Ship the pilot\nwith three teams",
      source_position: 2,
      alignment_score: 77,
      parked_by: "test-agent",
    });
    expect(result).toMatchObject({ kind: "strategy", source_position: 2, parked: true });
  });

  it("dry_run reports the plan and changes nothing", async () => {
    const admin = fakeAdmin({ equilibrium_strategies: [strategy(1, "Keep me")] });

    const { result } = await parkStrategy(admin, USER, { position: 1, agentName: "a", dryRun: true });

    expect(result).toMatchObject({ parked: false, parked_id: "dry-run-parked-id" });
    expect(admin.tables.equilibrium_strategies).toHaveLength(1);
    expect(admin.tables.equilibrium_parked).toHaveLength(0);
  });

  it("rejects an empty slot (message routes to HTTP 400)", async () => {
    const admin = fakeAdmin();
    await expect(parkStrategy(admin, USER, { position: 3, agentName: "a", dryRun: false }))
      .rejects.toThrow(/not found/i);
  });

  it("does not touch another user's strategy", async () => {
    const admin = fakeAdmin({
      equilibrium_strategies: [{ ...strategy(1, "Theirs"), user_id: OTHER_USER }],
    });
    await expect(parkStrategy(admin, USER, { position: 1, agentName: "a", dryRun: false }))
      .rejects.toThrow(/not found/i);
    expect(admin.tables.equilibrium_strategies).toHaveLength(1);
  });

  it("rolls the parked copy back when the slot cannot be freed", async () => {
    const admin = fakeAdmin(
      { equilibrium_strategies: [strategy(1, "Stuck")] },
      { table: "equilibrium_strategies", op: "delete" },
    );
    await expect(parkStrategy(admin, USER, { position: 1, agentName: "a", dryRun: false }))
      .rejects.toThrow(/Could not free strategy slot/);
    expect(admin.tables.equilibrium_strategies).toHaveLength(1);
    expect(admin.tables.equilibrium_parked).toHaveLength(0);
  });
});

describe("park_item", () => {
  it("inserts a parked row", async () => {
    const admin = fakeAdmin();
    const { result } = await parkItem(admin, USER, {
      kind: "idea", title: "Revisit pricing", body: "After Q1", agentName: "test-agent", dryRun: false,
    });
    expect(admin.tables.equilibrium_parked[0]).toMatchObject({
      user_id: USER, kind: "idea", title: "Revisit pricing", body: "After Q1", parked_by: "test-agent",
    });
    expect(result).toMatchObject({ kind: "idea", parked: true });
  });

  it("stores a null body when none is given", async () => {
    const admin = fakeAdmin();
    await parkItem(admin, USER, { kind: "task", title: "No body", agentName: "a", dryRun: false });
    expect(admin.tables.equilibrium_parked[0].body).toBeNull();
  });

  it("dry_run inserts nothing", async () => {
    const admin = fakeAdmin();
    const { result } = await parkItem(admin, USER, { kind: "workstream", title: "X", agentName: "a", dryRun: true });
    expect(result).toMatchObject({ parked: false });
    expect(admin.tables.equilibrium_parked).toHaveLength(0);
  });

  it("validates kind", () => {
    for (const kind of ["strategy", "workstream", "task", "idea"]) {
      expect(cleanParkedKind(kind)).toBe(kind);
    }
    expect(() => cleanParkedKind("goal")).toThrow(/must be one of/);
    expect(() => cleanParkedKind(undefined)).toThrow(/must be one of/);
  });
});

describe("unpark_strategy", () => {
  const parkedStrategy = (over: Row = {}): Row => ({
    id: "20000000-0000-4000-8000-000000000001",
    user_id: USER,
    kind: "strategy",
    title: "Ship the pilot",
    body: "Ship the pilot with three teams",
    source_position: 2,
    alignment_score: 61,
    parked_at: "2026-08-01T00:00:00Z",
    ...over,
  });

  it("restores into the requested position and removes the parked row", async () => {
    const admin = fakeAdmin({ equilibrium_parked: [parkedStrategy()] });
    const { result } = await unparkStrategy(admin, USER, {
      parkedId: "20000000-0000-4000-8000-000000000001", position: 3, dryRun: false,
    });
    expect(admin.tables.equilibrium_strategies).toHaveLength(1);
    expect(admin.tables.equilibrium_strategies[0]).toMatchObject({
      user_id: USER, position: 3, text: "Ship the pilot with three teams", alignment_score: 61,
    });
    expect(admin.tables.equilibrium_parked).toHaveLength(0);
    expect(result).toMatchObject({ position: 3, restored: true });
  });

  it("defaults to the source position and upserts over an occupied slot", async () => {
    const admin = fakeAdmin({
      equilibrium_parked: [parkedStrategy()],
      equilibrium_strategies: [strategy(2, "Old occupant")],
    });
    await unparkStrategy(admin, USER, { parkedId: "20000000-0000-4000-8000-000000000001", dryRun: false });
    expect(admin.tables.equilibrium_strategies).toHaveLength(1);
    expect(admin.tables.equilibrium_strategies[0].text).toBe("Ship the pilot with three teams");
  });

  it("dry_run changes nothing", async () => {
    const admin = fakeAdmin({ equilibrium_parked: [parkedStrategy()] });
    const { result } = await unparkStrategy(admin, USER, {
      parkedId: "20000000-0000-4000-8000-000000000001", position: 1, dryRun: true,
    });
    expect(result).toMatchObject({ restored: false });
    expect(admin.tables.equilibrium_strategies).toHaveLength(0);
    expect(admin.tables.equilibrium_parked).toHaveLength(1);
  });

  it("refuses non-strategy items, other users' items, and missing ids", async () => {
    const admin = fakeAdmin({
      equilibrium_parked: [
        parkedStrategy({ id: "20000000-0000-4000-8000-000000000002", kind: "idea" }),
        parkedStrategy({ id: "20000000-0000-4000-8000-000000000003", user_id: OTHER_USER }),
      ],
    });
    await expect(unparkStrategy(admin, USER, { parkedId: "20000000-0000-4000-8000-000000000002", position: 1, dryRun: false }))
      .rejects.toThrow(/Cannot unpark/);
    await expect(unparkStrategy(admin, USER, { parkedId: "20000000-0000-4000-8000-000000000003", position: 1, dryRun: false }))
      .rejects.toThrow(/not found/i);
    await expect(unparkStrategy(admin, USER, { parkedId: "20000000-0000-4000-8000-0000000000ff", position: 1, dryRun: false }))
      .rejects.toThrow(/not found/i);
    expect(admin.tables.equilibrium_strategies).toHaveLength(0);
  });

  it("requires a position when the parked strategy has no source position", async () => {
    const admin = fakeAdmin({ equilibrium_parked: [parkedStrategy({ source_position: null })] });
    await expect(unparkStrategy(admin, USER, { parkedId: "20000000-0000-4000-8000-000000000001", dryRun: false }))
      .rejects.toThrow(/position is required/);
  });
});

describe("read_state parked list", () => {
  it("returns newest first with only the documented fields, scoped to the user", async () => {
    const admin = fakeAdmin({
      equilibrium_parked: [
        { id: "a", user_id: USER, kind: "idea", title: "Old", body: "b1", parked_at: "2026-08-01T00:00:00Z", parked_by: "x", source_position: null },
        { id: "b", user_id: USER, kind: "task", title: "New", body: null, parked_at: "2026-08-03T00:00:00Z", parked_by: "x", source_position: null },
        { id: "c", user_id: OTHER_USER, kind: "idea", title: "Not mine", body: null, parked_at: "2026-08-04T00:00:00Z", parked_by: "x", source_position: null },
      ],
    });
    const parked = await readParked(admin, USER);
    expect(parked.map((p: Row) => p.id)).toEqual(["b", "a"]);
    expect(Object.keys(parked[0]).sort()).toEqual(["body", "id", "kind", "parked_at", "title"]);
  });

  it("caps the list at 50", async () => {
    const rows = Array.from({ length: 60 }, (_, i) => ({
      id: `p${i}`, user_id: USER, kind: "idea", title: `T${i}`, body: null,
      parked_at: new Date(Date.UTC(2026, 7, 1, 0, i)).toISOString(),
    }));
    const parked = await readParked(fakeAdmin({ equilibrium_parked: rows }), USER);
    expect(parked).toHaveLength(MAX_PARKED_READ);
    expect(parked[0].id).toBe("p59");
  });

  it("returns an empty list when the table does not exist yet", async () => {
    const admin = {
      from: () => ({
        select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({
          data: null, error: { code: "42P01", message: 'relation "equilibrium_parked" does not exist' },
        }) }) }) }),
      }),
    };
    expect(await readParked(admin, USER)).toEqual([]);
  });
});

describe("titleFromStrategyText", () => {
  it("uses the first line and truncates long titles", () => {
    expect(titleFromStrategyText("  First line\nSecond")).toBe("First line");
    const long = titleFromStrategyText("x".repeat(300));
    expect(long.length).toBeLessThanOrEqual(120);
    expect(long.endsWith("...")).toBe(true);
  });
});
