import { describe, it, expect, vi, beforeEach } from "vitest";

// Node test env has no DOM: give the module a minimal window.localStorage.
const store = new Map<string, string>();
vi.stubGlobal("window", {
  localStorage: {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  },
});

/**
 * 2026-10-24 incident: a guest Top Talent result typed in under
 * alexanderkonst@gmail.com on ANOTHER browser replaced Sasha's own Top
 * Talent at his next sign-in (claim-anonymous-zog matched by email only).
 * Locked in here:
 *   - existing Top Talent + no local save marker  → skip (never claim)
 *   - existing Top Talent + this browser saved it  → claim (allow_existing)
 *   - no Top Talent yet (new user funnel)          → claim
 *   - lookup error                                 → fail closed (skip)
 */

const state = {
  profile: null as null | { id: string; last_zog_snapshot_id: string | null },
  snapshotCount: 0,
  profileError: null as null | { message: string },
  session: { user: { id: "user-1", email: "Owner@Example.com" } } as
    | null
    | { user: { id: string; email: string } },
  invokes: [] as Array<{ name: string; body: unknown }>,
};

vi.mock("@/integrations/supabase/client", () => {
  const from = (table: string) => {
    const b: Record<string, unknown> = {};
    b.select = () => b;
    b.eq = () => b;
    b.maybeSingle = async () =>
      table === "game_profiles"
        ? { data: state.profile, error: state.profileError }
        : { data: null, error: null };
    // `.select(..., {head:true}).eq()` is awaited directly for the count.
    b.then = (resolve: (v: unknown) => void) =>
      resolve({ count: state.snapshotCount, error: null });
    return b;
  };
  return {
    supabase: {
      from,
      auth: { getSession: async () => ({ data: { session: state.session } }) },
      functions: {
        invoke: async (name: string, opts?: { body?: unknown }) => {
          state.invokes.push({ name, body: opts?.body });
          return { data: { claimed: true }, error: null };
        },
      },
    },
  };
});

import {
  claimAnonymousZogIfAllowed,
  decideAnonymousZogClaim,
  markAnonymousZogSaved,
  hasLocalAnonymousZogSave,
} from "@/lib/anonClaimGuard";

beforeEach(() => {
  window.localStorage.clear();
  state.profile = null;
  state.snapshotCount = 0;
  state.profileError = null;
  state.session = { user: { id: "user-1", email: "Owner@Example.com" } };
  state.invokes = [];
});

describe("anonClaimGuard", () => {
  it("never claims over an existing Top Talent when this browser did not save the guest result", async () => {
    state.profile = { id: "p1", last_zog_snapshot_id: "snap-old" };
    expect(await decideAnonymousZogClaim("user-1", "owner@example.com")).toBe("skip_existing");
    expect(await claimAnonymousZogIfAllowed("test")).toBe("skip_existing");
    expect(state.invokes).toHaveLength(0);
  });

  it("treats snapshots without a pointer as existing too", async () => {
    state.profile = { id: "p1", last_zog_snapshot_id: null };
    state.snapshotCount = 2;
    expect(await decideAnonymousZogClaim("user-1", "owner@example.com")).toBe("skip_existing");
  });

  it("claims for a brand-new user with no Top Talent yet", async () => {
    expect(await claimAnonymousZogIfAllowed("test")).toBe("claim_new_user");
    expect(state.invokes).toEqual([
      { name: "claim-anonymous-zog", body: { allow_existing: false } },
    ]);
  });

  it("claims over an existing one only when this browser saved it for the same email", async () => {
    state.profile = { id: "p1", last_zog_snapshot_id: "snap-old" };
    markAnonymousZogSaved(" OWNER@example.com ");
    expect(await claimAnonymousZogIfAllowed("test")).toBe("claim_own_device");
    expect(state.invokes[0]).toEqual({
      name: "claim-anonymous-zog",
      body: { allow_existing: true },
    });
    // marker is consumed after a successful claim
    expect(hasLocalAnonymousZogSave("owner@example.com")).toBe(false);
  });

  it("a marker for a different email does not unlock the claim", async () => {
    state.profile = { id: "p1", last_zog_snapshot_id: "snap-old" };
    markAnonymousZogSaved("someone-else@example.com");
    expect(await claimAnonymousZogIfAllowed("test")).toBe("skip_existing");
    expect(state.invokes).toHaveLength(0);
  });

  it("fails closed when the profile lookup errors", async () => {
    state.profileError = { message: "network" };
    expect(await claimAnonymousZogIfAllowed("test")).toBe("skip_existing");
    expect(state.invokes).toHaveLength(0);
  });

  it("does nothing without a session", async () => {
    state.session = null;
    expect(await claimAnonymousZogIfAllowed("test")).toBe("no_session");
    expect(state.invokes).toHaveLength(0);
  });
});
