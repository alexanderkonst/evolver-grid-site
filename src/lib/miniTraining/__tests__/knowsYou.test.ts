import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
import { ANYWHERE_PROMPT, KNOWS_YOU_STEPS, anywhereText, type KnowsYouProfile } from "../knowsYouPrompts";
import {
  emptyKnowsYouState,
  isKnowsYouModuleDone,
  knowsYouModulesDone,
  knowsYouStateKey,
  loadKnowsYouState,
  saveKnowsYouState,
} from "../knowsYouState";
import { mirrorStateKey } from "../mirrorState";
import { KNOWS_YOU_MODULE_COPY } from "../knowsYouCopy";

const memory = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

const step = (id: string) => KNOWS_YOU_STEPS.find((s) => s.id === id)!;

const full: KnowsYouProfile = {
  topTalents: ["Designing Ideals", "Crafting Visions"],
  archetype: "Experience-to-Direction Turning.",
  mission: "Dedicate your life to clear schools.",
  priorityArea: "health",
  plan: "1. Call Ana\n2. Draft the offer",
};

describe("prompts", () => {
  it("every prompt asks for no emojis", () => {
    for (const s of KNOWS_YOU_STEPS) expect(s.build(full)).toMatch(/no emojis\.$/i);
  });

  it("#1a knows nothing; #1b carries mission and priority area after a colon", () => {
    expect(step("1a").build(full)).toBe("Give me advice for my week. Up to 5 lines, no emojis.");
    expect(step("1a").isolated).toBe(true);
    expect(step("1b").build(full)).toBe(
      "My mission: Dedicate your life to clear schools. My most important life area: health. Now give me advice for my week. Up to 5 lines, no emojis.",
    );
  });

  it("#3 uses talents, archetype, mission and the rung 1 plan, trailing periods stripped", () => {
    const text = step("3").build(full);
    expect(text).toContain("My talents: Designing Ideals, Crafting Visions.");
    expect(text).toContain("My archetype: Experience-to-Direction Turning.");
    expect(text).not.toContain("Turning..");
    expect(text).toContain("My plan: 1. Call Ana 2. Draft the offer.");
    expect(text).toContain("identity and roles, 90-day goals, genius, how I like answers, my limits. Mark what you guessed.");
  });

  it("#3 with an empty profile drops every label", () => {
    const text = step("3").build({});
    expect(text).not.toContain(":  ");
    expect(text.startsWith("From everything in this chat")).toBe(true);
  });

  it("dialog cards ask one question at a time and have an answer box", () => {
    for (const id of ["2", "4"]) {
      expect(step(id).build(full)).toContain("Ask only the first question now and wait for my answer.");
      expect(step(id).replies).toBeGreaterThan(0);
    }
    expect(step("5").replies).toBeGreaterThan(0);
    expect(step("6b").replies).toBeGreaterThan(0);
    expect(step("4").saveAfterReplies).toBe(3);
  });

  it("#5 carries a gap the person fills", () => {
    expect(step("5").build(full)).toContain(`Here is something I want: ${step("5").fillToken}.`);
  });

  it("#7 copies the profile with the question under it", () => {
    expect(anywhereText("Me.\nMore.")).toBe(`Me.\nMore.\n\n${ANYWHERE_PROMPT}`);
    expect(anywhereText("")).toBe(ANYWHERE_PROMPT);
  });

  it("copy has seven micro-modules, each with a promise line", () => {
    expect(KNOWS_YOU_MODULE_COPY.map((m) => m.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const m of KNOWS_YOU_MODULE_COPY) expect(m.promise.length).toBeGreaterThan(10);
  });
});

describe("state", () => {
  it("is kept under its own key, apart from rung 1", () => {
    expect(knowsYouStateKey("u1", false)).toBe("mini-training:ai-that-knows-you:v1:u1");
    expect(knowsYouStateKey("u1", false)).not.toBe(mirrorStateKey("u1", false));
  });

  it("round-trips and drops junk", () => {
    const store = memory();
    const state = {
      ...emptyKnowsYouState(),
      sent: ["1a", "1b"],
      profile: { text: "Me", stepId: "3", savedAt: "2026-11-25T00:00:00Z" },
      anywhereDone: true,
    };
    saveKnowsYouState("u1", state, store, false);
    expect(loadKnowsYouState("u1", store, false)).toEqual(state);
    store.setItem(knowsYouStateKey("u2", false), "{not json");
    expect(loadKnowsYouState("u2", store, false)).toEqual(emptyKnowsYouState());
  });

  it("counts modules: #1 needs both cards, #7 needs the mark", () => {
    expect(isKnowsYouModuleDone(1, { sent: ["1a"], anywhereDone: false })).toBe(false);
    expect(isKnowsYouModuleDone(1, { sent: ["1a", "1b"], anywhereDone: false })).toBe(true);
    expect(isKnowsYouModuleDone(7, { sent: [], anywhereDone: true })).toBe(true);
    expect(knowsYouModulesDone({ sent: ["1a", "1b", "2", "6a"], anywhereDone: true })).toBe(3);
  });
});
