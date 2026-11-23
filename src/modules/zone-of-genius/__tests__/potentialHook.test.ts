import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/i18n/config", () => ({ default: { resolvedLanguage: "en" } }));

import { acceptedMicroQuestOf } from "@/hooks/useAcceptedMicroQuest";
import { ZONE_OF_GENIUS_PROMPT } from "@/prompts";
import { OUTPUT_FORMAT, readPotentialHook } from "../appleseedGenerator";

const hook = {
  next_potential: { title: "Market Doorway Discipline", line: "The version of you who opens the smallest door." },
  micro_quest: "Today, send your one-line offer to one person it fits.",
};

describe("A4 potential hook", () => {
  it("reads a complete hook and trims it", () => {
    expect(readPotentialHook({ ...hook, micro_quest: `  ${hook.micro_quest} ` })).toEqual(hook);
  });

  it("hides the hook for old reveals and half-formed answers", () => {
    expect(readPotentialHook(undefined)).toBeUndefined();
    expect(readPotentialHook({})).toBeUndefined();
    expect(readPotentialHook({ micro_quest: "x" })).toBeUndefined();
    expect(readPotentialHook({ ...hook, micro_quest: "" })).toBeUndefined();
    expect(readPotentialHook({ next_potential: { title: "T" }, micro_quest: "x" })).toBeUndefined();
    expect(readPotentialHook({ next_potential: "T", micro_quest: "x" })).toBeUndefined();
  });

  it("both paths ask for the fields", () => {
    for (const prompt of [OUTPUT_FORMAT, ZONE_OF_GENIUS_PROMPT]) {
      expect(prompt).toContain('"next_potential"');
      expect(prompt).toContain('"micro_quest"');
    }
  });

  it("the Quest Board lists a micro-quest only after it is accepted", () => {
    expect(acceptedMicroQuestOf(null)).toBeNull();
    expect(acceptedMicroQuestOf({ topTalentProfile: {} })).toBeNull();
    expect(acceptedMicroQuestOf({ topTalentProfile: { ...hook } })).toBeNull();
    expect(
      acceptedMicroQuestOf({ topTalentProfile: { ...hook, micro_quest_accepted_at: "2026-11-22T00:00:00Z" } }),
    ).toEqual({ quest: hook.micro_quest, potential: "Market Doorway Discipline" });
  });
});
