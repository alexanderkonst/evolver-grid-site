/**
 * The one Academy module a guest can play start to finish (playtest fix, issue #186).
 * Design: docs/02-strategy/game_of_being_you.md §14.1 (experience first), §14.4 (module form),
 * WP-7b (result first, the account only to save).
 *
 * It is the first lesson of the free course «Activate Your Dormant Potential»: episode `00`,
 * «Welcome» (src/data/courses/activateYourDormantPotential.ts), the first module of the
 * Academy's first open room («Watch the foundational course»). The words on its Intro and
 * Outro live here, in the shape `ModuleIntro` / `ModuleOutro` read; it is not a Journey step,
 * so it is not in `JOURNEY_MODULES` and nothing in the village waits on it.
 *
 * Copy rules (§14.1, §14.3): the headline IS the Master Result; the button is the result as a
 * verb, never «Continue»; no barrier words (lock, gate, unlock, coming soon).
 * COPY FOR SASHA'S REVIEW BEFORE MERGE.
 */

import type { JourneyModuleDef } from "@/data/journeyModules";
import { COURSE_MODULES, COURSE_TITLE } from "@/data/courses/activateYourDormantPotential";

/** The step id of its victory and its real choice (`journey_victories` / `module_choices`). */
export const ACADEMY_WELCOME_ID = "academy-welcome" as const;

/** The lesson itself: the first episode of the course. */
export const ACADEMY_WELCOME_EPISODE = COURSE_MODULES[0].episodes[0];

export const ACADEMY_WELCOME_MODULE: JourneyModuleDef = {
  id: ACADEMY_WELCOME_ID,
  place: "academy",
  eyebrow: "Academy · Lesson 1",
  headline: "Wake the potential you already carry",
  silhouette: "A short welcome from the free course. You watch it, then you choose one thing to do this week.",
  verb: "Wake my potential",
  startPath: "/game/learn",
  outro: {
    done: "Done · Your first lesson",
    badge: "First Lesson",
    livesIn: { text: "It is your first badge in the Academy.", to: "/game/learn?rooms=1" },
    opened: "The rest of the free course is open to you.",
    fallbackResult: `${COURSE_TITLE} · Lesson 1`,
  },
};
