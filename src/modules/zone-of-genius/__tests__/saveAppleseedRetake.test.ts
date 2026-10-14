import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Issue #45 (Sasha 2026-10-14): retake persistence regression.
 *
 * Scenario: an authenticated user already has ONE zog_snapshots row whose
 * `excalibur_data` is null (the classic state — a completed Top Talent run
 * that never produced an Excalibur, e.g. Sasha's old RU "Potential-to-Path
 * Shaping"). They retake the Zone of Genius assessment.
 *
 * Expected:
 *   1. saveAppleseed returns success.
 *   2. The NEW appleseed_data is written (the reuse path overwrites the
 *      existing incomplete row — per the D1 history rule in getOrCreateSnapshot).
 *   3. game_profiles.last_zog_snapshot_id points to that row.
 *   4. The write targets the existing row (no duplicate insert).
 *
 * Before the fix, the update RETURNED no rows on an RLS denial and the code
 * never noticed — this test locks in the `.select()` + 0-row guard behaviour
 * and the happy-path persistence.
 */

// ── Mocked collaborators ────────────────────────────────────────────────
const EXISTING_SNAPSHOT_ID = "snap-existing-1";
const PROFILE_ID = "profile-1";

// Capture what the mock supabase client was asked to write.
const writes = {
  zogUpdates: [] as Array<{ id: unknown; values: Record<string, unknown> }>,
  zogInserts: [] as Array<Record<string, unknown>>,
  profileUpdates: [] as Array<{ id: unknown; values: Record<string, unknown> }>,
};

// Lets a test simulate an RLS UPDATE denial: the update affects 0 rows
// (PostgREST returns an empty array, no error).
const config = { denyZogUpdate: false };

// A chainable + thenable query-builder that mimics the subset of the
// PostgREST client the save path exercises.
function makeBuilder(table: string) {
  const ctx: {
    table: string;
    op: "select" | "insert" | "update" | "delete";
    values?: Record<string, unknown>;
    filters: Record<string, unknown>;
  } = { table, op: "select", filters: {} };

  const resolve = (single: boolean) => {
    if (ctx.table === "zog_snapshots") {
      if (ctx.op === "select") {
        // getOrCreateSnapshot's "latest row" lookup.
        const row = {
          id: EXISTING_SNAPSHOT_ID,
          xp_awarded: true, // skip the awardXp branch
          excalibur_generated_at: null,
          excalibur_data: null, // ← incomplete run → reuse path
        };
        return { data: single ? row : [row], error: null };
      }
      if (ctx.op === "update") {
        writes.zogUpdates.push({ id: ctx.filters.id, values: ctx.values || {} });
        // RLS UPDATE denial → 0 rows returned, no error.
        return { data: config.denyZogUpdate ? [] : [{ id: ctx.filters.id }], error: null };
      }
      if (ctx.op === "insert") {
        writes.zogInserts.push(ctx.values || {});
        return { data: single ? { id: "new-row" } : [{ id: "new-row" }], error: null };
      }
    }
    if (ctx.table === "game_profiles") {
      if (ctx.op === "update") {
        writes.profileUpdates.push({ id: ctx.filters.id, values: ctx.values || {} });
        return { data: [{ id: ctx.filters.id }], error: null };
      }
    }
    return { data: null, error: null };
  };

  const builder: Record<string, unknown> = {
    select: () => builder,
    insert: (values: Record<string, unknown>) => {
      ctx.op = "insert";
      ctx.values = values;
      return builder;
    },
    update: (values: Record<string, unknown>) => {
      ctx.op = "update";
      ctx.values = values;
      return builder;
    },
    delete: () => {
      ctx.op = "delete";
      return builder;
    },
    eq: (k: string, v: unknown) => {
      ctx.filters[k] = v;
      return builder;
    },
    order: () => builder,
    limit: () => builder,
    maybeSingle: () => Promise.resolve(resolve(true)),
    single: () => Promise.resolve(resolve(true)),
    // thenable: `await builder` (used after `.select()` on an update/insert)
    then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(resolve(false)).then(onFulfilled, onRejected),
  };
  return builder;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }),
    },
    from: (table: string) => makeBuilder(table),
  },
}));

vi.mock("@/lib/gameProfile", () => ({
  getOrCreateGameProfileId: () => Promise.resolve(PROFILE_ID),
}));

vi.mock("@/lib/xpSystem", () => ({
  awardXp: () => Promise.resolve({ success: false }),
}));

vi.mock("@/lib/xpService", () => ({
  awardFirstTimeBonus: () => Promise.resolve({ awarded: false, xp: 0 }),
}));

vi.mock("@/lib/zogSnapshotCache", () => ({
  clearCachedZogSnapshot: vi.fn(),
}));

vi.mock("@/i18n/config", () => ({
  default: { resolvedLanguage: "en" },
}));

// withRetry is the real module (it just awaits the thenable builder).

import { saveAppleseed } from "../saveToDatabase";
import type { AppleseedData } from "../appleseedGenerator";

const appleseed = {
  bullseyeSentence: "turn foggy power into a clear path people can use",
  vibrationalKey: { name: "Signal-to-Path Shaping", tagline: "", tagline_simple: "" },
  threeLenses: {
    actions: ["Synthesizing Understanding", "Constructing Thought Systems", "Designing Ideals"],
    primeDriver: "",
    primeDriver_meaning: "",
    archetype: "",
    archetype_meaning: "",
  },
} as unknown as AppleseedData;

describe("saveAppleseed — retake over an existing incomplete snapshot", () => {
  beforeEach(() => {
    writes.zogUpdates = [];
    writes.zogInserts = [];
    writes.profileUpdates = [];
    config.denyZogUpdate = false;
  });

  it("persists the new appleseed into the existing row and repoints last_zog_snapshot_id", async () => {
    const result = await saveAppleseed(appleseed, "raw ai response");

    expect(result.success).toBe(true);
    expect(result.snapshotId).toBe(EXISTING_SNAPSHOT_ID);

    // Reuse path — no duplicate insert for an incomplete (excalibur null) row.
    expect(writes.zogInserts).toHaveLength(0);

    // The appleseed update targeted the existing row with the new data.
    const update = writes.zogUpdates.find((u) => u.id === EXISTING_SNAPSHOT_ID);
    expect(update).toBeDefined();
    expect(update!.values.archetype_title).toBe("Signal-to-Path Shaping");
    expect(update!.values.appleseed_data).toBeTruthy();

    // Pointer now references the retaken snapshot.
    const pointer = writes.profileUpdates.find((p) => p.id === PROFILE_ID);
    expect(pointer).toBeDefined();
    expect(pointer!.values.last_zog_snapshot_id).toBe(EXISTING_SNAPSHOT_ID);
    expect(pointer!.values.zone_of_genius_completed).toBe(true);
  });

  it("fails loudly (no false success) when an RLS UPDATE denial filters the row", async () => {
    config.denyZogUpdate = true;

    const result = await saveAppleseed(appleseed, "raw ai response");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/0 rows/i);
    // The pointer must NOT be repointed when the snapshot write didn't land.
    expect(writes.profileUpdates).toHaveLength(0);
  });
});
