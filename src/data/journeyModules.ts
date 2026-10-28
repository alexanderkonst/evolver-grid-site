/**
 * Journey modules in the module form (WP-5): the words on each module's Intro and Outro.
 * Design: docs/02-strategy/game_of_being_you.md §14.4 (Intro → one button → result → Outro),
 * §14.12 (the result is the badge).
 *
 * One entry per Journey step that is built today (J1, J2, J4, J5). The UBB slices, webinar,
 * Mastermind and Quest Board add their entries with WP-9/10/11. Order, requirements and the
 * closed line come from `JOURNEY_MAIN` (src/data/journeySequence.ts); nothing here restates
 * them. The place a module lives in comes from VILLAGE_PLACES (src/data/villagePlaces.ts).
 *
 * Copy rules (§14.1, §14.3): the headline IS the module's Master Result; the button is the
 * result as a verb, never «Continue»; no barrier words (lock, gate, unlock, coming soon).
 */

import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { placeState, type PlaceSave, type PlaceStateName } from "@/lib/placeState";
import type { VillagePlaceKey } from "@/data/villagePlaces";

export type JourneyModuleDef = {
  /** The Journey step this module completes; the key of its victory row. */
  id: JourneyItemId;
  /** Where it lives in the village (scene image, particle place). */
  place: VillagePlaceKey;
  /** Intro eyebrow: where you are. */
  eyebrow: string;
  /** Intro headline: the module's Master Result (workflow §1.1). */
  headline: string;
  /** 1–2 lines on what will happen. */
  silhouette: string;
  /** The one button: the result as a verb. */
  verb: string;
  /** Where the module itself starts. */
  startPath: string;
  outro: {
    /** «Done · …» eyebrow. */
    done: string;
    /** Names the badge. The result itself is the badge's body (§14.12). */
    badge: string;
    /** Where the result lives, as a sentence, and the route behind it. */
    livesIn: { text: string; to: string };
    /** What opened or brightened in the village (no barrier words). */
    opened: string;
    /** Shown when the result cannot be read from the save yet. */
    fallbackResult: string;
  };
};

export const JOURNEY_MODULES: JourneyModuleDef[] = [
  {
    id: "find-top-talent",
    place: "reception",
    eyebrow: "Reception · Step 1",
    headline: "Discover your top talent",
    silhouette: "A short test of what you do best. It ends with the talent that is yours, in your own colors.",
    verb: "Find my top talent",
    startPath: "/zone-of-genius/entry",
    outro: {
      done: "Done · Your top talent is saved",
      badge: "Top Talent",
      livesIn: { text: "It lives in Your House, on the shelf of your victories.", to: "/game/me/overview" },
      opened: "Your House, the Quest Board and the Oracle are open.",
      fallbackResult: "Your top talent",
    },
  },
  {
    id: "discover-mission",
    place: "house",
    eyebrow: "Your House · Step 2",
    headline: "Discover your mission",
    silhouette: "Paste one answer from your own AI. You leave with one sentence about what is yours to do in the world.",
    verb: "Find my mission",
    startPath: "/mission-discovery",
    outro: {
      done: "Done · Your mission is saved",
      badge: "Mission",
      livesIn: { text: "It lives in Your House, and it is the banner over your stall.", to: "/game/me/mission" },
      opened: "The Café, the Workshop, the quality-of-life map and your assets are open.",
      fallbackResult: "Your mission",
    },
  },
  {
    id: "assess-qol",
    place: "house",
    eyebrow: "Your House · Step 3",
    headline: "Know your real level",
    silhouette: "Eight areas of life, answered honestly. The result is private: only you see it.",
    verb: "Show my level",
    startPath: "/quality-of-life-map/assessment",
    outro: {
      done: "Done · Your level is saved",
      badge: "Real Level",
      livesIn: { text: "It lives in Your House. It is private to you.", to: "/game/me/quality-of-life" },
      opened: "Your House now shows your level, privately, and where to grow next.",
      fallbackResult: "Your level",
    },
  },
  {
    id: "map-assets",
    place: "house",
    eyebrow: "Your House · Step 4",
    headline: "Map everything you can build with",
    silhouette: "Your skills, experience and network, gathered once into one inventory.",
    verb: "Map my assets",
    startPath: "/asset-mapping",
    outro: {
      done: "Done · Your assets are saved",
      badge: "Inventory",
      livesIn: { text: "They live in Your House, and they are the shelves of your stall.", to: "/game/me/assets" },
      opened: "The Workshop's first job is open: your offer, built from these.",
      fallbackResult: "Your assets",
    },
  },
];

export const getJourneyModule = (id: string | undefined): JourneyModuleDef | undefined =>
  JOURNEY_MODULES.find((m) => m.id === id);

/**
 * The Intro's place state: `closed` while a required earlier step is not done (with the
 * «Opens when… Inside:…» line from `lockedHint`), `done` once the step is, `next` when it is
 * the single next move, otherwise `open`. Pure; the caller passes the save
 * (`placeSaveFromSheet`).
 */
export const moduleIntroState = (id: JourneyItemId, save: PlaceSave): PlaceStateName => {
  const item = JOURNEY_MAIN.find((i) => i.id === id);
  const requires = item?.requires ?? [];
  const closedFirst = requires.find((req) => save.met[req] !== true);
  return placeState(
    {
      line: "",
      rule: {
        opens: closedFirst,
        steps: [id],
      },
    },
    save,
  );
};

/** True when the step waits on an earlier one, so its state depends on the save. */
export const moduleHasRequirements = (id: JourneyItemId): boolean =>
  (JOURNEY_MAIN.find((i) => i.id === id)?.requires ?? []).length > 0;

/** The closed line of a Journey step: «Opens when … Inside: ….» Empty when it has none. */
export const moduleClosedLine = (id: JourneyItemId): string =>
  JOURNEY_MAIN.find((i) => i.id === id)?.lockedHint ?? "";

/** The part of the character sheet the Outro reads its result from. */
export type ModuleResultSource = {
  topTalent: string | null;
  missionTitle: string | null;
  qol: { level: number } | null;
  assets: { count: number; top: { title: string }[] };
};

/** «12 assets mapped». */
export const assetsResultText = (count: number): string | null =>
  count > 0 ? `${count} ${count === 1 ? "asset" : "assets"} mapped` : null;

/** «Level 4 of 10»: the weakest of the eight QoL domains, as Your House shows it. */
export const qolResultText = (level: number): string => `Level ${level} of 10`;

/**
 * The step's result in the player's own words, read from the save (the same data Your House
 * shows). Null until the step has one; the Outro then falls back to `outro.fallbackResult`.
 * A module that holds the fresh result in hand (a just-typed mission) passes it to the
 * Outro directly, which wins over this.
 */
export const moduleResultText = (id: JourneyItemId, sheet: ModuleResultSource): string | null => {
  switch (id) {
    case "find-top-talent":
      return sheet.topTalent?.trim() || null;
    case "discover-mission":
      return sheet.missionTitle?.trim() || null;
    case "assess-qol":
      return sheet.qol ? qolResultText(sheet.qol.level) : null;
    case "map-assets":
      return assetsResultText(sheet.assets.count);
    default:
      return null;
  }
};

export const RATING_MIN = 1;
export const RATING_MAX = 10;

/** True for a whole number from 1 to 10: the only ratings the database accepts. */
export const isValidRating = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= RATING_MIN && n <= RATING_MAX;
