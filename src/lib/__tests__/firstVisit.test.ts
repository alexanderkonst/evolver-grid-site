// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  INTRO_SEEN_KEY,
  hasGuestTopTalentResult,
  hasSavedGame,
  markIntroSeen,
  readGuestTalentName,
  readGuestTopTalentPayload,
  shouldShowWelcomeBack,
  shouldShowWordlessIntro,
} from "@/lib/firstVisit";

describe("firstVisit", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows the intro in a fresh browser", () => {
    expect(shouldShowWordlessIntro()).toBe(true);
  });

  it("skips it once the flag is set", () => {
    markIntroSeen();
    expect(window.localStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
    expect(shouldShowWordlessIntro()).toBe(false);
  });

  it("skips it for a signed-in session", () => {
    window.localStorage.setItem("evolver-auth-token", "{}");
    expect(hasSavedGame()).toBe(true);
    expect(shouldShowWordlessIntro()).toBe(false);
  });

  it("skips it for a guest with a saved profile", () => {
    window.localStorage.setItem("game_profile_id", "abc");
    expect(shouldShowWordlessIntro()).toBe(false);
  });

  it("reads a guest's finished Top Talent reading, and only that", () => {
    expect(hasGuestTopTalentResult()).toBe(false);
    window.localStorage.setItem("fytt:transition-quiz-result:v1", JSON.stringify({ completedAt: "2026-10-28" }));
    expect(hasGuestTopTalentResult()).toBe(false); // the quiz marker is another result
    window.localStorage.setItem("guest_appleseed_data", JSON.stringify({ title: "The Builder" }));
    expect(hasGuestTopTalentResult()).toBe(true);
    expect(readGuestTopTalentPayload()).toEqual({ title: "The Builder" });
  });

  describe("a guest with a result on this device", () => {
    const keep = (name: unknown) =>
      window.localStorage.setItem("guest_appleseed_data", JSON.stringify({ vibrationalKey: { name } }));

    it("reads the talent name the reveal showed, without decorative glyphs", () => {
      expect(readGuestTalentName()).toBeNull();
      keep("✦ Pattern Architecting ✦");
      expect(readGuestTalentName()).toBe("Pattern Architecting");
    });

    it("has no talent name when the reading carries none", () => {
      window.localStorage.setItem("guest_appleseed_data", JSON.stringify({ title: "The Builder" }));
      expect(readGuestTalentName()).toBeNull();
      keep(42);
      expect(readGuestTalentName()).toBeNull();
      keep("  ✦ ");
      expect(readGuestTalentName()).toBeNull();
    });

    it("is welcomed back, and the wordless intro stays off for them", () => {
      keep("Signal-to-Path Shaping");
      expect(shouldShowWelcomeBack()).toBe(true);
      expect(shouldShowWordlessIntro()).toBe(false);
    });

    it("a fresh browser gets no welcome-back and still gets the wordless intro", () => {
      expect(shouldShowWelcomeBack()).toBe(false);
      expect(shouldShowWordlessIntro()).toBe(true);
    });

    it("a signed-in session uses Load game, not the guest welcome-back", () => {
      keep("Signal-to-Path Shaping");
      window.localStorage.setItem("evolver-auth-token", "{}");
      expect(shouldShowWelcomeBack()).toBe(false);
    });

    it("the Transition Quiz marker alone is not a talent to welcome back", () => {
      window.localStorage.setItem("fytt:transition-quiz-result:v1", JSON.stringify({ completedAt: "2026-10-28" }));
      expect(shouldShowWelcomeBack()).toBe(false);
    });
  });

  it("treats broken guest data as no result", () => {
    window.localStorage.setItem("guest_appleseed_data", "{not json");
    expect(hasGuestTopTalentResult()).toBe(false);
    window.localStorage.setItem("guest_appleseed_data", "[]");
    expect(hasGuestTopTalentResult()).toBe(false);
  });
});
