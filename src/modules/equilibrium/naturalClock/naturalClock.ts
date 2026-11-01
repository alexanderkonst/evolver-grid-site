/**
 * Natural Clock — the four clocks in one object.
 *
 * Pure: give it a moment, a place and (optionally) a birthday, get back
 * everything the strip and the full face draw. No React, no I/O.
 */

import { getLunarState } from "@/lib/equilibrium-cycles";
import { getLight, skyPalette, type GeoPoint, type LightReading, type SkyPalette } from "./sunLight";
import { moonView, type MoonView } from "./moonShape";
import { weekPlanet, type WeekPlanet } from "./weekPlanet";
import { solarBattery, type SolarBattery } from "./solarBattery";
import { NATURAL_CLOCK_COPY } from "../equilibriumCopy";

export interface NaturalClockInput {
  now: Date;
  geo: GeoPoint;
  /** "YYYY-MM-DD" or null. */
  birthday: string | null;
}

export interface NaturalClockState {
  now: Date;
  geo: GeoPoint;
  light: LightReading;
  sky: SkyPalette;
  moon: MoonView;
  week: WeekPlanet;
  /** Null until a valid birthday is known. */
  year: SolarBattery | null;
  /** "20 days to your new year", "Your new year begins today", or null. */
  yearLine: string | null;
  /** The four readings joined, without the lead-in: "Golden hour · Seeing, 3d · …". */
  summary: string;
  /** The one-line "You are here" sentence: lead-in + summary. */
  sentence: string;
}

export function yearLine(year: SolarBattery | null): string | null {
  if (!year) return null;
  if (year.isBirthdayToday) return NATURAL_CLOCK_COPY.birthdayToday;
  return `${year.daysToNext} ${year.daysToNext === 1 ? "day" : "days"} to your new year`;
}

export function computeNaturalClock({ now, geo, birthday }: NaturalClockInput): NaturalClockState {
  const ms = now.getTime();
  const light = getLight(ms, geo.lat, geo.lon);
  const moon = moonView(getLunarState(ms));
  const week = weekPlanet(now);
  const year = solarBattery(now, birthday);
  const line = yearLine(year);

  const parts = [
    light.state,
    `${moon.phaseName}, ${moon.daysToNext}d`,
    `${week.dayName}, ${week.word.toLowerCase()}`,
    line,
  ].filter((p): p is string => Boolean(p));
  const summary = parts.join(" · ");

  return {
    now,
    geo,
    light,
    sky: skyPalette(light.altitudeDeg),
    moon,
    week,
    year,
    yearLine: line,
    summary,
    sentence: `${NATURAL_CLOCK_COPY.youAreHere}: ${summary}`,
  };
}
