import { describe, expect, it } from "vitest";
import { JOURNEY_MODULES } from "../journeyModules";
import {
  CHOICE_MAX,
  FOLLOWUPS,
  FOLLOWUP_AFTER_DAYS,
  JOURNEY_CHOICES,
  choiceAgeDays,
  cleanChoiceText,
  followupDue,
  followupLine,
  getJourneyChoice,
  isFollowup,
} from "../journeyChoices";

const NOW = new Date("2026-10-28T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe("journey choices (WP-19 real-choice ending)", () => {
  it("every built module has a prompt", () => {
    for (const m of JOURNEY_MODULES) expect(getJourneyChoice(m.id), m.id).toBeDefined();
  });

  it("one prompt per step, J1–J12 without the unbuilt J3", () => {
    const ids = JOURNEY_CHOICES.map((c) => c.stepId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(JOURNEY_CHOICES.map((c) => c.journey)).toEqual(
      ["J1", "J2", "J4", "J5", "J6", "J7", "J8", "J9", "J10", "J11", "J12"],
    );
    for (const id of ids) expect(id.length).toBeLessThanOrEqual(40); // module_choices_step_id_length
  });

  it("each question is short, plain and carries no number or score", () => {
    for (const c of JOURNEY_CHOICES) {
      expect(c.question.endsWith("?"), c.stepId).toBe(true);
      expect(c.question.length, c.stepId).toBeLessThanOrEqual(70);
      expect(c.question, c.stepId).not.toMatch(/\d|score|rate|rating|points?/i);
    }
  });

  it("cleans text to the database range", () => {
    expect(cleanChoiceText("  stop   scrolling \n in bed ")).toBe("stop scrolling in bed");
    expect(cleanChoiceText("   ")).toBeNull();
    expect(cleanChoiceText("a".repeat(CHOICE_MAX))).not.toBeNull();
    expect(cleanChoiceText("a".repeat(CHOICE_MAX + 1))).toBeNull();
  });

  it("knows the three follow-up answers and no others", () => {
    expect([...FOLLOWUPS]).toEqual(["yes", "partly", "not_yet"]);
    expect(isFollowup("partly")).toBe(true);
    expect(isFollowup("no")).toBe(false);
    expect(isFollowup(null)).toBe(false);
  });

  it("asks only after a few days, and only once", () => {
    expect(followupDue({ created_at: daysAgo(0), followup: null }, NOW)).toBe(false);
    expect(followupDue({ created_at: daysAgo(FOLLOWUP_AFTER_DAYS - 1), followup: null }, NOW)).toBe(false);
    expect(followupDue({ created_at: daysAgo(FOLLOWUP_AFTER_DAYS), followup: null }, NOW)).toBe(true);
    expect(followupDue({ created_at: daysAgo(30), followup: "yes" }, NOW)).toBe(false);
    expect(choiceAgeDays("not a date", NOW)).toBe(0);
  });

  it("words the follow-up by how long ago, never by a count", () => {
    const choice = (n: number) => ({ choice_text: "stop scrolling in bed", created_at: daysAgo(n) });
    expect(followupLine(choice(4), NOW, "en-GB")).toBe("A few days ago you chose “stop scrolling in bed”. How did it go?");
    expect(followupLine(choice(8), NOW, "en-GB")).toBe("Last week you chose “stop scrolling in bed”. How did it go?");
    expect(followupLine(choice(20), NOW, "en-GB")).toMatch(/^On \d+ \w+ 2026 you chose /);
  });
});
