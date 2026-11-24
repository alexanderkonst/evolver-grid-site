import { describe, expect, it } from "vitest";
import {
  LINE_TOKEN,
  MIRROR_STEPS,
  WEAKEST_AREA_MASK,
  answerLines,
  cleanValue,
  labelLine,
  prepareForCopy,
  priorityAreaOf,
  stepById,
  talentNames,
  weakestAreaOf,
  type MirrorProfile,
} from "../mirrorPrompts";

const full: MirrorProfile = {
  firstName: "Mira",
  topTalents: ["Designing Ideals", "Mastering Precision", "Crafting Visions"],
  archetype: "Experience-to-Direction Turning",
  masteryAction: "turning scattered experience into a clear direction.",
  mission: "Dedicate your life to helping people find their work.",
  priorityArea: "health",
  weakestArea: "wealth",
};

const prompt = (id: string, p: MirrorProfile, line?: string) => stepById(id)!.build(p, { line });

describe("filling rule", () => {
  it("strips one trailing period before the label adds its own", () => {
    expect(cleanValue("health.")).toBe("health");
    expect(labelLine("My mission", "help people.")).toBe("My mission: help people.");
    expect(labelLine("My mission", "help people")).toBe("My mission: help people.");
  });

  it("drops the whole label for an empty field, never a stand-in", () => {
    expect(labelLine("My mission", "")).toBeNull();
    expect(labelLine("My mission", "   ")).toBeNull();
    expect(labelLine("My mission", null)).toBeNull();
    expect(labelLine("My mission", ".")).toBeNull();
    const text = prompt("1", { ...full, mission: null, firstName: "" });
    expect(text).not.toMatch(/My mission/);
    expect(text).not.toMatch(/My name/);
    expect(text).toContain("My top talents: Designing Ideals, Mastering Precision, Crafting Visions.");
  });

  it("keeps a mission written as «Dedicate your life…» as is", () => {
    expect(prompt("1", full)).toContain("My mission: Dedicate your life to helping people find their work.");
  });
});

describe("the eight buttons", () => {
  it("#1 fills name, talents, mission", () => {
    expect(prompt("1", full)).toBe(
      "My name: Mira. My top talents: Designing Ideals, Mastering Precision, Crafting Visions. " +
        "My mission: Dedicate your life to helping people find their work. " +
        "What do you see in me that I may not see myself? Last line: what you are least sure of. Up to 5 lines, no emojis.",
    );
  });

  it("#2 uses mastery_action, and the talents when it is empty", () => {
    expect(prompt("2", full)).toContain("What I do best: turning scattered experience into a clear direction.");
    expect(prompt("2", full)).toContain("Write a four-line motto for it.");
    const fallback = prompt("2", { ...full, masteryAction: null });
    expect(fallback).not.toMatch(/What I do best/);
    expect(fallback).toContain("My top talents: Designing Ideals");
    expect(fallback).toContain("Write a four-line motto for them.");
  });

  it("#3 drops only the empty label", () => {
    const text = prompt("3", { ...full, masteryAction: null });
    expect(text).not.toMatch(/What I do best/);
    expect(text).toContain("My talents: Designing Ideals");
  });

  it("#4 is one button with the archetype as a label, not a way to address the person", () => {
    const text = prompt("4", full);
    expect(text).toContain("My archetype: Experience-to-Direction Turning.");
    expect(text).not.toMatch(/talk to me as/i);
    expect(prompt("4", { ...full, archetype: null })).not.toMatch(/archetype/);
  });

  it("#5 uses mission and priority area, and falls back to the talents when both are empty", () => {
    const text = prompt("5", full);
    expect(text).toContain("My mission:");
    expect(text).toContain("My most important life area: health.");
    const bare = prompt("5", { ...full, mission: null, priorityArea: null });
    expect(bare).not.toMatch(/My mission|My most important life area/);
    expect(bare).toContain("My top talents:");
    expect(stepById("5")!.savePlan).toBe(true);
  });

  it("#6 carries [LINE] until a line is tapped, then fills it", () => {
    expect(prompt("6", full)).toContain(`This line would fit anyone: ${LINE_TOKEN}.`);
    const filled = prompt("6", full, "You have a rare gift for seeing patterns.");
    expect(filled).toBe(
      "This line would fit anyone: You have a rare gift for seeing patterns. Say it again so it fits only me, or tell me you don't know. Up to 3 lines, no emojis.",
    );
    expect(prompt("6", full, "Ends with a period.")).toContain("anyone: Ends with a period. Say it again");
  });

  it("#7 is two buttons: the vague one, then the profile one", () => {
    expect(prompt("7a", full)).toBe("Help me with my life. Up to 5 lines, no emojis.");
    const b = prompt("7b", full);
    expect(b).toContain("My weakest life area now: wealth.");
    expect(b).toContain("My most important life area: health.");
    expect(b).toContain("My archetype:");
    expect(stepById("7a")!.isolated).toBe(true);
    expect(b).toContain("Three moves that use my talents.");
  });

  it("#7b leaves the weakest area out when it is empty (a tie)", () => {
    expect(prompt("7b", { ...full, weakestArea: null })).not.toMatch(/weakest/);
  });

  it("#8 asks one question at a time and lets the player answer", () => {
    expect(prompt("8", full)).toContain("Ask only the first question now and wait for my answer.");
    expect(stepById("8")!.replies).toBe(4);
    expect(stepById("5")!.replies).toBe(2);
  });

  it("#8 ends with the exact last line from the spec and offers Save plan", () => {
    expect(prompt("8", full).endsWith("Your final answer: up to 5 lines, no emojis.")).toBe(true);
    expect(stepById("8")!.savePlan).toBe(true);
  });

  it("every prompt carries the line cap and the emoji ban (#2 has six lines by design)", () => {
    for (const step of MIRROR_STEPS) {
      const text = step.build(full, { line: "x" });
      expect(text, step.id).toMatch(/no emojis/i);
      if (step.id !== "2") expect(text, step.id).toMatch(/up to [35] lines/i);
    }
  });

  it("covers all eight micro-modules, #7 with two steps", () => {
    const modules = new Set(MIRROR_STEPS.map((s) => s.module));
    expect([...modules].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(MIRROR_STEPS.filter((s) => s.module === 7)).toHaveLength(2);
  });

  it("never leaves a stand-in or an unfilled placeholder behind with an empty profile", () => {
    const empty: MirrorProfile = {};
    for (const step of MIRROR_STEPS) {
      if (step.needsLine) continue;
      const text = step.build(empty);
      expect(text, step.id).not.toMatch(/\{|undefined|null|\[LINE\]/);
      expect(text, step.id).not.toMatch(/: \./);
    }
  });
});

describe("Copy masks the weakest area", () => {
  it("replaces the value on its label line", () => {
    const text = prompt("7b", full);
    const copied = prepareForCopy(text, "wealth");
    expect(copied).toContain(`My weakest life area now: ${WEAKEST_AREA_MASK}.`);
    expect(copied).not.toMatch(/now: wealth/);
  });

  it("only touches the label line, not the same word elsewhere", () => {
    const text = "My mission: build wealth for all. My weakest life area now: wealth.";
    expect(prepareForCopy(text, "wealth")).toBe(`My mission: build wealth for all. My weakest life area now: ${WEAKEST_AREA_MASK}.`);
  });

  it("changes nothing when there is no weakest area", () => {
    const text = prompt("7b", { ...full, weakestArea: null });
    expect(prepareForCopy(text, null)).toBe(text);
  });

  it("handles areas with regex characters", () => {
    expect(prepareForCopy("My weakest life area now: love & relationships.", "love & relationships")).toContain(WEAKEST_AREA_MASK);
  });
});

describe("profile → text", () => {
  it("maps talent ids and numeric strings to names, and passes names through", () => {
    expect(talentNames([1, "4", "Custom Talent"])).toEqual(["Designing Ideals", "Mastering Precision", "Custom Talent"]);
    expect(talentNames(null)).toEqual([]);
    expect(talentNames([9999])).toEqual([]);
  });

  it("takes the first known priority area as a lowercase name", () => {
    expect(priorityAreaOf(["health", "wealth"])).toBe("health");
    expect(priorityAreaOf(["bogus", "socialTies"])).toBe("social ties");
    expect(priorityAreaOf([])).toBeNull();
    expect(priorityAreaOf(null)).toBeNull();
  });

  it("finds the single weakest area, and leaves a tie out", () => {
    const base = {
      wealth_stage: 4, health_stage: 3, happiness_stage: 5, love_relationships_stage: 6,
      impact_stage: 7, growth_stage: 8, social_ties_stage: 5, home_stage: 6,
    };
    expect(weakestAreaOf(base)).toBe("health");
    expect(weakestAreaOf({ ...base, wealth_stage: 3 })).toBeNull();
    expect(weakestAreaOf({ wealth_stage: 1, health_stage: 1, happiness_stage: 1, love_relationships_stage: 1, impact_stage: 1, growth_stage: 1, social_ties_stage: 2, home_stage: 2 })).toBeNull();
    expect(weakestAreaOf(null)).toBeNull();
    expect(weakestAreaOf({})).toBeNull();
  });

  it("ignores empty scores when looking for the weakest", () => {
    expect(weakestAreaOf({ wealth_stage: null, health_stage: 2, happiness_stage: 5 })).toBe("health");
  });
});

describe("answer lines for #6", () => {
  it("splits an answer into tappable lines and strips bullets", () => {
    const answer = "You see patterns first.\n\n- You like to finish things.\n2. **You care about people.**\n";
    expect(answerLines(answer)).toEqual(["You see patterns first.", "You like to finish things.", "You care about people."]);
    expect(answerLines("")).toEqual([]);
    expect(answerLines(null)).toEqual([]);
  });
});
