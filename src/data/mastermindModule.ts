/**
 * The Fire Circle's Journey step in the module form (WP-10, J9).
 * Design: docs/02-strategy/game_of_being_you.md §14.2 (J9), §14.4, §14.5, §14.8 row WP-10.
 *
 * The Mastermind (`/build/mastermind`, src/pages/Mastermind.tsx) has no row in `JOURNEY_MAIN`,
 * so it is not in `JOURNEY_MODULES` and nothing in the village waits on it; the words on its
 * Intro and Outro live here, in the shape `ModuleIntro` / `ModuleOutro` read (the same
 * arrangement as src/data/academyModule.ts). The Fire Circle is open to everyone (§14.3).
 *
 * The step ends when the player says they were in the circle: a self-report, recorded as a
 * victory in `journey_victories` with the 1–10 they pick at that moment. Nothing about a
 * purchase is recorded or read here.
 *
 * Copy rules (§14.1, §14.3): the headline IS the module's Master Result (the page's own
 * promise); the button is the result as a verb, never «Continue»; no barrier words
 * (lock, gate, unlock, coming soon). COPY FOR SASHA'S REVIEW BEFORE MERGE.
 */

import type { JourneyModuleDef } from "@/data/journeyModules";

/** The step id of its victory and its real choice (`journey_victories` / `module_choices`). */
export const MASTERMIND_ID = "mastermind" as const;

/** Where the step lives: the Mastermind page itself. `?step=page` goes straight to the page, past the Intro. */
export const MASTERMIND_ROUTE = "/build/mastermind";

export const MASTERMIND_MODULE: JourneyModuleDef = {
  id: MASTERMIND_ID,
  place: "fire-circle",
  eyebrow: "Fire Circle · Step 9",
  headline: "Your clear offer for your first clients",
  silhouette:
    "Two live sessions, Nov 9 and Nov 10, and a week in the group. You find where your uniqueness meets the market.",
  verb: "Find my market fit",
  startPath: MASTERMIND_ROUTE,
  outro: {
    done: "Done · You sat in the circle",
    badge: "Fire Circle",
    livesIn: { text: "It lives in Your House, on the shelf of your victories.", to: "/game/me/overview" },
    opened: "The Quest Board holds the next quests: your first price and your first sale.",
    fallbackResult: "Your place in the circle",
  },
};

/** The task line under the headline once the player has been through the circle. */
export const MASTERMIND_TASK = "Two sessions and a week of integration, with others who are finding their offer. When you have been in the circle, say so here.";

/** The label of the button that says it is done. */
export const MASTERMIND_DID_IT = "I was in the circle";
