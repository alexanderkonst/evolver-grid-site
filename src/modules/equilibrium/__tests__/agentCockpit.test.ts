/**
 * Daily agent cycle operations for equilibrium-agent-write (issue #90).
 *
 * Exercises settings_read defaults, digest_write validation / upsert / dry_run
 * against a tiny in-memory stand-in for the Supabase client. Idempotency and
 * audit logging live in index.ts and are shared with every other operation.
 * Fixtures are synthetic.
 */

import { describe, expect, it } from "vitest";
import {
  DEFAULT_COCKPIT_SETTINGS,
  cleanDigestDate,
  cleanDigestItems,
  isValidTimezone,
  localDate,
  readCockpitSettings,
  writeDigest,
} from "../../../../supabase/functions/equilibrium-agent-write/cockpit";

type Row = Record<string, any>;

const USER = "00000000-0000-4000-8000-000000000001";

function fakeAdmin(seed: Record<string, Row[]> = {}, missingTables: string[] = []) {
  const tables: Record<string, Row[]> = {
    cockpit_settings: [],
    cockpit_digests: [],
    ...JSON.parse(JSON.stringify(seed)),
  };

  const from = (table: string) => {
    const filters: [string, unknown][] = [];
    let op: "select" | "upsert" = "select";
    let payload: Row | undefined;
    let conflictKeys: string[] = [];

    const run = (): { data: any; error: any } => {
      if (missingTables.includes(table)) {
        return { data: null, error: { code: "42P01", message: `relation "${table}" does not exist` } };
      }
      if (op === "upsert") {
        const existing = tables[table].find((r) => conflictKeys.every((k) => r[k] === payload![k]));
        if (existing) {
          Object.assign(existing, payload);
          return { data: existing, error: null };
        }
        const row = { id: `20000000-0000-4000-8000-${String(tables[table].length + 1).padStart(12, "0")}`, ...payload };
        tables[table].push(row);
        return { data: row, error: null };
      }
      return { data: tables[table].filter((r) => filters.every(([c, v]) => r[c] === v))[0] ?? null, error: null };
    };

    const builder: any = {
      select: () => builder,
      eq: (c: string, v: unknown) => (filters.push([c, v]), builder),
      upsert: (row: Row, opts: { onConflict: string }) => {
        op = "upsert";
        payload = row;
        conflictKeys = opts.onConflict.split(",");
        return builder;
      },
      maybeSingle: async () => run(),
      single: async () => run(),
    };
    return builder;
  };

  return { from, tables };
}

describe("readCockpitSettings", () => {
  it("returns defaults when the owner has no row", async () => {
    const admin = fakeAdmin();
    expect(await readCockpitSettings(admin, USER)).toEqual({ ...DEFAULT_COCKPIT_SETTINGS, updated_at: null });
  });

  it("returns the stored pause state", async () => {
    const admin = fakeAdmin({
      cockpit_settings: [{ user_id: USER, agents_paused: true, digest_time: "07:30", timezone: "UTC", updated_at: "t" }],
    });
    expect(await readCockpitSettings(admin, USER)).toEqual({
      agents_paused: true,
      digest_time: "07:30",
      timezone: "UTC",
      updated_at: "t",
    });
  });

  it("falls back to defaults before the migration is applied", async () => {
    const admin = fakeAdmin({}, ["cockpit_settings"]);
    expect((await readCockpitSettings(admin, USER)).agents_paused).toBe(false);
  });
});

describe("digest validation", () => {
  it("accepts well-formed items and trims them", () => {
    expect(cleanDigestItems([{ section: "outbox", text: "  Send offer  ", ref: " https://x.test " }])).toEqual([
      { section: "outbox", text: "Send offer", ref: "https://x.test" },
    ]);
    expect(cleanDigestItems(undefined)).toEqual([]);
  });

  it("rejects bad sections, empty text and oversize lists", () => {
    expect(() => cleanDigestItems([{ section: "done", text: "x" }])).toThrow(/must be one of/);
    expect(() => cleanDigestItems([{ section: "moved", text: " " }])).toThrow(/cannot be empty/);
    expect(() => cleanDigestItems("nope")).toThrow(/must be an array/);
    expect(() => cleanDigestItems(Array(51).fill({ section: "moved", text: "x" }))).toThrow(/too long/);
  });

  it("validates dates and timezones", () => {
    expect(cleanDigestDate("2026-10-20")).toBe("2026-10-20");
    expect(() => cleanDigestDate("2026-02-31")).toThrow(/valid date/);
    expect(() => cleanDigestDate("20 Oct")).toThrow(/YYYY-MM-DD/);
    expect(isValidTimezone("America/Mexico_City")).toBe(true);
    expect(isValidTimezone("Mars/Olympus")).toBe(false);
  });

  it("computes the local calendar day", () => {
    // 03:00 UTC on Oct 21 is still Oct 20 in Mexico City (UTC-06:00).
    expect(localDate(Date.UTC(2026, 9, 21, 3, 0), "America/Mexico_City")).toBe("2026-10-20");
  });
});

describe("writeDigest", () => {
  const items = cleanDigestItems([
    { section: "moved", text: "Shipped X" },
    { section: "outbox", text: "Draft A" },
    { section: "outbox", text: "Draft B" },
  ]);
  const nowMs = Date.UTC(2026, 9, 21, 3, 0);

  it("writes today's digest in the owner's timezone and counts the outbox", async () => {
    const admin = fakeAdmin();
    const { result } = await writeDigest(admin, USER, { summaryMd: "**Good morning**", items, nowMs, dryRun: false });
    expect(result).toMatchObject({ date: "2026-10-20", item_count: 3, outbox_count: 2, written: true });
    expect(admin.tables.cockpit_digests).toHaveLength(1);
    expect(admin.tables.cockpit_digests[0]).toMatchObject({ user_id: USER, date: "2026-10-20", summary_md: "**Good morning**" });
  });

  it("replaces the digest when written twice for the same day", async () => {
    const admin = fakeAdmin();
    await writeDigest(admin, USER, { summaryMd: "first", items, nowMs, dryRun: false });
    await writeDigest(admin, USER, { summaryMd: "second", items: [], nowMs, dryRun: false });
    expect(admin.tables.cockpit_digests).toHaveLength(1);
    expect(admin.tables.cockpit_digests[0].summary_md).toBe("second");
  });

  it("honors an explicit date and dry_run", async () => {
    const admin = fakeAdmin();
    const { result } = await writeDigest(admin, USER, {
      summaryMd: "x",
      items,
      date: "2026-10-01",
      nowMs,
      dryRun: true,
    });
    expect(result).toMatchObject({ date: "2026-10-01", written: false });
    expect(admin.tables.cockpit_digests).toHaveLength(0);
  });
});
