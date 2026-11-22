import { describe, expect, it } from "vitest";
import { buildMirrorProfile, cleanValue, weakestAreaName, DEMO_MIRROR_PROFILE, type MirrorProfile } from "../mirror/mirrorProfile";
import {
  MASKED_AREA,
  MIRROR_MODULES,
  answerLines,
  getMirrorStep,
  maskForCopy,
} from "../mirror/mirrorPrompts";

const FULL = {
  first_name: "Alex",
  top_talents: "Naming what is happening; Building the frame",
  archetype: "Experience-to-Direction Turning",
  mastery_action: "Turning a tangle into a map",
  mission: "Dedicate your life to clarity",
  priority_area: "health",
  weakest_area: "wealth",
};

const ALL_STAGES = {
  wealth_stage: 3,
  health_stage: 5,
  happiness_stage: 6,
  love_relationships_stage: 7,
  impact_stage: 4,
  growth_stage: 8,
  social_ties_stage: 5,
  home_stage: 6,
};

describe("cleanValue", () => {
  it("strips a trailing period so the label adds its own once", () => {
    expect(cleanValue("Dedicate your life to clarity.")).toBe("Dedicate your life to clarity");
    expect(cleanValue("  two   words. ")).toBe("two words");
    expect(cleanValue(null)).toBe("");
    expect(cleanValue(42)).toBe("");
  });
});

describe("weakestAreaName", () => {
  it("names the single lowest area", () => {
    expect(weakestAreaName(ALL_STAGES)).toBe("wealth");
  });
  it("leaves it out on a tie for the lowest", () => {
    expect(weakestAreaName({ ...ALL_STAGES, impact_stage: 3 })).toBe("");
    expect(weakestAreaName({ ...ALL_STAGES, wealth_stage: 1, health_stage: 1, home_stage: 1 })).toBe("");
  });
  it("leaves it out when a stage is missing or there is no snapshot", () => {
    expect(weakestAreaName({ ...ALL_STAGES, home_stage: null })).toBe("");
    expect(weakestAreaName(null)).toBe("");
  });
});

describe("buildMirrorProfile", () => {
  it("keeps only fields that have a value", () => {
    const p = buildMirrorProfile({
      game_profile: { first_name: "Alex", mission_statement: "  ", qol_priorities: ["health", "growth"] },
      zog_snapshot: { top_three_talents: ["A.", "B"], archetype_title: "", mastery_action: null },
      qol_snapshot: ALL_STAGES,
    });
    expect(p).toEqual({ first_name: "Alex", top_talents: "A; B", priority_area: "health", weakest_area: "wealth" });
    expect("mission" in p).toBe(false);
  });
  it("reads talent ids from older snapshots", () => {
    const p = buildMirrorProfile({ zog_snapshot: { top_three_talents: [1, 2, 3] } });
    expect(p.top_talents).toBe("Designing Ideals; Advocating Fairness; Seeking Improvements");
  });
  it("returns an empty profile for no sources", () => {
    expect(buildMirrorProfile({})).toEqual({});
  });
});

describe("prompts", () => {
  const prompt = (key: string, p: MirrorProfile = FULL, ctx?: { line?: string }) => getMirrorStep(key).prompt(p, ctx);

  it("has 8 micro-modules and 9 buttons (module 7 has two)", () => {
    expect(MIRROR_MODULES).toHaveLength(8);
    expect(MIRROR_MODULES.flatMap((m) => m.steps)).toHaveLength(9);
  });

  it("fills a full profile, one label per line", () => {
    expect(prompt("1")).toBe(
      [
        "My name: Alex.",
        "My top talents: Naming what is happening; Building the frame.",
        "My mission: Dedicate your life to clarity.",
        "In up to 5 lines: what do you see in me that I may not see myself? Last line: what you are least sure of. No emojis.",
      ].join("\n"),
    );
  });

  it("drops the whole label line for an empty field, never a stand-in", () => {
    const p = { ...FULL, mission: undefined, first_name: undefined };
    const text = prompt("1", p);
    expect(text).not.toMatch(/My mission|My name/);
    expect(text).toContain("My top talents:");
    expect(text).not.toMatch(/undefined|\{|\}/);
  });

  it("#2 without a mastery action uses the top talents", () => {
    const text = prompt("2", { ...FULL, mastery_action: undefined });
    expect(text).toContain("My talents: Naming what is happening; Building the frame.");
    expect(text).not.toContain("What I do best");
  });

  it("#3 drops only the empty label", () => {
    const text = prompt("3", { ...FULL, mastery_action: undefined });
    expect(text).not.toContain("What I do best");
    expect(text).toContain("My talents:");
  });

  it("#5 works with no mission and no priority area", () => {
    const text = prompt("5", {});
    expect(text).toBe("Be my partner: three steps for this week, then ask me which one we start with. Up to 5 lines, no emojis.");
  });

  it("#7 leaves the weakest area out on a tie (absent) and keeps the rest", () => {
    const text = prompt("7b", { ...FULL, weakest_area: undefined });
    expect(text).not.toContain("weakest");
    expect(text).toContain("My archetype: Experience-to-Direction Turning.");
    expect(prompt("7a")).toBe("Help me with my life.");
  });

  it("every profile-driven prompt ends with the line cap and the emoji ban", () => {
    for (const key of ["2", "3", "4", "5", "6", "7b", "8"]) {
      expect(prompt(key)).toMatch(/no emojis\.$/i);
    }
    expect(prompt("1")).toMatch(/No emojis\.$/);
  });

  it("#6 carries [LINE] until a line is tapped, then fills it (trailing period stripped)", () => {
    expect(prompt("6")).toContain("[LINE].");
    const filled = prompt("6", FULL, { line: "You value depth over speed." });
    expect(filled).toBe(
      "This line would fit anyone: You value depth over speed. Say it again so it fits only me, or tell me you don't know. Up to 3 lines, no emojis.",
    );
    expect(prompt("6", FULL, { line: "Do you see it?" })).toContain("anyone: Do you see it? Say it again");
  });

  it("blocks a button whose essential profile is empty", () => {
    expect(getMirrorStep("1").blockedReason?.({})).toMatch(/Top Talent/);
    expect(getMirrorStep("1").blockedReason?.(FULL)).toBeNull();
    expect(getMirrorStep("2").blockedReason?.({ mastery_action: "x" })).toBeNull();
  });

  it("#5 invites the microphone when the mission is empty", () => {
    expect(getMirrorStep("5").hint?.({})).toMatch(/microphone/);
    expect(getMirrorStep("5").hint?.(FULL)).toBeNull();
  });

  it("uses «mini-training», never «course», in the visible module copy", () => {
    const copy = JSON.stringify(MIRROR_MODULES.map((m) => [m.title, m.idea, m.promise]));
    expect(copy).not.toMatch(/course/i);
  });
});

describe("maskForCopy", () => {
  it("replaces the weakest area on Copy, only in its label", () => {
    const text = "My weakest life area now: wealth.\nMy talents: wealth of ideas.";
    expect(maskForCopy(text, FULL)).toBe(`My weakest life area now: ${MASKED_AREA}.\nMy talents: wealth of ideas.`);
  });
  it("leaves text alone when there is no weakest area", () => {
    expect(maskForCopy("Help me with my life.", {})).toBe("Help me with my life.");
  });
});

describe("answerLines", () => {
  it("splits an answer into tap targets, stripping bullets and blanks", () => {
    expect(answerLines("1. You see patterns.\n\n- You hold on to depth.\n  \nLeast sure: your mission.")).toEqual([
      "You see patterns.",
      "You hold on to depth.",
      "Least sure: your mission.",
    ]);
  });
});

describe("demo profile", () => {
  it("has some empty fields on purpose", () => {
    expect(DEMO_MIRROR_PROFILE.mastery_action).toBeUndefined();
    expect(DEMO_MIRROR_PROFILE.weakest_area).toBeUndefined();
    expect(DEMO_MIRROR_PROFILE.top_talents).toBeTruthy();
  });
});
