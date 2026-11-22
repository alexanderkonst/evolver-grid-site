/**
 * Circles v1: the rules that need no database (docs/specs/circles_v1_spec.md).
 *
 * Pure functions only, so the Café list, the circle page, Manage and Who came all read one
 * set of rules: defaults by kind, repeat dates, the "came" window, which join card to show.
 * The data layer is src/lib/circlesApi.ts; the UI copy is src/data/circlesCopy.ts.
 *
 * Rule that runs through all of it: only "came" counts. Nothing here computes a score,
 * a rank, a streak or a view count.
 */
import { getLunarState } from "@/lib/equilibrium-cycles";

export const CIRCLE_KINDS = ["weekly_circle", "mastermind", "practice", "dinner", "gathering"] as const;
export type CircleKind = (typeof CIRCLE_KINDS)[number];

export const REPEAT_RULES = ["never", "weekly", "biweekly", "monthly", "new_moon", "full_moon"] as const;
export type RepeatRule = (typeof REPEAT_RULES)[number];

export type RsvpStatus = "going" | "maybe" | "not_going" | "asked" | "declined";

/** "Village" is shown in the Café ('public' in `events.visibility`); "Link only" is 'private'. */
export type CircleVisibility = "village" | "link";
export const visibilityToColumn = (v: CircleVisibility): string => (v === "link" ? "private" : "public");
export const visibilityFromColumn = (v: string | null | undefined): CircleVisibility =>
  v === "private" ? "link" : "village";

export const LINE_MAX = 200;
/** "Editable for 7 days after the circle; then fixed." (S5) */
export const CAME_WINDOW_DAYS = 7;
/** "We'll put the next 4 meetings in the Café." (S2) */
export const SERIES_LENGTH = 4;
const DEFAULT_DURATION_MIN = 90;

export const isCircleKind = (v: unknown): v is CircleKind =>
  typeof v === "string" && (CIRCLE_KINDS as readonly string[]).includes(v);

/** Old events carry no kind (or none we know): they are plain gatherings. */
export const kindOf = (v: unknown): CircleKind => (isCircleKind(v) ? v : "gathering");

export interface KindDefaults {
  capacity: number | null;
  requiresApproval: boolean;
  repeat: RepeatRule;
}

/** S2 "Defaults by kind" and S7 (Weekly circle: ask to join on, repeats every Sunday). */
export const KIND_DEFAULTS: Record<CircleKind, KindDefaults> = {
  weekly_circle: { capacity: null, requiresApproval: true, repeat: "weekly" },
  mastermind: { capacity: 8, requiresApproval: true, repeat: "weekly" },
  practice: { capacity: null, requiresApproval: false, repeat: "never" },
  dinner: { capacity: 10, requiresApproval: true, repeat: "never" },
  gathering: { capacity: null, requiresApproval: false, repeat: "never" },
};

// ─── dates and zones ───────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as YYYY-MM-DD (not UTC: a player in Mazatlan at 9 PM is still "today"). */
export const toDateString = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parse YYYY-MM-DD as a local noon date (noon stays on the same day across DST shifts). */
export const parseDateString = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
};

export const addDays = (dateStr: string, days: number): string => {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
};

/** "19:00" or "19:00:00" → minutes since midnight. */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (minutes: number): string => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
};

/** S2: start date today, start time the next full hour, end +90 min. */
export function defaultWhen(now: Date = new Date()): { date: string; start: string; end: string } {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  const start = `${pad(next.getHours())}:00`;
  return { date: toDateString(next), start, end: minutesToTime(timeToMinutes(start) + DEFAULT_DURATION_MIN) };
}

/** First date on or after `from` that falls on `weekday` (0 = Sunday). Weekly circle meets on Sunday. */
export function nextWeekday(from: Date, weekday: number): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7));
  return toDateString(d);
}

/** The Monday of the week a date is in (weeks run Monday to Sunday). */
export function mondayOf(dateStr: string): string {
  const d = parseDateString(dateStr);
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return toDateString(d);
}

/**
 * The instant a local wall-clock time happens in an IANA zone. Intl has no "parse in zone",
 * so take the zone's offset at a first guess and correct once (twice for DST edges).
 */
export function zonedInstant(date: string, time: string, timeZone: string | null | undefined): number {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, (mo || 1) - 1, d || 1, h || 0, mi || 0, 0);
  const zone = timeZone || "UTC";
  let guess = wall;
  try {
    for (let i = 0; i < 2; i += 1) {
      guess = wall - zoneOffsetMinutes(guess, zone) * 60000;
    }
  } catch {
    return wall; // unknown zone: treat as UTC
  }
  return guess;
}

/** Offset of `zone` from UTC at an instant, in minutes (Mazatlan = -420). */
export function zoneOffsetMinutes(instant: number, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(instant / 1000) * 1000) / 60000);
}

/** "GMT-7" (short offset). Falls back to the zone name when Intl cannot say. */
export function zoneLabel(timeZone: string | null | undefined, at: number = Date.now()): string {
  const zone = timeZone || "UTC";
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" })
      .formatToParts(new Date(at))
      .find((p) => p.type === "timeZoneName");
    return part?.value ?? zone;
  } catch {
    return zone;
  }
}

/** "GMT-07:00 Mazatlan", the line under "When" in S2. */
export function zoneLongLabel(timeZone: string | null | undefined, at: number = Date.now()): string {
  const zone = timeZone || "UTC";
  const offset = zoneOffsetMinutes(at, zone);
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const city = (zone.split("/").pop() || zone).replace(/_/g, " ");
  return `GMT${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)} ${city}`;
}

/** "7:00 PM" from "19:00" or "19:00:00". English on purpose: circle copy is fixed (spec). */
export function formatClock(time: string): string {
  const mins = timeToMinutes(time);
  const h24 = Math.floor(mins / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${pad(mins % 60)} ${h24 < 12 ? "AM" : "PM"}`;
}

/** "7:00 PM – 8:30 PM GMT-7" (S3). End defaults to start + 90 min. */
export function formatTimeRange(
  start: string,
  end: string | null | undefined,
  timeZone: string | null | undefined,
  date?: string,
): string {
  const endTime = end || minutesToTime(timeToMinutes(start) + DEFAULT_DURATION_MIN);
  const at = date ? zonedInstant(date, start, timeZone) : Date.now();
  return `${formatClock(start)} – ${formatClock(endTime)} ${zoneLabel(timeZone, at)}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Nov 24 · Tuesday" (date rail, S1). */
export function dateRailLabel(dateStr: string): string {
  const d = parseDateString(dateStr);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()} · ${WEEKDAYS[d.getDay()]}`;
}

/** "Tuesday, November 24" (S3). */
export function longDateLabel(dateStr: string): string {
  const d = parseDateString(dateStr);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** { month: "NOV", day: "24" }, the date badge on the circle page. */
export function dateBadge(dateStr: string): { month: string; day: string } {
  const d = parseDateString(dateStr);
  return { month: MONTHS[d.getMonth()].slice(0, 3).toUpperCase(), day: String(d.getDate()) };
}

// ─── moon ──────────────────────────────────────────────────────────────────────

export type MoonMark = "new" | "full" | null;

/**
 * Is this calendar day the day of a new or full moon? Read from the same lunar math as the
 * Equilibrium page (`getLunarState`, client side). One day is one 1/29.53 slice of the cycle,
 * so the day whose noon is within half a day of the instant carries the mark.
 */
export function moonMark(dateStr: string): MoonMark {
  const noon = parseDateString(dateStr).getTime();
  const { progress } = getLunarState(noon);
  const halfDay = 0.5 / 29.530588;
  const fromNew = Math.min(progress, 1 - progress);
  if (fromNew <= halfDay) return "new";
  if (Math.abs(progress - 0.5) <= halfDay) return "full";
  return null;
}

// ─── repeating ─────────────────────────────────────────────────────────────────

function addMonths(dateStr: string, months: number): string {
  const d = parseDateString(dateStr);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return toDateString(d);
}

/**
 * The dates of a series, first meeting included, `count` in total.
 * `new_moon` / `full_moon`: the first meeting is the date picked; the next ones are the
 * following new / full moon days.
 */
export function seriesDates(startDate: string, rule: RepeatRule, count: number = SERIES_LENGTH): string[] {
  if (rule === "never" || count <= 1) return [startDate];
  const dates = [startDate];
  if (rule === "weekly" || rule === "biweekly") {
    const step = rule === "weekly" ? 7 : 14;
    for (let i = 1; i < count; i += 1) dates.push(addDays(startDate, step * i));
  } else if (rule === "monthly") {
    for (let i = 1; i < count; i += 1) dates.push(addMonths(startDate, i));
  } else {
    const want: MoonMark = rule === "new_moon" ? "new" : "full";
    let cursor = startDate;
    for (let guard = 0; dates.length < count && guard < 200; guard += 1) {
      cursor = addDays(cursor, 1);
      if (moonMark(cursor) === want) dates.push(cursor);
    }
  }
  return dates;
}

export function repeatSummary(rule: RepeatRule): string {
  switch (rule) {
    case "weekly":
      return "every week";
    case "biweekly":
      return "every 2 weeks";
    case "monthly":
      return "every month";
    case "new_moon":
      return "every new moon";
    case "full_moon":
      return "every full moon";
    default:
      return "never";
  }
}

// ─── the circle as the screens see it ──────────────────────────────────────────

export interface CircleLike {
  id: string;
  event_date: string;
  event_time: string;
  end_time?: string | null;
  timezone?: string | null;
  capacity?: number | null;
  requires_approval?: boolean | null;
  cancelled_at?: string | null;
  host_id?: string | null;
  created_by?: string | null;
  cohost_id?: string | null;
}

export const hostOf = (c: CircleLike): string | null => c.host_id ?? c.created_by ?? null;
export const isHost = (c: CircleLike, userId: string | null | undefined): boolean =>
  !!userId && hostOf(c) === userId;
export const isCohost = (c: CircleLike, userId: string | null | undefined): boolean =>
  !!userId && c.cohost_id === userId;
/** Host or co-host: can approve, mark came, write to everyone. Only the host hands off or cancels. */
export const canRun = (c: CircleLike, userId: string | null | undefined): boolean =>
  isHost(c, userId) || isCohost(c, userId);

export const startInstant = (c: CircleLike): number => zonedInstant(c.event_date, c.event_time, c.timezone);
export const endInstant = (c: CircleLike): number =>
  zonedInstant(
    c.event_date,
    c.end_time || minutesToTime(timeToMinutes(c.event_time) + DEFAULT_DURATION_MIN),
    c.timezone,
  ) + (c.end_time && timeToMinutes(c.end_time) < timeToMinutes(c.event_time) ? 86400000 : 0);

export const hasEnded = (c: CircleLike, now: number = Date.now()): boolean => now >= endInstant(c);

/** "Mark who came": active from start time until 7 days after (S4, S5). */
export function canMarkCame(c: CircleLike, now: number = Date.now()): boolean {
  if (c.cancelled_at) return false;
  const start = startInstant(c);
  return now >= start && now <= start + CAME_WINDOW_DAYS * 86400000;
}

export type JoinState = "open" | "ask" | "full" | "joined" | "asked" | "declined" | "ended" | "cancelled";

/**
 * Which join card S3 shows. `goingCount` is the number of people going now; the host never
 * gets a join card (they get the "You host this circle." banner instead).
 */
export function joinState(args: {
  circle: CircleLike;
  myStatus: RsvpStatus | null | undefined;
  goingCount: number;
  now?: number;
}): JoinState {
  const { circle, myStatus, goingCount, now = Date.now() } = args;
  if (circle.cancelled_at) return "cancelled";
  if (myStatus === "going") return "joined";
  if (myStatus === "asked") return "asked";
  if (myStatus === "declined") return "declined";
  if (hasEnded(circle, now)) return "ended";
  if (circle.capacity && goingCount >= circle.capacity) return "full";
  return circle.requires_approval ? "ask" : "open";
}

/** The pill on the right of a Café row: Going, Asked or Came (S1). */
export function statusPill(rsvp: { status?: string | null; came?: boolean | null } | null | undefined): "Going" | "Asked" | "Came" | null {
  if (!rsvp) return null;
  if (rsvp.came) return "Came";
  if (rsvp.status === "going") return "Going";
  if (rsvp.status === "asked") return "Asked";
  return null;
}

export const validLine = (body: string): string | null => {
  const trimmed = body.trim();
  return trimmed.length >= 1 && trimmed.length <= LINE_MAX ? trimmed : null;
};

/** Upcoming / Past toggle, written to the URL as `?period=past` (S1). */
export type Period = "upcoming" | "past";
export const periodFromSearch = (search: string): Period =>
  new URLSearchParams(search).get("period") === "past" ? "past" : "upcoming";

/** Split circles into Upcoming (not yet ended, soonest first) and Past (latest first). */
export function splitByPeriod<T extends CircleLike>(circles: T[], period: Period, now: number = Date.now()): T[] {
  const kept = circles.filter((c) => (period === "past" ? hasEnded(c, now) : !hasEnded(c, now)));
  const key = (c: T) => startInstant(c);
  return kept.sort((a, b) => (period === "past" ? key(b) - key(a) : key(a) - key(b)));
}

/** Group already-sorted circles by calendar day, keeping order: the date rail. */
export function groupByDay<T extends CircleLike>(circles: T[]): Array<{ date: string; circles: T[] }> {
  const groups: Array<{ date: string; circles: T[] }> = [];
  for (const c of circles) {
    const last = groups[groups.length - 1];
    if (last && last.date === c.event_date) last.circles.push(c);
    else groups.push({ date: c.event_date, circles: [c] });
  }
  return groups;
}

/** The meetings of a series that have not happened yet, soonest first. */
export function upcomingOfSeries<T extends CircleLike>(meetings: T[], now: number = Date.now()): T[] {
  return meetings
    .filter((m) => !m.cancelled_at && !hasEnded(m, now))
    .sort((a, b) => startInstant(a) - startInstant(b));
}

/**
 * A repeating circle with nobody marked Came across its last 3 ended meetings stops repeating
 * and asks the host "Keep it going?" (§6 Quality). `cameCounts` is came-per-meeting for the
 * ended meetings, most recent last.
 */
export function shouldAskKeepGoing(cameCounts: number[]): boolean {
  if (cameCounts.length < 3) return false;
  return cameCounts.slice(-3).every((n) => n === 0);
}

// ─── the Save Point (S7) ───────────────────────────────────────────────────────

/** Is this meeting a Weekly circle (Monday step, Sunday Save Point)? */
export const isWeekly = (kind: unknown): boolean => kind === "weekly_circle";

/** A step is valid when "My step" and "Done when…" are each one non-empty line of up to 200. */
export function validStep(step: string, doneWhen: string): { step: string; doneWhen: string } | null {
  const s = step.trim();
  const d = doneWhen.trim();
  if (!s || !d || s.length > 200 || d.length > 200 || /\n/.test(s) || /\n/.test(d)) return null;
  return { step: s, doneWhen: d };
}

/** Plain-text inbox bodies. Each carries the circle path so the inbox can link to it. */
export const circlePath = (id: string): string => `/game/meet/${id}`;

const CIRCLE_PATH_RE = /(\/game\/meet\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\/(?:manage|came))?)/g;

/**
 * Split an inbox note into text and circle links. Notes about a circle end with its path
 * (`/game/meet/<id>`), so the inbox can offer one tap into the circle without a new table.
 */
export function splitCircleLinks(body: string): Array<{ text: string; to?: string }> {
  const parts = body.split(CIRCLE_PATH_RE);
  return parts
    .map((text, i) => (i % 2 === 1 ? { text: "Open the circle", to: text } : { text }))
    .filter((part) => part.text !== "");
}

/** The note without its circle path, for one-line previews. */
export const stripCircleLinks = (body: string): string => body.replace(CIRCLE_PATH_RE, "").replace(/\s+$/, "");
