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
 * returns a `{id → boolean}` completion map. Companion: `useDeepProfileActivated`
 * still gates item #7 dynamically; that lock is computed in the builder, not here.
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
 *   - To rearrange: move the entry in `JOURNEY_SEQUENCE`. To add/remove an
 *     item: add/remove the entry; the builder + hook adapt automatically as
 *     long as the new `id` is added to `JourneyItemId`.
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
    label: string;
    path: string;
    /** When set, defines what "done" means for this item. Undefined = never auto-completes. */
    completionPredicate?: CompletionPredicate;
    /** Where the completed artifact lives in ME / BUILD. Informational. */
    completionHome?: string;
    /** Hint shown in the locked-row popover when the item is locked. */
    lockedHint?: string;
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

export const JOURNEY_SEQUENCE: JourneyItem[] = [
    {
        id: "find-top-talent",
        label: "1. Start by finding your top talent",
        path: "/",
        completionHome: "/game/me/zone-of-genius",
        completionPredicate: async ({ supabase, profileId }) =>
            profileId ? anyRowExists(supabase, "zog_snapshots", "profile_id", profileId) : false,
    },
    {
        id: "take-playbook",
        label: "2. Take the exact playbook",
        path: "/playbook",
        // No predicate Wave 1 — "visited the playbook" is a localStorage signal
        // we haven't wired yet. Row will not auto-complete; user navigates freely.
    },
    {
        id: "see-path",
        label: "3. See the shortcut path to your business",
        path: "/path",
    },
    {
        id: "see-dashboard",
        label: "4. See how we're building this",
        path: "/dashboard",
    },
    {
        id: "map-assets",
        label: "5. Map your assets",
        path: "/asset-mapping",
        completionHome: "/game/me/assets",
        completionPredicate: async ({ supabase, userId }) =>
            userId ? anyRowExists(supabase, "user_assets", "user_id", userId) : false,
    },
    {
        id: "assess-qol",
        label: "6. Assess your quality of life",
        path: "/quality-of-life-map/assessment",
        completionHome: "/game/me/quality-of-life",
        completionPredicate: async ({ supabase, profileId }) =>
            profileId ? anyRowExists(supabase, "qol_snapshots", "profile_id", profileId) : false,
    },
    {
        id: "build-business",
        label: "7. Build a business off your top talent",
        path: "/ubb",
        // Lock is dynamic (computed in the builder from useDeepProfileActivated)
        // — not in the data file so the file stays pure data with no hook deps.
        lockedHint: "Unlocks after activation.",
        // Completion = "UBB canvas reached PMF threshold" — definition TBD,
        // not wired Wave 1.
    },
    {
        id: "discover-mission",
        label: "8. Discover your mission",
        path: "/mission-discovery",
        // Static-locked at the builder level (always true today).
        lockedHint: "Unlocks after you build a business off your top talent.",
        // Completion = mission artifact exists; the mission feature itself
        // isn't built yet, so no predicate.
    },
];

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
 * propagation into ME-space rows / SpacesRail badges / PlayerStatsBadge
 * without changing the pane code. Per the holonic roast (P8 — Platform as
 * Nervous System): build the seam now even if the consumers come later.
 *
 * Event detail shape: `{ id: JourneyItemId }`
 */
export const JOURNEY_ITEM_COMPLETED_EVENT = "journeyItemCompleted";
