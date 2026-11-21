/**
 * streak — the forgiving streak on Your House (spec row A13, issue #368; Sasha 2026-11-21:
 * «стрик используем только где это зеркалит действия в реальном мире»).
 *
 * One REAL act a day extends the streak: today's 5-minute practice, a Journey step, or the
 * reveal's micro-quest, each named by the player in their own words («Day 12: wrote to a client»).
 * Never app opens. Not tied to QoL or any amount. Up to two freezes are held, earned by real acts
 * (every 7th day of a run) and never sold. A freeze covers one missed day.
 *
 * Tone is part of the rule: nothing here reports a «loss». A run that cannot be bridged is
 * `resting`, and the next named act simply begins a new one.
 *
 * PRIVACY: owner-only. The streak shows on the player's own House and nowhere else.
 *
 * Pure: dates are plain `YYYY-MM-DD` strings (the player's local calendar day). No clock, no I/O.
 */

export const STREAK_SOURCES = ["practice", "journey", "micro_quest"] as const;
export type StreakSource = (typeof STREAK_SOURCES)[number];

/** Freezes a player can hold at once. */
export const MAX_FREEZES = 2;
/** A freeze is earned on every Nth day of a run. */
export const FREEZE_EVERY = 7;
/** Longest accepted act text, in characters (mirrors the table's check). */
export const ACT_TEXT_MAX = 140;

export type StreakState = {
  /** The run as it stands today. 0 while `resting` or before the first act. */
  count: number;
  /** Freezes held now (0–2). */
  freezes: number;
  /** The longest run so far, in act days. */
  best: number;
  /** A real act has been named today. */
  actedToday: boolean;
  /** Date of the newest act, if any. */
  lastActDate: string | null;
  /**
   * `none`: no act yet · `active`: the run is alive (today's act, or yesterday's act, or freezes
   * cover the gap) · `resting`: the gap is too long to bridge; the next act begins a new run.
   */
  status: "none" | "active" | "resting";
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** The player's local calendar day as `YYYY-MM-DD`. */
export function localDateKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const dayNumber = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
};

/** Whole calendar days from `a` to `b` (b − a). */
export const daysBetween = (a: string, b: string) => dayNumber(b) - dayNumber(a);

/** The act text as it will be stored: trimmed, inner whitespace collapsed. Null when unusable. */
export function cleanActText(raw: string): string | null {
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length === 0 || text.length > ACT_TEXT_MAX) return null;
  return text;
}

/**
 * Streak and freezes from the dates of the player's named acts.
 *
 * Walking the act days in order: the next day extends the run; a gap of N missed days is covered
 * when N freezes are held (they are spent, the missed days add nothing to the count); otherwise a
 * new run starts at 1, and the freezes still held stay held. Every 7th day of a run earns a
 * freeze, up to two.
 *
 * Duplicate dates count once; malformed dates and dates after `today` are ignored.
 */
export function computeStreak(actDates: readonly string[], today: string): StreakState {
  const days = [...new Set(actDates.filter((d) => DATE_RE.test(d) && d <= today))].sort();

  let run = 0;
  let freezes = 0;
  let best = 0;
  let last: string | null = null;

  for (const day of days) {
    if (last === null) {
      run = 1;
    } else {
      const missed = daysBetween(last, day) - 1;
      if (missed === 0) {
        run += 1;
      } else if (missed <= freezes) {
        freezes -= missed;
        run += 1;
      } else {
        run = 1;
      }
    }
    if (run % FREEZE_EVERY === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
    best = Math.max(best, run);
    last = day;
  }

  if (last === null) {
    return { count: 0, freezes: 0, best: 0, actedToday: false, lastActDate: null, status: "none" };
  }

  const actedToday = last === today;
  const missedSince = daysBetween(last, today) - (actedToday ? 0 : 1);
  const alive = actedToday || missedSince <= freezes;

  return {
    count: alive ? run : 0,
    freezes,
    best,
    actedToday,
    lastActDate: last,
    status: alive ? "active" : "resting",
  };
}
