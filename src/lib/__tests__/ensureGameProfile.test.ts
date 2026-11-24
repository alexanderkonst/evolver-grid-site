import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Issue #420: a fresh sign-up has no game_profiles row. The shell and Settings
 * heal it through ensureGameProfileForSignedInUser, which must be storm-safe
 * (Day 148 v7: an unguarded self-heal drove a token-refresh 429 storm).
 */

const USER = { id: "user-1", user_metadata: { first_name: "Qa", last_name: "Bee" } };

const state = {
  rows: [] as Array<Record<string, unknown>>,
  inserts: 0,
  failInsert: false,
};

vi.mock("@/integrations/supabase/client", () => {
  const builder = (op: "select" | "insert") => {
    let values: Record<string, unknown> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b: any = {
      select: () => b,
      insert: (v: Record<string, unknown>) => {
        op = "insert";
        values = v;
        return b;
      },
      eq: () => b,
      single: async () => {
        if (state.failInsert) return { data: null, error: new Error("boom") };
        state.inserts += 1;
        const row = { id: `profile-${state.inserts}`, ...values };
        state.rows.push(row);
        return { data: row, error: null };
      },
      maybeSingle: async () => ({ data: state.rows[0] ?? null, error: null }),
    };
    void op;
    return b;
  };
  return {
    supabase: {
      auth: { getSession: async () => ({ data: { session: { user: USER } } }) },
      from: () => builder("select"),
    },
  };
});

const store = new Map<string, string>();
vi.stubGlobal("window", {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
  location: { search: "" },
});

import { ensureGameProfileForSignedInUser, __resetEnsureGameProfileGuards } from "../gameProfile";

describe("ensureGameProfileForSignedInUser", () => {
  beforeEach(() => {
    state.rows = [];
    state.inserts = 0;
    state.failInsert = false;
    __resetEnsureGameProfileGuards();
    store.clear();
  });

  it("creates the row with the sign-up name when none exists", async () => {
    const id = await ensureGameProfileForSignedInUser(USER.id);
    expect(id).toBe("profile-1");
    expect(state.rows[0]).toMatchObject({ user_id: USER.id, first_name: "Qa", last_name: "Bee" });
  });

  it("dedupes concurrent callers and never creates twice", async () => {
    const [a, b, c] = await Promise.all([
      ensureGameProfileForSignedInUser(USER.id),
      ensureGameProfileForSignedInUser(USER.id),
      ensureGameProfileForSignedInUser(USER.id),
    ]);
    expect(new Set([a, b, c]).size).toBe(1);
    expect(state.inserts).toBe(1);
    await ensureGameProfileForSignedInUser(USER.id);
    expect(state.inserts).toBe(1);
  });

  it("does not throw on failure and holds off retries during the cooldown", async () => {
    state.failInsert = true;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await ensureGameProfileForSignedInUser(USER.id)).toBeNull();
    state.failInsert = false;
    // Still inside the cooldown: no new attempt, no insert.
    expect(await ensureGameProfileForSignedInUser(USER.id)).toBeNull();
    expect(state.inserts).toBe(0);
  });
});
