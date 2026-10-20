/**
 * Task Flow operations for equilibrium-agent-write (issue #71).
 *
 * Exercises add_subtask / update_subtask / delete_subtask, promote_do_now /
 * demote / complete, move_task / convert_task_to_subtask and the read_state v2
 * shaping against a tiny in-memory stand-in for the Supabase client. The fake
 * also enforces what the migration enforces in the database (one human Do Now
 * per user, an item in Do Now once, exactly one Do Now target, FK cascades).
 * Token gate, idempotency, audit log and alias routing live in index.ts.
 * Fixtures are synthetic.
 */

import { describe, expect, it } from "vitest";
import {
  addSubtask,
  cleanItemRef,
  cleanOwner,
  cleanPriority,
  cleanSubtaskKind,
  cleanSubtaskStatus,
  complete,
  convertTaskToSubtask,
  deleteSubtask,
  demote,
  moveTask,
  parseAddSubtask,
  parseSubtaskPatch,
  promoteDoNow,
  shapeTaskFlowState,
  startOfPanelDayMs,
  updateSubtask,
} from "../../../../supabase/functions/equilibrium-agent-write/taskflow";

type Row = Record<string, any>;

const USER = "00000000-0000-4000-8000-000000000001";
const OTHER_USER = "00000000-0000-4000-8000-000000000002";
const WS_A = "a0000000-0000-4000-8000-000000000001";
const WS_B = "a0000000-0000-4000-8000-000000000002";
const WS_OTHER = "a0000000-0000-4000-8000-000000000009";
const T1 = "b0000000-0000-4000-8000-000000000001";
const T2 = "b0000000-0000-4000-8000-000000000002";
const T3 = "b0000000-0000-4000-8000-000000000003";
const T_OTHER = "b0000000-0000-4000-8000-000000000009";
const S1 = "c0000000-0000-4000-8000-000000000001";
const S2 = "c0000000-0000-4000-8000-000000000002";
const S3 = "c0000000-0000-4000-8000-000000000003";

/** Minimal chainable fake of the Supabase query builder. */
function fakeAdmin(seed: Record<string, Row[]> = {}, failOn?: { table: string; op: string; times?: number }) {
  const tables: Record<string, Row[]> = {
    equilibrium_workstreams: [],
    equilibrium_tasks: [],
    equilibrium_subtasks: [],
    equilibrium_do_now: [],
    equilibrium_focus: [],
    ...JSON.parse(JSON.stringify(seed)),
  };
  let nextId = 1;
  let failuresLeft = failOn?.times ?? 1;
  const writes: string[] = [];

  const uniqueViolation = (table: string, row: Row, others: Row[]) => {
    if (table !== "equilibrium_do_now") return null;
    if (Boolean(row.task_id) === Boolean(row.subtask_id)) return "violates check constraint (exactly one target)";
    for (const o of others) {
      if (o.user_id !== row.user_id) continue;
      if (row.owner === "human" && o.owner === "human") return 'duplicate key value violates unique constraint "uq_eq_do_now_one_human"';
      if (row.task_id && o.task_id === row.task_id) return 'duplicate key value violates unique constraint "uq_eq_do_now_task"';
      if (row.subtask_id && o.subtask_id === row.subtask_id) return 'duplicate key value violates unique constraint "uq_eq_do_now_subtask"';
    }
    return null;
  };

  const cascade = (table: string, id: string) => {
    if (table === "equilibrium_tasks") {
      const subs = tables.equilibrium_subtasks.filter((s) => s.task_id === id).map((s) => s.id);
      tables.equilibrium_subtasks = tables.equilibrium_subtasks.filter((s) => s.task_id !== id);
      tables.equilibrium_focus = tables.equilibrium_focus.filter((f) => f.task_id !== id);
      tables.equilibrium_do_now = tables.equilibrium_do_now.filter((d) => d.task_id !== id && !subs.includes(d.subtask_id));
    }
    if (table === "equilibrium_subtasks") {
      tables.equilibrium_do_now = tables.equilibrium_do_now.filter((d) => d.subtask_id !== id);
    }
  };

  const from = (table: string) => {
    let filters: ((r: Row) => boolean)[] = [];
    let op: "select" | "insert" | "update" | "delete" = "select";
    let payload: Row | undefined;
    let order: { col: string; asc: boolean } | undefined;
    let limit: number | undefined;
    let wantSingle = false;

    const matching = () => tables[table].filter((r) => filters.every((f) => f(r)));

    const run = (): { data: any; error: any } => {
      if (op !== "select") writes.push(`${op}:${table}`);
      if (failOn && failOn.table === table && failOn.op === op && failuresLeft > 0) {
        failuresLeft--;
        return { data: null, error: { message: `forced ${op} failure` } };
      }
      if (op === "insert") {
        const row = {
          id: `d0000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`,
          created_at: new Date().toISOString(),
          ...payload,
        };
        const violation = uniqueViolation(table, row, tables[table]);
        if (violation) return { data: null, error: { message: violation } };
        tables[table].push(row);
        return { data: row, error: null };
      }
      if (op === "update") {
        for (const r of matching()) Object.assign(r, payload);
        return { data: null, error: null };
      }
      if (op === "delete") {
        const doomed = matching();
        tables[table] = tables[table].filter((r) => !doomed.includes(r));
        for (const r of doomed) cascade(table, r.id);
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
      update: (row: Row) => { op = "update"; payload = row; return builder; },
      delete: () => { op = "delete"; return builder; },
      eq: (col: string, val: unknown) => { filters.push((r) => r[col] === val); return builder; },
      in: (col: string, vals: unknown[]) => { filters.push((r) => vals.includes(r[col])); return builder; },
      gte: (col: string, val: string) => { filters.push((r) => r[col] != null && r[col] >= val); return builder; },
      order: (col: string, o: { ascending: boolean }) => { order = { col, asc: o.ascending }; return builder; },
      limit: (n: number) => { limit = n; return builder; },
      maybeSingle: () => { wantSingle = true; return Promise.resolve(run()); },
      single: () => { wantSingle = true; return Promise.resolve(run()); },
      then: (resolve: (v: any) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(run()).then(resolve, reject),
    };
    return builder;
  };

  return { from, tables, writes };
}

const ws = (id: string, title: string, position: number, user = USER): Row => ({ id, user_id: user, title, position });
const task = (id: string, workstream_id: string, text: string, extra: Row = {}): Row => ({
  id, workstream_id, position: 0, text, status: "active", owner: "human",
  created_at: "2026-10-01T00:00:00.000Z", done_at: null, do_now_at: null, ...extra,
});
const sub = (id: string, task_id: string, text: string, extra: Row = {}): Row => ({
  id, user_id: USER, task_id, position: 0, text, owner: "ai", status: "todo", waiting_on: null,
  priority: null, external_ref: null, note: null, effort: null, kind: null, created_by: "hark",
  created_at: "2026-10-02T00:00:00.000Z", updated_at: "2026-10-02T00:00:00.000Z", done_at: null, ...extra,
});
const doNow = (extra: Row): Row => ({
  id: `e0000000-0000-4000-8000-${String(Math.floor(Math.random() * 1e11)).padStart(12, "0")}`,
  user_id: USER, owner: "human", task_id: null, subtask_id: null, position: 0,
  promoted_at: "2026-10-16T00:00:00.000Z", promoted_by: "human", ...extra,
});

const base = () => ({
  equilibrium_workstreams: [ws(WS_A, "Founder OS", 0), ws(WS_B, "Mirror Funnel", 1), ws(WS_OTHER, "Not mine", 0, OTHER_USER)],
  equilibrium_tasks: [
    task(T1, WS_A, "Task Flow — build it"),
    task(T2, WS_A, "Knowledge graph"),
    task(T_OTHER, WS_OTHER, "Foreign task"),
  ],
});

describe("validators", () => {
  it("accepts the documented enums and rejects the rest", () => {
    expect(cleanOwner("ai")).toBe("ai");
    expect(() => cleanOwner("robot")).toThrow(/must be one of/);
    expect(cleanSubtaskStatus("in_progress")).toBe("in_progress");
    expect(() => cleanSubtaskStatus("active")).toThrow(/must be one of/);
    expect(cleanPriority(2)).toBe(2);
    expect(() => cleanPriority(4)).toThrow(/1 to 3/);
    expect(cleanItemRef({ type: "subtask", id: S1 })).toEqual({ type: "subtask", id: S1 });
    expect(() => cleanItemRef({ type: "project", id: S1 })).toThrow(/must be "task" or "subtask"/);
    expect(() => cleanItemRef(undefined)).toThrow(/required/);
    expect(() => cleanItemRef({ type: "task", id: "nope" })).toThrow(/must be a UUID/);
  });

  it("add_subtask defaults to owner ai and todo; waiting_on only while waiting", () => {
    expect(parseAddSubtask({ task_id: T1, text: " Review PR " })).toMatchObject({
      text: "Review PR", owner: "ai", status: "todo", waitingOn: null, priority: null,
    });
    expect(parseAddSubtask({ task_id: T1, text: "x", status: "todo", waiting_on: "sasha" }).waitingOn).toBeNull();
    expect(parseAddSubtask({ task_id: T1, text: "x", status: "waiting", waiting_on: "claude" }).waitingOn).toBe("claude");
  });

  it("effort and kind are optional; kind is one of research|build|outreach|ops", () => {
    expect(parseAddSubtask({ task_id: T1, text: "x" })).toMatchObject({ effort: null, kind: null });
    expect(parseAddSubtask({ task_id: T1, text: "x", effort: " 15m ", kind: "research" })).toMatchObject({ effort: "15m", kind: "research" });
    expect(cleanSubtaskKind("ops")).toBe("ops");
    expect(() => cleanSubtaskKind("design")).toThrow(/must be one of: research, build, outreach, ops/);
    expect(() => parseAddSubtask({ task_id: T1, text: "x", kind: "design" })).toThrow(/payload\.kind/);
    expect(() => parseAddSubtask({ task_id: T1, text: "x", effort: "y".repeat(41) })).toThrow(/too long/);
    expect(parseSubtaskPatch({ effort: "1 credit", kind: "build" })).toEqual({ effort: "1 credit", kind: "build" });
    expect(parseSubtaskPatch({ effort: null, kind: null })).toEqual({ effort: null, kind: null });
    expect(parseSubtaskPatch({ effort: "" })).toEqual({ effort: null });
  });

  it("update patch needs at least one field and lets null clear", () => {
    expect(() => parseSubtaskPatch({ subtask_id: S1 })).toThrow(/at least one field/);
    expect(parseSubtaskPatch({ priority: null, note: "" })).toEqual({ priority: null, note: null });
    expect(() => parseSubtaskPatch({ position: -1 })).toThrow(/integer/);
  });
});

describe("add_subtask", () => {
  it("inserts at the end with created_by = agent_name", async () => {
    const admin = fakeAdmin({ ...base(), equilibrium_subtasks: [sub(S1, T1, "First", { position: 0 })] });
    const { result, summary } = await addSubtask(admin, USER, {
      ...parseAddSubtask({ task_id: T1, text: "Phase 1 PR review", status: "waiting", waiting_on: "claude", priority: 1, external_ref: "https://example.test/71" }),
      agentName: "hark", dryRun: false,
    });
    const row = admin.tables.equilibrium_subtasks[1];
    expect(row).toMatchObject({
      user_id: USER, task_id: T1, position: 1, owner: "ai", status: "waiting", waiting_on: "claude",
      priority: 1, external_ref: "https://example.test/71", created_by: "hark",
    });
    expect(result).toEqual({ target: "equilibrium_subtasks", subtask_id: row.id, created: true, task_id: T1, owner: "ai", status: "waiting" });
    expect(summary).toBe('created subtask "Phase 1 PR review"');
  });

  it("stores effort and kind when given, null when not", async () => {
    const admin = fakeAdmin(base());
    await addSubtask(admin, USER, { ...parseAddSubtask({ task_id: T1, text: "Tagged", effort: "15m", kind: "outreach" }), agentName: "hark", dryRun: false });
    await addSubtask(admin, USER, { ...parseAddSubtask({ task_id: T1, text: "Untagged" }), agentName: "hark", dryRun: false });
    expect(admin.tables.equilibrium_subtasks[0]).toMatchObject({ effort: "15m", kind: "outreach" });
    expect(admin.tables.equilibrium_subtasks[1]).toMatchObject({ effort: null, kind: null });
  });

  it("reuses an active subtask with the same normalized text", async () => {
    const admin = fakeAdmin({ ...base(), equilibrium_subtasks: [sub(S1, T1, "Review the  PR")] });
    const { result } = await addSubtask(admin, USER, { ...parseAddSubtask({ task_id: T1, text: " review THE pr " }), agentName: "hark", dryRun: false });
    expect(result).toMatchObject({ created: false, subtask_id: S1 });
    expect(admin.tables.equilibrium_subtasks).toHaveLength(1);
  });

  it("dry_run reports the plan and writes nothing", async () => {
    const admin = fakeAdmin(base());
    const { result } = await addSubtask(admin, USER, { ...parseAddSubtask({ task_id: T1, text: "Plan" }), agentName: "hark", dryRun: true });
    expect(result).toMatchObject({ subtask_id: "dry-run-subtask-id", created: true, owner: "ai", status: "todo" });
    expect(admin.writes).toEqual([]);
  });

  it("refuses another user's task (message routes to HTTP 400)", async () => {
    const admin = fakeAdmin(base());
    await expect(addSubtask(admin, USER, { ...parseAddSubtask({ task_id: T_OTHER, text: "x" }), agentName: "a", dryRun: false }))
      .rejects.toThrow(/not found/i);
  });
});

describe("update_subtask / delete_subtask", () => {
  const seed = () => fakeAdmin({
    ...base(),
    equilibrium_subtasks: [sub(S1, T1, "Waiting item", { status: "waiting", waiting_on: "sasha" })],
    equilibrium_do_now: [doNow({ owner: "ai", subtask_id: S1 })],
  });

  it("done stamps done_at, clears waiting_on and removes the Do Now row", async () => {
    const admin = seed();
    const { result } = await updateSubtask(admin, USER, { subtaskId: S1, patch: parseSubtaskPatch({ status: "done" }), dryRun: false });
    expect(admin.tables.equilibrium_subtasks[0]).toMatchObject({ status: "done", waiting_on: null });
    expect(admin.tables.equilibrium_subtasks[0].done_at).toBeTruthy();
    expect(admin.tables.equilibrium_do_now).toHaveLength(0);
    expect(result).toMatchObject({ status: "done", do_now_removed: true });
  });

  it("a non-waiting status clears waiting_on; reopening clears done_at", async () => {
    const admin = seed();
    await updateSubtask(admin, USER, { subtaskId: S1, patch: parseSubtaskPatch({ status: "in_progress" }), dryRun: false });
    expect(admin.tables.equilibrium_subtasks[0]).toMatchObject({ status: "in_progress", waiting_on: null, done_at: null });
    await updateSubtask(admin, USER, { subtaskId: S1, patch: parseSubtaskPatch({ status: "dropped" }), dryRun: false });
    const droppedAt = admin.tables.equilibrium_subtasks[0].done_at;
    expect(droppedAt).toBeTruthy();
    await updateSubtask(admin, USER, { subtaskId: S1, patch: parseSubtaskPatch({ status: "todo" }), dryRun: false });
    expect(admin.tables.equilibrium_subtasks[0].done_at).toBeNull();
  });

  it("dry_run writes nothing", async () => {
    const admin = seed();
    await updateSubtask(admin, USER, { subtaskId: S1, patch: parseSubtaskPatch({ status: "done" }), dryRun: true });
    expect(admin.writes).toEqual([]);
  });

  it("delete_subtask removes the row and its Do Now row", async () => {
    const admin = seed();
    const { result } = await deleteSubtask(admin, USER, { subtaskId: S1, dryRun: false });
    expect(result).toMatchObject({ deleted: true });
    expect(admin.tables.equilibrium_subtasks).toHaveLength(0);
    expect(admin.tables.equilibrium_do_now).toHaveLength(0);
  });

  it("will not touch another user's subtask", async () => {
    const admin = fakeAdmin({ ...base(), equilibrium_subtasks: [sub(S1, T1, "Mine", { user_id: OTHER_USER })] });
    await expect(deleteSubtask(admin, USER, { subtaskId: S1, dryRun: false })).rejects.toThrow(/not found/i);
  });
});

describe("promote_do_now", () => {
  const seed = () => fakeAdmin({
    ...base(),
    equilibrium_subtasks: [sub(S1, T1, "Subtask one"), sub(S2, T1, "Subtask two"), sub(S3, T1, "Closed", { status: "done", done_at: "2026-10-16T00:00:00.000Z" })],
  });
  const p = (admin: ReturnType<typeof seed>, ref: { type: "task" | "subtask"; id: string }, owner?: "human" | "ai", dryRun = false) =>
    promoteDoNow(admin, USER, { ref, owner, agentName: "hark", dryRun });

  it("first human promote has nothing to replace and stamps do_now_at on tasks", async () => {
    const admin = seed();
    const { result } = await p(admin, { type: "task", id: T1 }, "human");
    expect(result).toMatchObject({ owner: "human", promoted: true, replaced: null, position: 0 });
    expect(admin.tables.equilibrium_do_now[0]).toMatchObject({ user_id: USER, owner: "human", task_id: T1, subtask_id: null, promoted_by: "hark" });
    expect(admin.tables.equilibrium_tasks.find((t) => t.id === T1)!.do_now_at).toBeTruthy();
  });

  it("a second human promote replaces the first and returns replaced:{type,id,text}", async () => {
    const admin = seed();
    await p(admin, { type: "task", id: T1 }, "human");
    const { result, summary } = await p(admin, { type: "subtask", id: S1 }, "human");
    expect(result).toMatchObject({ replaced: { type: "task", id: T1, text: "Task Flow — build it" } });
    expect(admin.tables.equilibrium_do_now.filter((d) => d.owner === "human")).toHaveLength(1);
    expect(admin.tables.equilibrium_do_now[0]).toMatchObject({ subtask_id: S1, task_id: null });
    expect(summary).toContain("replacing task");
  });

  it("ai promotes append in order with no cap", async () => {
    const admin = seed();
    await p(admin, { type: "subtask", id: S1 }, "ai");
    await p(admin, { type: "subtask", id: S2 }, "ai");
    await p(admin, { type: "task", id: T2 }, "ai");
    expect(admin.tables.equilibrium_do_now.map((d) => [d.owner, d.position])).toEqual([["ai", 0], ["ai", 1], ["ai", 2]]);
  });

  it("owner defaults to the item's owner (subtask ai, task human)", async () => {
    const admin = seed();
    expect((await p(admin, { type: "subtask", id: S1 })).result.owner).toBe("ai");
    expect((await p(admin, { type: "task", id: T1 })).result.owner).toBe("human");
  });

  it("re-promoting to the same owner is idempotent and writes nothing", async () => {
    const admin = seed();
    await p(admin, { type: "task", id: T1 }, "human");
    const writesBefore = admin.writes.length;
    const { result } = await p(admin, { type: "task", id: T1 }, "human");
    expect(result).toMatchObject({ promoted: false, unchanged: true, replaced: null });
    expect(admin.writes).toHaveLength(writesBefore);
    expect(admin.tables.equilibrium_do_now).toHaveLength(1);
  });

  it("an item in the other owner's list moves instead of duplicating", async () => {
    const admin = seed();
    await p(admin, { type: "subtask", id: S1 }, "ai");
    const { result } = await p(admin, { type: "subtask", id: S1 }, "human");
    expect(result).toMatchObject({ owner: "human", replaced: null });
    expect(admin.tables.equilibrium_do_now).toHaveLength(1);
    expect(admin.tables.equilibrium_do_now[0]).toMatchObject({ owner: "human", subtask_id: S1 });
  });

  it("done and dropped items are refused (message routes to HTTP 400)", async () => {
    const admin = seed();
    await expect(p(admin, { type: "subtask", id: S3 }, "ai")).rejects.toThrow(/Cannot promote a done subtask/);
    admin.tables.equilibrium_tasks[1].status = "done";
    await expect(p(admin, { type: "task", id: T2 }, "human")).rejects.toThrow(/Cannot promote a done task/);
    admin.tables.equilibrium_subtasks[0].status = "dropped";
    await expect(p(admin, { type: "subtask", id: S1 }, "ai")).rejects.toThrow(/Cannot promote a dropped subtask/);
  });

  it("refuses an item the caller does not own", async () => {
    const admin = seed();
    await expect(p(admin, { type: "task", id: T_OTHER }, "human")).rejects.toThrow(/not found/i);
  });

  it("dry_run reports what would be replaced and writes nothing", async () => {
    const admin = seed();
    await p(admin, { type: "task", id: T1 }, "human");
    const writesBefore = admin.writes.length;
    const { result } = await p(admin, { type: "subtask", id: S1 }, "human", true);
    expect(result).toMatchObject({ promoted: false, replaced: { type: "task", id: T1 } });
    expect(admin.writes).toHaveLength(writesBefore);
  });

  it("restores the replaced human row when the insert fails", async () => {
    const admin = fakeAdmin(
      { ...base(), equilibrium_subtasks: [sub(S1, T1, "Subtask one")], equilibrium_do_now: [doNow({ owner: "human", task_id: T2 })] },
      { table: "equilibrium_do_now", op: "insert" },
    );
    await expect(promoteDoNow(admin, USER, { ref: { type: "subtask", id: S1 }, owner: "human", agentName: "hark", dryRun: false }))
      .rejects.toThrow(/Could not promote/);
    expect(admin.tables.equilibrium_do_now).toHaveLength(1);
    expect(admin.tables.equilibrium_do_now[0]).toMatchObject({ owner: "human", task_id: T2 });
  });

  it("the fake enforces the unique index the migration creates (second human insert fails)", async () => {
    const admin = fakeAdmin({ ...base(), equilibrium_do_now: [doNow({ owner: "human", task_id: T1 })] });
    const { error } = await admin.from("equilibrium_do_now").insert({ user_id: USER, owner: "human", task_id: T2 });
    expect(error.message).toMatch(/uq_eq_do_now_one_human/);
  });
});

describe("demote", () => {
  it("removes the row but keeps the item", async () => {
    const admin = fakeAdmin({ ...base(), equilibrium_do_now: [doNow({ owner: "human", task_id: T1 })] });
    const { result } = await demote(admin, USER, { ref: { type: "task", id: T1 }, dryRun: false });
    expect(result).toMatchObject({ demoted: true, owner: "human" });
    expect(admin.tables.equilibrium_do_now).toHaveLength(0);
    expect(admin.tables.equilibrium_tasks.find((t) => t.id === T1)!.status).toBe("active");
  });

  it("is a 200 no-op with demoted:false when the item is not in Do Now", async () => {
    const admin = fakeAdmin(base());
    const { result } = await demote(admin, USER, { ref: { type: "task", id: T1 }, dryRun: false });
    expect(result).toMatchObject({ demoted: false });
    expect(admin.writes).toEqual([]);
  });
});

describe("complete", () => {
  it("task: done + snapshot + Do Now and legacy focus rows removed; open subtasks stay open (D4)", async () => {
    const admin = fakeAdmin({
      ...base(),
      equilibrium_subtasks: [sub(S1, T1, "Still open")],
      equilibrium_do_now: [doNow({ owner: "human", task_id: T1 })],
      equilibrium_focus: [{ user_id: USER, position: 1, task_id: T1 }],
    });
    const { result } = await complete(admin, USER, { ref: { type: "task", id: T1 }, dryRun: false });
    const t = admin.tables.equilibrium_tasks.find((x) => x.id === T1)!;
    expect(t).toMatchObject({ status: "done", do_now_at: null, workstream_title_snapshot: "Founder OS" });
    expect(t.done_at).toBeTruthy();
    expect(admin.tables.equilibrium_do_now).toHaveLength(0);
    expect(admin.tables.equilibrium_focus).toHaveLength(0);
    expect(admin.tables.equilibrium_subtasks[0].status).toBe("todo");
    expect(result).toMatchObject({ target: "equilibrium_tasks", task_id: T1, status: "done" });
  });

  it("subtask: done + done_at + Do Now row removed", async () => {
    const admin = fakeAdmin({
      ...base(),
      equilibrium_subtasks: [sub(S1, T1, "Doing", { status: "in_progress" })],
      equilibrium_do_now: [doNow({ owner: "ai", subtask_id: S1 })],
    });
    const { result } = await complete(admin, USER, { ref: { type: "subtask", id: S1 }, dryRun: false });
    expect(admin.tables.equilibrium_subtasks[0]).toMatchObject({ status: "done" });
    expect(admin.tables.equilibrium_subtasks[0].done_at).toBeTruthy();
    expect(admin.tables.equilibrium_do_now).toHaveLength(0);
    expect(result).toMatchObject({ target: "equilibrium_subtasks", subtask_id: S1, status: "done" });
  });

  it("a dropped subtask cannot be completed; dry_run writes nothing", async () => {
    const admin = fakeAdmin({ ...base(), equilibrium_subtasks: [sub(S1, T1, "x", { status: "dropped", done_at: "2026-10-16T00:00:00.000Z" })] });
    await expect(complete(admin, USER, { ref: { type: "subtask", id: S1 }, dryRun: false })).rejects.toThrow(/Cannot complete/);
    const admin2 = fakeAdmin(base());
    await complete(admin2, USER, { ref: { type: "task", id: T1 }, dryRun: true });
    expect(admin2.writes).toEqual([]);
  });
});

describe("move_task", () => {
  it("moves the task to the end of the target workstream; its subtasks follow via task_id", async () => {
    const admin = fakeAdmin({ ...base(), equilibrium_tasks: [...base().equilibrium_tasks, task(T3, WS_B, "Existing")], equilibrium_subtasks: [sub(S1, T1, "Rides along")] });
    const { result } = await moveTask(admin, USER, { taskId: T1, workstreamId: WS_B, maxTasks: 3, dryRun: false });
    expect(admin.tables.equilibrium_tasks.find((t) => t.id === T1)).toMatchObject({ workstream_id: WS_B, position: 1 });
    expect(admin.tables.equilibrium_subtasks[0].task_id).toBe(T1);
    expect(result).toMatchObject({ moved: true, workstream_id: WS_B });
  });

  it("refuses a target at the cap and names the way out", async () => {
    const full = [task("b1", WS_B, "1"), task("b2", WS_B, "2"), task("b3", WS_B, "3")];
    const admin = fakeAdmin({ ...base(), equilibrium_tasks: [...base().equilibrium_tasks, ...full] });
    const err = await moveTask(admin, USER, { taskId: T1, workstreamId: WS_B, maxTasks: 3, dryRun: false }).catch((e) => e);
    expect(err.message).toMatch(/Cannot move task: active task cap is 3/);
    expect(err.message).toMatch(/move_task/);
    expect(err.message).toMatch(/convert_task_to_subtask/);
  });

  it("same workstream is a no-op; foreign workstream is not found", async () => {
    const admin = fakeAdmin(base());
    expect((await moveTask(admin, USER, { taskId: T1, workstreamId: WS_A, maxTasks: 3, dryRun: false })).result).toMatchObject({ moved: false });
    await expect(moveTask(admin, USER, { taskId: T1, workstreamId: WS_OTHER, maxTasks: 3, dryRun: false })).rejects.toThrow(/not found/i);
  });
});

describe("convert_task_to_subtask", () => {
  const seed = () => fakeAdmin({
    ...base(),
    equilibrium_tasks: [
      task(T1, WS_A, "Parent task"),
      task(T2, WS_A, "Task to fold in", { created_at: "2026-09-01T00:00:00.000Z" }),
    ],
    equilibrium_subtasks: [sub(S1, T1, "Existing parent subtask", { position: 4 }), sub(S2, T2, "Own subtask")],
    equilibrium_do_now: [doNow({ owner: "human", task_id: T2 })],
  });
  const run = (admin: ReturnType<typeof seed>, dryRun = false, owner?: "human" | "ai") =>
    convertTaskToSubtask(admin, USER, { taskId: T2, parentTaskId: T1, owner, agentName: "hark", dryRun });

  it("carries text/status/created_at, re-parents subtasks, moves the Do Now row, deletes the task", async () => {
    const admin = seed();
    const { result } = await run(admin);
    const created = admin.tables.equilibrium_subtasks.find((s) => s.text === "Task to fold in")!;
    expect(created).toMatchObject({
      task_id: T1, status: "todo", owner: "human", created_at: "2026-09-01T00:00:00.000Z", created_by: "hark", position: 5,
    });
    expect(admin.tables.equilibrium_subtasks.find((s) => s.id === S2)!.task_id).toBe(T1);
    expect(admin.tables.equilibrium_do_now).toHaveLength(1);
    expect(admin.tables.equilibrium_do_now[0]).toMatchObject({ owner: "human", task_id: null, subtask_id: created.id });
    expect(admin.tables.equilibrium_tasks.map((t) => t.id)).not.toContain(T2);
    expect(result).toMatchObject({ converted: true, subtask_id: created.id, reparented_subtasks: 1, do_now_moved: true });
  });

  it("a done task becomes a done subtask with its done_at", async () => {
    const admin = seed();
    Object.assign(admin.tables.equilibrium_tasks[1], { status: "done", done_at: "2026-09-02T00:00:00.000Z" });
    admin.tables.equilibrium_do_now = [];
    await run(admin, false, "ai");
    expect(admin.tables.equilibrium_subtasks.find((s) => s.text === "Task to fold in")).toMatchObject({
      status: "done", done_at: "2026-09-02T00:00:00.000Z", owner: "ai",
    });
  });

  it("dry_run returns the plan and writes nothing", async () => {
    const admin = seed();
    const { result } = await run(admin, true);
    expect(result).toMatchObject({ converted: false, plan: { reparent_subtask_ids: [S2], delete_task_id: T2 } });
    expect((result as any).plan.move_do_now).toMatchObject({ owner: "human" });
    expect(admin.writes).toEqual([]);
    expect(admin.tables.equilibrium_tasks).toHaveLength(2);
  });

  it("rejects converting a task into itself and a foreign parent", async () => {
    const admin = seed();
    await expect(convertTaskToSubtask(admin, USER, { taskId: T2, parentTaskId: T2, agentName: "a", dryRun: false })).rejects.toThrow(/Cannot convert/);
    await expect(convertTaskToSubtask(admin, USER, { taskId: T2, parentTaskId: T_OTHER, agentName: "a", dryRun: false })).rejects.toThrow(/not found/i);
  });

  it("when re-parenting fails the new subtask is rolled back and the task survives", async () => {
    const admin = fakeAdmin({
      ...base(),
      equilibrium_subtasks: [sub(S2, T2, "Own subtask")],
    }, { table: "equilibrium_subtasks", op: "update" });
    await expect(convertTaskToSubtask(admin, USER, { taskId: T2, parentTaskId: T1, agentName: "hark", dryRun: false }))
      .rejects.toThrow(/task not deleted/);
    expect(admin.tables.equilibrium_tasks.map((t) => t.id)).toContain(T2);
    expect(admin.tables.equilibrium_subtasks).toHaveLength(1);
  });
});

describe("read_state v2 shaping", () => {
  const NOW = Date.parse("2026-10-17T18:00:00.000Z"); // 12:00 Mexico City
  const workstreams = [ws(WS_A, "Founder OS", 0), ws(WS_B, "Mirror Funnel", 3)];
  const tasks = [
    task(T1, WS_A, "Equilibrium Task Flow — spec + build", { owner: "human" }),
    task(T2, WS_A, "Knowledge graph", { position: 1 }),
  ];
  const subtasks = [
    sub(S1, T1, "Phase 1 backend", { status: "waiting", waiting_on: "claude", priority: 1, external_ref: "https://example.test/71", effort: "1 credit", kind: "build", position: 0 }),
    sub(S2, T1, "Your review of the plan", { status: "waiting", waiting_on: "Sasha", priority: 2, position: 1 }),
    sub(S3, T1, "Spec committed", { status: "done", done_at: "2026-10-17T07:00:00.000Z" }),
    sub("c0000000-0000-4000-8000-000000000004", T1, "Old and done", { status: "done", done_at: "2026-10-10T00:00:00.000Z" }),
    sub("c0000000-0000-4000-8000-000000000005", T1, "Declined yesterday", { status: "dropped", done_at: "2026-10-16T12:00:00.000Z" }),
    sub("c0000000-0000-4000-8000-000000000006", "b0000000-0000-4000-8000-0000000000aa", "Orphan of a done parent", { status: "in_progress" }),
  ];
  const parentTasks = [task("b0000000-0000-4000-8000-0000000000aa", WS_A, "Finished parent — done", { status: "done" })];
  const input = (doNowRows: Row[]) => ({
    workstreams, tasks, parentTasks, subtasks, doNow: doNowRows,
    caps: { workstreams: 3, tasksPerWorkstream: 3 }, nowMs: NOW,
  });

  it("returns the v2 fields next to the legacy shapes", () => {
    const humanRow = doNow({ owner: "human", subtask_id: S1, promoted_at: "2026-10-17T10:00:00.000Z" });
    const aiRow = doNow({ owner: "ai", task_id: T2, position: 0 });
    const state = shapeTaskFlowState(input([humanRow, aiRow]));

    expect(state.caps).toEqual({ workstreams: 3, tasks_per_workstream: 3, human_do_now: 1 });
    expect(state.workstreams.map((w) => [w.title, w.over_cap])).toEqual([["Founder OS", false], ["Mirror Funnel", true]]);

    const [t1, t2] = state.workstreams[0].tasks;
    expect(t1).toMatchObject({ id: T1, name: "Equilibrium Task Flow", owner: "human", status: "active", is_focus: false, do_now: null });
    expect(t2).toMatchObject({ id: T2, is_focus: true, do_now: "ai" });
    // open subtasks by position, then closed within 48h newest first; the 7-day-old one is gone
    expect(t1.subtasks.map((s) => s.text)).toEqual(["Phase 1 backend", "Your review of the plan", "Spec committed", "Declined yesterday"]);
    expect(t1.subtasks[0]).toEqual({
      id: S1, text: "Phase 1 backend", owner: "ai", status: "waiting", waiting_on: "claude", priority: 1,
      external_ref: "https://example.test/71", note: null, effort: "1 credit", kind: "build", do_now: "human", created_by: "hark",
      created_at: "2026-10-02T00:00:00.000Z", updated_at: "2026-10-02T00:00:00.000Z", done_at: null,
    });

    // legacy do_now = HUMAN row; a subtask maps to {parent task id, subtask text, workstream_title}
    expect(state.doNow).toEqual({ id: T1, name: "Phase 1 backend", workstream_title: "Founder OS" });
    expect(state.humanDoNowFilled).toBe(true);

    expect(state.do_now_v2.human).toEqual({
      type: "subtask", id: S1, text: "Phase 1 backend",
      path: ["Founder OS", "Equilibrium Task Flow"], effort: "1 credit", kind: "build", promoted_at: "2026-10-17T10:00:00.000Z",
    });
    expect(state.do_now_v2.ai).toEqual([
      { type: "task", id: T2, text: "Knowledge graph", path: ["Founder OS"], status: "active", waiting_on: null, effort: null, kind: null },
    ]);
    expect(state.waiting_on_human).toEqual([
      { type: "subtask", id: S2, text: "Your review of the plan", path: ["Founder OS", "Equilibrium Task Flow"] },
    ]);
    // 07:00Z is 01:00 Mexico City on the 17th (today); 12:00Z on the 16th is yesterday
    expect(state.subtask_counts).toEqual({
      todo: 0, in_progress: 1, waiting: 2, waiting_on_human: 1, done_today: 1, dropped_today: 0,
    });
  });

  it("legacy do_now stays the same 3-key shape for a task; null without a human row", () => {
    expect(shapeTaskFlowState(input([doNow({ owner: "human", task_id: T2 })])).doNow)
      .toEqual({ id: T2, name: "Knowledge graph", workstream_title: "Founder OS" });
    const empty = shapeTaskFlowState(input([doNow({ owner: "ai", task_id: T2 })]));
    expect(empty.doNow).toBeNull();
    expect(empty.humanDoNowFilled).toBe(false);
    expect(empty.do_now_v2.human).toBeNull();
  });

  it("resolves the path of a Do Now subtask whose parent task is done (D4)", () => {
    const orphanId = "c0000000-0000-4000-8000-000000000006";
    const state = shapeTaskFlowState(input([doNow({ owner: "ai", subtask_id: orphanId })]));
    expect(state.do_now_v2.ai[0]).toMatchObject({ id: orphanId, path: ["Founder OS", "Finished parent"] });
  });

  it("flags a workstream over the task cap", () => {
    const many = [1, 2, 3, 4].map((n) => task(`b0000000-0000-4000-8000-00000000010${n}`, WS_A, `t${n}`));
    const state = shapeTaskFlowState({ ...input([]), tasks: many });
    expect(state.workstreams[0].over_cap).toBe(true);
  });

  it("uses the UTC-06:00 day boundary", () => {
    expect(new Date(startOfPanelDayMs(NOW)).toISOString()).toBe("2026-10-17T06:00:00.000Z");
    expect(new Date(startOfPanelDayMs(Date.parse("2026-10-17T05:59:00.000Z"))).toISOString()).toBe("2026-10-16T06:00:00.000Z");
  });
});
