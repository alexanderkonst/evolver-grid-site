import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Issue #48 P0 #3: the load-time "Failed to save Appleseed" toast.
 *
 * `migrateGuestDataToProfile` runs on every SIGNED_IN (postAuthSideEffects).
 * The old version re-saved whatever sat in `guest_appleseed_data` and, on
 * failure, left the buffer in place — so a stale buffer (e.g. an old result
 * on a shared browser) failed and re-fired on every page load.
 *
 * The fix, locked in here:
 *   1. If the signed-in user already has a saved snapshot, skip the write
 *      entirely and clear the stale buffer.
 *   2. If a genuine migrate attempt fails, clear the buffer after reporting
 *      once so it stops retrying on every load.
 *   3. On success, clear the buffer as before.
 */

const PROFILE_ID = "profile-1";

const config = {
  existingSnapshot: false, // loadSavedData finds a saved snapshot?
  denyZogUpdate: false, // simulate an RLS UPDATE denial (0 rows, no error)
};

const writes = {
  zogUpdates: [] as Array<{ id: unknown; values: Record<string, unknown> }>,
  zogInserts: [] as Array<Record<string, unknown>>,
};

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
        // Serves BOTH loadSavedData's "latest row" lookup and
        // getOrCreateSnapshot's. A row only exists when config says so.
        if (!config.existingSnapshot) {
          return { data: single ? null : [], error: null };
        }
        const row = {
          id: "snap-existing",
          appleseed_data: { bullseyeSentence: "existing" },
          excalibur_data: null,
          xp_awarded: true,
          excalibur_generated_at: null,
        };
        return { data: single ? row : [row], error: null };
      }
      if (ctx.op === "insert") {
        writes.zogInserts.push(ctx.values || {});
        const row = { id: "new-row", xp_awarded: true, excalibur_generated_at: null };
        return { data: single ? row : [row], error: null };
      }
      if (ctx.op === "update") {
        writes.zogUpdates.push({ id: ctx.filters.id, values: ctx.values || {} });
        return { data: config.denyZogUpdate ? [] : [{ id: ctx.filters.id }], error: null };
      }
    }
    if (ctx.table === "game_profiles") {
      if (ctx.op === "update") {
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

vi.mock("@/lib/xpSystem", () => ({ awardXp: () => Promise.resolve({ success: false }) }));
vi.mock("@/lib/xpService", () => ({
  awardFirstTimeBonus: () => Promise.resolve({ awarded: false, xp: 0 }),
}));
vi.mock("@/lib/zogSnapshotCache", () => ({ clearCachedZogSnapshot: vi.fn() }));
vi.mock("@/i18n/config", () => ({ default: { resolvedLanguage: "en" } }));

import { migrateGuestDataToProfile } from "../saveToDatabase";

// Minimal in-memory localStorage for the node test environment.
class FakeStorage {
  private store = new Map<string, string>();
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

describe("migrateGuestDataToProfile — load-time toast hardening (#3)", () => {
  beforeEach(() => {
    writes.zogUpdates = [];
    writes.zogInserts = [];
    config.existingSnapshot = false;
    config.denyZogUpdate = false;
    const storage = new FakeStorage();
    // A stale guest appleseed buffer sits in localStorage.
    storage.setItem("guest_appleseed_data", JSON.stringify({ bullseyeSentence: "stale" }));
    (globalThis as any).localStorage = storage;
  });

  it("skips the write and clears the stale buffer when a snapshot already exists", async () => {
    config.existingSnapshot = true;

    const result = await migrateGuestDataToProfile();

    expect(result.success).toBe(true);
    expect(result.migratedAppleseed).toBe(false);
    // No save attempt happened — the existing snapshot is the source of truth.
    expect(writes.zogUpdates).toHaveLength(0);
    expect(writes.zogInserts).toHaveLength(0);
    // The stale buffer is gone, so it won't re-fire on the next load.
    expect(localStorage.getItem("guest_appleseed_data")).toBeNull();
  });

  it("clears the buffer after a failed migrate so it stops retrying", async () => {
    config.existingSnapshot = false;
    config.denyZogUpdate = true; // RLS denial → saveAppleseed fails

    const result = await migrateGuestDataToProfile();

    expect(result.success).toBe(true);
    expect(result.migratedAppleseed).toBe(false);
    // It did attempt the save (so this is a genuine failure, not a skip)…
    expect(writes.zogUpdates.length).toBeGreaterThan(0);
    // …and then cleared the buffer so the toast can't re-fire every load.
    expect(localStorage.getItem("guest_appleseed_data")).toBeNull();
  });

  it("migrates and clears on the happy path (fresh signup, no snapshot)", async () => {
    config.existingSnapshot = false;
    config.denyZogUpdate = false;

    const result = await migrateGuestDataToProfile();

    expect(result.success).toBe(true);
    expect(result.migratedAppleseed).toBe(true);
    expect(localStorage.getItem("guest_appleseed_data")).toBeNull();
  });

  it("no-ops cleanly when there is nothing buffered", async () => {
    localStorage.removeItem("guest_appleseed_data");

    const result = await migrateGuestDataToProfile();

    expect(result.success).toBe(true);
    expect(result.migratedAppleseed).toBe(false);
    expect(writes.zogUpdates).toHaveLength(0);
    expect(writes.zogInserts).toHaveLength(0);
  });
});
