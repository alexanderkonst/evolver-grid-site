import { describe, expect, it } from "vitest";
import {
  CRYSTAL_QUEST_MAX,
  buildEssenceLine,
  buildQuestPlaceholder,
  normalizeSoulColors,
  parseFirstQuest,
  sanitizeQuest,
  toHex,
  wrapLines,
} from "@/lib/crystal";
import { getPostZogRedirect } from "@/lib/onboardingRouting";

describe("crystal colors", () => {
  it("converts hsl strings from the deterministic palette to hex", () => {
    expect(toHex("hsl(0, 100%, 50%)")).toBe("#ff0000");
    expect(toHex("hsl(120, 100%, 25%)")).toBe("#008000");
    expect(toHex("#9B5DE5")).toBe("#9b5de5");
    expect(toHex("not-a-color")).toBeNull();
  });

  it("normalises a palette to exactly three hex codes", () => {
    expect(normalizeSoulColors(["#9b5de5", "#f5a623", "#4361ee", "#ff6b35"])).toEqual([
      "#9b5de5",
      "#f5a623",
      "#4361ee",
    ]);
    expect(normalizeSoulColors(["hsl(0, 100%, 50%)", "#00ff00", "#0000ff"])).toEqual([
      "#ff0000",
      "#00ff00",
      "#0000ff",
    ]);
    expect(normalizeSoulColors(["#9b5de5", "oops"])).toBeNull();
    expect(normalizeSoulColors(null)).toBeNull();
  });
});

describe("crystal copy", () => {
  it("joins archetype title and the first sentence of the core pattern", () => {
    expect(buildEssenceLine("The Quiet Architect", "You build calm systems. They last.")).toBe(
      "Quiet Architect. You build calm systems.",
    );
  });

  it("ignores the pending snapshot sentinel", () => {
    expect(buildEssenceLine("Pending", "Pending")).toBe("");
    expect(buildEssenceLine("Pending", "You see patterns.")).toBe("You see patterns.");
  });

  it("builds a placeholder from top talents", () => {
    expect(buildQuestPlaceholder(["Storytelling", "Synthesis", "Care"])).toBe(
      "Use storytelling and synthesis to make something real",
    );
    expect(buildQuestPlaceholder([])).toBe("Something only I can make");
  });
});

describe("first quest", () => {
  it("collapses whitespace and caps length", () => {
    expect(sanitizeQuest("  a   b \n c ")).toBe("a b c");
    expect(sanitizeQuest("x".repeat(500))).toHaveLength(CRYSTAL_QUEST_MAX);
    expect(sanitizeQuest("   ")).toBe("");
  });

  it("reads the quest back from main_quest_progress", () => {
    expect(
      parseFirstQuest({ player_first_quest: { text: "Ship my workshop page", written_at: "2026-10-27T10:00:00Z" } }),
    ).toEqual({ text: "Ship my workshop page", written_at: "2026-10-27T10:00:00Z" });
    expect(parseFirstQuest({})).toBeNull();
    expect(parseFirstQuest(null)).toBeNull();
  });
});

describe("share card helpers", () => {
  it("wraps text and ellipsises past the line cap", () => {
    expect(wrapLines("one two three four", 7, 5)).toEqual(["one two", "three", "four"]);
    const out = wrapLines("aaa bbb ccc ddd eee fff", 7, 2);
    expect(out).toHaveLength(2);
    expect(out[1].endsWith("...")).toBe(true);
  });
});

describe("post-ZoG redirect", () => {
  it("sends NEW GAME players to the crystal and leaves other returns alone", () => {
    expect(getPostZogRedirect("/game/crystal")).toBe("/game/crystal");
    expect(getPostZogRedirect("/start")).toBe("/start");
    expect(getPostZogRedirect("/game/me")).toBeNull();
  });
});
