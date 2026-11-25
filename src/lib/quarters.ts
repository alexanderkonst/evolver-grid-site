import type { TFunction } from "i18next";
import { VILLAGE_ELEMENTS, type ElementKey, type VillagePlace } from "@/data/villagePlaces";
import type { PlaceStateName } from "@/lib/placeState";
import { tr } from "@/lib/villageCopy";

/**
 * The five quarters of the village (GoBY §25.14). An element is a quarter of the map, never a
 * door: nothing here navigates. This file holds the two rules the signs need, earned light and
 * rail order; the data (`element` per place, the element list) is in src/data/villagePlaces.ts.
 */

/** Stable sort of places by quarter (ether, air, water, fire, earth); the order inside a quarter is kept. */
export const groupByQuarter = <T extends Pick<VillagePlace, "element">>(places: readonly T[]): T[] => {
  const rank = (p: T) => VILLAGE_ELEMENTS.findIndex((e) => e.key === p.element);
  return places.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).map(({ p }) => p);
};

/**
 * Earned light (§25.14 rule 2): a quarter's solid is lit once the first place of the quarter is
 * open, read from the same `placeState` as every other surface. Air is lit for everyone because
 * Your AI is open to all (its rule has no `opens`). `states` is parallel to `places`.
 */
export const litQuarters = (
  places: readonly Pick<VillagePlace, "element">[],
  states: readonly PlaceStateName[],
): Record<ElementKey, boolean> => {
  const lit = Object.fromEntries(VILLAGE_ELEMENTS.map((e) => [e.key, false])) as Record<ElementKey, boolean>;
  places.forEach((p, i) => {
    if (states[i] && states[i] !== "closed") lit[p.element] = true;
  });
  return lit;
};

/** «<Element> quarter», the accessible name of a sign; es and ru under `village.quarter.<key>.name`. */
export const quarterName = (element: ElementKey, t?: TFunction): string => {
  const english = `${VILLAGE_ELEMENTS.find((e) => e.key === element)!.name} quarter`;
  return tr(t, `village.quarter.${element}.name`, english);
};
