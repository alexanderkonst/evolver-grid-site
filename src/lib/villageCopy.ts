import type { TFunction } from "i18next";
import type { PlaceStateName } from "@/lib/placeState";

/**
 * Village copy through i18n (issue #203).
 *
 * The English of the village lives in its data files (`VILLAGE_PLACES`, `JOURNEY_MODULES`,
 * `JOURNEY_SEQUENCE`, `VILLAGE_SKY_MOODS`): they stay the source and the tests read them.
 * Each string is translated at render under a stable key in `src/locales/<lng>/common.json`
 * (`village.*`), with the English as the `defaultValue`. Pass no `t` and you get the English
 * source, the same shape as `journeyStepLabel(item, t?)` in `journeyLabels.ts`.
 *
 * With the English as `defaultValue`, a surface also renders correctly where i18n is not
 * initialised (server-rendered tests) and a key missing from ru / es falls back to English.
 */

/** `key` translated, else the English. A missing `key` or `t` is the English too. */
export const tr = (t: TFunction | undefined, key: string | undefined, english: string): string =>
  t && key ? String(t(key, { defaultValue: english })) : english;

/** English source of the state words; `village.state.<state>` translates them. `open` has none. */
const STATE_WORD: Record<PlaceStateName, string | null> = {
  closed: "Not open yet",
  open: null,
  next: "Next",
  done: "Done",
  live: "Live",
};

/** The state as a word in the reader's language, or null for `open`. */
export const stateWordText = (state: PlaceStateName, t?: TFunction): string | null => {
  const english = STATE_WORD[state];
  return english ? tr(t, `village.state.${state}`, english) : null;
};

/** The name of a village place: «Reception», «Your House» … */
export const placeName = (p: { key: string; name: string }, t?: TFunction): string =>
  tr(t, `village.place.${p.key}.name`, p.name);

/** The place's own line: «Welcome, guest. Discover your uniqueness.» */
export const placeTagline = (p: { key?: string; line: string }, t?: TFunction): string =>
  tr(t, p.key ? `village.place.${p.key}.line` : undefined, p.line);

/** The scene description for screen readers. */
export const placeAlt = (p: { key: string; alt: string }, t?: TFunction): string =>
  tr(t, `village.place.${p.key}.alt`, p.alt);
