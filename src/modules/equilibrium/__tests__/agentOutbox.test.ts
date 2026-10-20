/**
 * Cockpit Outbox operations for equilibrium-agent-write (issue #89).
 *
 * Exercises outbox_add_draft / outbox_list / outbox_mark_sent against a tiny
 * in-memory stand-in for the Supabase client. Token gating, the operation
 * allowlist, idempotency and audit logging live in index.ts and are shared
 * with every other operation; the draft-only creation, approved-only
 * mark-sent, dry_run and ownership behavior is what these tests pin down.
 * Fixtures are synthetic.
 */

import { describe, expect, it } from "vitest";
import {
  DEFAULT_OUTBOX_READ,
  MAX_OUTBOX_READ,
  addOutboxDraft,
  cleanOutboxChannel,
  cleanOutboxLimit,
  cleanOutboxStatus,
  listOutbox,
  markOutboxSent,
} from "../../../../supabase/functions/equilibrium-agent-write/outbox";

type Row = Record<string, any>;

const USER = "00000000-0000-4000-8000-000000000001";
const OTHER_USER = "00000000-0000-4000-8000-000000000002";
const ITEM = "30000000-0000-4000-8000-000000000001";

/** Minimal chainable fake of the Supabase query builder. */
function fakeAdmin(seed: Row[] = [], failOn?: { op: string }) {
  const tables: Record<string, Row[]> = { cockpit_outbox: JSON.parse(JSON.stringify(seed)) };
  let nextId = 1;

  const from = (table: string) => {
    const filters: Array<[string, "eq" | "neq", unknown]> = [];
    let op: "select" | "insert" | "update" = "select";
    let payload: Row | undefined;
    let order: { col: string; asc: boolean } | undefined;
    let limit: number | undefined;
    let wantSingle = false;

    const matching = () =>
      tables[table].filter((r) => filters.every(([c, kind, v]) => (kind === "eq" ? r[c] === v : r[c] !== v)));

    const run = (): { data: any; error: any } => {
      if (failOn && failOn.op === op) return { data: null, error: { message: `forced ${op} failure` } };
      if (op === "insert") {
        const row = {
          id: `40000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`,
          created_at: new Date().toISOString(),
          ...payload,
        };
        tables[table].push(row);
        return { data: row, error: null };
      }
      if (op === "update") {
        const rows = matching();
        rows.forEach((r) => Object.assign(r, payload));
        return { data: rows, error: null };
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
      eq: (col: string, val: unknown) => { filters.push([col, "eq", val]); return builder; },
      neq: (col: string, val: unknown) => { filters.push([col, "neq", val]); return builder; },
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

const item = (over: Row = {}): Row => ({
  id: ITEM,
  user_id: USER,
  channel: "linkedin",
  recipient_name: "Ada Test",
  recipient_ref: "https://example.com/in/ada-test",
  body: "Hi Ada, a short synthetic note.",
  status: "approved",
  created_by: "ai",
  created_at: "2026-10-20T08:00:00Z",
  approved_at: "2026-10-20T08:05:00Z",
  sent_at: null,
  sent_result: null,
  ...over,
});

describe("outbox_add_draft", () => {
  it("inserts an ai-authored draft for the user", async () => {
    const admin = fakeAdmin();
    const { result } = await addOutboxDraft(admin, USER, {
      channel: "linkedin",
      recipientName: "Ada Test",
      recipientRef: "https://example.com/in/ada-test",
      body: "Hello Ada",
      dryRun: false,
    });
    expect(admin.tables.cockpit_outbox).toHaveLength(1);
    expect(admin.tables.cockpit_outbox[0]).toMatchObject({
      user_id: USER,
      channel: "linkedin",
      recipient_name: "Ada Test",
      recipient_ref: "https://example.com/in/ada-test",
      body: "Hello Ada",
      status: "draft",
      created_by: "ai",
    });
    expect(result).toMatchObject({ status: "draft", added: true });
  });

  it("always creates a draft, never an approved item", async () => {
    const admin = fakeAdmin();
    await addOutboxDraft(admin, USER, { channel: "email", body: "Body", dryRun: false });
    expect(admin.tables.cockpit_outbox[0].status).toBe("draft");
    expect(admin.tables.cockpit_outbox[0].approved_at).toBeUndefined();
  });

  it("stores null recipient fields for a post", async () => {
    const admin = fakeAdmin();
    await addOutboxDraft(admin, USER, { channel: "post", body: "Public note", dryRun: false });
    expect(admin.tables.cockpit_outbox[0]).toMatchObject({ recipient_name: null, recipient_ref: null });
  });

  it("dry_run reports the plan and inserts nothing", async () => {
    const admin = fakeAdmin();
    const { result } = await addOutboxDraft(admin, USER, { channel: "email", body: "x", dryRun: true });
    expect(result).toMatchObject({ added: false, outbox_id: "dry-run-outbox-id" });
    expect(admin.tables.cockpit_outbox).toHaveLength(0);
  });

  it("surfaces insert failures", async () => {
    const admin = fakeAdmin([], { op: "insert" });
    await expect(addOutboxDraft(admin, USER, { channel: "post", body: "x", dryRun: false }))
      .rejects.toThrow(/Could not add outbox draft/);
  });
});

describe("outbox_list", () => {
  const seed = [
    item({ id: "a", status: "approved", created_at: "2026-10-20T08:00:00Z" }),
    item({ id: "b", status: "draft", channel: "email", created_at: "2026-10-20T09:00:00Z" }),
    item({ id: "c", status: "deleted", created_at: "2026-10-20T10:00:00Z" }),
    item({ id: "d", status: "approved", user_id: OTHER_USER, created_at: "2026-10-20T11:00:00Z" }),
  ];

  it("returns the user's items newest first and leaves out deleted ones by default", async () => {
    const items = await listOutbox(fakeAdmin(seed), USER);
    expect(items.map((i: Row) => i.id)).toEqual(["b", "a"]);
  });

  it("filters by status, so Hark can fetch only approved items", async () => {
    const items = await listOutbox(fakeAdmin(seed), USER, { status: "approved" });
    expect(items.map((i: Row) => i.id)).toEqual(["a"]);
  });

  it("can ask for deleted items explicitly", async () => {
    const items = await listOutbox(fakeAdmin(seed), USER, { status: "deleted" });
    expect(items.map((i: Row) => i.id)).toEqual(["c"]);
  });

  it("filters by channel", async () => {
    const items = await listOutbox(fakeAdmin(seed), USER, { channel: "email" });
    expect(items.map((i: Row) => i.id)).toEqual(["b"]);
  });

  it("returns only the documented fields", async () => {
    const [first] = await listOutbox(fakeAdmin(seed), USER);
    expect(Object.keys(first).sort()).toEqual([
      "approved_at", "body", "channel", "created_at", "created_by", "id",
      "recipient_name", "recipient_ref", "sent_at", "sent_result", "status",
    ]);
  });

  it("respects the limit", async () => {
    const items = await listOutbox(fakeAdmin(seed), USER, { limit: 1 });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("b");
  });
});

describe("outbox_mark_sent", () => {
  it("marks an approved item as sent and records the result", async () => {
    const admin = fakeAdmin([item()]);
    const { result } = await markOutboxSent(admin, USER, {
      outboxId: ITEM, sentResult: "sent via LinkedIn", dryRun: false,
    });
    expect(admin.tables.cockpit_outbox[0]).toMatchObject({ status: "sent", sent_result: "sent via LinkedIn" });
    expect(admin.tables.cockpit_outbox[0].sent_at).toEqual(expect.any(String));
    expect(result).toMatchObject({ status: "sent", sent: true });
  });

  it("refuses a draft: nothing sends without the human press", async () => {
    const admin = fakeAdmin([item({ status: "draft", approved_at: null })]);
    await expect(markOutboxSent(admin, USER, { outboxId: ITEM, dryRun: false }))
      .rejects.toThrow(/Cannot mark a draft item as sent/);
    expect(admin.tables.cockpit_outbox[0].status).toBe("draft");
  });

  it("refuses deleted and already-sent items", async () => {
    for (const status of ["deleted", "sent"]) {
      const admin = fakeAdmin([item({ status })]);
      await expect(markOutboxSent(admin, USER, { outboxId: ITEM, dryRun: false }))
        .rejects.toThrow(/Cannot mark/);
      expect(admin.tables.cockpit_outbox[0].status).toBe(status);
    }
  });

  it("does not touch another user's item (message routes to HTTP 400)", async () => {
    const admin = fakeAdmin([item({ user_id: OTHER_USER })]);
    await expect(markOutboxSent(admin, USER, { outboxId: ITEM, dryRun: false }))
      .rejects.toThrow(/not found/i);
    expect(admin.tables.cockpit_outbox[0].status).toBe("approved");
  });

  it("rejects an unknown id", async () => {
    await expect(markOutboxSent(fakeAdmin(), USER, { outboxId: ITEM, dryRun: false }))
      .rejects.toThrow(/not found/i);
  });

  it("stores a null result when none is given", async () => {
    const admin = fakeAdmin([item()]);
    await markOutboxSent(admin, USER, { outboxId: ITEM, dryRun: false });
    expect(admin.tables.cockpit_outbox[0].sent_result).toBeNull();
  });

  it("dry_run changes nothing", async () => {
    const admin = fakeAdmin([item()]);
    const { result } = await markOutboxSent(admin, USER, { outboxId: ITEM, dryRun: true });
    expect(result).toMatchObject({ sent: false });
    expect(admin.tables.cockpit_outbox[0]).toMatchObject({ status: "approved", sent_at: null });
  });
});

describe("payload validation", () => {
  it("accepts the three channels and rejects others", () => {
    for (const channel of ["linkedin", "email", "post"]) expect(cleanOutboxChannel(channel)).toBe(channel);
    expect(() => cleanOutboxChannel("sms")).toThrow(/must be one of/);
    expect(() => cleanOutboxChannel(undefined)).toThrow(/must be one of/);
  });

  it("accepts the four statuses and rejects others", () => {
    for (const status of ["draft", "approved", "sent", "deleted"]) expect(cleanOutboxStatus(status)).toBe(status);
    expect(() => cleanOutboxStatus("pending")).toThrow(/must be one of/);
  });

  it("defaults and bounds the list limit", () => {
    expect(cleanOutboxLimit(undefined)).toBe(DEFAULT_OUTBOX_READ);
    expect(cleanOutboxLimit(MAX_OUTBOX_READ)).toBe(MAX_OUTBOX_READ);
    expect(() => cleanOutboxLimit(0)).toThrow(/must be an integer/);
    expect(() => cleanOutboxLimit(MAX_OUTBOX_READ + 1)).toThrow(/must be an integer/);
    expect(() => cleanOutboxLimit("abc")).toThrow(/must be an integer/);
  });
});
