// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  GUEST_STEP_IDS,
  GUEST_STORAGE_KEY,
  isGuestStep,
  readGuestStep,
  saveGuestChoice,
  saveGuestRating,
} from "@/lib/guestModule";

const STEP = "academy-welcome" as const;

describe("guest module progress (issue #186)", () => {
  beforeEach(() => window.localStorage.clear());

  it("knows only the Academy lesson as guest-playable", () => {
    expect([...GUEST_STEP_IDS]).toEqual([STEP]);
    expect(isGuestStep(STEP)).toBe(true);
    expect(isGuestStep("find-top-talent")).toBe(false);
    expect(isGuestStep(null)).toBe(false);
  });

  it("starts empty in a fresh browser", () => {
    expect(readGuestStep(STEP)).toEqual({});
  });

  it("keeps a 1–10 rating in the browser, first answer standing", () => {
    expect(saveGuestRating(STEP, 8)).toBe(8);
    expect(saveGuestRating(STEP, 3)).toBe(8);
    expect(readGuestStep(STEP).rating).toBe(8);
  });

  it("refuses a rating outside 1–10", () => {
    expect(saveGuestRating(STEP, 0)).toBeNull();
    expect(saveGuestRating(STEP, 11)).toBeNull();
    expect(saveGuestRating(STEP, 4.5)).toBeNull();
    expect(readGuestStep(STEP)).toEqual({});
  });

  it("keeps the real choice, cleaned, with its date, first one standing", () => {
    const at = new Date("2026-10-28T12:00:00Z");
    expect(saveGuestChoice(STEP, "  walk   before work ", at)).toEqual({
      text: "walk before work",
      at: "2026-10-28T12:00:00.000Z",
    });
    expect(saveGuestChoice(STEP, "something else", at)?.text).toBe("walk before work");
    expect(saveGuestChoice(STEP, "   ")).toBeNull();
  });

  it("rating and choice live side by side", () => {
    saveGuestRating(STEP, 7);
    saveGuestChoice(STEP, "call my sister");
    expect(readGuestStep(STEP).rating).toBe(7);
    expect(readGuestStep(STEP).choice?.text).toBe("call my sister");
  });

  it("ignores a damaged store instead of throwing", () => {
    window.localStorage.setItem(GUEST_STORAGE_KEY, "{not json");
    expect(readGuestStep(STEP)).toEqual({});
    window.localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify({ [STEP]: { rating: 99, choice: { text: 5, at: 1 } }, other: { rating: 5 } }),
    );
    expect(readGuestStep(STEP)).toEqual({});
  });
});
