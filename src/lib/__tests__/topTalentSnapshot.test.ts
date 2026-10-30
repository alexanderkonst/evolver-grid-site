import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Issue #207: Reception showed the pointed snapshot, Home the newest one,
 * so one account showed two top talents. Both now go through
 * fetchTopTalentSnapshot: pointer first, newest only as the fallback.
 */

type Snap = { id: string; profile_id: string; archetype_title: string };

const state = {
  pointerId: null as string | null,
  snapshots: [] as Snap[], // newest first
};

vi.mock("@/integrations/supabase/client", () => {
  const from = (table: string) => {
    const filters: Record<string, unknown> = {};
    const b: Record<string, unknown> = {};
    b.select = () => b;
    b.eq = (col: string, val: unknown) => {
      filters[col] = val;
      return b;
    };
    b.order = () => b;
    b.limit = () => b;
    b.maybeSingle = async () => {
      if (table === "game_profiles") {
        return { data: { last_zog_snapshot_id: state.pointerId }, error: null };
      }
      const rows = state.snapshots.filter(
        (s) =>
          (filters.id === undefined || s.id === filters.id) &&
          (filters.profile_id === undefined || s.profile_id === filters.profile_id),
      );
      return { data: rows[0] ?? null, error: null };
    };
    return b;
  };
  return { supabase: { from } };
});

import { fetchTopTalentSnapshot, pickTopTalentSnapshot } from "@/lib/topTalentSnapshot";

const COLUMNS = "id, archetype_title";

beforeEach(() => {
  state.pointerId = null;
  state.snapshots = [
    { id: "new", profile_id: "p1", archetype_title: "Matching Founders to Businesses" },
    { id: "old", profile_id: "p1", archetype_title: "Designing System Standards" },
    { id: "foreign", profile_id: "p2", archetype_title: "Someone Else" },
  ];
});

describe("pickTopTalentSnapshot", () => {
  it("prefers the pointed row over the newest", () => {
    expect(pickTopTalentSnapshot("pointed", "newest")).toBe("pointed");
  });
  it("falls back to the newest when nothing is pointed", () => {
    expect(pickTopTalentSnapshot(null, "newest")).toBe("newest");
  });
});

describe("fetchTopTalentSnapshot", () => {
  it("returns the pointed snapshot even when a newer row exists", async () => {
    state.pointerId = "old";
    const snap = await fetchTopTalentSnapshot<Snap>("p1", COLUMNS);
    expect(snap?.archetype_title).toBe("Designing System Standards");
  });

  it("falls back to the newest snapshot when the pointer is NULL", async () => {
    const snap = await fetchTopTalentSnapshot<Snap>("p1", COLUMNS);
    expect(snap?.id).toBe("new");
  });

  it("ignores a pointer at another profile's row and falls back to the newest", async () => {
    state.pointerId = "foreign";
    const snap = await fetchTopTalentSnapshot<Snap>("p1", COLUMNS);
    expect(snap?.id).toBe("new");
  });

  it("returns null when the profile has no snapshot", async () => {
    state.snapshots = [];
    expect(await fetchTopTalentSnapshot<Snap>("p1", COLUMNS)).toBeNull();
  });
});
