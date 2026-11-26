/**
 * The rooms of each village place that are not Journey steps (§25.3, GoBY).
 *
 * A place's rooms are two kinds, and the second pane (`PlaceRoomsPane`) lists both at once:
 *   steps   the Journey steps / quests the place holds (`VillagePlace.rule.steps`); their
 *           names, results, routes and states come from `JOURNEY_MAIN` and the quest rows.
 *           Nothing about them is written here.
 *   rooms   the rest: the routes a place already opens (Home's Equilibrium, the Café's RSVPs,
 *           the Workshop's phases). Names are the ones the shell's pane 2 already uses
 *           (src/components/game/SectionsPanel.tsx); this file only gathers them by place.
 *
 * The Quest Board has no rooms of its own: its pane is the quest order (`questOrder`).
 */
import type { VillagePlaceKey } from "@/data/villagePlaces";
import { COURSE_PATH } from "@/data/courses/activateYourDormantPotential";
import { CMS_COURSE_PATH } from "@/data/courses/consciousnessMeetsScience";

export type StaticRoom = {
  id: string;
  name: string;
  to: string;
  /**
   * What the room gives, one line, completing «Inside: …». Every room has its own: a closed place
   * says «Opens when <event>. Inside: <this>.» per room, never the place's line six times (§25.5).
   */
  result: string;
  /** Only a signed-in player has this room (a guest is not shown a door that asks them to sign up). */
  signedInOnly?: boolean;
};

export const PLACE_ROOMS: Partial<Record<VillagePlaceKey, readonly StaticRoom[]>> = {
  house: [
    { id: "me-overview", name: "Character", to: "/game/me/overview", result: "your crystal, mission and save file" },
    { id: "equilibrium", name: "Equilibrium", to: "/build/equilibrium", result: "your body clock" },
    { id: "my-artifacts", name: "My Artifacts", to: "/my-artifacts", result: "everything you have saved" },
    { id: "settings", name: "Settings", to: "/game/settings", result: "your language, skin and privacy" },
  ],
  cafe: [
    { id: "browse", name: "Browse Events", to: "/game/meet", result: "the events happening in the village" },
    { id: "my-rsvps", name: "My RSVPs", to: "/game/meet/my-rsvps", result: "the events you said yes to", signedInOnly: true },
    { id: "create", name: "Create Event", to: "/game/meet/create", result: "an event of your own, with your people", signedInOnly: true },
  ],
  coworking: [
    { id: "genius-match", name: "Find Collaborators", to: "/game/collaborate/matches", result: "people whose gifts fit your work" },
    { id: "connections", name: "Connections", to: "/game/collaborate/connections", result: "the people you are connected with" },
    { id: "people", name: "People Directory", to: "/game/collaborate/people", result: "every resident, found by their gift" },
    { id: "messages", name: "Messages", to: "/game/collaborate/messages", result: "your conversations with partners" },
  ],
  academy: [
    { id: "academy", name: "Academy", to: "/game/learn", result: "the courses of the Academy" },
    { id: "dormant-potential", name: "Your Unfolding Potential", to: COURSE_PATH, result: "a course that wakes your dormant potential" },
    { id: "consciousness-meets-science", name: "Consciousness Meets Science", to: CMS_COURSE_PATH, result: "a course where consciousness meets science" },
  ],
  workshop: [
    { id: "founder-collective", name: "Founder Collective", to: "/collective", result: "founders with working businesses, by invitation" },
    { id: "ubb-canvas", name: "Canvas", to: "/ubb", result: "your business on one canvas: uniqueness, myth, tribe, pain, promise" },
    { id: "ubb-session", name: "1st Session Design", to: "/ubb/session", result: "your first paid session, designed" },
    { id: "ubb-marketing", name: "Marketing", to: "/ubb/marketing", result: "your core belief, your packaging and a frictionless purchase" },
    { id: "ubb-distribution", name: "Distribution", to: "/ubb/distribution", result: "how your offer reaches people, is delivered and spreads" },
    { id: "ubb-communications", name: "Communications", to: "/ubb/communications", result: "your channels, your tuning fork and your golden DM" },
    { id: "ubb-landing-page", name: "Landing Page", to: "/ubb/landing-page", result: "a landing page that carries your offer" },
  ],
  market: [
    { id: "overview", name: "Overview", to: "/game/marketplace", result: "your shop, and the shops of other residents" },
    { id: "my-products", name: "My Products", to: "/game/marketplace/my-products", result: "the products you sell" },
  ],
};
