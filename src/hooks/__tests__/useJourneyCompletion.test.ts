import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Issue #263: Home and Workshop stayed on «Loading profile...» / skeletons for good because
 * one request never settled. `useJourneyCompletion` and `useCharacterSheet` derive their
 * loading flag from the promises tested here, so a promise that is bounded here cannot keep
 * either hook loading past the timeout. (The repo has no DOM test environment, so the
 * hooks' effects are exercised through the functions they await.)
 */

const NEVER = new Promise<never>(() => {});

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    from: mocks.from,
  },
}));

import { loadCompletion } from "../useJourneyCompletion";
import { LOAD_TIMEOUT_MS, TimeoutError, withTimeout } from "@/lib/withTimeout";

const signedIn = { data: { session: { user: { id: "u1" } } } };

/** A query builder whose chain ends in `end`, whatever the chain looks like. */
const query = (end: Promise<unknown>) => {
  const q: Record<string, unknown> = {};
  const chain = () => q;
  for (const m of ["select", "eq", "order", "limit", "in"]) q[m] = chain;
  q.maybeSingle = () => end;
  q.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => end.then(res, rej);
  return q;
};

describe("loadCompletion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.getSession.mockReset();
    mocks.from.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("guest: all false, no table read, not failed", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    const out = await loadCompletion();
    expect(out.failed).toBe(false);
    expect(Object.values(out.completion).every((v) => v === false)).toBe(true);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("reads the stored session, not the network (no auth.getUser call)", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.from.mockImplementation((table: string) =>
      table === "game_profiles"
        ? query(Promise.resolve({ data: { id: "p1" } }))
        : query(Promise.resolve({ count: 1, error: null })),
    );
    const out = await loadCompletion();
    expect(out.failed).toBe(false);
    expect(out.completion["find-top-talent"]).toBe(true);
  });

  it("a predicate request that never resolves is cut at the timeout and reported as failed", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.from.mockImplementation((table: string) =>
      table === "game_profiles" ? query(Promise.resolve({ data: { id: "p1" } })) : query(NEVER),
    );

    let done = false;
    const pending = loadCompletion().then((r) => {
      done = true;
      return r;
    });
    await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS - 1);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const out = await pending;

    expect(done).toBe(true);
    expect(out.failed).toBe(true);
    expect(out.completion["find-top-talent"]).toBe(false);
  });

  it("the profile lookup that never resolves is cut by the hook's outer timeout", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.from.mockImplementation(() => query(NEVER));

    // useJourneyCompletion wraps the whole read exactly like this.
    const bounded = withTimeout(loadCompletion(), LOAD_TIMEOUT_MS, "journey completion");
    const settled = expect(bounded).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);
    await settled;
  });

  it("a getSession that never resolves is cut by the outer timeout", async () => {
    mocks.getSession.mockReturnValue(NEVER);
    const bounded = withTimeout(loadCompletion(), LOAD_TIMEOUT_MS, "journey completion");
    const settled = expect(bounded).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);
    await settled;
  });
});
