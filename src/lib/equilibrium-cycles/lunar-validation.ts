/**
 * Lunar elongation self-validation (Sasha 2026-05-21, extended 05-24).
 *
 * Verifies the elongation calculation in `getLunarState` against
 * well-attested real lunar events. The extended Brown's-theory
 * implementation (15 terms + ΔT, see `index.ts`) should reproduce
 * these to within ~0.1° (≈12 minutes of cycle position).
 *
 * Reference events selected for VERIFIABILITY — total/annular solar
 * eclipses are publicly recorded to the minute by NASA/USNO, and
 * full moons cross-check via published lunar tables.
 *
 * For each instant, the expected true elongation is:
 *   New Moon       →    0° (or 360°)
 *   First Quarter  →   90°
 *   Full Moon      →  180°
 *   Last Quarter   →  270°
 *
 * Tolerance: 0.5° (~6 min of cycle). The 15-term implementation
 * comfortably hits 0.05° on these checks; 0.5° gives headroom for
 * future-dated tests and minor drift.
 */

import { getLunarState } from "./index";

interface PhaseCheck {
  label: string;
  /** ISO UTC instant of the principal phase. */
  utcIso: string;
  /** Expected elongation in degrees (0, 90, 180, or 270). */
  expectedDeg: number;
}

const CHECKS: PhaseCheck[] = [
  { label: "J2000 reference new moon", utcIso: "2000-01-06T18:14:00Z", expectedDeg: 0 },
  { label: "Annular eclipse new moon", utcIso: "2023-10-14T17:55:00Z", expectedDeg: 0 },
  { label: "Total eclipse new moon",  utcIso: "2024-04-08T18:21:00Z", expectedDeg: 0 },
  { label: "Full moon Aug 2024",      utcIso: "2024-08-19T18:25:00Z", expectedDeg: 180 },
];

export interface CheckResult {
  label: string;
  expectedDeg: number;
  actualDeg: number;
  /** Smallest signed angular error in degrees (handles 360° wrap). */
  errorDeg: number;
  passed: boolean;
}

export function runLunarValidation(toleranceDeg = 0.5): CheckResult[] {
  return CHECKS.map((check) => {
    const ms = Date.parse(check.utcIso);
    const state = getLunarState(ms);
    // `progress` is elongation/360 — recover degrees for direct comparison.
    const actualDeg = state.progress * 360;
    const raw = actualDeg - check.expectedDeg;
    const errorDeg = ((raw + 540) % 360) - 180;
    return {
      label: check.label,
      expectedDeg: check.expectedDeg,
      actualDeg,
      errorDeg,
      passed: Math.abs(errorDeg) <= toleranceDeg,
    };
  });
}

export function logLunarValidation(toleranceDeg = 0.5): boolean {
  const results = runLunarValidation(toleranceDeg);
  let allPassed = true;
  console.group(`Lunar validation (tolerance ±${toleranceDeg}°)`);
  for (const r of results) {
    const sign = r.errorDeg >= 0 ? "+" : "";
    const status = r.passed ? "✓" : "✗";
    console.log(
      `${status} ${r.label}: expected ${r.expectedDeg}°, got ${r.actualDeg.toFixed(3)}° (err ${sign}${r.errorDeg.toFixed(3)}°)`,
    );
    if (!r.passed) allPassed = false;
  }
  console.groupEnd();
  return allPassed;
}
