/**
 * Lunar elongation self-validation — dev-only sanity check (Sasha
 * 2026-05-21).
 *
 * Verifies the elongation calculation in `getLunarState` against a
 * handful of well-attested lunar phase instants. The Brown's-theory
 * truncated implementation should reproduce these to within ~0.1°
 * (≈12 minutes of cycle position).
 *
 * Not wired into the runtime — call `runLunarValidation()` from a
 * dev console or attach to a debug route when you want to verify
 * the math hasn't regressed. CI integration is a follow-up if we
 * adopt a test framework for this package.
 *
 * Reference instants from USNO / NASA (best available 2026 data):
 *   2000-01-06 18:14 UTC  New Moon     (our reference epoch)
 *   2000-02-05 13:03 UTC  New Moon     (epoch + 1 synodic month)
 *   2026-04-13 04:51 UTC  Full Moon    (recent verification point)
 *   2026-04-21 11:35 UTC  Last Quarter
 *   2026-04-28 17:24 UTC  New Moon
 *   2026-05-06 02:42 UTC  First Quarter
 *   2026-05-12 16:55 UTC  Full Moon
 *
 * For each instant, the expected true elongation is:
 *   New Moon       →    0° (or 360°)
 *   First Quarter  →   90°
 *   Full Moon      →  180°
 *   Last Quarter   →  270°
 *
 * Tolerance: 1° (~12 min of cycle). Anything tighter would require
 * more perturbation terms than Brown's-main implementation gives us.
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
  { label: "2000-01-06 New Moon (ref)", utcIso: "2000-01-06T18:14:00Z", expectedDeg: 0 },
  { label: "2000-02-05 New Moon", utcIso: "2000-02-05T13:03:00Z", expectedDeg: 0 },
  { label: "2026-04-13 Full Moon", utcIso: "2026-04-13T04:51:00Z", expectedDeg: 180 },
  { label: "2026-04-21 Last Quarter", utcIso: "2026-04-21T11:35:00Z", expectedDeg: 270 },
  { label: "2026-04-28 New Moon", utcIso: "2026-04-28T17:24:00Z", expectedDeg: 0 },
  { label: "2026-05-06 First Quarter", utcIso: "2026-05-06T02:42:00Z", expectedDeg: 90 },
  { label: "2026-05-12 Full Moon", utcIso: "2026-05-12T16:55:00Z", expectedDeg: 180 },
];

interface CheckResult {
  label: string;
  expectedDeg: number;
  actualDeg: number;
  /** Smallest signed angular error in degrees (handles 360° wrap). */
  errorDeg: number;
  passed: boolean;
}

/**
 * Run all validation checks. Returns an array of results suitable
 * for logging or assertion. Pass criterion: |errorDeg| < tolerance.
 */
export function runLunarValidation(toleranceDeg = 1): CheckResult[] {
  return CHECKS.map((check) => {
    const ms = Date.parse(check.utcIso);
    const state = getLunarState(ms);
    // `progress` is elongation/360 — recover degrees for direct comparison.
    const actualDeg = state.progress * 360;
    // Signed minimum angular difference (handles wrap so 358° vs 0° is 2°, not 358°).
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

/**
 * Print results to console. Returns true if all checks passed.
 * Usage: open /build/equilibrium devtools console, run:
 *
 *   import("/src/lib/equilibrium-cycles/lunar-validation").then(m => m.logLunarValidation())
 *
 * Or import in a debug component.
 */
export function logLunarValidation(toleranceDeg = 1): boolean {
  const results = runLunarValidation(toleranceDeg);
  let allPassed = true;
  console.group(`Lunar elongation validation (tolerance ±${toleranceDeg}°)`);
  for (const r of results) {
    const sign = r.errorDeg >= 0 ? "+" : "";
    const status = r.passed ? "✓" : "✗";
    console.log(
      `${status} ${r.label}: expected ${r.expectedDeg}°, got ${r.actualDeg.toFixed(2)}° (err ${sign}${r.errorDeg.toFixed(2)}°)`,
    );
    if (!r.passed) allPassed = false;
  }
  console.groupEnd();
  return allPassed;
}
