import type { TFunction } from "i18next";
import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import {
  QUEST_STEP_IDS,
  getJourneyModule,
  moduleClosedLine,
  moduleIntroState,
  moduleText,
  questTaskText,
  type QuestStepId,
} from "@/data/journeyModules";
import { journeyStepLabel } from "@/lib/journeyLabels";
import { nextJourneyStep, type PlaceSave, type PlaceStateName } from "@/lib/placeState";
import { tr } from "@/lib/villageCopy";

/**
 * The Quest Board's rows (WP-11). Design: docs/02-strategy/game_of_being_you.md §14.2, §14.3.
 *
 * Two lists, both read from real events in the save, never from points:
 *   the Journey   the `JOURNEY_MAIN` steps (J1–J7) in their order, each done / next / open / closed
 *   in the world  the real-world quests J8–J12, each done / open / closed (J11 and J12 wait on a saved offer)
 *
 * Pure and synchronous: the page loads the save (`useCharacterSheet`) and passes it in through
 * `placeSaveFromSheet`. Order, labels and requirements come from `JOURNEY_SEQUENCE` and
 * `JOURNEY_MODULES`; nothing here restates them.
 */

/** Where a real-world quest lives (the Intro → task → «I did it» → Outro module). */
export const questRoute = (id: string): string => `/game/journey/quest/${id}`;

export type JourneyRow = {
  id: JourneyItemId;
  /** 1-based position in the Journey. */
  no: number;
  label: string;
  optional: boolean;
  state: PlaceStateName;
  /** The closed line while `closed`, else empty. */
  line: string;
  /** The clause after «Done when»: the checkable completion criterion. Empty when the step has none. */
  doneWhen: string;
  to: string;
};

export type QuestRow = {
  id: QuestStepId;
  /** «J8» … «J12». */
  journey: string;
  title: string;
  state: PlaceStateName;
  /** The closed line while `closed`, else what the quest asks. */
  line: string;
  /** The clause after «Done when»: the checkable completion criterion. Empty when the quest has none. */
  doneWhen: string;
  to: string;
};

/** What a Journey step gives, in the reader's language (the clause after the dash). Empty when it has none. */
export const journeyResultText = (id: JourneyItemId, t?: TFunction): string => {
  const result = JOURNEY_MAIN.find((i) => i.id === id)?.result;
  return result ? tr(t, `village.result.${id}`, result) : "";
};

/**
 * The Journey steps with their state: done, the single next move, open, or closed with its line.
 * Pass `t` for the reader's language; without it the rows are the English source.
 */
export const journeyRows = (save: PlaceSave, t?: TFunction): JourneyRow[] => {
  const next = nextJourneyStep(save);
  return JOURNEY_MAIN.map((item, i): JourneyRow => {
    const done = save.met[item.id] === true;
    const closed = !done && (item.requires ?? []).some((req) => save.met[req] !== true);
    const state: PlaceStateName = done ? "done" : closed ? "closed" : item.id === next ? "next" : "open";
    return {
      id: item.id,
      no: i + 1,
      label: journeyStepLabel(item, t),
      optional: !!item.optional,
      state,
      line: closed && item.lockedHint ? tr(t, `journeySteps.locked.${item.id}`, item.lockedHint) : "",
      doneWhen: item.doneWhen ? tr(t, `village.doneWhen.${item.id}`, item.doneWhen) : "",
      to: item.enter ?? item.path,
    };
  });
};

/** The real-world quests J8–J12, in order. */
export const questRows = (save: PlaceSave, t?: TFunction): QuestRow[] =>
  QUEST_STEP_IDS.map((id): QuestRow => {
    const module = getJourneyModule(id);
    const state = moduleIntroState(id, save);
    return {
      id,
      journey: module?.quest?.journey ?? "",
      title: module ? moduleText(module, "headline", t) : id,
      state,
      line: state === "closed" ? moduleClosedLine(id, t) : questTaskText(module, t),
      doneWhen: module?.quest?.doneWhen ? tr(t, `village.doneWhen.${id}`, module.quest.doneWhen) : "",
      to: questRoute(id),
    };
  });

/**
 * The one quest to offer first: the next Journey step if there is one, else the first
 * real-world quest that is open. Null when everything is done or waiting.
 */
export const nextQuest = (
  save: PlaceSave,
  t?: TFunction,
): { kind: "journey"; row: JourneyRow } | { kind: "quest"; row: QuestRow } | null => {
  const step = journeyRows(save, t).find((r) => r.state === "next");
  if (step) return { kind: "journey", row: step };
  const quest = questRows(save, t).find((r) => r.state === "open" || r.state === "next");
  return quest ? { kind: "quest", row: quest } : null;
};
