/**
 * lunarWorld — how the player's color reaches the Lunar skin.
 * Design: docs/02-strategy/game_of_being_you.md §14.11 (color enters as you play).
 *
 * Lunar paints the world in silver. Two things come from the player, and both
 * travel as CSS custom properties on <html>, so no screen needs to know about
 * them:
 *
 *   --soul-1 / --soul-2 / --soul-3   the player's soul colors, dominant first.
 *       Places in state `done` / `live` take them; so do earned badges and the
 *       assembled stall (§14.12). Until Spectrum Reading exists these are the
 *       colors of the top talent archetype (see useSoulColors).
 *   --lunar-dawn                     0 → 1, the sky moving from deep night
 *       toward pre-dawn as the Journey fills. A CSS input only: it is never
 *       shown as a number, a bar or a count.
 *
 * The values are cached in localStorage so every screen can paint them
 * immediately, without querying the save. Village keeps the cache fresh.
 */

import { JOURNEY_MAIN } from "@/data/journeySequence";
import type { VillagePlaceKey } from "@/data/villagePlaces";
import type { PlaceSave, PlaceStateName } from "@/lib/placeState";

const CACHE_KEY = "lunar-world";

export type LunarWorld = {
  /** Soul colors, dominant first; null until the player has any. */
  soul: [string, string, string] | null;
  /** 0 (deep night) … 1 (first light). */
  dawn: number;
};

const EMPTY: LunarWorld = { soul: null, dawn: 0 };

const SOUL_VARS = ["--soul-1", "--soul-2", "--soul-3"] as const;

/**
 * Share of the Journey that is done, as the sky's progress. Read from the same
 * `PlaceSave` that `placeState()` reads (so a saved offer finishes its step here
 * too), and never a count on screen. Clamped to 0…1.
 */
export const dawnFromSave = (save: PlaceSave): number => {
  if (JOURNEY_MAIN.length === 0) return 0;
  const done = JOURNEY_MAIN.filter((item) => save.met[item.id] === true).length;
  return Math.min(1, Math.max(0, done / JOURNEY_MAIN.length));
};

/**
 * The paths of the map, by place key (the Journey and unlock order, §14.2 / §14.3):
 * Reception → Your House → Workshop → Market → Town Hall. A path lights when both
 * of its places are `done` or `live` (§14.11 step 3).
 */
export const LUNAR_PATHS: ReadonlyArray<readonly [VillagePlaceKey, VillagePlaceKey]> = [
  ["reception", "house"],
  ["house", "workshop"],
  ["workshop", "market"],
  ["market", "town-hall"],
];

/** The two states in which Lunar paints a place in the player's color. */
export const isColored = (state: PlaceStateName | undefined): boolean => state === "done" || state === "live";

export const readLunarWorld = (): LunarWorld => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<LunarWorld>;
    const soul =
      Array.isArray(parsed.soul) && parsed.soul.length === 3 && parsed.soul.every((c) => typeof c === "string")
        ? (parsed.soul as [string, string, string])
        : null;
    const dawn = typeof parsed.dawn === "number" ? Math.min(1, Math.max(0, parsed.dawn)) : 0;
    return { soul, dawn };
  } catch {
    return EMPTY;
  }
};

export const writeLunarWorld = (world: LunarWorld) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(world));
  } catch {
    // Private mode / quota: the cache only saves a round trip, ignore.
  }
};

/** Sets or clears the CSS custom properties on <html>. */
export const applyLunarWorld = (world: LunarWorld) => {
  if (typeof document === "undefined") return;
  const style = document.documentElement.style;
  SOUL_VARS.forEach((name, i) => {
    if (world.soul) style.setProperty(name, world.soul[i]);
    else style.removeProperty(name);
  });
  style.setProperty("--lunar-dawn", world.dawn.toFixed(3));
};

/** Removes everything applyLunarWorld set (leaving Lunar for another skin). */
export const clearLunarWorld = () => {
  if (typeof document === "undefined") return;
  const style = document.documentElement.style;
  SOUL_VARS.forEach((name) => style.removeProperty(name));
  style.removeProperty("--lunar-dawn");
};
