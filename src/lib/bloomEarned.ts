import { PLACE_OBJECTS, watchedCourseObjects } from "@/lib/placeColor";
import { commitEarned } from "@/lib/bloom";

/**
 * bloomEarned — which objects the player has earned, read from data the client already holds.
 *
 * The objects are exactly the ones `placeColor` counts per place (Journey steps, the five
 * real-world victories, saved offer, the triad, each Academy module watched to the end), taken
 * once each: an object that lives in two places (`find-top-talent`, `first-sale`) is one object,
 * so the world's colorfulness is not counted twice.
 */

/** Every object in the world, once. */
export const bloomUniverse = (): string[] => [...new Set(Object.values(PLACE_OBJECTS).flat())];

/** The earned objects: `met` is `PlaceSave.met` merged with victories and watched course modules. */
export const earnedBloomObjects = (met: Readonly<Record<string, boolean | undefined>>): string[] =>
  bloomUniverse().filter((id) => met[id] === true);

/**
 * Reads the save and updates the world. Called from the hooks that already hold the character
 * sheet (usePlaceStates for the rail and shell, Village), once the sheet has loaded.
 */
export const syncBloomFromSave = (
  met: Readonly<Record<string, boolean | undefined>>,
  victories: readonly string[] | undefined,
): number => {
  const merged: Record<string, boolean | undefined> = {
    ...met,
    ...Object.fromEntries((victories ?? []).map((id) => [id, true])),
    ...watchedCourseObjects(),
  };
  return commitEarned(earnedBloomObjects(merged), bloomUniverse().length);
};
