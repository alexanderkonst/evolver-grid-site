import { describe, it, expect } from "vitest";
import { ZONE_OF_GENIUS_PROMPT } from "../user/zoneOfGeniusPrompt";

/**
 * Issue #266: the prompt is shown to guests in the «Copy this prompt» box and
 * pasted into their own AI, so it must not carry internal dev notes. It also
 * must keep the exact JSON shape the reveal parser depends on.
 */

describe("ZONE_OF_GENIUS_PROMPT — no internal dev notes", () => {
  it.each([/bug/i, /Day 6/, /May 13/, /May 2026/, /Sasha/, /CANONICAL/i, /Bucket B/])(
    "does not contain %s",
    (pattern) => {
      expect(ZONE_OF_GENIUS_PROMPT).not.toMatch(pattern);
    },
  );

  it("uses Wrong / Right annotations for its examples", () => {
    expect(ZONE_OF_GENIUS_PROMPT).toContain("Wrong:");
    expect(ZONE_OF_GENIUS_PROMPT).toContain("Right:");
  });
});

describe("ZONE_OF_GENIUS_PROMPT — output shape unchanged", () => {
  it("asks for exactly the same JSON fields, in the same order", () => {
    const keys = [...ZONE_OF_GENIUS_PROMPT.matchAll(/^ {2}"([a-z_]+)":/gm)].map((m) => m[1]);
    expect(keys).toEqual([
      "archetype_title",
      "core_pattern",
      "top_three_talents",
      "how_genius_shows_up",
      "edge_and_traps",
      "top_shadow_one_sentence",
      "shadow_currency",
      "ideal_environments",
      "career_sweet_spots",
      "flywheel_action",
    ]);
  });

  it("keeps the key rules", () => {
    for (const rule of [
      "TRANSMIT, DON'T REPORT.",
      "ENACT MY GIFT, DON'T ONLY NAME IT.",
      "EDITORIAL VOICE — TWO PEOPLE, TWO PRONOUNS",
      "REFLEXIVE-PRONOUN DISCIPLINE",
      "DUAL-ACTOR DISCIPLINE",
      "SCENE-STRUCTURE TEMPLATE",
      "SUBSTITUTION TEST",
      "End the response with the JSON block and nothing after.",
    ]) {
      expect(ZONE_OF_GENIUS_PROMPT).toContain(rule);
    }
  });
});
