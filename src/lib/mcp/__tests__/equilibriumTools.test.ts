/**
 * Equilibrium MCP tools: set_focus, set_strategies, set_workstreams, set_tasks, get_cycle.
 *
 * Run against the in-memory fake client (./fakeDb). What these pin down:
 * writes land in the right tables for the right user, repeating a call is a
 * no-op, caps are enforced with a readable message, nothing is ever deleted
 * except unlisted strategy slots, and DB errors never reach the agent raw.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { getLunarState } from "../../equilibrium-cycles";
import { phaseByLunarIndex } from "../../../modules/equilibrium/phasePlan";
import { ToolError } from "../tools/_shared";
import { getCycle } from "../tools/get-cycle";
import { getEquilibriumState } from "../tools/get-equilibrium-state";
import { setFocus, setFocusInput } from "../tools/set-focus";
import { setStrategies, setStrategiesInput } from "../tools/set-strategies";
import { setTasks } from "../tools/set-tasks";
import { setWorkstreams, setWorkstreamsInput } from "../tools/set-workstreams";
import { OTHER_USER, RAW_DB_MESSAGE, USER, fakeDb, type Row } from "./fakeDb";

const WS_A = "00000000-0000-4000-8000-000000000a01";
const WS_B = "00000000-0000-4000-8000-000000000a02";
const WS_C = "00000000-0000-4000-8000-000000000a03";
const WS_OTHER = "00000000-0000-4000-8000-000000000a09";

const ws = (id: string, title: string, position: number, extra: Row = {}): Row => ({
  id,
  user_id: USER,
  title,
  position,
  archived_at: null,
  ...extra,
});
const task = (id: string, workstream_id: string, text: string, position: number, status = "active"): Row => ({
  id,
  workstream_id,
  text,
  position,
  status,
});

describe("set_focus", () => {
  it("upserts moon_focus_text for the user and trims it", async () => {
    const { db, tables } = fakeDb();
    const out = await setFocus(db, USER, { text: "  Ship the pilot  " });

    expect(out).toMatchObject({ moon_focus: "Ship the pilot", cleared: false });
    expect(tables.equilibrium_state).toHaveLength(1);
    expect(tables.equilibrium_state[0]).toMatchObject({ user_id: USER, moon_focus_text: "Ship the pilot" });
  });

  it("overwrites on repeat instead of adding a row, and an empty string clears", async () => {
    const { db, tables } = fakeDb({ equilibrium_state: [{ user_id: USER, moon_focus_text: "Old", role_override_text: "keep me" }] });

    await setFocus(db, USER, { text: "New" });
    expect(tables.equilibrium_state).toHaveLength(1);
    expect(tables.equilibrium_state[0]).toMatchObject({ moon_focus_text: "New", role_override_text: "keep me" });

    const cleared = await setFocus(db, USER, { text: "" });
    expect(cleared).toMatchObject({ moon_focus: null, cleared: true });
    expect(tables.equilibrium_state[0].moon_focus_text).toBeNull();
  });

  it("does not touch another user's state", async () => {
    const { db, tables } = fakeDb({ equilibrium_state: [{ user_id: OTHER_USER, moon_focus_text: "Theirs" }] });
    await setFocus(db, USER, { text: "Mine" });
    expect(tables.equilibrium_state.find((r) => r.user_id === OTHER_USER)?.moon_focus_text).toBe("Theirs");
  });

  it("turns a database failure into a friendly error without the raw message", async () => {
    const { db } = fakeDb({}, { fail: { table: "equilibrium_state", op: "upsert", code: "42501" } });
    const error = await setFocus(db, USER, { text: "x" }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/not allowed to set the moon focus/i);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });
});

describe("set_strategies", () => {
  const strategy = (position: number, text: string, extra: Row = {}): Row => ({
    user_id: USER,
    position,
    text,
    set_at: "2026-10-01T00:00:00.000Z",
    ...extra,
  });

  it("writes the list in priority order", async () => {
    const { db, tables } = fakeDb();
    const out = await setStrategies(db, USER, { strategies: ["Ship the pilot", "  Hire the first two  "] });

    expect(out.strategies).toEqual([
      { position: 1, text: "Ship the pilot" },
      { position: 2, text: "Hire the first two" },
    ]);
    expect(out.written_positions).toEqual([1, 2]);
    expect(tables.equilibrium_strategies.map((s) => [s.position, s.text])).toEqual([
      [1, "Ship the pilot"],
      [2, "Hire the first two"],
    ]);
  });

  it("is a no-op when repeated: set_at and alignment scores survive", async () => {
    const { db, tables } = fakeDb({
      equilibrium_strategies: [strategy(1, "A", { alignment_score: 80 }), strategy(2, "B")],
    });

    const out = await setStrategies(db, USER, { strategies: ["A", "B"] });

    expect(out.unchanged).toBe(true);
    expect(tables.equilibrium_strategies[0]).toMatchObject({ alignment_score: 80, set_at: "2026-10-01T00:00:00.000Z" });
  });

  it("replaces: changed slots are rewritten, unlisted slots are cleared", async () => {
    const { db, tables } = fakeDb({
      equilibrium_strategies: [strategy(1, "A"), strategy(2, "B"), strategy(3, "C")],
    });

    const out = await setStrategies(db, USER, { strategies: ["X"] });

    expect(out.written_positions).toEqual([1]);
    expect(out.cleared_positions).toEqual([2, 3]);
    expect(tables.equilibrium_strategies.map((s) => [s.position, s.text])).toEqual([[1, "X"]]);
  });

  it("never touches another user's strategies", async () => {
    const { db, tables } = fakeDb({
      equilibrium_strategies: [strategy(1, "Mine"), { ...strategy(1, "Theirs"), user_id: OTHER_USER }, { ...strategy(2, "Theirs 2"), user_id: OTHER_USER }],
    });

    await setStrategies(db, USER, { strategies: [] });

    expect(tables.equilibrium_strategies.map((s) => s.text)).toEqual(["Theirs", "Theirs 2"]);
  });

  it("rejects more than 3 in the schema and in the core", async () => {
    const four = ["a", "b", "c", "d"];
    expect(z.object(setStrategiesInput).safeParse({ strategies: four }).success).toBe(false);
    expect(z.object(setStrategiesInput).safeParse({ strategies: ["a", "b", "c"] }).success).toBe(true);

    const { db } = fakeDb();
    await expect(setStrategies(db, USER, { strategies: four })).rejects.toThrow(/at most 3/);
  });

  it("surfaces a write failure as a friendly error", async () => {
    const { db } = fakeDb({}, { fail: { table: "equilibrium_strategies", op: "upsert" } });
    const error = await setStrategies(db, USER, { strategies: ["A"] }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/could not save the strategies/i);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });
});

describe("set_workstreams", () => {
  it("creates missing workstreams in order", async () => {
    const { db, tables } = fakeDb();
    const out = await setWorkstreams(db, USER, { workstreams: ["Launch", "Hiring"] });

    expect(out.created).toEqual(["Launch", "Hiring"]);
    expect(tables.equilibrium_workstreams.map((w) => [w.title, w.position, w.user_id])).toEqual([
      ["Launch", 0, USER],
      ["Hiring", 1, USER],
    ]);
  });

  it("is a no-op when repeated, matching titles case-insensitively", async () => {
    const { db, tables } = fakeDb({ equilibrium_workstreams: [ws(WS_A, "Launch", 0), ws(WS_B, "Hiring", 1)] });

    const out = await setWorkstreams(db, USER, { workstreams: ["launch", "  HIRING "] });

    expect(out.unchanged).toBe(true);
    expect(tables.equilibrium_workstreams).toHaveLength(2);
  });

  it("reorders existing workstreams without recreating them", async () => {
    const { db, tables } = fakeDb({ equilibrium_workstreams: [ws(WS_A, "Launch", 0), ws(WS_B, "Hiring", 1)] });

    const out = await setWorkstreams(db, USER, { workstreams: ["Hiring", "Launch"] });

    expect(out.created).toEqual([]);
    expect(tables.equilibrium_workstreams.find((w) => w.id === WS_B)?.position).toBe(0);
    expect(tables.equilibrium_workstreams.find((w) => w.id === WS_A)?.position).toBe(1);
  });

  it("refuses to exceed 3 active workstreams and says what is in the way", async () => {
    const { db, tables } = fakeDb({
      equilibrium_workstreams: [ws(WS_A, "Launch", 0), ws(WS_B, "Hiring", 1), ws(WS_C, "Ops", 2)],
    });

    const error = await setWorkstreams(db, USER, { workstreams: ["Brand new"] }).catch((e) => e);

    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/at most 3/);
    expect(error.message).toContain('"Launch"');
    expect(error.message).toContain("archive_unlisted");
    expect(tables.equilibrium_workstreams).toHaveLength(3);
  });

  it("never deletes: unlisted workstreams stay and are reported", async () => {
    const { db, tables } = fakeDb({ equilibrium_workstreams: [ws(WS_A, "Launch", 0), ws(WS_B, "Hiring", 1)] });

    const out = await setWorkstreams(db, USER, { workstreams: ["Launch"] });

    expect(out.left_unlisted).toEqual(["Hiring"]);
    expect(tables.equilibrium_workstreams).toHaveLength(2);
    expect(tables.equilibrium_workstreams.every((w) => w.archived_at === null)).toBe(true);
  });

  it("archive_unlisted soft-archives (keeps the row and its tasks) to make room", async () => {
    const { db, tables } = fakeDb({
      equilibrium_workstreams: [ws(WS_A, "Launch", 0), ws(WS_B, "Hiring", 1), ws(WS_C, "Ops", 2)],
      equilibrium_tasks: [task("t1", WS_B, "Interview", 0)],
    });

    const out = await setWorkstreams(db, USER, { workstreams: ["Launch", "Brand new"], archive_unlisted: true });

    expect(out.archived).toEqual(["Hiring", "Ops"]);
    expect(out.created).toEqual(["Brand new"]);
    expect(tables.equilibrium_workstreams.find((w) => w.id === WS_B)?.archived_at).toBeTruthy();
    expect(tables.equilibrium_tasks).toHaveLength(1);
    const active = tables.equilibrium_workstreams.filter((w) => w.archived_at == null).sort((a, b) => a.position - b.position);
    expect(active.map((w) => w.title)).toEqual(["Launch", "Brand new"]);
  });

  it("validates the list in the schema", () => {
    const schema = z.object(setWorkstreamsInput);
    expect(schema.safeParse({ workstreams: ["a", "b", "c", "d"] }).success).toBe(false);
    expect(schema.safeParse({ workstreams: [""] }).success).toBe(false);
    expect(schema.parse({ workstreams: ["a"] }).archive_unlisted).toBe(false);
  });

  it("ignores another user's workstreams", async () => {
    const { db, tables } = fakeDb({ equilibrium_workstreams: [ws(WS_OTHER, "Launch", 0, { user_id: OTHER_USER })] });

    const out = await setWorkstreams(db, USER, { workstreams: ["Launch"] });

    expect(out.created).toEqual(["Launch"]);
    expect(tables.equilibrium_workstreams).toHaveLength(2);
  });
});

describe("set_tasks", () => {
  const base = () => ({
    equilibrium_workstreams: [ws(WS_A, "Launch", 0), ws(WS_OTHER, "Theirs", 0, { user_id: OTHER_USER })],
  });

  it("adds tasks to a workstream found by title", async () => {
    const { db, tables } = fakeDb(base());
    const out = await setTasks(db, USER, { workstream: "launch", tasks: ["Write the brief", "Book the venue"] });

    expect(out.workstream).toEqual({ id: WS_A, title: "Launch" });
    expect(out.created).toEqual(["Write the brief", "Book the venue"]);
    expect(tables.equilibrium_tasks.map((t) => [t.workstream_id, t.text, t.position, t.status])).toEqual([
      [WS_A, "Write the brief", 0, "active"],
      [WS_A, "Book the venue", 1, "active"],
    ]);
  });

  it("finds the workstream by id and is a no-op when repeated", async () => {
    const { db, tables } = fakeDb(base());
    await setTasks(db, USER, { workstream: WS_A, tasks: ["One", "Two"] });
    const again = await setTasks(db, USER, { workstream: WS_A, tasks: ["two", "one"] });

    expect(again.created).toEqual([]);
    expect(tables.equilibrium_tasks).toHaveLength(2);
    // Reordered by the list, text untouched.
    expect(tables.equilibrium_tasks.find((t) => t.text === "Two")?.position).toBe(0);
    expect(tables.equilibrium_tasks.find((t) => t.text === "One")?.position).toBe(1);
  });

  it("enforces the 3 active-task cap and names what is in the way", async () => {
    const { db, tables } = fakeDb({
      ...base(),
      equilibrium_tasks: [task("t1", WS_A, "One", 0), task("t2", WS_A, "Two", 1), task("t3", WS_A, "Three", 2)],
    });

    const error = await setTasks(db, USER, { workstream: "Launch", tasks: ["Four"] }).catch((e) => e);

    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/at most 3 active tasks/);
    expect(error.message).toContain('"One"');
    expect(tables.equilibrium_tasks).toHaveLength(3);
  });

  it("counts only active tasks toward the cap; a done task with the same text does not block a new one", async () => {
    const { db, tables } = fakeDb({
      ...base(),
      equilibrium_tasks: [
        task("t1", WS_A, "Write the brief", 0, "done"),
        task("t2", WS_A, "Two", 1),
        task("t3", WS_A, "Three", 2),
      ],
    });

    const out = await setTasks(db, USER, { workstream: "Launch", tasks: ["Write the brief"] });

    expect(out.created).toEqual(["Write the brief"]);
    expect(tables.equilibrium_tasks.filter((t) => t.status === "active")).toHaveLength(3);
  });

  it("never deletes unlisted tasks", async () => {
    const { db, tables } = fakeDb({ ...base(), equilibrium_tasks: [task("t1", WS_A, "Keep", 0)] });

    const out = await setTasks(db, USER, { workstream: "Launch", tasks: ["Add"] });

    expect(out.left_unlisted).toEqual(["Keep"]);
    expect(tables.equilibrium_tasks.map((t) => t.text).sort()).toEqual(["Add", "Keep"]);
  });

  it("explains what to do when the workstream does not exist or belongs to someone else", async () => {
    const { db } = fakeDb(base());

    const missing = await setTasks(db, USER, { workstream: "Nope", tasks: ["x"] }).catch((e) => e);
    expect(missing).toBeInstanceOf(ToolError);
    expect(missing.message).toMatch(/No active workstream matches "Nope"/);
    expect(missing.message).toContain('"Launch"');
    expect(missing.message).toContain("set_workstreams");

    const foreign = await setTasks(db, USER, { workstream: WS_OTHER, tasks: ["x"] }).catch((e) => e);
    expect(foreign).toBeInstanceOf(ToolError);
    expect(foreign.message).toMatch(/No active workstream matches/);
  });
});

describe("get_cycle", () => {
  const NOW = Date.UTC(2026, 9, 21, 12, 0, 0);

  it("reports the lunar phase, what it asks and which layers are due on an empty account", async () => {
    const { db } = fakeDb();
    const out = await getCycle(db, USER, NOW);

    const expected = phaseByLunarIndex(getLunarState(NOW).segmentIndex);
    expect(out.phase).toMatchObject({ name: expected.name, position: expected.position, asks: expected.asks });
    expect(out.phase.hours_remaining).toBeGreaterThanOrEqual(0);
    expect(new Date(out.phase.ends_at).getTime()).toBeGreaterThan(NOW);
    expect(out.phase.next.name).toBeTruthy();
    expect(out.filled).toEqual({ focus: false, strategies: false, workstreams: false, tasks: false, doNow: false });
    // Moon Focus is due from Planning onward, i.e. in every phase.
    expect(out.readiness.focus).toBe("due_empty");
    expect(out.due.find((d) => d.layer === "focus")).toMatchObject({ fill_with: "set_focus" });
  });

  it("marks layers filled from the user's data and stops listing them as due", async () => {
    const { db } = fakeDb({
      equilibrium_state: [{ user_id: USER, moon_focus_text: "Ship" }],
      equilibrium_strategies: [{ user_id: USER, position: 1, text: "A" }],
      equilibrium_workstreams: [ws(WS_A, "Launch", 0)],
      equilibrium_tasks: [task("t1", WS_A, "One", 0)],
      equilibrium_focus: [{ user_id: USER, position: 1, task_id: "t1" }],
    });

    const out = await getCycle(db, USER, NOW);

    expect(out.filled).toEqual({ focus: true, strategies: true, workstreams: true, tasks: true, doNow: true });
    expect(Object.values(out.readiness).every((r) => r === "filled")).toBe(true);
    expect(out.due).toEqual([]);
  });

  it("ignores archived workstreams and done tasks when judging what is filled", async () => {
    const { db } = fakeDb({
      equilibrium_workstreams: [ws(WS_A, "Old", 0, { archived_at: "2026-09-01T00:00:00.000Z" }), ws(WS_B, "Live", 1)],
      equilibrium_tasks: [task("t1", WS_B, "Finished", 0, "done")],
    });

    const out = await getCycle(db, USER, NOW);

    expect(out.filled.workstreams).toBe(true);
    expect(out.filled.tasks).toBe(false);
  });

  it("reports a read failure as a friendly error", async () => {
    const { db } = fakeDb({}, { fail: { table: "equilibrium_state", op: "select" } });
    const error = await getCycle(db, USER, NOW).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });
});

describe("get_equilibrium_state", () => {
  it("returns the snapshot with active tasks per workstream and the focus tasks, for this user only", async () => {
    const { db } = fakeDb({
      equilibrium_state: [{ user_id: USER, moon_focus_text: "Ship" }],
      equilibrium_strategies: [{ user_id: USER, position: 1, text: "A" }],
      equilibrium_workstreams: [ws(WS_A, "Launch", 0), ws(WS_OTHER, "Theirs", 0, { user_id: OTHER_USER })],
      equilibrium_tasks: [
        task("t1", WS_A, "Open", 0),
        task("t2", WS_A, "Finished", 1, "done"),
        task("t3", WS_OTHER, "Theirs", 0),
      ],
      equilibrium_focus: [{ user_id: USER, position: 1, task_id: "t1" }],
    });

    const out = await getEquilibriumState(db, USER);

    expect(out.state).toMatchObject({ moon_focus_text: "Ship" });
    expect(out.workstreams).toHaveLength(1);
    expect(out.workstreams[0].active_tasks.map((t: Row) => t.id)).toEqual(["t1"]);
    expect(out.focus_tasks.map((t: Row) => t.id)).toEqual(["t1"]);
  });

  it("reports a read failure instead of silently returning an empty snapshot", async () => {
    const { db } = fakeDb({}, { fail: { table: "equilibrium_strategies", op: "select" } });
    const error = await getEquilibriumState(db, USER).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });
});

describe("schemas", () => {
  it("set_focus accepts empty (clear) and rejects oversized text", () => {
    const schema = z.object(setFocusInput);
    expect(schema.safeParse({ text: "" }).success).toBe(true);
    expect(schema.safeParse({ text: "x".repeat(4001) }).success).toBe(false);
  });
});
