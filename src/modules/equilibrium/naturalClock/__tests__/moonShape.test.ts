import { describe, expect, it } from "vitest";
import { REFERENCE_NEW_MOON_UTC_MS, getLunarState } from "@/lib/equilibrium-cycles";
import {
  isWaxing,
  moonIlluminatedFraction,
  moonLitPath,
  moonView,
} from "../moonShape";

const DAY = 86_400_000;

describe("moonIlluminatedFraction / isWaxing", () => {
  it("is 0 at new, ½ at the quarters, 1 at full", () => {
    expect(moonIlluminatedFraction(0)).toBeCloseTo(0, 6);
    expect(moonIlluminatedFraction(0.25)).toBeCloseTo(0.5, 6);
    expect(moonIlluminatedFraction(0.5)).toBeCloseTo(1, 6);
    expect(moonIlluminatedFraction(0.75)).toBeCloseTo(0.5, 6);
  });
  it("waxes until full, then wanes", () => {
    expect(isWaxing(0.1)).toBe(true);
    expect(isWaxing(0.49)).toBe(true);
    expect(isWaxing(0.5)).toBe(false);
    expect(isWaxing(0.9)).toBe(false);
  });
});

describe("moonLitPath", () => {
  it("draws nothing for a new moon and the whole disc for a full moon", () => {
    expect(moonLitPath(0, true)).toBe("");
    expect(moonLitPath(1, true)).toMatch(/^M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0 Z$/);
  });
  it("lights the right side of a waxing crescent", () => {
    // p = 0.1 → lit 9.5 %, terminator half-width 50·0.809 = 40.451
    expect(moonLitPath(moonIlluminatedFraction(0.1), true)).toBe(
      "M 50 0 A 50 50 0 0 1 50 100 A 40.451 50 0 0 0 50 0 Z",
    );
  });
  it("lights the left side of a waning crescent", () => {
    expect(moonLitPath(moonIlluminatedFraction(0.9), false)).toBe(
      "M 50 0 A 50 50 0 0 0 50 100 A 40.451 50 0 0 1 50 0 Z",
    );
  });
  it("bulges the terminator the other way for a gibbous moon", () => {
    expect(moonLitPath(moonIlluminatedFraction(0.4), true)).toBe(
      "M 50 0 A 50 50 0 0 1 50 100 A 40.451 50 0 0 1 50 0 Z",
    );
    expect(moonLitPath(moonIlluminatedFraction(0.6), false)).toBe(
      "M 50 0 A 50 50 0 0 0 50 100 A 40.451 50 0 0 0 50 0 Z",
    );
  });
  it("makes a straight terminator at the quarters", () => {
    expect(moonLitPath(0.5, true)).toBe("M 50 0 A 50 50 0 0 1 50 100 A 0 50 0 0 0 50 0 Z");
  });
  it("honours centre and radius", () => {
    expect(moonLitPath(0.5, true, 10, 20, 30)).toBe("M 20 20 A 10 10 0 0 1 20 40 A 0 10 0 0 0 20 20 Z");
  });
});

describe("moonView — the 8 Equilibrium phases", () => {
  // Row index = astronomical index; columns: clock name, cycle position, next clock name.
  const names: Array<[string, number, string]> = [
    ["Clearing", 3, "Gathering"],
    ["Gathering", 4, "Seeing"],
    ["Seeing", 5, "Prep for Harvest"],
    ["Prep for Harvest", 6, "Harvesting"],
    ["Harvesting", 7, "Celebrating"],
    ["Celebrating", 8, "Planning"],
    ["Planning", 1, "Planting"],
    ["Planting", 2, "Clearing"],
  ];
  const rows: Array<[number, string, number, string]> = names.map(([name, position, next], i) => [
    i,
    name,
    position,
    next,
  ]);

  it.each(rows)(
    "astronomical index %d is %s (position %d), then %s",
    (index, name, position, next) => {
      const view = moonView({ progress: index / 8, segmentIndex: index, daysRemainingInPhase: 2 });
      expect(view.phaseName).toBe(name);
      expect(view.position).toBe(position);
      expect(view.nextPhaseName).toBe(next);
      expect(view.astronomicalIndex).toBe(index);
    },
  );

  it("rounds days to the next phase up, never below 1", () => {
    const base = { progress: 0.3, segmentIndex: 2 };
    expect(moonView({ ...base, daysRemainingInPhase: 0.2 }).daysToNext).toBe(1);
    expect(moonView({ ...base, daysRemainingInPhase: 3 }).daysToNext).toBe(3);
    expect(moonView({ ...base, daysRemainingInPhase: 3.01 }).daysToNext).toBe(4);
  });

  it("reports the lit share as a whole percent", () => {
    const view = moonView({ progress: 0.3, segmentIndex: 2, daysRemainingInPhase: 1 });
    expect(view.illuminationPercent).toBe(65);
    expect(view.waxing).toBe(true);
  });
});

describe("moonView on fixed dates (days after the 2000-01-06 18:14 UTC new moon)", () => {
  // Mid-point of each 45° window, in mean days (3.691 d per phase). The real
  // moon strays at most ~0.5 d from the mean, the window is ±1.85 d wide.
  const cases: Array<[number, string, number]> = [
    [1.85, "Clearing", 0],
    [5.54, "Gathering", 1],
    [9.23, "Seeing", 2],
    [12.92, "Prep for Harvest", 3],
    [16.61, "Harvesting", 4],
    [20.3, "Celebrating", 5],
    [23.99, "Planning", 6],
    [27.68, "Planting", 7],
  ];
  it.each(cases)("day %d is %s", (days, name, index) => {
    const lunar = getLunarState(REFERENCE_NEW_MOON_UTC_MS + days * DAY);
    const view = moonView(lunar);
    expect(view.phaseName).toBe(name);
    expect(view.astronomicalIndex).toBe(index);
    expect(view.daysToNext).toBeGreaterThanOrEqual(1);
    expect(view.daysToNext).toBeLessThanOrEqual(4);
  });

  it("is nearly dark just after the new moon and nearly full at mid-cycle", () => {
    expect(moonView(getLunarState(REFERENCE_NEW_MOON_UTC_MS + 1 * DAY)).illuminationPercent).toBeLessThan(10);
    expect(moonView(getLunarState(REFERENCE_NEW_MOON_UTC_MS + 14.8 * DAY)).illuminationPercent).toBeGreaterThan(95);
  });
});
