/**
 * Solar / zodiac validation (Sasha 2026-05-24).
 *
 * Verifies the Sun's true longitude calculation against the four
 * cardinal points of the year: vernal equinox (0°), summer solstice
 * (90°), autumnal equinox (180°), winter solstice (270°). Times are
 * from IMCCE / NASA Marshall Space Flight Center solar data tables,
 * accurate to the minute.
 *
 * Also exercises the zodiac sign assignment derived from Sun's
 * longitude — at each cardinal instant, the correct sign must be
 * the entering one (Aries at vernal equinox, etc.).
 *
 * Tolerance: 0.1° on solar longitude (~3 minutes of zodiac position).
 * The Meeus equation-of-center implementation hits ~0.013° in
 * practice — large headroom.
 */

import { getSolarState, getZodiacState } from "./index";

interface SolarCheck {
  label: string;
  /** ISO UTC instant of the equinox/solstice. */
  utcIso: string;
  /** Expected Sun ecliptic longitude (degrees). */
  expectedLongDeg: number;
  /** Expected zodiac sign at this instant (sign name). */
  expectedSign: string;
}

const CHECKS: SolarCheck[] = [
  {
    label: "Vernal equinox 2024",
    utcIso: "2024-03-20T03:06:00Z",
    expectedLongDeg: 0,
    expectedSign: "Aries",
  },
  {
    label: "Summer solstice 2024",
    utcIso: "2024-06-20T20:51:00Z",
    expectedLongDeg: 90,
    expectedSign: "Cancer",
  },
  {
    label: "Autumnal equinox 2024",
    utcIso: "2024-09-22T12:43:00Z",
    expectedLongDeg: 180,
    expectedSign: "Libra",
  },
  {
    label: "Winter solstice 2024",
    utcIso: "2024-12-21T09:21:00Z",
    expectedLongDeg: 270,
    expectedSign: "Capricorn",
  },
  {
    label: "Vernal equinox 2025",
    utcIso: "2025-03-20T09:01:00Z",
    expectedLongDeg: 0,
    expectedSign: "Aries",
  },
];

export interface SolarCheckResult {
  label: string;
  longitudeError: number;
  signOk: boolean;
  passed: boolean;
}

export function runSolarValidation(toleranceDeg = 0.1): SolarCheckResult[] {
  return CHECKS.map((check) => {
    const ms = Date.parse(check.utcIso);
    // Solar state at this moment — yearProgress is solstice-anchored,
    // so we need to back into the longitude. yearProgress = (long - 270)/360
    // mod 1, so long = (yearProgress * 360 + 270) mod 360.
    const solarState = getSolarState(ms);
    const longitudeDeg = ((solarState.yearProgress * 360 + 270) % 360 + 360) % 360;
    const raw = longitudeDeg - check.expectedLongDeg;
    const errorDeg = ((raw + 540) % 360) - 180;

    // Zodiac assignment check
    const zodiacState = getZodiacState(ms);
    const actualSign = zodiacState.current.sign;
    const signOk = actualSign === check.expectedSign;

    return {
      label: check.label,
      longitudeError: errorDeg,
      signOk,
      passed: Math.abs(errorDeg) <= toleranceDeg && signOk,
    };
  });
}

export function logSolarValidation(toleranceDeg = 0.1): boolean {
  const results = runSolarValidation(toleranceDeg);
  let allPassed = true;
  console.group(`Solar + zodiac validation (tolerance ±${toleranceDeg}°)`);
  for (const r of results) {
    const sign = r.longitudeError >= 0 ? "+" : "";
    const status = r.passed ? "✓" : "✗";
    const signMark = r.signOk ? "" : " [WRONG SIGN]";
    console.log(
      `${status} ${r.label}: longitude err ${sign}${r.longitudeError.toFixed(3)}°${signMark}`,
    );
    if (!r.passed) allPassed = false;
  }
  console.groupEnd();
  return allPassed;
}
