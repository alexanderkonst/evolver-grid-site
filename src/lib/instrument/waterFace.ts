/**
 * The water face's data, as pure functions (architecture §6, SoW WP3): the moon phase, the day of the
 * lunar cycle, the next FMF, the next Café gathering and "this cycle" changes. The component
 * `faces/WaterFace.tsx` only paints what `buildWaterItems` returns, so the rules (at most three items,
 * which ones, where each button goes) are testable without a DOM.
 *
 * Nothing here computes a second moon: the phase and the day come from `getLunarState`, the same math
 * the village sky, the Equilibrium page and the glyph's ring read.
 */
import { getLunarState } from "@/lib/equilibrium-cycles";
import { FMF_PAGE_PATH, nextFmfDates, fmfLiveWindows } from "@/data/fmfSession";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { endInstant, startInstant, type CircleLike } from "@/lib/circles";

/** The face never shows more than this many items (architecture §6: "at most three items"). */
export const MAX_WATER_ITEMS = 3;
/** The changes item is one item; its lines stay few so the face reads in three seconds. */
export const MAX_CHANGE_LINES = 2;

/** Where the buttons hand the player back to: the two places of the water quarter this face speaks for. */
export const FMF_ROUTE = FMF_PAGE_PATH;
export const CAFE_ROUTE: string = VILLAGE_PLACES.find((p) => p.key === "cafe")?.to ?? "/game/meet";

export type CycleToday = {
  /** 0 = New Moon … 7 = Waning Crescent: the app's eight 45° windows (`MOON_PHASES`). */
  segmentIndex: number;
  /** Day of the lunar cycle, 1 (the day the moon is new) … 30. */
  day: number;
  /** Position in the cycle, 0 (new) … 1 (next new); what `moonLitPolygon` draws. */
  cycle: number;
};

/** Phase and day of the lunar cycle at an instant. Whole days: the day counts from 1, as a calendar does. */
export const cycleToday = (now: Date | number = Date.now()): CycleToday => {
  const lunar = getLunarState(typeof now === "number" ? now : now.getTime());
  return {
    segmentIndex: lunar.segmentIndex,
    day: Math.min(30, Math.floor(lunar.day) + 1),
    cycle: lunar.progress,
  };
};

export type Gathering = {
  id: string;
  title: string;
  /** YYYY-MM-DD, in the gathering's own time zone. */
  date: string;
  /** HH:MM. */
  time: string;
  timezone: string | null;
};

/** The shape of a Café row this face needs (a subset of `Circle`). */
export type CafeRow = CircleLike & { title: string };

/**
 * The next Café gathering that has not ended yet, by start time. A cancelled row never counts.
 * FMF is its own item, so a `mastermind` row is skipped here rather than shown twice.
 */
export const nextGathering = (rows: readonly CafeRow[], now: Date | number = Date.now()): Gathering | null => {
  const ms = typeof now === "number" ? now : now.getTime();
  const upcoming = rows
    .filter((r) => !r.cancelled_at && r.kind !== "mastermind" && endInstant(r) > ms)
    .sort((a, b) => startInstant(a) - startInstant(b));
  const next = upcoming[0];
  return next
    ? { id: next.id, title: next.title, date: next.event_date, time: next.event_time, timezone: next.timezone ?? null }
    : null;
};

export type FmfNext = { monday: string; wednesday: string; live: boolean };

/** The next FMF (or the one running now), from the single source `src/data/fmfSession.ts`. */
export const fmfNext = (now: Date | number = Date.now()): FmfNext => {
  const at = new Date(typeof now === "number" ? now : now.getTime());
  const dates = nextFmfDates(at);
  const w = fmfLiveWindows().find((x) => x.from.slice(0, 10) === dates.monday);
  const t = at.getTime();
  const live = !!w && t >= Date.parse(w.from) && t < Date.parse(w.until);
  return { monday: dates.monday, wednesday: dates.wednesday, live };
};

/**
 * "This cycle" changes: the line of what changed since the player was here. Phase 6 (#451, WP6) writes
 * these into Your House; until that data exists there is nothing to read, so this returns an empty list
 * and the item stays hidden. WP6 fills this one function; the face and the item rules do not change.
 */
export const readCycleChanges = (): string[] => [];

export type WaterItem =
  | ({ kind: "moon" } & CycleToday)
  | ({ kind: "fmf" } & FmfNext)
  | { kind: "gathering"; gathering: Gathering | null }
  | { kind: "changes"; lines: string[] };

/**
 * The items on the face, most important first, never more than `MAX_WATER_ITEMS`:
 *  1. the moon: phase and day (the clock),
 *  2. the next FMF,
 *  3. "this cycle" changes when there are any (a clock never stands without its memory, architecture §9),
 *     otherwise the next Café gathering.
 * With changes present the Café gathering waits for a cycle with fewer changes: three items is the law.
 */
export const buildWaterItems = ({
  now,
  gathering,
  changes,
}: {
  now: Date | number;
  gathering: Gathering | null;
  changes: readonly string[];
}): WaterItem[] => {
  const items: WaterItem[] = [{ kind: "moon", ...cycleToday(now) }, { kind: "fmf", ...fmfNext(now) }];
  items.push(changes.length > 0 ? { kind: "changes", lines: changes.slice(0, MAX_CHANGE_LINES) } : { kind: "gathering", gathering });
  return items.slice(0, MAX_WATER_ITEMS);
};

/** Where an item's button goes; the moon and the changes lines have none (they are read, not visited). */
export const itemRoute = (item: WaterItem): string | null => {
  if (item.kind === "fmf") return FMF_ROUTE;
  if (item.kind === "gathering") return CAFE_ROUTE;
  return null;
};
