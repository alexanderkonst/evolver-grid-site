import { describe, expect, it } from "vitest";
import { ZONE_OF_GENIUS_PROMPT } from "../user/zoneOfGeniusPrompt";

// The prompt is shown to guests and copied into their own AI, so it must read
// as plain instructions — no internal dev notes. The reveal parser depends on
// the JSON field names, so those are pinned here too.

describe("ZONE_OF_GENIUS_PROMPT", () => {
  it("contains no internal dev annotations", () => {
    for (const banned of [/bug/i, /Day 6/, /May 13/, /Sasha/, /CANONICAL/i]) {
      expect(ZONE_OF_GENIUS_PROMPT).not.toMatch(banned);
    }
  });

  it("keeps the same JSON output field names", () => {
    const block = ZONE_OF_GENIUS_PROMPT.slice(
      ZONE_OF_GENIUS_PROMPT.indexOf("{\n"),
      ZONE_OF_GENIUS_PROMPT.indexOf("\n}\n") + 2,
    );
    const fields = [...block.matchAll(/^ {2}"([a-z_]+)":/gm)].map((m) => m[1]);
    expect(fields).toEqual([
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
});
