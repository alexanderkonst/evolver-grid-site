import type { PlaceRequirement } from "@/lib/placeState";

/**
 * founderTools.ts — when each BUILD-pane tool («Founder Tools» and «Unique Startup
 * Incubation») opens in the hero's journey. The one config; nothing else restates it.
 * Decision: Sasha, 2026-10-30 (issue #250, docs/02-strategy/game_of_being_you.md §19.3 #4).
 *
 * The stage model is the game's own: the real events of the save that `placeState` reads
 * (`placeSaveFromSheet`), the same ones that open the Workshop, the Market and the Town Hall.
 * A tool opens at a stage and stays open after it. The tool's route is untouched: the pane
 * only decides what to list, a direct link always works.
 *
 * To move a tool: change its `stage` below. To add a tool: add its pane row id here, or the
 * row is listed for everyone.
 */

/** The journey stages, in order. Stage N of a player is the last of these their save has met. */
export const FOUNDER_TOOL_STAGES = [
  "find-top-talent", // 1 · top talent saved: Home and the Quest Board open
  "discover-mission", // 2 · mission saved: the Workshop opens
  "triad", // 3 · top talent + mission + assets saved: Co-working opens
  "offer-saved", // 4 · offer saved: the Market opens
  "first-sale", // 5 · first sale recorded: the Town Hall opens
] as const satisfies readonly PlaceRequirement[];

export type FounderToolStage = (typeof FOUNDER_TOOL_STAGES)[number];

/**
 * «Opens when …» for each stage, in plain words (English fallback; the pane reads
 * `rail.build.opensWhen.<stage>`). Same clauses as the closed lines of the places that
 * open at the same moments (src/data/villagePlaces.ts).
 */
export const FOUNDER_TOOL_OPENS_WHEN: Record<FounderToolStage, string> = {
  "find-top-talent": "Opens when your top talent is saved.",
  "discover-mission": "Opens when your mission is saved.",
  triad: "Opens when your top talent, mission and assets are saved.",
  "offer-saved": "Opens when your offer is saved.",
  "first-sale": "Opens when your first sale is recorded.",
};

export type FounderToolRule =
  /** Opens at a journey stage, for every player who reaches it. */
  | { stage: FounderToolStage; owner?: never }
  /** Belongs to one person: listed only for that account, at any stage. */
  | { owner: string; stage?: never };

/** Keyed by the pane row id (`SPACE_SECTIONS.build`). Order of the pane decides the teaser. */
export const FOUNDER_TOOLS: Readonly<Record<string, FounderToolRule>> = {
  // Method pages: the map of the road, readable once there is a talent to walk it with.
  "build-playbook": { stage: "find-top-talent" },
  "build-path": { stage: "find-top-talent" },
  // The Workshop opens on the mission: its instruments open with it.
  "ubb-v2": { stage: "discover-mission" },
  "build-ignite": { stage: "discover-mission" },
  // Matching needs the triad; the Mastermind circle is for people who can be matched.
  "founder-mastermind": { stage: "triad" },
  // The Market opens on a saved offer: the tools that work an offer open with it.
  "equilibrium-v2": { stage: "offer-saved" },
  "founder-cockpit": { stage: "offer-saved" },
  "build-products": { stage: "offer-saved" },
  "build-dashboard": { stage: "offer-saved" },
  // The Town Hall opens on the first sale. Commercial OS and Enter the Cockpit are also
  // admin-only (src/components/game/adminOnlyRows.ts); both gates apply.
  "commercial-os": { stage: "first-sale" },
  "founder-cockpit-dashboard": { stage: "first-sale" },
  "build-holomap": { stage: "first-sale" },
  // Personal pages: only their person sees the row.
  "build-karime": { owner: "karimekurit@gmail.com" },
};
