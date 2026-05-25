/**
 * Day-of-week sanity check (Sasha 2026-05-24).
 *
 * Day-of-week is a Gregorian-calendar convention, not an
 * astronomical cycle — but the planetary-day mapping (Mon=Moon,
 * Tue=Mars, ...) and the Monday-first ordering are conventions we
 * shouldn't accidentally break.
 *
 * Tests:
 *   • Known anchor dates resolve to expected day names.
 *   • PLANETARY_DAYS array is Monday-first (index 0 = Mon).
 *   • Helpers `getPlanetaryDayByJsDow` + `jsDowToMondayIndex` are
 *     internally consistent.
 *   • segmentIndex returned by getDayOfWeekState is Monday-based
 *     (Mon=0, Sun=6) — used by DAY_OF_WEEK_SEGMENTS rendering.
 */

import {
  getDayOfWeekState,
  PLANETARY_DAYS,
  getPlanetaryDayByJsDow,
  jsDowToMondayIndex,
} from "./index";

interface DowCheck {
  label: string;
  utcIso: string;
  expectedName: string; // Monday / Tuesday / ...
  expectedMondayIdx: number; // 0=Mon, 6=Sun
}

const CHECKS: DowCheck[] = [
  // Sasha's birthday workspace — verified anchor.
  { label: "Reference Monday", utcIso: "2024-03-04T12:00:00Z", expectedName: "Monday",    expectedMondayIdx: 0 },
  { label: "Reference Tuesday",  utcIso: "2024-03-05T12:00:00Z", expectedName: "Tuesday",   expectedMondayIdx: 1 },
  { label: "Reference Wednesday",utcIso: "2024-03-06T12:00:00Z", expectedName: "Wednesday", expectedMondayIdx: 2 },
  { label: "Reference Thursday", utcIso: "2024-03-07T12:00:00Z", expectedName: "Thursday",  expectedMondayIdx: 3 },
  { label: "Reference Friday",   utcIso: "2024-03-08T12:00:00Z", expectedName: "Friday",    expectedMondayIdx: 4 },
  { label: "Reference Saturday", utcIso: "2024-03-09T12:00:00Z", expectedName: "Saturday",  expectedMondayIdx: 5 },
  { label: "Reference Sunday",   utcIso: "2024-03-10T12:00:00Z", expectedName: "Sunday",    expectedMondayIdx: 6 },
];

export interface DowCheckResult {
  label: string;
  expectedName: string;
  actualName: string;
  expectedMondayIdx: number;
  actualMondayIdx: number;
  passed: boolean;
}

export function runDayOfWeekValidation(): DowCheckResult[] {
  return CHECKS.map((check) => {
    const ms = Date.parse(check.utcIso);
    const state = getDayOfWeekState(ms);
    return {
      label: check.label,
      expectedName: check.expectedName,
      actualName: state.day.name,
      expectedMondayIdx: check.expectedMondayIdx,
      actualMondayIdx: state.segmentIndex,
      passed:
        state.day.name === check.expectedName &&
        state.segmentIndex === check.expectedMondayIdx,
    };
  });
}

/** Structural sanity: PLANETARY_DAYS is Monday-first. */
export function checkPlanetaryDaysStructure(): boolean {
  const expectedOrder = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
  ];
  for (let i = 0; i < expectedOrder.length; i++) {
    if (PLANETARY_DAYS[i].name !== expectedOrder[i]) return false;
  }
  // Lookups consistent: getPlanetaryDayByJsDow(JS dow) returns the right
  // entry; jsDowToMondayIndex inverts to the array position.
  for (let jsDow = 0; jsDow < 7; jsDow++) {
    const entry = getPlanetaryDayByJsDow(jsDow);
    if (entry.dayOfWeek !== jsDow) return false;
    const mondayIdx = jsDowToMondayIndex(jsDow);
    if (PLANETARY_DAYS[mondayIdx].name !== entry.name) return false;
  }
  return true;
}

export function logDayOfWeekValidation(): boolean {
  const results = runDayOfWeekValidation();
  const structureOk = checkPlanetaryDaysStructure();
  let allPassed = structureOk;

  console.group("Day-of-week validation");
  console.log(`${structureOk ? "✓" : "✗"} PLANETARY_DAYS structure (Monday-first + lookups)`);
  for (const r of results) {
    const status = r.passed ? "✓" : "✗";
    console.log(
      `${status} ${r.label}: expected ${r.expectedName} (idx ${r.expectedMondayIdx}), got ${r.actualName} (idx ${r.actualMondayIdx})`,
    );
    if (!r.passed) allPassed = false;
  }
  console.groupEnd();
  return allPassed;
}
