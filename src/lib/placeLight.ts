import type { PlaceInput, PlaceSave, PlaceStateName } from "@/lib/placeState";

/**
 * Window light = place state (village-as-dashboard step 3, Sasha 2026-11-03).
 *
 * The village map reads as a dashboard: a building's windows glow brighter where the place
 * holds something for the player now, and stay dark where it is locked. Read only from the
 * save that already drives `placeState` and «what changed»; nothing is invented.
 *
 *   dark    closed: not open yet
 *   quiet   open with nothing waiting (no step of its own, or all of them done)
 *   lit     open, and a step of this place is still unfinished
 *   bright  the next move is here, something is live here now, or it opened since the last visit
 */
export type PlaceLight = "dark" | "quiet" | "lit" | "bright";

export const placeLight = (
  place: PlaceInput,
  state: PlaceStateName,
  save: PlaceSave,
  opts: { isNew?: boolean; houseLit?: boolean } = {},
): PlaceLight => {
  if (state === "closed") return "dark";
  if (state === "next" || state === "live" || opts.isNew || opts.houseLit) return "bright";
  const steps = place.rule.steps ?? [];
  if (state === "open" && steps.some((req) => save.met[req] !== true)) return "lit";
  return "quiet";
};

/** The tiny signal word beside a building, or null when the state word already says it. */
export const placeSignalKey = (light: PlaceLight, state: PlaceStateName): "unfinished" | null =>
  light === "lit" && state === "open" ? "unfinished" : null;
