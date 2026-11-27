import { describe, expect, it } from "vitest";
import { TOUR_GROUPS } from "../yourAiInstrument";
import {
  REVEAL_OUTLINES,
  REVEAL_STEPS,
  firstRevealStep,
  hasSeenReveal,
  hasTopTalentResult,
  isLastRevealStep,
  isRevealDue,
  markRevealSeen,
  nextRevealStep,
  revealLineKey,
  revealMotion,
  type RevealDueInput,
  type RevealStepId,
} from "../instrument/reveal";
import { emptyLitSeen, litSeenFromActions, litSeenToActions, markLitSeen, readLitSeen, writeLitSeen } from "../instrument/state";

const due: RevealDueInput = {
  profileCreated: true,
  topTalentDone: true,
  seen: emptyLitSeen(),
  seenLoaded: true,
  calm: true,
  playing: false,
};

const memoryStorage = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe("DoD 1 · plays once after profile creation and not again", () => {
  it("is due right after the profile exists, at a calm moment", () => {
    expect(isRevealDue(due)).toBe(true);
  });

  it("is not due without a profile", () => {
    expect(isRevealDue({ ...due, profileCreated: false })).toBe(false);
  });

  it("marking it seen makes it never due again", () => {
    const seen = markRevealSeen(emptyLitSeen());
    expect(hasSeenReveal(seen)).toBe(true);
    expect(isRevealDue({ ...due, seen })).toBe(false);
  });

  it("the once-flag survives a reload (localStorage) and a new device (the save's first_time_actions)", () => {
    const storage = memoryStorage();
    writeLitSeen("player", markRevealSeen(emptyLitSeen()), storage);
    expect(hasSeenReveal(readLitSeen("player", storage))).toBe(true);
    expect(hasSeenReveal(readLitSeen("someone-else", storage))).toBe(false);

    const actions = litSeenToActions(markRevealSeen(emptyLitSeen()));
    expect(actions).toEqual({ instrument_lit_air: true });
    expect(hasSeenReveal(litSeenFromActions({ other_action: true, ...actions }))).toBe(true);
  });

  it("marking is idempotent and keeps other bodies' flags", () => {
    const withFire = markLitSeen(emptyLitSeen(), "fire");
    const once = markRevealSeen(withFire);
    expect(once).toEqual({ fire: true, air: true });
    expect(markRevealSeen(once)).toBe(once);
  });

  it("waits for the saved flag to load, so a returning player on a new device never sees it twice", () => {
    expect(isRevealDue({ ...due, seenLoaded: false })).toBe(false);
  });

  it("never plays while something else plays, or away from a calm moment", () => {
    expect(isRevealDue({ ...due, playing: true })).toBe(false);
    expect(isRevealDue({ ...due, calm: false })).toBe(false);
  });

  it("a body-lit ritual does not consume the reveal: only the air entry does", () => {
    expect(isRevealDue({ ...due, seen: markLitSeen(emptyLitSeen(), "fire") })).toBe(true);
  });
});

describe("DoD 2 · never before the top talent result", () => {
  it("is not due while the top talent result is missing, whatever else is true", () => {
    expect(isRevealDue({ ...due, topTalentDone: false })).toBe(false);
    expect(isRevealDue({ ...due, topTalentDone: false, calm: true, seenLoaded: true, profileCreated: true })).toBe(false);
  });

  it("a fresh profile with nothing done has no top talent result", () => {
    expect(hasTopTalentResult({})).toBe(false);
    expect(hasTopTalentResult({ zogComplete: false, lastZogSnapshotId: null, zoneOfGeniusCompleted: null, journeyStart: false })).toBe(false);
  });

  it("any one of the shell's four signals counts as the result", () => {
    expect(hasTopTalentResult({ zogComplete: true })).toBe(true);
    expect(hasTopTalentResult({ lastZogSnapshotId: "snap-1" })).toBe(true);
    expect(hasTopTalentResult({ zoneOfGeniusCompleted: true })).toBe(true);
    expect(hasTopTalentResult({ journeyStart: true })).toBe(true);
  });

  it("the unmarked reveal becomes due exactly when the result arrives", () => {
    const before = hasTopTalentResult({ journeyStart: false });
    const after = hasTopTalentResult({ journeyStart: true });
    expect(isRevealDue({ ...due, topTalentDone: before })).toBe(false);
    expect(isRevealDue({ ...due, topTalentDone: after })).toBe(true);
  });
});

describe("the sequence (§5.3)", () => {
  it("runs dim, gather, ring, open, one step per tour group, outlines, settle", () => {
    expect(REVEAL_STEPS).toEqual(["dim", "gather", "ring", "open", ...TOUR_GROUPS, "outlines", "settle"]);
  });

  it("Continue walks every step once, in order, and ends after settle", () => {
    const walked: RevealStepId[] = [firstRevealStep()];
    for (let s = nextRevealStep(walked[0]); s; s = nextRevealStep(s)) walked.push(s);
    expect(walked).toEqual([...REVEAL_STEPS]);
    expect(isLastRevealStep("settle")).toBe(true);
    expect(isLastRevealStep("dim")).toBe(false);
    expect(nextRevealStep("settle")).toBeNull();
  });

  it("one line per step, one outline each for the three earthly bodies", () => {
    const keys = REVEAL_STEPS.map(revealLineKey);
    expect(new Set(keys).size).toBe(REVEAL_STEPS.length);
    expect(REVEAL_OUTLINES).toEqual(["fire", "earth", "ether"]);
  });
});

describe("DoD 3 · reduced-motion variant: no drawing, no fade", () => {
  it("turns drawing and fading off, and leaves them on otherwise", () => {
    expect(revealMotion(true)).toEqual({ animate: false, fade: false });
    expect(revealMotion(false)).toEqual({ animate: true, fade: true });
  });
});
