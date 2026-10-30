import type { TFunction } from "i18next";
import {
  JOURNEY_MAIN,
  type JourneyItem,
  type JourneyItemId,
} from "@/data/journeySequence";

/**
 * One way to name the Journey in a list (WP-4, game_of_being_you.md §14.1.2).
 *
 * Every list of Journey steps (the title screen's Chapter 01, Home, `/ignite`, the
 * Quest Board pane) reads `JOURNEY_MAIN` through `journeyStepRows`, so they carry the same
 * labels, the same order and the same «optional» marks. The English strings live in
 * `JOURNEY_SEQUENCE`; the `journeySteps.*` catalog only translates them. Pass no `t` and
 * you get the English source (the title screen is English-only).
 */

export type JourneyStepRow = {
  id: JourneyItemId;
  /** 1-based position in the Journey. */
  no: number;
  label: string;
  /** The word «optional» in the reader's language, or null for a step the Journey needs. */
  optional: string | null;
  path: string;
};

export const journeyStepLabel = (item: JourneyItem, t?: TFunction): string =>
  t ? String(t(`journeySteps.${item.id}`, { defaultValue: item.label })) : item.label;

export const journeyOptionalWord = (t?: TFunction): string =>
  t ? String(t("journeySteps.optional", { defaultValue: "optional" })) : "optional";

/** The Journey as list rows, in `JOURNEY_MAIN` order. */
export const journeyStepRows = (t?: TFunction): JourneyStepRow[] =>
  JOURNEY_MAIN.map((item, i) => ({
    id: item.id,
    no: i + 1,
    label: journeyStepLabel(item, t),
    optional: item.optional ? journeyOptionalWord(t) : null,
    path: item.path,
  }));

/** «3. Assess your quality of life (optional)»: one line, for lists that print a single string. */
export const journeyStepLine = (row: JourneyStepRow): string =>
  `${row.no}. ${row.label}${row.optional ? ` (${row.optional})` : ""}`;
