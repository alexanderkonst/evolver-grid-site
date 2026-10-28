import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";

/**
 * placeState — one function that says what state a place (or a room inside one) is in.
 * Design: docs/02-strategy/game_of_being_you.md §14.3 (the lock rule + unlock order)
 * and §14.11 (the five states).
 *
 *   closed  its condition is not met: faded, no ENTER, one line says what opens it
 *   open    condition met, module not done
 *   next    open, and the single next move on the Journey
 *   done    its module reached the Outro / its result is saved
 *   live    something is happening there now (webinar, Mastermind)
 *
 * The state is read from real events in the save file, never from points or XP.
 * Journey order and requirements come from `JOURNEY_MAIN` (src/data/journeySequence.ts);
 * nothing here restates them. Pure and synchronous: callers load the save
 * (`useCharacterSheet`) and pass it in through `placeSaveFromSheet`.
 */

export type PlaceStateName = "closed" | "open" | "next" | "done" | "live";

/**
 * Real events that are not Journey steps. Some have no record in the save yet
 * (`first-sale`, `productize-session`, `founder-academy`, `spectrum-reading`); until a module writes
 * one, the event stays unmet and whatever waits on it stays closed.
 */
export type PlaceEvent =
  | "offer-saved"
  | "first-sale"
  | "productize-session"
  | "founder-academy"
  | "deeper-access"
  | "spectrum-reading";

/** What a place can wait on: a Journey step being done, or a real event. */
export type PlaceRequirement = JourneyItemId | PlaceEvent;

/** «Opens when <event>. Inside: <result>.» — written as data, rendered by `closedLine`. */
export type PlaceClosedLine = {
  /** A clause that completes «Opens when …», e.g. "your mission is saved". */
  event: string;
  /** The transformational result, completing «Inside: …», e.g. "your offer, built from your top talent". */
  inside: string;
};

/** A window in which something happens at the place. ISO timestamps with offset. */
export type PlaceLive = {
  from: string;
  until: string;
  /** «Live now: Webinar, Wed Nov 4.» */
  line: string;
};

export type PlaceRule = {
  /** What opens the place. Absent = always open. */
  opens?: PlaceRequirement;
  /** The line shown while closed. Required for anything that can be closed. */
  closed?: PlaceClosedLine;
  /**
   * What finishing here means. Done once every entry is met. Journey step ids in
   * this list also make the place `next` while that step is the single next move.
   */
  steps?: PlaceRequirement[];
  live?: PlaceLive;
};

/** Anything with a rule: a village place, an Academy room, the Oracle Reading. */
export type PlaceInput = {
  line: string;
  rule: PlaceRule;
};

export type PlaceSave = {
  /** Which requirements are met by real events in the save. Absent = not met. */
  met: Partial<Record<PlaceRequirement, boolean>>;
  now: Date;
};

/** A save with nothing in it: a guest, or a state read before the save has loaded. */
export const emptyPlaceSave = (now: Date = new Date()): PlaceSave => ({ met: {}, now });

/** The part of `useCharacterSheet` this module reads. */
export type PlaceSaveSource = {
  chain: { id: JourneyItemId; done: boolean }[];
  /** An offer / tagline artifact exists in the UBB. */
  offerSaved?: boolean;
};

/**
 * Turn the character sheet into a PlaceSave. Journey steps come straight from the
 * sheet's chain (zog_snapshots, mission, qol_snapshots, user_assets); the offer
 * event comes from the UBB artifacts. There is no sales record yet, so
 * `first-sale` is never met.
 */
export const placeSaveFromSheet = (
  sheet: PlaceSaveSource,
  now: Date = new Date(),
  extra: Partial<Record<PlaceEvent, boolean>> = {},
): PlaceSave => {
  const met: PlaceSave["met"] = { ...extra };
  for (const step of sheet.chain) met[step.id] = step.done;
  if (sheet.offerSaved) {
    met["offer-saved"] = true;
    // Journey step 5 («Build a business») has no completion predicate of its own;
    // a saved offer / tagline is the artifact that finishes it (§14.2 J7).
    met["build-business"] = true;
  }
  return { met, now };
};

/** The single next move on the Journey: first main step not done whose requirements are done. */
export const nextJourneyStep = (save: PlaceSave): JourneyItemId | null => {
  const step = JOURNEY_MAIN.find(
    (item) => !save.met[item.id] && (item.requires ?? []).every((id) => save.met[id]),
  );
  return step ? step.id : null;
};

/** True while `now` falls inside the place's live window. */
export const isLiveNow = (live: PlaceLive | undefined, now: Date): boolean => {
  if (!live) return false;
  const t = now.getTime();
  return t >= Date.parse(live.from) && t < Date.parse(live.until);
};

const isMet = (save: PlaceSave, req: PlaceRequirement) => save.met[req] === true;

export const placeState = (place: PlaceInput, save: PlaceSave): PlaceStateName => {
  const { opens, steps, live } = place.rule;
  if (opens && !isMet(save, opens)) return "closed";
  if (isLiveNow(live, save.now)) return "live";
  if (steps && steps.length > 0 && steps.every((req) => isMet(save, req))) return "done";
  const next = nextJourneyStep(save);
  if (next && steps?.includes(next)) return "next";
  return "open";
};

const trimDot = (s: string) => s.trim().replace(/\.+$/, "");

/** «Opens when <real event>. Inside: <result>.» Empty when the place has no closed line. */
export const closedLine = (place: PlaceInput): string => {
  const c = place.rule.closed;
  if (!c) return "";
  return `Opens when ${trimDot(c.event)}. Inside: ${trimDot(c.inside)}.`;
};

/** The one line to show for a place in a given state. */
export const placeLine = (place: PlaceInput, state: PlaceStateName): string => {
  if (state === "closed") return closedLine(place);
  if (state === "live") return place.rule.live?.line ?? place.line;
  return place.line;
};
