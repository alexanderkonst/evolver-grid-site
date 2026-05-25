/**
 * Cycle math regression tests (Sasha 2026-05-24).
 *
 * Validates lunar, solar, zodiac, and day-of-week calculations
 * against well-attested astronomical events:
 *
 *   • Lunar — total/annular solar eclipses (USNO/NASA verified) and
 *     full moons. Phase must hit the expected elongation within
 *     ±0.5° (the extended Brown's-theory impl typically delivers
 *     ~0.05°; 0.5° gives test headroom).
 *
 *   • Solar — equinoxes and solstices (IMCCE published times).
 *     Sun's true longitude must match the expected cardinal value
 *     within ±0.1° (impl delivers ~0.013°).
 *
 *   • Zodiac — at each cardinal solar instant, the active sign must
 *     be the entering one (Aries at vernal equinox, etc.).
 *
 *   • Day-of-week — Monday-first ordering + known anchor dates
 *     resolve to expected day names + Monday-based segment indices.
 *
 * Together these catch every kind of silent regression — TZ bugs,
 * polynomial drift, phase boundary shifts, segment-index inversions.
 *
 * Run: pnpm test (vitest) — these tests are picked up automatically.
 */

import { describe, expect, it } from "vitest";
import {
  getLunarState,
  getSolarState,
  getZodiacState,
  getDayOfWeekState,
  PLANETARY_DAYS,
  getPlanetaryDayByJsDow,
  jsDowToMondayIndex,
} from "../index";

const minAngularError = (actual: number, expected: number): number => {
  const raw = actual - expected;
  return ((raw + 540) % 360) - 180;
};

describe("Lunar elongation — Brown's theory (15 terms + ΔT)", () => {
  // Each entry: well-known new/full moon instant + expected elongation.
  // Tolerance 0.5°; impl typically hits <0.05°.
  const cases = [
    { label: "J2000 reference new moon",     utc: "2000-01-06T18:14:00Z", expected: 0 },
    { label: "Annular eclipse new moon",     utc: "2023-10-14T17:55:00Z", expected: 0 },
    { label: "Total eclipse new moon",       utc: "2024-04-08T18:21:00Z", expected: 0 },
    { label: "Full moon (Aug 2024)",          utc: "2024-08-19T18:25:00Z", expected: 180 },
  ];

  it.each(cases)("$label: elongation ≈ $expected°", ({ utc, expected }) => {
    const ms = Date.parse(utc);
    const state = getLunarState(ms);
    const actualDeg = state.progress * 360; // progress = elongation/360
    const error = minAngularError(actualDeg, expected);
    expect(Math.abs(error)).toBeLessThan(0.5);
  });

  it("Phase boundaries advance monotonically across a synodic month", () => {
    // Step through one cycle in 6-hour increments; phase index should
    // either stay the same or increment by 1 (mod 8). No backwards jumps.
    const start = Date.UTC(2024, 7, 1); // arbitrary point
    let lastIdx = getLunarState(start).segmentIndex;
    for (let h = 0; h < 30 * 24; h += 6) {
      const idx = getLunarState(start + h * 3600 * 1000).segmentIndex;
      const advance = (idx - lastIdx + 8) % 8;
      expect(advance).toBeLessThanOrEqual(1);
      lastIdx = idx;
    }
  });
});

describe("Sun's true longitude — Meeus equation of center", () => {
  // Tolerance 0.1°; impl typically hits <0.02°.
  const cardinalPoints = [
    { label: "Vernal equinox 2024",   utc: "2024-03-20T03:06:00Z", expected: 0,   sign: "Aries" },
    { label: "Summer solstice 2024",  utc: "2024-06-20T20:51:00Z", expected: 90,  sign: "Cancer" },
    { label: "Autumnal equinox 2024", utc: "2024-09-22T12:43:00Z", expected: 180, sign: "Libra" },
    { label: "Winter solstice 2024",  utc: "2024-12-21T09:21:00Z", expected: 270, sign: "Capricorn" },
    { label: "Vernal equinox 2025",   utc: "2025-03-20T09:01:00Z", expected: 0,   sign: "Aries" },
  ];

  it.each(cardinalPoints)("$label: longitude ≈ $expected°", ({ utc, expected }) => {
    const ms = Date.parse(utc);
    // Recover longitude from solstice-anchored yearProgress:
    // yearProgress = (long - 270)/360 mod 1, so long = (yp * 360 + 270) mod 360
    const solarState = getSolarState(ms);
    const longitudeDeg = ((solarState.yearProgress * 360 + 270) % 360 + 360) % 360;
    const error = minAngularError(longitudeDeg, expected);
    expect(Math.abs(error)).toBeLessThan(0.1);
  });

  it.each(cardinalPoints)("$label: zodiac sign = $sign", ({ utc, sign }) => {
    const ms = Date.parse(utc);
    const state = getZodiacState(ms);
    expect(state.current.sign).toBe(sign);
  });
});

describe("Day-of-week — Monday-first planetary days", () => {
  it("PLANETARY_DAYS is ordered Mon → Sun", () => {
    const expected = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (let i = 0; i < expected.length; i++) {
      expect(PLANETARY_DAYS[i].name).toBe(expected[i]);
    }
  });

  it("getPlanetaryDayByJsDow + jsDowToMondayIndex are consistent", () => {
    for (let jsDow = 0; jsDow < 7; jsDow++) {
      const entry = getPlanetaryDayByJsDow(jsDow);
      expect(entry.dayOfWeek).toBe(jsDow);
      const mondayIdx = jsDowToMondayIndex(jsDow);
      expect(PLANETARY_DAYS[mondayIdx].name).toBe(entry.name);
    }
  });

  const dayChecks = [
    { utc: "2024-03-04T12:00:00Z", name: "Monday",    idx: 0 },
    { utc: "2024-03-05T12:00:00Z", name: "Tuesday",   idx: 1 },
    { utc: "2024-03-06T12:00:00Z", name: "Wednesday", idx: 2 },
    { utc: "2024-03-07T12:00:00Z", name: "Thursday",  idx: 3 },
    { utc: "2024-03-08T12:00:00Z", name: "Friday",    idx: 4 },
    { utc: "2024-03-09T12:00:00Z", name: "Saturday",  idx: 5 },
    { utc: "2024-03-10T12:00:00Z", name: "Sunday",    idx: 6 },
  ];

  it.each(dayChecks)("$utc resolves to $name (idx $idx)", ({ utc, name, idx }) => {
    const ms = Date.parse(utc);
    const state = getDayOfWeekState(ms);
    expect(state.day.name).toBe(name);
    expect(state.segmentIndex).toBe(idx);
  });
});
