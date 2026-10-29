import type { TFunction } from "i18next";
import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { journeyStepLabel } from "@/lib/journeyLabels";
import { placeName, placeTagline, tr } from "@/lib/villageCopy";

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
 * (`productize-session`, `founder-academy`, `spectrum-reading`); until a module writes
 * one, the event stays unmet and whatever waits on it stays closed.
 *
 * The five real-world victories (WP-11: `webinar` J8, `mastermind` J9, `mastery-practice` J10,
 * `first-price` J11, `first-sale` J12) are read from `journey_victories` through the sheet's `victories`.
 */
export type PlaceEvent =
  | "offer-saved"
  | "webinar"
  | "mastermind"
  | "mastery-practice"
  | "first-price"
  | "first-sale"
  | "productize-session"
  | "founder-academy"
  | "deeper-access"
  | "spectrum-reading"
  /**
   * The matching triad is saved: top talent, mission and assets (T-M-A, §14.13). Derived in
   * `placeSaveFromSheet` from the three Journey steps; QoL is optional and not part of it.
   */
  | "triad"
  /**
   * A signed-out visitor holds a finished Top Talent result on this device (local guest save).
   * Not a Journey step and not an unlock: Your House stays closed until the result is saved to
   * an account (§14.3). It only decides the next move («Save your character», WP-7b).
   */
  | "guest-result";

/** What a place can wait on: a Journey step being done, or a real event. */
export type PlaceRequirement = JourneyItemId | PlaceEvent;

/** «Opens when <event>. Inside: <result>.» — written as data, rendered by `closedLine`. */
export type PlaceClosedLine = {
  /** A clause that completes «Opens when …», e.g. "your mission is saved". */
  event: string;
  /** The transformational result, completing «Inside: …», e.g. "your offer, built from your top talent". */
  inside: string;
  /** i18n key of the whole line («Opens when …. Inside: ….»). Absent = English only. */
  key?: string;
};

/** A window in which something happens at the place. ISO timestamps with offset. */
export type PlaceLive = {
  from: string;
  until: string;
  /** «Live now: Webinar, Wed Nov 4.» */
  line: string;
  /** i18n key of `line`. Absent = English only. */
  key?: string;
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
  /** The place's key (`village.place.<key>.line`); absent = the line is not translated. */
  key?: string;
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

/** The real-world victories (J8–J12, §14.2) a player records themselves, in Journey order. */
export const REAL_WORLD_VICTORIES = ["webinar", "mastermind", "mastery-practice", "first-price", "first-sale"] as const;
export type RealWorldVictory = (typeof REAL_WORLD_VICTORIES)[number];

/** The part of `useCharacterSheet` this module reads. */
export type PlaceSaveSource = {
  chain: { id: JourneyItemId; done: boolean }[];
  /** An offer / tagline artifact exists in the UBB. */
  offerSaved?: boolean;
  /** `journey_victories.step_id` of every victory the player has recorded. */
  victories?: readonly string[];
};

/** The Journey steps that make a person matchable: talent, mission, assets (§14.13). */
const TRIAD_STEPS: JourneyItemId[] = ["find-top-talent", "discover-mission", "map-assets"];

/**
 * Turn the character sheet into a PlaceSave. Journey steps come straight from the
 * sheet's chain (zog_snapshots, mission, qol_snapshots, user_assets); the offer
 * event comes from the UBB artifacts. The real-world events (`first-sale` among them) are
 * met by the player's own recorded victories (WP-11); with none, they are never met.
 */
export const placeSaveFromSheet = (
  sheet: PlaceSaveSource,
  now: Date = new Date(),
  extra: Partial<Record<PlaceEvent, boolean>> = {},
): PlaceSave => {
  const met: PlaceSave["met"] = { ...extra };
  for (const step of sheet.chain) met[step.id] = step.done;
  if (TRIAD_STEPS.every((id) => met[id] === true)) met.triad = true;
  if (sheet.offerSaved) {
    met["offer-saved"] = true;
    // Journey step 5 («Build a business») has no completion predicate of its own;
    // a saved offer / tagline is the artifact that finishes it (§14.2 J7).
    met["build-business"] = true;
  }
  for (const id of REAL_WORLD_VICTORIES) {
    if (sheet.victories?.includes(id)) met[id] = true;
  }
  return { met, now };
};

/**
 * A guest has seen their result but not saved it: the Journey's first step is still undone
 * (it needs the account), yet taking the test is no longer the next move.
 */
export const awaitingSave = (save: PlaceSave): boolean =>
  save.met["guest-result"] === true && save.met["find-top-talent"] !== true;

/**
 * True once the first sale is recorded: Town Hall opens (its rule waits on `first-sale`) and
 * the player's house is the one to light on the map (§14.2 J12, §14.12). The map reads this
 * beside `placeState`; the house's own state is not changed by it.
 */
export const houseLit = (save: PlaceSave): boolean => save.met["first-sale"] === true;

/** The single next move on the Journey: first main step not done whose requirements are done. */
export const nextJourneyStep = (save: PlaceSave): JourneyItemId | null => {
  const step = JOURNEY_MAIN.find(
    (item) => !save.met[item.id] && (item.requires ?? []).every((id) => save.met[id]),
  );
  return step ? step.id : null;
};

/** What a place needs to be offered as the next move or named in «what changed». */
export type MovePlace = PlaceInput & {
  key: string;
  name: string;
  /** Module route behind ENTER. */
  to: string;
  /** The line when it has just opened: «Your House is open.» */
  opened?: string;
};

/**
 * The one next move (§14.6): where to go, what it is, what it gives, and where ENTER leads.
 *   step    the next Journey step, at the place that holds it
 *   live    the Journey is done (or nothing is left in it) and something is live now
 *   quests  nothing else is pending: the Quest Board holds the next quest
 */
export type NextMove<P extends MovePlace = MovePlace> = {
  kind: "step" | "live" | "quests";
  place: P;
  /** The Journey step when `kind` is `step`. */
  step: JourneyItemId | null;
  title: string;
  /** What it gives, completing «… — <result>». */
  result: string;
  to: string;
  /** The step is one the Journey works without. */
  optional: boolean;
};

const QUEST_BOARD = "quest-board";
/** The place that holds the save file; «Save your character» is done at its door (§14.3, WP-7b). */
const SAVE_PLACE = "house";

/** The next move for a guest who has a result and no account. */
export const SAVE_CHARACTER_TITLE = "Save your character";
const SAVE_CHARACTER_RESULT = "you'll keep your character, and Your House opens.";

/** The title shown after the place name on the next-move card; null when it only repeats the name. */
export const moveTitle = (move: Pick<NextMove, "title" | "place">): string | null =>
  move.title.toLowerCase() === move.place.name.toLowerCase() ? null : move.title;

/**
 * The words of a next move in the reader's language: the place's name, the title, and what it
 * gives. `nextMove` builds the English; this reads the same sources through the catalog
 * (`village.*`, `journeySteps.*`). Pass no `t` and you get the English back.
 */
export const nextMoveCopy = (
  move: NextMove,
  t?: TFunction,
): { place: string; title: string; result: string } => {
  const place = placeName(move.place, t);
  if (move.title === SAVE_CHARACTER_TITLE) {
    return {
      place,
      title: tr(t, "village.saveCharacter", move.title),
      result: tr(t, "village.saveResult", move.result),
    };
  }
  if (move.kind === "step") {
    const item = JOURNEY_MAIN.find((i) => i.id === move.step);
    if (item) {
      return {
        place,
        title: journeyStepLabel(item, t),
        result: item.result ? tr(t, `village.result.${item.id}`, item.result) : placeTagline(move.place, t),
      };
    }
  }
  if (move.kind === "live") {
    const live = move.place.rule.live;
    return {
      place,
      title: live ? tr(t, live.key, live.line) : place,
      result: placeTagline(move.place, t),
    };
  }
  return { place, title: move.kind === "quests" ? place : move.title, result: placeTagline(move.place, t) };
};

/**
 * The single next move for this save. The Journey's next step comes first, at the place
 * whose `steps` hold it; with no step left, a place that is live now; else the Quest Board.
 * A place that is closed is never offered. Null only when nothing is open to offer.
 */
export const nextMove = <P extends MovePlace>(places: readonly P[], save: PlaceSave): NextMove<P> | null => {
  const states = new Map(places.map((p) => [p.key, placeState(p, save)] as const));
  const offered = (p: P | undefined): p is P => !!p && states.get(p.key) !== "closed";

  // A guest who finished the test: the next move is to save it. Your House is still closed
  // (the unlock order is untouched); its door is where the save happens.
  if (awaitingSave(save)) {
    const house = places.find((p) => p.key === SAVE_PLACE);
    if (house) {
      return {
        kind: "step",
        place: house,
        step: "find-top-talent",
        title: SAVE_CHARACTER_TITLE,
        result: SAVE_CHARACTER_RESULT,
        to: `/village/${house.key}`,
        optional: false,
      };
    }
  }

  const stepId = nextJourneyStep(save);
  if (stepId) {
    const item = JOURNEY_MAIN.find((i) => i.id === stepId);
    const place = places.find((p) => p.rule.steps?.includes(stepId));
    if (item && offered(place)) {
      return {
        kind: "step",
        place,
        step: stepId,
        title: item.label,
        result: item.result ?? place.line,
        to: item.enter ?? item.path,
        optional: !!item.optional,
      };
    }
  }

  const live = places.find((p) => states.get(p.key) === "live");
  if (live) {
    return {
      kind: "live",
      place: live,
      step: null,
      title: live.rule.live?.line ?? live.name,
      result: live.line,
      to: live.to,
      optional: false,
    };
  }

  const board = places.find((p) => p.key === QUEST_BOARD);
  if (offered(board)) {
    return { kind: "quests", place: board, step: null, title: board.name, result: board.line, to: board.to, optional: false };
  }
  return null;
};

/** Keys of the places that are not closed: the set the village remembers having seen open. */
export const openPlaceKeys = (places: readonly MovePlace[], save: PlaceSave): string[] =>
  places.filter((p) => placeState(p, save) !== "closed").map((p) => p.key);

/**
 * «What changed» (§14.6): the places open now that were not open at the last visit, and the
 * one line that names it. A place with its own `opened` line speaks first (a Workshop and a
 * Café open together on the mission; the Workshop is the Journey's place), else the first
 * new place in map order says «<Name> is open.» Null line when nothing is new.
 */
export const whatChanged = <P extends MovePlace>(
  places: readonly P[],
  seenOpen: ReadonlySet<string>,
  save: PlaceSave,
): { fresh: P[]; line: string | null } => {
  const fresh = places.filter((p) => placeState(p, save) !== "closed" && !seenOpen.has(p.key));
  return { fresh, line: whatChangedLine(fresh) };
};

/**
 * The one «what changed» line for the places that just opened (see `whatChanged`), in the
 * reader's language when a `t` is passed. Null when nothing is new.
 */
export const whatChangedLine = <P extends MovePlace>(fresh: readonly P[], t?: TFunction): string | null => {
  const spoken = fresh.find((p) => p.opened) ?? fresh[0];
  if (!spoken) return null;
  if (spoken.opened) return tr(t, `village.place.${spoken.key}.opened`, spoken.opened);
  return t
    ? String(t("village.opened.default", { name: placeName(spoken, t), defaultValue: "{{name}} is open." }))
    : `${spoken.name} is open.`;
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
  // Awaiting the save, the test is behind the guest: Reception is no longer the next move.
  if (next && steps?.includes(next) && !awaitingSave(save)) return "next";
  return "open";
};

const trimDot = (s: string) => s.trim().replace(/\.+$/, "");

/** «Opens when <real event>. Inside: <result>.» Empty when the place has no closed line. */
export const closedLine = (place: PlaceInput, t?: TFunction): string => {
  const c = place.rule.closed;
  if (!c) return "";
  return tr(t, c.key, `Opens when ${trimDot(c.event)}. Inside: ${trimDot(c.inside)}.`);
};

/** The one line to show for a place in a given state. */
export const placeLine = (place: PlaceInput, state: PlaceStateName, t?: TFunction): string => {
  if (state === "closed") return closedLine(place, t);
  const live = place.rule.live;
  if (state === "live" && live) return tr(t, live.key, live.line);
  return placeTagline(place, t);
};
