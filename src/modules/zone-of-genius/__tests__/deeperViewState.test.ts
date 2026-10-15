import { describe, it, expect } from "vitest";
import { resolveDeeperViewState, buildRecoveryRawSignal } from "../deeperViewState";
import { SNAPSHOT_PENDING_SENTINEL } from "../snapshotSentinel";
import type { AppleseedData } from "../appleseedGenerator";

/**
 * Issue #53: after a Guided ZoG run the deeper tabs showed
 * "No Top Talent data found yet" even though the main card rendered the
 * saved archetype. The divergence: deeper tabs read only `appleseed_data`,
 * which the guided lane writes asynchronously (and can fail silently).
 *
 * Issue #53 follow-up (Sasha 2026-10-15): a real saved snapshot with NO
 * `ai_response_raw` (pre-#54 rows) must still offer recovery — the main card
 * renders fine from the basic columns, so the deeper view must never show
 * "Complete the assessment first" for the same row. The recovery signal is
 * synthesized from those basic columns when the raw signal is absent.
 *
 * These lock in the three-way recovery decision:
 *   - appleseed present   → "ready" (render the saved result)
 *   - real archetype      → "regenerable" (offer "Generate deeper view")
 *   - nothing saved       → "empty" (take the assessment)
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

  it("offers regeneration for a real snapshot even when the raw signal is missing", () => {
    // Issue #53 follow-up: Sasha's pre-#54 row. Main card renders from the
    // basic columns; the deeper view must offer recovery, never "empty".
    expect(
      resolveDeeperViewState({
        appleseedData: null,
        archetypeTitle: "Architecting Coherent Truth",
        aiResponseRaw: null,
      }),
    ).toBe("regenerable");
  });

  it("offers regeneration for a real snapshot when the raw signal is only whitespace", () => {
    expect(
      resolveDeeperViewState({
        appleseedData: null,
        archetypeTitle: "Architecting Coherent Truth",
        aiResponseRaw: "   \n  ",
      }),
    ).toBe("regenerable");
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

describe("buildRecoveryRawSignal — Issue #53 follow-up", () => {
  it("synthesizes a signal from archetype + core pattern + talents", () => {
    const signal = buildRecoveryRawSignal(
      "Architecting Coherent Truth",
      "You listen until the living point reveals itself, then build the structure.",
      ["Hearing the real point", "Building nested clarity", "Making usable artifacts"],
    );
    expect(signal).toContain("Architecting Coherent Truth");
    expect(signal).toContain("living point");
    expect(signal).toContain("1. Hearing the real point");
    expect(signal).toContain("3. Making usable artifacts");
  });

  it("returns a signal from the archetype alone when the other columns are absent", () => {
    const signal = buildRecoveryRawSignal("Architecting Coherent Truth", null, null);
    expect(signal).toBe("Top Talent: Architecting Coherent Truth");
  });

  it("drops blank talents and trims the archetype", () => {
    const signal = buildRecoveryRawSignal("  Constellation Mapping  ", "", ["", "  ", "Map the field"]);
    expect(signal).toContain("Top Talent: Constellation Mapping");
    expect(signal).toContain("1. Map the field");
    expect(signal).not.toContain("Core pattern:");
  });

  it("returns null when there is no real archetype to recover from", () => {
    expect(buildRecoveryRawSignal(null, "something", ["a"])).toBeNull();
    expect(buildRecoveryRawSignal(SNAPSHOT_PENDING_SENTINEL, "something", ["a"])).toBeNull();
  });
});
