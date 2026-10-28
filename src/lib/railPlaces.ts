import { VILLAGE_PLACES, type VillagePlace, type VillagePlaceKey } from "@/data/villagePlaces";

/**
 * The rail is the village map folded (WP-4, game_of_being_you.md §14.1.2, §14.6):
 * the same 11 places, in the same order, with the same names and the same states as
 * `/village`. `RAIL_PLACES` IS `VILLAGE_PLACES`; nothing here restates a name or an order.
 *
 * What this file adds is the bridge to the existing pane 2 (`SectionsPanel`), which is
 * still keyed by the old space ids. Each place opens the pane of the module it holds.
 */
export const RAIL_PLACES: readonly VillagePlace[] = VILLAGE_PLACES;

/** The pane-2 space id (SECTIONS in SectionsPanel.tsx) behind each place. */
export const PANE_BY_PLACE: Record<VillagePlaceKey, string> = {
  reception: "journey",
  house: "grow",
  "quest-board": "journey",
  oracle: "ai-os",
  cafe: "meet",
  coworking: "collaborate",
  "fire-circle": "build",
  academy: "learn",
  workshop: "build",
  market: "buysell",
  "town-hall": "journey",
};

/** The place that lights up for a pane when the path does not say otherwise. */
const PLACE_BY_PANE: Record<string, VillagePlaceKey> = {
  journey: "quest-board",
  grow: "house",
  "ai-os": "oracle",
  meet: "cafe",
  collaborate: "coworking",
  learn: "academy",
  build: "workshop",
  buysell: "market",
};

/**
 * `data-tour-id` of a rail chip. The onboarding tour still points at the old space ids
 * ("grow", "learn", "build", …); a place that is the canonical door of its pane keeps that
 * id, and a place that only shares a pane (Reception, Fire Circle, Town Hall) uses its own key.
 */
export const tourIdFor = (key: VillagePlaceKey): string =>
  PLACE_BY_PANE[PANE_BY_PLACE[key]] === key ? PANE_BY_PLACE[key] : key;

const under = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/**
 * Which place the player is standing in. A few routes belong to a place that shares its
 * pane with another (Reception and Fire Circle sit in panes the Quest Board and the
 * Workshop also use), so the path decides first and the pane second.
 */
export const activePlaceKey = (pathname: string, paneId: string | undefined): VillagePlaceKey | null => {
  if (under(pathname, "/zone-of-genius")) return "reception";
  if (under(pathname, "/build/mastermind")) return "fire-circle";
  if (under(pathname, "/game/coop")) return "town-hall";
  return paneId ? PLACE_BY_PANE[paneId] ?? null : null;
};
