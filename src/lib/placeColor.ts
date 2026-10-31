import type { VillagePlaceKey } from "@/data/villagePlaces";
import type { CourseModule } from "@/data/courses/types";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL } from "@/data/courses/activateYourDormantPotential";
import { CONSCIOUSNESS_MEETS_SCIENCE } from "@/data/courses/consciousnessMeetsScience";
import { getPublishedModules, loadGuestWatched, loadWatched } from "@/lib/coursePlayer";

/**
 * placeColor — the colour a player brings back to each place of the Digital Village
 * (Sasha, 2026-10-30: «they reclaim and bring the colours of their soul to that space»).
 *
 * Every place starts mostly greyscale. Each accomplishment that lives in a place is an
 * object there: earned, it shines in iridescent hues; and every earned object gives the
 * place back a little more of its colour. The fraction earned / total drives the scene
 * (`--vl-soul`, 0…1, read by Village.css and the Lunar skin). Nothing here is a number on
 * screen; it is read from real events in the save, never from points or XP (§13).
 *
 * Objects are ids of things the save already knows: Journey steps, place events and
 * recorded victories (`PlaceSave.met`, `journey_victories`), and, for the Academy, each
 * module of the two courses watched to the end (src/lib/coursePlayer.ts progress).
 */

/** The two Academy courses, in the order the path shows them. */
export const ACADEMY_COURSES = [CONSCIOUSNESS_MEETS_SCIENCE, ACTIVATE_YOUR_DORMANT_POTENTIAL] as const;

/** Object id of one course module: done once every published episode in it is watched. */
export const courseModuleObjectId = (slug: string, moduleId: string) => `course:${slug}:${moduleId}`;

const academyObjects = (): string[] =>
  ACADEMY_COURSES.flatMap((c) => getPublishedModules(c.modules).map((m) => courseModuleObjectId(c.slug, m.id)));

/**
 * The objects of each place: what a player accomplishes there. A place's own `rule.steps`
 * (villagePlaces.ts) come first; places whose module writes no event of its own carry the
 * accomplishment they hold (the Café holds the webinar, the Quest Board every real-world
 * victory, Your AI what it knows of you).
 */
export const PLACE_OBJECTS: Record<VillagePlaceKey, readonly string[]> = {
  reception: ["find-top-talent"],
  house: ["discover-mission", "assess-qol", "map-assets"],
  "quest-board": ["webinar", "mastermind", "mastery-practice", "first-price", "first-sale"],
  oracle: ["find-top-talent", "discover-mission", "map-assets"],
  cafe: ["webinar"],
  coworking: ["triad"],
  "fire-circle": ["mastermind"],
  academy: academyObjects(),
  workshop: ["build-business"],
  market: ["offer-saved", "first-sale"],
  "town-hall": ["first-sale"],
};

/** True when every published episode of the module is in the watched list. */
export const moduleWatched = (module: CourseModule, watched: readonly string[]): boolean => {
  const eps = module.episodes;
  return eps.length > 0 && eps.every((e) => watched.includes(e.code));
};

/** Course modules watched to the end on this device (account and guest lists together). */
export const watchedCourseObjects = (
  read: (slug: string) => readonly string[] = (slug) => [...loadWatched(slug), ...loadGuestWatched(slug)],
): Record<string, boolean> => {
  const met: Record<string, boolean> = {};
  for (const c of ACADEMY_COURSES) {
    const watched = read(c.slug);
    for (const m of getPublishedModules(c.modules)) {
      if (moduleWatched(m, watched)) met[courseModuleObjectId(c.slug, m.id)] = true;
    }
  }
  return met;
};

export type PlaceObjectState = { id: string; earned: boolean };

/** The objects of a place, each earned or not, in a fixed order. */
export const placeObjects = (
  key: VillagePlaceKey,
  met: Readonly<Record<string, boolean | undefined>>,
): PlaceObjectState[] => (PLACE_OBJECTS[key] ?? []).map((id) => ({ id, earned: met[id] === true }));

/** How much colour the place has back: earned / total, 0 with no objects. */
export const placeSoul = (objects: readonly PlaceObjectState[]): number => {
  if (objects.length === 0) return 0;
  return objects.filter((o) => o.earned).length / objects.length;
};
