import { describe, it, expect } from "vitest";
import {
  extractOneSentence,
  isLikelyBareSentence,
  resolveMissionSentence,
  resolveMissionSavedDate,
} from "../missionSynthesis";

/**
 * Issue #48 P1 #5: pasting a bare single sentence (no JSON, no
 * "1 sentence synthesis:" label) is accepted AS the mission instead of
 * dead-ending on the "Couldn't find a single-sentence summary" toast.
 *
 * Issue #48 P1 #6: /game/me/mission's "Saved on" prefers updated_at (bumped
 * on every save) over first-write-wins mission_discovered_at.
 */

describe("extractOneSentence — structured extraction still works", () => {
  it("pulls mission_one_sentence from a JSON paste", () => {
    const raw = `Here's my analysis.
{"mission_analysis": "long...", "mission_one_sentence": "I help founders turn chaos into clarity."}`;
    expect(extractOneSentence(raw)).toBe("I help founders turn chaos into clarity.");
  });

  it("takes the LAST JSON block (ignores an echoed example)", () => {
    const raw = `{"mission_one_sentence": "EXAMPLE sentence."}
some reasoning
{"mission_one_sentence": "My real mission sentence."}`;
    expect(extractOneSentence(raw)).toBe("My real mission sentence.");
  });

  it("falls back to the legacy '1 sentence synthesis:' marker", () => {
    const raw = `Reasoning here.\n\n1 sentence synthesis: I build bridges between science and story.`;
    expect(extractOneSentence(raw)).toBe("I build bridges between science and story.");
  });

  it("returns null when neither JSON nor marker is present", () => {
    expect(extractOneSentence("just some unmarked prose with no structure")).toBeNull();
  });
});

describe("isLikelyBareSentence (#5)", () => {
  it("accepts a single plain sentence", () => {
    expect(isLikelyBareSentence("I help founders turn chaos into clarity.")).toBe(true);
  });

  it("accepts a single sentence with no trailing period", () => {
    expect(isLikelyBareSentence("I help founders turn chaos into clarity")).toBe(true);
  });

  it("rejects multiple sentences", () => {
    expect(isLikelyBareSentence("I help founders. I also coach teams.")).toBe(false);
  });

  it("rejects JSON-looking input", () => {
    expect(isLikelyBareSentence('{"mission_one_sentence": "x"}')).toBe(false);
  });

  it("rejects a long multi-paragraph essay", () => {
    const essay = "First paragraph of reasoning here.\n\nSecond paragraph that keeps going well past the length of any one sentence someone would reasonably paste as a mission statement on its own line.";
    expect(isLikelyBareSentence(essay)).toBe(false);
  });

  it("rejects empty / whitespace", () => {
    expect(isLikelyBareSentence("   ")).toBe(false);
  });
});

describe("resolveMissionSentence (#5)", () => {
  it("prefers structured extraction when available", () => {
    const raw = `{"mission_one_sentence": "Structured wins."} plus I help people.`;
    expect(resolveMissionSentence(raw)).toBe("Structured wins.");
  });

  it("accepts a bare single sentence as the mission", () => {
    const raw = "I help founders turn chaos into clarity.";
    expect(resolveMissionSentence(raw)).toBe("I help founders turn chaos into clarity.");
  });

  it("trims surrounding whitespace on the bare sentence", () => {
    expect(resolveMissionSentence("   I make the invisible visible.   ")).toBe(
      "I make the invisible visible.",
    );
  });

  it("returns null for an unmarked multi-paragraph essay", () => {
    const essay = "Paragraph one with some reasoning.\n\nParagraph two with more reasoning that is clearly not a single mission sentence.";
    expect(resolveMissionSentence(essay)).toBeNull();
  });
});

describe("resolveMissionSavedDate (#6)", () => {
  it("prefers updated_at over mission_discovered_at", () => {
    expect(
      resolveMissionSavedDate({
        updatedAt: "2026-10-14T00:00:00Z",
        discoveredAt: "2026-05-22T00:00:00Z",
      }),
    ).toBe("2026-10-14T00:00:00Z");
  });

  it("falls back to mission_discovered_at when updated_at is absent", () => {
    expect(
      resolveMissionSavedDate({ updatedAt: null, discoveredAt: "2026-05-22T00:00:00Z" }),
    ).toBe("2026-05-22T00:00:00Z");
  });

  it("returns null when neither is present", () => {
    expect(resolveMissionSavedDate({ updatedAt: null, discoveredAt: null })).toBeNull();
  });
});
