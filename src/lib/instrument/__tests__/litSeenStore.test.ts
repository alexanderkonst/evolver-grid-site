/**
 * WP1's save lookup. `game_profiles.id` is a random uuid; the player's id is in `user_id`.
 * The store used to ask for `id = <user id>`, so the save was never read and never written.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

type Call = { table: string; op: string; filters: Array<[string, unknown]>; payload?: unknown };
const calls: Call[] = [];
let row: { first_time_actions: Record<string, boolean> | null } | null = null;
let failure: Error | null = null;

vi.mock("@/integrations/supabase/client", () => {
  const builder = (table: string) => {
    const call: Call = { table, op: "select", filters: [] };
    const b = {
      select: () => b,
      update: (payload: unknown) => {
        call.op = "update";
        call.payload = payload;
        return b;
      },
      eq: (column: string, value: unknown) => {
        call.filters.push([column, value]);
        if (call.op === "update") calls.push(call);
        return b;
      },
      maybeSingle: () => {
        calls.push(call);
        return Promise.resolve(failure ? { data: null, error: failure } : { data: row, error: null });
      },
      then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
    };
    return b;
  };
  return { supabase: { from: (table: string) => builder(table) } };
});

import { readRemote, writeRemote } from "@/lib/instrument/litSeenStore";

beforeEach(() => {
  calls.length = 0;
  failure = null;
  row = { first_time_actions: { some_other_action: true } };
});

describe("litSeenStore: the save lookup", () => {
  it("reads the save by user_id, not by the profile's own id", async () => {
    await readRemote("user-1");
    expect(calls[0].table).toBe("game_profiles");
    expect(calls[0].filters).toEqual([["user_id", "user-1"]]);
  });

  it("reads a lit body back from first_time_actions", async () => {
    row = { first_time_actions: { instrument_lit_air: true } };
    const seen = await readRemote("user-1");
    expect(seen?.air).toBe(true);
  });

  it("writes by user_id and keeps the other first-time actions", async () => {
    await writeRemote("user-1", { air: true } as never);
    const update = calls.find((c) => c.op === "update");
    expect(update?.filters).toEqual([["user_id", "user-1"]]);
    expect(update?.payload).toEqual({ first_time_actions: { some_other_action: true, instrument_lit_air: true } });
  });
});

describe("litSeenStore: a failed save read", () => {
  it("throws, so the hook can go by this browser's record for the session and ask again next time", async () => {
    failure = new Error("network");
    await expect(readRemote("user-1")).rejects.toThrow("network");
  });

  it("a player with no save yet is not a failure: null", async () => {
    row = null;
    await expect(readRemote("user-1")).resolves.toBeNull();
  });

  it("a failed read writes nothing", async () => {
    failure = new Error("network");
    await writeRemote("user-1", { air: true } as never);
    expect(calls.some((c) => c.op === "update")).toBe(false);
  });
});
