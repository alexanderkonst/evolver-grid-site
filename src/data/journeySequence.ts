/**
 * journeySequence.ts — single source of truth for the JOURNEY pane's
 * item list (the "second pane" sequence when JOURNEY is the active Space).
 *
 * Day 67 (Sasha 2026-05-10): extracted from the inline hardcoded array
 * that used to live inside `SectionsPanel.tsx → buildJourneySections()`.
 *
 * The motivation (Sasha): "I want an easy way to rearrange them" —
 * before, every reorder was a code-edit + comment-paragraph dance inside
 * a function body. Now: move an array entry. The function `buildJourneySections`
 * reads from this file and overlays UI state (locked, completed, active).
 *
 * Companion: `src/hooks/useJourneyCompletion.ts` evaluates predicates and
 * returns a `{id → boolean}` completion map.
 *
 * WP-13 (2026-10-27): order follows game_of_being_you.md §14.2 (Mission before
 * business). The JOURNEY pane (`SectionsPanel.buildJourneySections`) and Home
 * (`useCharacterSheet`) both read `JOURNEY_MAIN`; the rail's MAIN QUEST entry opens
 * that pane.
 *
 * Conventions:
 *   - `id` is a stable string used by the completion map, the localStorage
 *     "last-seen-completion-state" cache, and the `journeyItemCompleted` event.
 *     Don't rename without a migration.
 *   - `completionPredicate` is async and runs ONLY for items not currently
 *     locked (so we never query for items the user can't see complete).
 *   - `completionHome` is informational — it documents where the produced
 *     artifact lives in ME / BUILD so a future "click crossed-off row → land
 *     on archive instead of redo" feature has the data ready. Today the row
 *     still routes to `path` even when completed (per the design call:
 *     completion is a visual layer, not a redirect).
 *   - To rearrange: move the entry in `JOURNEY_SEQUENCE`. To add/remove a main
 *     item: add/remove the entry and its row in `buildJourneySections`; the
 *     new `id` must be added to `JourneyItemId`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type JourneyItemId =
    | "find-top-talent"
    | "take-playbook"
    | "see-path"
    | "see-dashboard"
    | "map-assets"
    | "assess-qol"
    | "build-business"
    | "discover-mission";

export type CompletionContext = {
    supabase: SupabaseClient;
    /** auth.users.id — for tables keyed on user_id (e.g. user_assets) */
    userId: string | null;
    /** game_profiles.id — for tables keyed on profile_id (e.g. zog_snapshots, qol_snapshots) */
    profileId: string | null;
};

export type CompletionPredicate = (ctx: CompletionContext) => Promise<boolean>;

export type JourneyItem = {
    id: JourneyItemId;
    /** "main" = a step of the Journey (§14.2); "extra" = tutorial lore, off the main path. */
    kind: "main" | "extra";
    /**
     * The one name of this step, everywhere it is listed (`/`, Home, `/ignite`, the
     * Quest Board pane). No ordinal in the string: lists render the number from the step's
     * position in `JOURNEY_MAIN`, so a reorder never leaves a stale «3.» behind.
     * Localised through `journeyStepLabel` (src/lib/journeyLabels.ts).
     */
    label: string;
    path: string;
    /**
     * True when the Journey works without this step. It is marked «optional» wherever the
     * list is drawn, and nothing downstream requires it: one answer for every list.
     */
    optional?: boolean;
    /** When set, defines what "done" means for this item. Undefined = never auto-completes. */
    completionPredicate?: CompletionPredicate;
    /** Where the completed artifact lives in ME / BUILD. Informational. */
    completionHome?: string;
    /** Items that must be done first. Drives the closed state at Home. */
    requires?: JourneyItemId[];
    /** Line shown while the item is closed: «Opens when <real event>. Inside: <result>.» (§14.3). */
    lockedHint?: string;
    /**
     * What the player gets, as a clause that follows a dash: «you'll know what is yours to do
     * in the world.» It is the Intro's promise (§14.4) and the village's next-move hint (§14.6).
     * Must match the module's Master Result.
     */
    result?: string;
    /**
     * The checkable completion criterion, as the clause after the «Done when» label on the
     * Quest Board: «your top talent shows on your Home.» The player checks it for themselves.
     */
    doneWhen?: string;
    /** Where ENTER in the village goes when it is not `path` (the title `/` is no place to enter). */
    enter?: string;
};

/**
 * Helper: returns `true` if any row exists in `table` matching `column = value`.
 * Uses `head: true` + `count: "exact"` so no payload is fetched — just the count.
 */
const anyRowExists = async (
    supabase: SupabaseClient,
    table: string,
    column: string,
    value: string,
): Promise<boolean> => {
    const { count, error } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq(column, value);
    if (error) return false;
    return (count ?? 0) > 0;
};

/**
 * The order below is the canonical Journey (docs/02-strategy/game_of_being_you.md
 * §14.2, decided 2026-10-27, §14.10): Mission before business.
 * Top talent → Mission → QoL → Assets → Business (uniqueness, then tagline).
 *
 * `lockedHint` follows the §14.3 line: «Opens when <real event>. Inside: <result>.»
 * Hints here are English fallbacks; the pane reads `rail.journey.*` and Home
 * reads `characterSheet.quests.locked.*` first. Keep the three in step.
 */
export const JOURNEY_SEQUENCE: JourneyItem[] = [
    {
        id: "find-top-talent",
        kind: "main",
        label: "Start by finding your top talent",
        path: "/",
        enter: "/zone-of-genius/entry",
        result: "you'll see your top talent and keep your character.",
        doneWhen: "your top talent shows on your Home.",
        completionHome: "/game/me/zone-of-genius",
        completionPredicate: async ({ supabase, profileId }) =>
            profileId ? anyRowExists(supabase, "zog_snapshots", "profile_id", profileId) : false,
    },
    {
        id: "discover-mission",
        kind: "main",
        label: "Discover your mission",
        path: "/mission-discovery",
        result: "you'll know what is yours to do in the world.",
        doneWhen: "one sentence of your mission is saved at Home.",
        requires: ["find-top-talent"],
        lockedHint: "Opens when your top talent is saved. Inside: what is yours to do in the world.",
        // No predicate: a committed mission (mission_participants) is the artifact
        // that satisfies it, and `useCharacterSheet` reads that row.
    },
    {
        id: "assess-qol",
        kind: "main",
        label: "Assess your quality of life",
        // Optional since Sasha, 2026-05-22 (Day 79): nothing downstream requires QoL.
        // The mark lives here so every list shows the same answer.
        optional: true,
        path: "/quality-of-life-map/assessment",
        result: "you'll know your real level, private to you.",
        doneWhen: "all eight areas are answered and your level shows.",
        completionHome: "/game/me/quality-of-life",
        requires: ["discover-mission"],
        lockedHint: "Opens when your mission is saved. Inside: your real level, private to you.",
        completionPredicate: async ({ supabase, profileId }) =>
            profileId ? anyRowExists(supabase, "qol_snapshots", "profile_id", profileId) : false,
    },
    {
        id: "map-assets",
        kind: "main",
        label: "Map your assets",
        path: "/asset-mapping",
        result: "you'll hold the inventory of everything you can build with.",
        doneWhen: "your skills, experience and network sit in one inventory.",
        completionHome: "/game/me/assets",
        requires: ["discover-mission"],
        lockedHint: "Opens when your mission is saved. Inside: your inventory of everything you can build with.",
        completionPredicate: async ({ supabase, userId }) =>
            userId ? anyRowExists(supabase, "user_assets", "user_id", userId) : false,
    },
    {
        id: "build-business",
        kind: "main",
        label: "Build a business off your top talent",
        path: "/ubb",
        result: "you'll have your uniqueness in one phrase, then your tagline.",
        doneWhen: "your uniqueness phrase and your tagline are both saved.",
        requires: ["find-top-talent", "discover-mission", "map-assets"],
        lockedHint:
            "Opens when your top talent, mission and assets are saved. Inside: your uniqueness in one phrase, then your tagline.",
        // The JOURNEY pane also opens this row on activation (useDeepProfileActivated);
        // that OR is computed in the builder, not here, so this file stays pure data.
        // Completion = "UBB canvas reached PMF threshold" — definition TBD, not wired.
        // Journey steps 6 (uniqueness) and 7 (tagline) of §14.2 live inside this item.
    },
    // Tutorial lore, not Journey steps (§14.2). The pages stay; they only leave
    // the main sequence, the pane and Home.
    {
        id: "take-playbook",
        kind: "extra",
        label: "Take the exact playbook",
        path: "/playbook",
    },
    {
        id: "see-path",
        kind: "extra",
        label: "See the shortcut path to your business",
        path: "/path",
    },
    {
        id: "see-dashboard",
        kind: "extra",
        label: "See how we're building this",
        path: "/dashboard",
    },
];

/** The Journey proper, in §14.2 order. Everything that renders Journey order reads this. */
export const JOURNEY_MAIN: JourneyItem[] = JOURNEY_SEQUENCE.filter((i) => i.kind === "main");

/** Tutorial / extras: stay in the completion map, never rendered as Journey steps. */
export const JOURNEY_EXTRAS: JourneyItem[] = JOURNEY_SEQUENCE.filter((i) => i.kind === "extra");

/**
 * localStorage key for the "last-seen completion state" cache.
 *
 * Used by the JOURNEY pane to fire a one-shot glow pulse on rows whose
 * completion state has flipped from false → true since the user's previous
 * visit. The shape stored under this key is `Record<JourneyItemId, boolean>`.
 */
export const JOURNEY_LAST_SEEN_KEY = "journey:last-seen-completion-v1";

/**
 * DOM event name dispatched when an item transitions to completed.
 *
 * Wave 1: nothing listens. The event is a SEAM so a later wave can wire
 * propagation into ME-space rows / SpacesRail badges
 * without changing the pane code. Per the holonic roast (P8 — Platform as
 * Nervous System): build the seam now even if the consumers come later.
 *
 * Event detail shape: `{ id: JourneyItemId }`
 */
export const JOURNEY_ITEM_COMPLETED_EVENT = "journeyItemCompleted";

/**
 * Fire the completion event. Call it right after a module writes the artifact
 * that satisfies an item's `completionPredicate`. The Character Sheet
 * (`/game/me/overview`) listens and re-evaluates without a reload.
 */
export const dispatchJourneyItemCompleted = (id: JourneyItemId): void => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(JOURNEY_ITEM_COMPLETED_EVENT, { detail: { id } }));
};
