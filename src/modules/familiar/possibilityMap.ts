/**
 * possibilityMap — what the player can do in the village now, as data for the outro's map.
 * Pure: the places and their states come from `VILLAGE_PLACES` and `placeState`, the closed
 * line from `closedLine`, the one next step from `nextMove`. Nothing here restates an unlock rule.
 *
 * The map is a hub: the player's top talent in the centre, a ray to every house. Your AI itself
 * is left out (the player is standing in it). A house is lit when it is not closed.
 */
import { VILLAGE_PLACES, type VillagePlace, type VillagePlaceKey } from "@/data/villagePlaces";
import { closedLine, nextMove, placeState, type NextMove, type PlaceSave, type PlaceStateName } from "@/lib/placeState";

/** The place the map is shown in; it has no ray to itself. */
export const MAP_HOME = "oracle" as const;

/** «What you can do now», one line per house, English source (`familiar.map.do.<key>` translates it). */
export const WHAT_YOU_CAN_DO: Record<Exclude<VillagePlaceKey, typeof MAP_HOME>, string> = {
  reception: "Find your top talent.",
  house: "See your crystal, mission and save file.",
  "quest-board": "Pick your next quest.",
  cafe: "Meet people, professionally or simply.",
  coworking: "Find partners for the work.",
  "fire-circle": "Join your Mastermind circle.",
  academy: "Grow in what matters most.",
  workshop: "Craft your offer.",
  market: "Open your shop.",
  "town-hall": "Build ventures together.",
};

export type PossibilityHouse = {
  place: VillagePlace;
  state: PlaceStateName;
  /** Not closed: the player can go in now. */
  lit: boolean;
  /** Lit: what you can do. Dim: what opens it («Opens when … Inside: …»). */
  line: string;
  /** Where the ray ends, in a 100 × 100 box with the centre at 50, 50. */
  x: number;
  y: number;
};

export type PossibilityMap = {
  houses: PossibilityHouse[];
  /** The first open next step, or null when nothing is open to offer. */
  next: NextMove | null;
};

const RADIUS = 38;

/** Houses evenly round the centre, the first straight up, clockwise. */
export const rayPoint = (index: number, total: number): { x: number; y: number } => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return { x: 50 + RADIUS * Math.cos(angle), y: 50 + RADIUS * Math.sin(angle) };
};

export function buildPossibilityMap(save: PlaceSave, places: readonly VillagePlace[] = VILLAGE_PLACES): PossibilityMap {
  const homes = places.filter((p) => p.key !== MAP_HOME);
  const houses = homes.map((place, i) => {
    const state = placeState(place, save);
    const lit = state !== "closed";
    const live = place.rule.live;
    const line = !lit
      ? closedLine(place)
      : state === "live" && live
        ? live.line
        : (WHAT_YOU_CAN_DO[place.key as keyof typeof WHAT_YOU_CAN_DO] ?? place.line);
    return { place, state, lit, line, ...rayPoint(i, homes.length) };
  });
  return { houses, next: nextMove(places, save) };
}
