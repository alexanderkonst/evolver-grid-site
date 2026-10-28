/**
 * The live windows of the Fire Circle and the Academy: the dates, in one place (WP-10).
 * Design: docs/02-strategy/game_of_being_you.md §14.3 (`live` state), §14.8 row WP-10.
 *
 * `placeState` (src/lib/placeState.ts) turns a window into the `live` state; the village
 * places (src/data/villagePlaces.ts) and the Mastermind page (src/pages/Mastermind.tsx) both
 * read these constants, so a date changes here and nowhere else. The dates and the lines are
 * the ones the page already carries (the bridge line «Wed Nov 4, 9:00 CDMX», «Nov 9–10»).
 */

import type { PlaceLive } from "@/lib/placeState";

/** Webinar, Wed Nov 4, 2026, 9:00 Mexico City. The length is not in the code; 90 minutes assumed. */
export const WEBINAR_LIVE: PlaceLive = {
  from: "2026-11-04T09:00:00-06:00",
  until: "2026-11-04T10:30:00-06:00",
  line: "Live now: Webinar, Wed Nov 4.",
};

/**
 * Mastermind sessions on Nov 9 and Nov 10, 2026. The session times are not in the code, so
 * the window is the two days, Mexico City time.
 */
export const MASTERMIND_LIVE: PlaceLive = {
  from: "2026-11-09T00:00:00-06:00",
  until: "2026-11-11T00:00:00-06:00",
  line: "Live now: Mastermind, Nov 9–10.",
};

/** The Fire Circle shows `live` for the webinar it announces and for the Mastermind itself. */
export const FIRE_CIRCLE_LIVE: readonly PlaceLive[] = [WEBINAR_LIVE, MASTERMIND_LIVE];

/** True once the Mastermind has begun: from then on a player can say they were in the circle. */
export const mastermindBegun = (now: Date = new Date()): boolean => now.getTime() >= Date.parse(MASTERMIND_LIVE.from);
