import i18n from "i18next";
import type { TFunction } from "i18next";

/**
 * Neutral moon-phase DISPLAY names (spec: docs/specs/equilibrium/biologic_clock_rings_spec.md, Rings v7 item 7).
 *
 * The engine keeps the astronomical names (`MOON_PHASES[i].name`: "Waxing Gibbous", "Last Quarter", …) as
 * internal keys: lookups, localStorage, stored values and the edge functions all use them. Everything a
 * player READS goes through `moonPhaseName`, which gives the neutral name in the active language
 * (catalog keys `moonPhase.0` … `moonPhase.7` in en / ru / es).
 *
 * Index = astronomical index, as in `MOON_PHASES` and `MoonOrb` (0 New Moon … 7 Waning Crescent).
 */
export const MOON_PHASE_DISPLAY_EN = [
  "New Moon",
  "Growing Crescent",
  "Growing Half",
  "Almost Full",
  "Full Moon",
  "Past Full",
  "Fading Half",
  "Fading Crescent",
] as const;

/** The engine's astronomical names, in `MOON_PHASES` order: the internal keys, never shown. */
const ASTRONOMICAL_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

/** Astronomical index (0–7) of an engine phase name; -1 when it is not one. */
export const moonPhaseIndexOf = (astronomicalName: string): number =>
  (ASTRONOMICAL_NAMES as readonly string[]).indexOf(astronomicalName);

/**
 * The neutral display name of a phase, from its astronomical index or its engine name.
 * `t` is the component's translator; without it the global i18next instance is used (PDF, helpers),
 * and plain English when that is not initialised (tests of pure modules).
 */
export const moonPhaseName = (phase: number | string, t?: TFunction): string => {
  const index = typeof phase === "number" ? ((phase % 8) + 8) % 8 : moonPhaseIndexOf(phase);
  if (index < 0) return String(phase); // not an engine name: show it as it is
  const english = MOON_PHASE_DISPLAY_EN[index];
  const translate = t ?? (i18n.isInitialized ? (i18n.t.bind(i18n) as TFunction) : null);
  return translate ? String(translate(`moonPhase.${index}`, { defaultValue: english })) : english;
};
