/**
 * Natural Clock · clock 3 — Week = planet.
 *
 * Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn for Sun…Sat. Reuses
 * PLANETARY_DAYS (the same table the Day-of-Week bar reads) and adds one word
 * of energy from `NATURAL_CLOCK_COPY`.
 */

import { PLANETARY_DAYS, getPlanetaryDayByJsDow } from "@/lib/equilibrium-cycles";
import { NATURAL_CLOCK_COPY } from "../equilibriumCopy";

/** U+FE0E asks for the text glyph; ♀ ♂ otherwise render as colour emoji on iOS. */
const TEXT_PRESENTATION = "︎";

export type Planet = keyof typeof NATURAL_CLOCK_COPY.weekWord;

export interface WeekPlanet {
  planet: Planet;
  /** "Thursday". */
  dayName: string;
  /** Text-presentation planet glyph, e.g. "♃". */
  glyph: string;
  /** One word of energy, e.g. "Expand". */
  word: string;
  /** 0 = Monday … 6 = Sunday. */
  mondayIndex: number;
}

const toWeekPlanet = (jsDow: number): WeekPlanet => {
  const day = getPlanetaryDayByJsDow(jsDow);
  const planet = day.planet as Planet;
  return {
    planet,
    dayName: day.name,
    glyph: `${day.symbol}${TEXT_PRESENTATION}`,
    word: NATURAL_CLOCK_COPY.weekWord[planet],
    mondayIndex: jsDow === 0 ? 6 : jsDow - 1,
  };
};

/** The planet of the LOCAL weekday of `date`. */
export function weekPlanet(date: Date): WeekPlanet {
  return toWeekPlanet(date.getDay());
}

/** All seven, Monday first — the ring order. */
export function weekPlanets(): WeekPlanet[] {
  return PLANETARY_DAYS.map((d) => toWeekPlanet(d.dayOfWeek));
}
