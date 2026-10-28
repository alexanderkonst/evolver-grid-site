import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { emptyPlaceSave } from "@/lib/placeState";
import { isGuestStep } from "@/lib/guestModule";
import { isEpisodePublished } from "@/lib/coursePlayer";
import { ACADEMY_WELCOME_EPISODE, ACADEMY_WELCOME_ID, ACADEMY_WELCOME_MODULE } from "../academyModule";
import { ACADEMY_CHOICES, JOURNEY_CHOICES, getJourneyChoice } from "../journeyChoices";
import { JOURNEY_MODULES, moduleClosedLine, moduleHasRequirements, moduleIntroState } from "../journeyModules";

const barrier = /\b(lock(s|ed|ing)?|gate|access denied|unlock(s|ed|ing)?|coming soon|sign in|log in|register)\b/i;

describe("the Academy module a guest can play (issue #186)", () => {
  const m = ACADEMY_WELCOME_MODULE;

  it("is lesson 1 of the free course: its first, published episode", () => {
    expect(ACADEMY_WELCOME_EPISODE.code).toBe("00");
    expect(isEpisodePublished(ACADEMY_WELCOME_EPISODE)).toBe(true);
  });

  it("lives in the Academy and is not a Journey step", () => {
    expect(VILLAGE_PLACES.some((p) => p.key === m.place && p.key === "academy")).toBe(true);
    expect(JOURNEY_MODULES.some((j) => j.id === m.id)).toBe(false);
    expect(isGuestStep(ACADEMY_WELCOME_ID)).toBe(true);
    expect(m.id).toBe(ACADEMY_WELCOME_ID);
  });

  it("is always open to a guest: nothing waits on it, so its Intro is never closed", () => {
    expect(moduleHasRequirements(m.id)).toBe(false);
    expect(moduleIntroState(m.id, emptyPlaceSave())).toBe("open");
    expect(moduleClosedLine(m.id)).toBe("");
  });

  it("the button is the result as a verb, and nothing a player reads sounds like a wall", () => {
    expect(m.verb).not.toMatch(/^(continue|next|go|start|submit)\b/i);
    for (const w of [m.eyebrow, m.headline, m.silhouette, m.verb, m.outro.done, m.outro.badge, m.outro.livesIn.text, m.outro.opened, m.outro.fallbackResult]) {
      expect(w, w).not.toMatch(barrier);
    }
    expect(m.outro.done).toMatch(/^Done · \S/);
  });

  it("asks one real choice, kept apart from J1–J12 and short enough for the table", () => {
    const prompt = getJourneyChoice(m.id);
    expect(prompt).toBe(ACADEMY_CHOICES[0]);
    expect(JOURNEY_CHOICES.some((c) => c.stepId === m.id)).toBe(false);
    expect(prompt!.question.endsWith("?")).toBe(true);
    expect(prompt!.question.length).toBeLessThanOrEqual(70);
    expect(prompt!.question).not.toMatch(/\d|score|rate|rating|points?/i);
    expect(m.id.length).toBeLessThanOrEqual(40); // journey_victories / module_choices step_id length
  });
});
