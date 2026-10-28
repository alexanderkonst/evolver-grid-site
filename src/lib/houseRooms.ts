import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { moduleClosedLine, moduleIntroState } from "@/data/journeyModules";
import {
  closedLine,
  placeState,
  type PlaceSave,
  type PlaceStateName,
} from "@/lib/placeState";

/**
 * houseRooms — the rooms of Your House and the badges on its shelf, as data.
 * Design: docs/02-strategy/game_of_being_you.md §14.7 (the eight decided answers, WP-8),
 * §14.3 (the lock rule), §14.12 (badges).
 *
 * One sheet, one list of rooms in Journey order (§14.7 q2):
 *   top talent → mission → soul colors → private level → assets → your offer → victories.
 * Each room has one state (`placeState`), one line while it is closed, and at most one button
 * to its module. A new resident's house is the same list with most rooms faded and the next
 * one glowing (§14.7 q6); there is no separate empty state.
 *
 * Journey order and requirements come from `JOURNEY_MAIN` (src/data/journeySequence.ts);
 * nothing here restates them. Pure and synchronous: the caller passes the save
 * (`placeSaveFromSheet`).
 *
 * PRIVACY (§14.7 q5): the private level, the 1–10 ratings, the choices and the asset details
 * are never shown to anyone but the owner. The 1–10 ratings are not read here at all.
 */

export type HouseRoomId = "talent" | "mission" | "colors" | "level" | "assets" | "offer" | "victories";

export type HouseRoom = {
  id: HouseRoomId;
  /** The Journey step this room shows, when it shows one. */
  step?: JourneyItemId;
  state: PlaceStateName;
  /** «Opens when … Inside: ….» Set only while the room is closed. */
  line: string;
  /** The one button to the room's module: where to begin, and where to deepen or retake. */
  to?: { start: string; again: string };
  /** Only the owner ever sees this room (§14.7 q5). */
  private?: boolean;
};

type RoomDef = Pick<HouseRoom, "id" | "step" | "to" | "private">;

/** The rooms in order. The Journey steps inside are the ones in `JOURNEY_MAIN`. */
const ROOMS: RoomDef[] = [
  {
    id: "talent",
    step: "find-top-talent",
    to: { start: "/zone-of-genius/entry", again: "/zone-of-genius/entry" },
  },
  {
    id: "mission",
    step: "discover-mission",
    to: { start: "/mission-discovery", again: "/game/me/mission" },
  },
  // Spectrum Reading is not built (§9): the room stays faded with its line (§14.7 q7).
  { id: "colors" },
  {
    id: "level",
    step: "assess-qol",
    to: { start: "/quality-of-life-map/assessment", again: "/quality-of-life-map/assessment" },
    private: true,
  },
  {
    id: "assets",
    step: "map-assets",
    to: { start: "/asset-mapping", again: "/game/me/assets" },
  },
  // The stall (§14.12): the offer, finished by a saved offer / tagline.
  {
    id: "offer",
    step: "build-business",
    to: { start: "/ubb", again: "/ubb" },
  },
  { id: "victories" },
];

/** The closed line of the soul-colors room: it waits on Spectrum Reading, not on a Journey step. */
export const COLORS_CLOSED = {
  event: "your Spectrum Reading is ready",
  inside: "your soul colors",
} as const;

const roomState = (def: RoomDef, save: PlaceSave): PlaceStateName => {
  if (def.id === "colors") {
    return placeState({ line: "", rule: { opens: "spectrum-reading", closed: COLORS_CLOSED } }, save);
  }
  if (def.step) return moduleIntroState(def.step, save);
  return "open";
};

const roomLine = (def: RoomDef, state: PlaceStateName): string => {
  if (state !== "closed") return "";
  if (def.id === "colors") {
    return closedLine({ line: "", rule: { opens: "spectrum-reading", closed: COLORS_CLOSED } });
  }
  return def.step ? moduleClosedLine(def.step) : "";
};

/** The rooms of the house for this save, in order. */
export const houseRooms = (save: PlaceSave): HouseRoom[] =>
  ROOMS.map((def) => {
    const state = roomState(def, save);
    return { ...def, state, line: roomLine(def, state) };
  });

/** The first room that is the single next move, if any. */
export const nextHouseRoom = (rooms: HouseRoom[]): HouseRoom | undefined =>
  rooms.find((r) => r.state === "next");

export type HouseBadge = {
  step: JourneyItemId;
  /** `done` = earned; anything else is a faint outline. */
  state: PlaceStateName;
  /** «Opens when … Inside: ….» Set only while the badge's step is closed. */
  line: string;
};

/**
 * One badge per Journey step, no counts, no levels, no rarity (§14.12). A badge is earned
 * exactly when its step is done; the rest are faint outlines, closed ones with their line.
 */
export const houseBadges = (save: PlaceSave): HouseBadge[] =>
  JOURNEY_MAIN.map((item) => {
    const state = moduleIntroState(item.id, save);
    return { step: item.id, state, line: state === "closed" ? moduleClosedLine(item.id) : "" };
  });

/**
 * What a badge carries as its own words. The talent and the mission are the player's own
 * lines; the private level and the asset details never ride on a badge, because a badge may
 * open to another player with consent (§14.7 q5).
 */
export const badgeResult = (
  step: JourneyItemId,
  sheet: { topTalent: string | null; missionTitle: string | null },
): string | null => {
  switch (step) {
    case "find-top-talent":
      return sheet.topTalent?.trim() || null;
    case "discover-mission":
      return sheet.missionTitle?.trim() || null;
    default:
      return null;
  }
};
