/**
 * Journey modules in the module form (WP-5): the words on each module's Intro and Outro.
 * Design: docs/02-strategy/game_of_being_you.md §14.4 (Intro → one button → result → Outro),
 * §14.12 (the result is the badge).
 *
 * One entry per Journey step that is built today (J1, J2, J4, J5, and the two Workshop slices
 * J6, J7 of WP-9) and the three real-world quests of the Quest Board (J10–J12, WP-11).
 * Webinar and Mastermind add their entries with WP-10. Order,
 * requirements and the closed line come from `JOURNEY_MAIN` (src/data/journeySequence.ts);
 * nothing here restates them. The place a module lives in comes from VILLAGE_PLACES
 * (src/data/villagePlaces.ts).
 *
 * J6 and J7 are two slices of the one `build-business` item (§14.2: «Journey steps 6 and 7
 * live inside this item»). They have no row in `JOURNEY_MAIN`; they borrow its requirements
 * and closed line through `SLICE_PARENT`, and their ids are the step ids of their victory and
 * their real choice (src/data/journeyChoices.ts).
 *
 * Copy rules (§14.1, §14.3): the headline IS the module's Master Result; the button is the
 * result as a verb, never «Continue»; no barrier words (lock, gate, unlock, coming soon).
 */

import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import {
  closedLine,
  placeState,
  type PlaceClosedLine,
  type PlaceRequirement,
  type PlaceSave,
  type PlaceStateName,
  type RealWorldVictory,
} from "@/lib/placeState";
import type { VillagePlaceKey } from "@/data/villagePlaces";

/** A Journey step that is not a `JOURNEY_MAIN` row of its own: a slice of `build-business`. */
export type SliceStepId = "uniqueness-phrase" | "tagline";

/** A module in the form that is not a Journey step: an Academy lesson a guest can play (src/data/academyModule.ts). */
export type ExtraStepId = "academy-welcome";

/**
 * A real-world quest on the Quest Board (WP-11, §14.2 J10–J12): the player does something
 * outside the game and says «I did it». None is a `JOURNEY_MAIN` row; the victory row they
 * write is their only record, and `placeState` reads it as the event of the same name.
 */
export type QuestStepId = RealWorldVictory;

/** The real-world quests, in Journey order: J10, J11, J12. */
export const QUEST_STEP_IDS: readonly QuestStepId[] = ["mastery-practice", "first-price", "first-sale"];

/** Everything that has a module form: a Journey step, a slice of one, a real-world quest, or an Academy lesson. */
export type ModuleStepId = JourneyItemId | SliceStepId | QuestStepId | ExtraStepId;

/** The Journey item whose requirements and closed line a slice borrows. */
export const SLICE_PARENT: Record<SliceStepId, JourneyItemId> = {
  "uniqueness-phrase": "build-business",
  tagline: "build-business",
};

export const isSliceStep = (id: ModuleStepId): id is SliceStepId => id in SLICE_PARENT;

/** An Academy lesson: it has the module form but no row in `JOURNEY_MAIN`, so nothing waits on it. */
export const isExtraStep = (id: ModuleStepId): id is ExtraStepId => id === "academy-welcome";

export const isQuestStep = (id: string | null | undefined): id is QuestStepId =>
  !!id && (QUEST_STEP_IDS as readonly string[]).includes(id);

/** The `JOURNEY_MAIN` item a module id is read from: itself, or the parent of a slice. Undefined for a quest or an Academy lesson. */
export const journeyStepOf = (id: ModuleStepId): JourneyItemId | undefined =>
  isExtraStep(id) || isQuestStep(id) ? undefined : isSliceStep(id) ? SLICE_PARENT[id] : id;

export type JourneyModuleDef = {
  /** The Journey step this module completes; the key of its victory row. */
  id: ModuleStepId;
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
  /** Only a real-world quest (J10–J12): the task, and what must be true before it is offered. */
  quest?: {
    /** «J10» … «J12», for the reader of the Quest Board. */
    journey: string;
    /** The task in the world, in the player's second person, one or two sentences. */
    task: string;
    /** The label of the button that says it is done. */
    didIt: string;
    /** What the quest waits on. Absent = always open. */
    opens?: PlaceRequirement;
    /** The «Opens when … Inside: …» line while it waits. Required with `opens`. */
    closed?: PlaceClosedLine;
  };
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
  {
    id: "uniqueness-phrase",
    place: "workshop",
    eyebrow: "Workshop · Step 6",
    headline: "Your uniqueness in one phrase",
    silhouette: "The AI drafts one phrase that only you could say, from your top talent. You sharpen it until it sounds like you.",
    verb: "Name my uniqueness",
    startPath: "/ubb/uniqueness",
    outro: {
      done: "Done · Your uniqueness is saved",
      badge: "Uniqueness",
      livesIn: { text: "It lives in your Workshop, and every part of your business is built from it.", to: "/ubb" },
      opened: "The Workshop holds the next piece: the tagline of your business.",
      fallbackResult: "Your uniqueness",
    },
  },
  {
    id: "tagline",
    place: "workshop",
    eyebrow: "Workshop · Step 7",
    headline: "The tagline of your unique business",
    silhouette: "One sentence for the people you serve: where they are, and where you take them.",
    verb: "Write my tagline",
    startPath: "/ubb/promise",
    outro: {
      done: "Done · Your tagline is saved",
      badge: "Tagline",
      livesIn: { text: "It lives in your Workshop, and it is the sign over your stall.", to: "/ubb" },
      opened: "Your stall stands in the Market.",
      fallbackResult: "Your tagline",
    },
  },

  // Real-world quests (WP-11, §14.2 J10–J12; J8 and J9 are the webinar and the Mastermind).
  // The task happens outside the game; «I did it» is the player's own word, recorded as a
  // victory with its 1–10 (src/components/game/QuestModule.tsx).
  {
    id: "mastery-practice",
    place: "academy",
    eyebrow: "Academy · Step 10",
    headline: "Twenty-one days of practice, done",
    silhouette: "Practise for 21 days with others walking the same path. When the twenty-first day is behind you, come back and say so.",
    verb: "Practise my 21 days",
    startPath: "/game/journey/quest/mastery-practice",
    quest: {
      journey: "J10",
      task: "Practise every day for 21 days, alongside others walking the same path. Come back when you have done all 21.",
      didIt: "I did my 21 days",
    },
    outro: {
      done: "Done · Your 21 days are complete",
      badge: "21 Days",
      livesIn: { text: "It lives in Your House, on the shelf of your victories.", to: "/game/me/overview" },
      opened: "Twenty-one days of practice are behind you. The Quest Board holds the next quest.",
      fallbackResult: "Twenty-one days of practice",
    },
  },
  {
    id: "first-price",
    place: "market",
    eyebrow: "Market · Step 11",
    headline: "Name your price to a real client",
    silhouette: "Your price is part of the gift. You say it out loud to one real person who could buy.",
    verb: "Name my price",
    startPath: "/game/journey/quest/first-price",
    quest: {
      journey: "J11",
      task: "Tell one real client the price of your offer, out loud or in writing. Then come back and say you did.",
      didIt: "I named my price",
      opens: "offer-saved",
      closed: { event: "your offer is saved", inside: "your first price, said to a real client" },
    },
    outro: {
      done: "Done · Your first price is named",
      badge: "First Price",
      livesIn: { text: "It lives in your Market stall: the price is what lets the work land.", to: "/game/marketplace" },
      opened: "Your stall carries a price. Your first sale is the next quest.",
      fallbackResult: "Your first price",
    },
  },
  {
    id: "first-sale",
    place: "market",
    eyebrow: "Market · Step 12",
    headline: "Receive your first payment for being you",
    silhouette: "Someone pays you for your own offer. A neighbour counts the same as a stranger online.",
    verb: "Make my first sale",
    startPath: "/game/journey/quest/first-sale",
    quest: {
      journey: "J12",
      task: "Sell your offer to one real person and receive the payment. Come back and say you did: no money moves here, and we take your word.",
      didIt: "I made my first sale",
      opens: "offer-saved",
      closed: { event: "your offer is saved", inside: "proof in the world that someone pays you for being you" },
    },
    outro: {
      done: "Done · Your first sale is recorded",
      badge: "First Sale",
      livesIn: { text: "It lives in the Town Hall, where your voice now counts.", to: "/village/town-hall" },
      opened: "The Town Hall is open, and your house is lit on the map.",
      fallbackResult: "Your first sale",
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
export const moduleIntroState = (id: ModuleStepId, save: PlaceSave): PlaceStateName => {
  if (isQuestStep(id)) {
    // A real-world quest is done once its victory is recorded; it waits on its own event.
    return placeState({ line: "", rule: { opens: questDef(id)?.opens, steps: [id] } }, save);
  }
  const item = JOURNEY_MAIN.find((i) => i.id === journeyStepOf(id));
  const requires = item?.requires ?? [];
  const closedFirst = requires.find((req) => save.met[req] !== true);
  return placeState(
    {
      line: "",
      rule: {
        opens: closedFirst,
        // A slice is not a Journey row, so it is never «next» or «done» on its own:
        // closed while its parent waits, otherwise open.
        steps: isSliceStep(id) || isExtraStep(id) ? [] : [id],
      },
    },
    save,
  );
};

const questDef = (id: QuestStepId) => getJourneyModule(id)?.quest;

/** True when the step waits on an earlier one, so its state depends on the save. */
export const moduleHasRequirements = (id: ModuleStepId): boolean =>
  isQuestStep(id)
    ? !!questDef(id)?.opens
    : (JOURNEY_MAIN.find((i) => i.id === journeyStepOf(id))?.requires ?? []).length > 0;

/** The closed line of a Journey step: «Opens when … Inside: ….» Empty when it has none. */
export const moduleClosedLine = (id: ModuleStepId): string => {
  if (isQuestStep(id)) {
    const closed = questDef(id)?.closed;
    return closed ? closedLine({ line: "", rule: { closed } }) : "";
  }
  return JOURNEY_MAIN.find((i) => i.id === journeyStepOf(id))?.lockedHint ?? "";
};

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
 * Outro directly, which wins over this. The slices J6, J7 always do: the sheet does not
 * carry their phrases.
 */
export const moduleResultText = (id: ModuleStepId, sheet: ModuleResultSource): string | null => {
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
