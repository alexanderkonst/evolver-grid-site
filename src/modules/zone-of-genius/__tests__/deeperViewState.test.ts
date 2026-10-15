import { describe, it, expect } from "vitest";
import { resolveDeeperViewState } from "../deeperViewState";
import { SNAPSHOT_PENDING_SENTINEL } from "../snapshotSentinel";
import type { AppleseedData } from "../appleseedGenerator";

/**
 * Issue #53: after a Guided ZoG run the deeper tabs showed
 * "No Top Talent data found yet" even though the main card rendered the
 * saved archetype. The divergence: deeper tabs read only `appleseed_data`,
 * which the guided lane writes asynchronously (and can fail silently).
 *
 * These lock in the three-way recovery decision:
 *   - appleseed present            → "ready" (render the saved result)
 *   - real archetype + raw signal  → "regenerable" (offer "Generate deeper view")
 *   - nothing usable               → "empty" (take the assessment)
 */

// Minimal stand-in; only presence/absence matters to the resolver.
const fakeAppleseed = {} as AppleseedData;

describe("resolveDeeperViewState — Issue #53", () => {
  it("renders when appleseed_data is present", () => {
    expect(
      resolveDeeperViewState({
        appleseedData: fakeAppleseed,
        archetypeTitle: "Architecting Coherent Truth",
        aiResponseRaw: "signal",
      }),
    ).toBe("ready");
  });

  it("is ready even if the raw signal is missing, as long as appleseed exists", () => {
    expect(
      resolveDeeperViewState({
        appleseedData: fakeAppleseed,
        archetypeTitle: null,
        aiResponseRaw: null,
      }),
    ).toBe("ready");
  });

  it("offers regeneration when a real snapshot exists but appleseed_data is missing", () => {
    // This is the exact Guided-lane bug: archetype saved, appleseed_data null,
    // but the raw signal was persisted so we can re-run generation.
    expect(
      resolveDeeperViewState({
        appleseedData: null,
        archetypeTitle: "Architecting Coherent Truth",
        aiResponseRaw: "TOP TALENT — GUIDED ASSESSMENT …",
      }),
    ).toBe("regenerable");
  });

  it("falls back to empty when there is no raw signal to regenerate from", () => {
    expect(
      resolveDeeperViewState({
        appleseedData: null,
        archetypeTitle: "Architecting Coherent Truth",
        aiResponseRaw: null,
      }),
    ).toBe("empty");
  });

  it("falls back to empty when the raw signal is only whitespace", () => {
    expect(
      resolveDeeperViewState({
        appleseedData: null,
        archetypeTitle: "Architecting Coherent Truth",
        aiResponseRaw: "   \n  ",
      }),
    ).toBe("empty");
  });

  it("treats the Pending sentinel as no real snapshot (empty, not regenerable)", () => {
    expect(
      resolveDeeperViewState({
        appleseedData: null,
        archetypeTitle: SNAPSHOT_PENDING_SENTINEL,
        aiResponseRaw: "signal",
      }),
    ).toBe("empty");
  });

  it("is empty when nothing is saved at all", () => {
    expect(
      resolveDeeperViewState({
        appleseedData: null,
        archetypeTitle: null,
        aiResponseRaw: null,
      }),
    ).toBe("empty");
  });
});
