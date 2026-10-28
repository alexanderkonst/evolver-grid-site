import { describe, expect, it } from "vitest";
import { getJourneyModule } from "@/data/journeyModules";
import { getJourneyChoice } from "@/data/journeyChoices";
import { firstSlicePhase, lockedHere, slicePhrase, SLICE_OF_ARTIFACT } from "../journeySlices";

describe("UBB Journey slices (WP-9)", () => {
  it("only uniqueness (J6) and promise (J7) are Journey modules; the rest of UBB is untouched", () => {
    expect(SLICE_OF_ARTIFACT).toEqual({ uniqueness: "uniqueness-phrase", promise: "tagline" });
  });

  it("each slice has its module copy and its real choice under the same step id", () => {
    for (const id of Object.values(SLICE_OF_ARTIFACT)) {
      const m = getJourneyModule(id);
      expect(m, id).toBeDefined();
      expect(m?.place, id).toBe("workshop");
      expect(getJourneyChoice(id), id).toBeDefined();
    }
  });

  it("reads the player's phrase from the artifact content", () => {
    expect(slicePhrase("uniqueness", { sentence: "  I turn tangled ideas into a path  " })).toBe(
      "I turn tangled ideas into a path",
    );
    expect(slicePhrase("promise", { promise_sentence: "From scattered to shipping." })).toBe(
      "From scattered to shipping.",
    );
  });

  it("gives null, so the Outro falls back, when there is no phrase to read", () => {
    expect(slicePhrase("uniqueness", null)).toBeNull();
    expect(slicePhrase("uniqueness", "text")).toBeNull();
    expect(slicePhrase("uniqueness", {})).toBeNull();
    expect(slicePhrase("uniqueness", { sentence: "   " })).toBeNull();
    expect(slicePhrase("uniqueness", { sentence: 4 })).toBeNull();
    expect(slicePhrase("promise", { sentence: "wrong field" })).toBeNull();
    expect(slicePhrase("myth", { sentence: "not a slice" })).toBeNull();
  });

  it("meets the Intro only when nothing is made yet", () => {
    expect(firstSlicePhase(false)).toBe("intro");
    expect(firstSlicePhase(true)).toBe("screen");
  });

  it("goes to the Outro only on a lock made in this visit", () => {
    expect(lockedHere("screen", true, true)).toBe(true);
    // locked on arrival: editing, not a new victory
    expect(lockedHere("screen", false, true)).toBe(false);
    expect(lockedHere("screen", true, false)).toBe(false);
    expect(lockedHere("intro", true, true)).toBe(false);
    expect(lockedHere("outro", true, true)).toBe(false);
    expect(lockedHere(null, true, true)).toBe(false);
  });
});
