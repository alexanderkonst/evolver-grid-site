// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  INTRO_SEEN_KEY,
  hasSavedGame,
  markIntroSeen,
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
});
