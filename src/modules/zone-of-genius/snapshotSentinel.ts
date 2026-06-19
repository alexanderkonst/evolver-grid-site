/**
 * Single source of truth for the ZoG snapshot "not generated yet" sentinel.
 *
 * When any ZoG save first runs, `getOrCreateSnapshot` (saveToDatabase.ts)
 * seeds a zog_snapshots row with `archetype_title` / `core_pattern` set to
 * this literal sentinel. `saveAppleseed` later overwrites them with the real
 * Top Talent once the Appleseed generation completes.
 *
 * Readers MUST treat the sentinel as "no appleseed yet" — otherwise a
 * freshly-seeded row (e.g. a user who completed Mission/Assets but not the
 * Top Talent assessment) leaks the raw "Pending / I pending" text into the
 * Zone of Genius hero instead of showing the clean empty-state CTA.
 *
 * Centralized here so the writer and the readers cannot drift apart.
 */
export const SNAPSHOT_PENDING_SENTINEL = "Pending";

/**
 * True only when `title` is a real archetype name — not null/blank and not
 * the placeholder sentinel. Use to gate any fallback that builds a minimal
 * AppleseedData from the basic snapshot columns.
 */
export const hasRealArchetype = (title: string | null | undefined): boolean =>
    !!title && title.trim() !== "" && title.trim() !== SNAPSHOT_PENDING_SENTINEL;
