import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES, getVillagePlace } from "@/data/villagePlaces";
import { isGuestStep } from "@/lib/guestModule";
import { emptyPlaceSave, isLiveNow } from "@/lib/placeState";
import { FIRE_CIRCLE_LIVE, MASTERMIND_LIVE, WEBINAR_LIVE, mastermindBegun } from "../liveEvents";
import { MASTERMIND_ID, MASTERMIND_MODULE } from "../mastermindModule";
import { JOURNEY_CHOICES, getJourneyChoice } from "../journeyChoices";
import { JOURNEY_MODULES, moduleClosedLine, moduleHasRequirements, moduleIntroState } from "../journeyModules";

const barrier = /\b(lock(s|ed|ing)?|gate|access denied|unlock(s|ed|ing)?|coming soon)\b/i;

describe("the Fire Circle's Journey step (WP-10, J9)", () => {
  const m = MASTERMIND_MODULE;

  it("lives in the Fire Circle and is not a Journey row or a guest-saved step", () => {
    expect(getVillagePlace("fire-circle")?.to).toBe("/build/mastermind");
    expect(VILLAGE_PLACES.some((p) => p.key === m.place && p.key === "fire-circle")).toBe(true);
    expect(JOURNEY_MODULES.some((j) => j.id === m.id)).toBe(false);
    // Recording a victory asks for the account: the step is not kept in the guest's browser.
    expect(isGuestStep(m.id)).toBe(false);
    expect(m.id).toBe(MASTERMIND_ID);
    expect(m.startPath).toBe("/build/mastermind");
  });

  it("is open to everyone: nothing waits on it, so its Intro is never closed", () => {
    expect(moduleHasRequirements(m.id)).toBe(false);
    expect(moduleIntroState(m.id, emptyPlaceSave())).toBe("open");
    expect(moduleClosedLine(m.id)).toBe("");
  });

  it("the button is the result as a verb, and nothing a player reads sounds like a wall", () => {
    expect(m.verb).not.toMatch(/^(continue|next|go|start|submit)\b/i);
    expect(m.verb.split(/\s+/).length).toBeLessThanOrEqual(5);
    for (const w of [m.eyebrow, m.headline, m.silhouette, m.verb, m.outro.done, m.outro.badge, m.outro.livesIn.text, m.outro.opened, m.outro.fallbackResult]) {
      expect(w, w).not.toMatch(barrier);
    }
    expect(m.outro.done).toMatch(/^Done · \S/);
  });

  it("asks one real choice: the J9 prompt, short enough for the table", () => {
    const prompt = getJourneyChoice(m.id);
    expect(prompt).toBeDefined();
    expect(JOURNEY_CHOICES.filter((c) => c.stepId === m.id)).toHaveLength(1);
    expect(prompt!.journey).toBe("J9");
    expect(prompt!.question.endsWith("?")).toBe(true);
    expect(m.id.length).toBeLessThanOrEqual(40); // journey_victories / module_choices step_id length
  });
});

describe("the Fire Circle's live windows (WP-10)", () => {
  it("the webinar is Wed Nov 4, 9:00 Mexico City; the Mastermind is Nov 9 and 10", () => {
    expect(WEBINAR_LIVE.from).toBe("2026-11-04T09:00:00-06:00");
    expect(MASTERMIND_LIVE.from).toBe("2026-11-09T00:00:00-06:00");
    expect(MASTERMIND_LIVE.until).toBe("2026-11-11T00:00:00-06:00");
    expect(FIRE_CIRCLE_LIVE).toEqual([WEBINAR_LIVE, MASTERMIND_LIVE]);
  });

  it("the village's Fire Circle and Academy read these constants, not their own dates", () => {
    expect(getVillagePlace("fire-circle")?.rule.live).toBe(FIRE_CIRCLE_LIVE);
    expect(getVillagePlace("academy")?.rule.live).toBe(WEBINAR_LIVE);
  });

  it("the Fire Circle is live on Nov 4 at the webinar and not before it", () => {
    expect(isLiveNow(FIRE_CIRCLE_LIVE, new Date("2026-11-04T15:30:00Z"))).toBe(true);
    expect(isLiveNow(FIRE_CIRCLE_LIVE, new Date("2026-11-04T14:59:00Z"))).toBe(false);
  });

  it("a player can say they were in the circle once the Mastermind has begun", () => {
    expect(mastermindBegun(new Date("2026-11-08T23:59:00-06:00"))).toBe(false);
    expect(mastermindBegun(new Date("2026-11-09T00:00:00-06:00"))).toBe(true);
    expect(mastermindBegun(new Date("2026-12-01T00:00:00Z"))).toBe(true);
  });
});

describe("Mastermind page (WP-10)", () => {
  const source = readFileSync(new URL("../../pages/Mastermind.tsx", import.meta.url), "utf8");

  it("keeps the seat destination in one constant at the top, with no payment code", () => {
    expect(source).toMatch(/const SEAT_CHECKOUT_URL = "";/);
    expect(source.match(/SEAT_CHECKOUT_URL = /g)).toHaveLength(1);
    expect(source).not.toMatch(/stripe\.com|sk_live|pk_live|buy\.stripe/i);
    // The reserve button is unchanged: while the constant is empty it goes to the free live session.
    expect(source).toContain('const MASTERMIND_LIVE_SESSION_URL = "https://lu.ma/qpogt17o";');
    expect(source).toContain("const MASTERMIND_CTA_HREF = SEAT_CHECKOUT_URL || MASTERMIND_LIVE_SESSION_URL;");
  });

  it("does not change the webinar date or the price", () => {
    expect(source).toContain('bridgeLink: "Join the live session on Wed Nov 4, 9:00 CDMX"');
    expect(source).toContain('const MASTERMIND_PRICE = "$222";');
    expect(source).toContain('"Small group, 2 sessions, $222"');
  });

  it("paints with the semantic tokens: no hardcoded color left in the markup", () => {
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/\brgba?\(\s*\d/);
    expect(source).not.toMatch(/--skin-/);
    for (const token of ["--surface-page", "--text-primary", "--text-secondary", "--accent-text", "--live-accent", "--cta-bg", "--cta-text"]) {
      expect(source, token).toContain(`var(${token})`);
    }
  });
});
