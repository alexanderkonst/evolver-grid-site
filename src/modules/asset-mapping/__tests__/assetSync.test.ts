import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression test for the Day 93 bug fix (Sasha 2026-06-04):
 *
 * After a user maps their assets, the JOURNEY pane's next step
 * ("Assess your quality of life") stayed LOCKED with the popover
 * "Unlocks after you map your assets" until a hard reload — because
 * `useJourneyProgress` only re-reads on mount or on a
 * `fytt:refresh-journey-progress` window event, and the asset-save
 * paths (saveAsset / saveAssets) never dispatched it. Mission Discovery
 * and QoL Results already dispatched the same signal; asset mapping was
 * the one that didn't.
 *
 * These tests assert the contract that fixes it: a SUCCESSFUL asset save
 * dispatches `fytt:refresh-journey-progress`, and a FAILED save does not.
 *
 * Note: this repo's vitest runs in a node environment (no jsdom), so we
 * stub the three browser globals assetSync touches — `window`,
 * `localStorage`, and `CustomEvent` — rather than pull in a DOM env for
 * one file.
 */

const h = vi.hoisted(() => ({ upsertError: null as { message: string } | null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: async () => ({ data: { user: { id: "user-1" } } }),
    },
    from: (table: string) => {
      if (table === "user_assets") {
        return {
          select: () => ({
            eq: () => ({ order: async () => ({ data: [], error: null }) }),
          }),
          // saveAsset / saveAssets write here via withRetry(() => upsert(...)).
          upsert: async () => ({ error: h.upsertError }),
        };
      }
      // game_profiles — markResourcesMapped's update().eq().is() chain.
      return {
        update: () => ({ eq: () => ({ is: async () => ({ error: null }) }) }),
      };
    },
  },
}));

// Pass-through: run the wrapped write once, return its { error } result.
vi.mock("@/lib/withRetry", () => ({
  withRetry: (fn: () => unknown) => fn(),
}));

const REFRESH_EVENT = "fytt:refresh-journey-progress";

let dispatchEvent: ReturnType<typeof vi.fn>;

beforeEach(() => {
  h.upsertError = null;

  dispatchEvent = vi.fn();
  const store = new Map<string, string>();

  vi.stubGlobal("window", { dispatchEvent });
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  });
  vi.stubGlobal(
    "CustomEvent",
    class {
      type: string;
      detail: unknown;
      constructor(type: string, init?: { detail?: unknown }) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const sampleAsset = {
  typeId: "expertise",
  title: "Essence-to-words shaping",
  description: "Turning vague thoughts into exact words.",
  savedAt: "2026-06-04T00:00:00.000Z",
  source: "ai",
};

const wasRefreshDispatched = () =>
  dispatchEvent.mock.calls.some(
    ([event]) => (event as { type?: string })?.type === REFRESH_EVENT,
  );

describe("assetSync — JOURNEY refresh on save", () => {
  it("saveAssets dispatches fytt:refresh-journey-progress after a successful DB save", async () => {
    const { saveAssets } = await import("@/modules/asset-mapping/assetSync");

    const result = await saveAssets("user-1", [sampleAsset]);

    expect(result.success).toBe(true);
    expect(wasRefreshDispatched()).toBe(true);
  });

  it("saveAsset dispatches fytt:refresh-journey-progress after a successful DB save", async () => {
    const { saveAsset } = await import("@/modules/asset-mapping/assetSync");

    const ok = await saveAsset("user-1", sampleAsset);

    expect(ok).toBe(true);
    expect(wasRefreshDispatched()).toBe(true);
  });

  it("does NOT dispatch the refresh when the DB save fails", async () => {
    h.upsertError = { message: "RLS denied" };
    const { saveAssets } = await import("@/modules/asset-mapping/assetSync");

    const result = await saveAssets("user-1", [sampleAsset]);

    expect(result.success).toBe(false);
    expect(wasRefreshDispatched()).toBe(false);
  });
});
