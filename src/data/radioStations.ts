/**
 * Village radio stations (spec row A8, docs/02-strategy/game_launch_spec.md).
 * Mechanic source: Heroes III music per town (H3-9): each village has its own sound.
 *
 * One station per village, keyed by village id. Only San Pancho ships today; a new
 * village adds one entry here and nothing else changes (the engine, the control and the
 * credit line all read the station they are given).
 */

export interface RadioStation {
  /** Short station name shown on the control. */
  name: string;
  /** Second half of the credit line, after «·». */
  tagline: string;
  /** Public MP3 stream. Only ever requested after the player presses Play. */
  streamUrl: string;
  /** Where the credit line links (opens in a new tab). */
  homepageUrl: string;
}

export const DEFAULT_VILLAGE_ID = "san-pancho";

export const VILLAGE_RADIO: Readonly<Record<string, RadioStation>> = {
  "san-pancho": {
    name: "Radio San Pancho",
    tagline: "The Sound of Riviera Nayarit",
    // MP3 128 kbps, public stream listed on radio-browser.info.
    streamUrl: "https://listen.radioking.com/radio/680182/stream/744577",
    homepageUrl: "https://radiosanpancho.org/",
  },
};

/** The station of a village, or null when that village has none. */
export const getVillageRadio = (villageId: string = DEFAULT_VILLAGE_ID): RadioStation | null =>
  VILLAGE_RADIO[villageId] ?? null;

/** «Radio San Pancho · The Sound of Riviera Nayarit» */
export const radioCreditLine = (station: RadioStation): string => `${station.name} · ${station.tagline}`;
