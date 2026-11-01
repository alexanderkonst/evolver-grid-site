/**
 * Natural Clock · clock 4 — Year = solar battery.
 *
 * The player's solar year runs birthday → next birthday (the same anchor as
 * `getSolarState` in `@/lib/equilibrium-cycles`). The battery is the share of
 * that year still ahead: full right after the birthday, empty on the eve of
 * the next one.
 *
 * Calendar-day arithmetic only (UTC day numbers built from local Y/M/D), so
 * DST and time of day never move a count by a day.
 *
 * Decisions, all reversible:
 *   • Birthday today → `daysToNext` 0, `battery` 1, `isBirthdayToday` true.
 *     The new year has just begun, the battery is freshly full.
 *   • Feb 29 birthdays in a common year fall on Mar 1. This is what
 *     `getSolarState` does (JS `new Date(y, 1, 29)` rolls to Mar 1), so the
 *     clock and the existing Solar bar agree.
 *   • Day-granular: the existing Solar bar is millisecond-granular and can
 *     differ from this battery by under 0.3 %.
 */

const DAY_MS = 86_400_000;

export interface SolarBattery {
  /** Whole days until the next birthday; 0 on the birthday itself. */
  daysToNext: number;
  /** Share of the solar year still ahead, 0…1. 1 on the birthday. */
  battery: number;
  /** Same as `battery`, rounded to a whole percent. */
  percent: number;
  /** Share of the year already lived, 0…1 (1 − battery). Drives the ring. */
  elapsed: number;
  /** Length of the current solar year in days (365 or 366). */
  yearLength: number;
  isBirthdayToday: boolean;
}

/** Parses "YYYY-MM-DD" into parts; null when it is not a real calendar date. */
export function parseBirthdayParts(
  birthday: string | null | undefined,
): { month: number; day: number } | null {
  if (!birthday) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthday.trim());
  if (!m) return null;
  const y = +m[1];
  const month = +m[2];
  const day = +m[3];
  const probe = new Date(Date.UTC(y, month - 1, day));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { month, day };
}

/** UTC day number of the birthday in a given year (Feb 29 rolls to Mar 1). */
const anniversary = (year: number, month: number, day: number): number =>
  Date.UTC(year, month - 1, day) / DAY_MS;

/**
 * @param now      the moment to read (its LOCAL calendar date is used)
 * @param birthday "YYYY-MM-DD"; null / invalid returns null
 */
export function solarBattery(now: Date, birthday: string | null | undefined): SolarBattery | null {
  const parts = parseBirthdayParts(birthday);
  if (!parts) return null;

  const year = now.getFullYear();
  const today = Date.UTC(year, now.getMonth(), now.getDate()) / DAY_MS;

  const thisYear = anniversary(year, parts.month, parts.day);
  // Last birthday on or before today; next birthday on or after today.
  const last = thisYear <= today ? thisYear : anniversary(year - 1, parts.month, parts.day);
  const next = thisYear >= today ? thisYear : anniversary(year + 1, parts.month, parts.day);

  if (thisYear === today) {
    const nextYear = anniversary(year + 1, parts.month, parts.day);
    return {
      daysToNext: 0,
      battery: 1,
      percent: 100,
      elapsed: 0,
      yearLength: nextYear - thisYear,
      isBirthdayToday: true,
    };
  }

  const yearLength = next - last;
  const daysToNext = next - today;
  const battery = daysToNext / yearLength;
  return {
    daysToNext,
    battery,
    percent: Math.round(battery * 100),
    elapsed: 1 - battery,
    yearLength,
    isBirthdayToday: false,
  };
}
