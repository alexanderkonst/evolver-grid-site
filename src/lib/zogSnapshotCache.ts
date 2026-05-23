/**
 * zogSnapshotCache — fast in-memory + sessionStorage cache for the
 * user's most-recent ZoG snapshot.
 *
 * Day 58+ (Sasha 2026-05-03): originally a pure in-memory cache (a
 * single module-level `let cache = null`). That layer alone was
 * fragile — any full SPA reload (hard refresh, back-nav from a
 * cross-origin tab like Stripe, accidental tab close + reopen)
 * dropped the snapshot from memory and the user was bounced back
 * through the assessment funnel as if they had never taken it.
 * Karime walkthrough hit this exact path.
 *
 * Two-tier caching now:
 *   1. **In-memory** — zero-cost reads for the common case, same as
 *      before. Lives only as long as the JS context.
 *   2. **sessionStorage** — survives reloads and within-tab back-nav,
 *      but does NOT persist across browser close (which is what we
 *      want — fresh sessions start clean, no risk of cross-profile
 *      leakage from a shared device). On read, if the memory cache
 *      is empty we hydrate from sessionStorage; on write, we mirror
 *      to both.
 *
 * Note: this cache is a fast-path supplement, NOT the source of
 * truth. The source of truth is the `zog_snapshots` Supabase table.
 * Components that need authoritative data (e.g. AppleseedView via
 * loadSavedData) will still hit Supabase. This cache exists so the
 * ME-space surfaces (ZoneOfGeniusOverview, ZoGPerspectiveView) can
 * paint instantly without waiting for a network roundtrip.
 *
 * Day 80 (Sasha 2026-05-23) — CROSS-USER LEAK FIX. The previous read
 * signature accepted profileId optionally and returned the cached
 * snapshot to ANY caller that didn't pass one. Two surfaces called
 * `getCachedZogSnapshot()` with no argument, which meant Karima's
 * page render received Sasha's cached snapshot when both had used
 * the same browser tab. Read now REQUIRES the current authenticated
 * `userId`; mismatch eagerly clears the cache and returns null. This
 * is a privacy-critical guard: every read site must prove it's the
 * right user before getting the data.
 */
import type { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

export interface CachedZogSnapshot {
    /**
     * Day 80: auth.users.id (NOT game_profiles.id). This is the
     * privacy guard — every read verifies the current session's
     * user.id matches this field. profileId is kept as a secondary
     * key (defense-in-depth) but userId is the canonical identity.
     */
    userId: string;
    profileId: string;
    appleseedData: AppleseedData | null;
    excaliburData: ExcaliburData | null;
    archetypeTitle: string | null;
    corePattern: string | null;
    /**
     * Day 61 (Sasha 2026-05-04): renamed from `topThreeTalents` to
     * disambiguate from the new `topTalentProfile.top_three_talents_compact`
     * field (which lives inside `appleseedData`). This one is the
     * legacy LONG-form sentences from the `top_three_talents` Supabase
     * column — different shape, different render target. The new
     * reveal-box section uses the compact field via appleseedData.
     */
    topThreeTalentsLong: string[] | null;
}

// sessionStorage key — namespaced so it can't collide with anything
// else the app stores.
const SESSION_STORAGE_KEY = "fytt:zog-snapshot-cache:v1";

let cache: CachedZogSnapshot | null = null;

/**
 * Read the cached snapshot from sessionStorage. Used to hydrate the
 * in-memory cache when the JS context is fresh (e.g. after a
 * full-page reload). Returns null if absent or unparseable.
 */
function readFromSessionStorage(): CachedZogSnapshot | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<CachedZogSnapshot>;
        // Day 80: legacy entries (pre-userId-field) are unsafe to
        // serve cross-user. Treat as missing.
        if (!parsed || typeof parsed.userId !== "string" || typeof parsed.profileId !== "string") {
            return null;
        }
        return parsed as CachedZogSnapshot;
    } catch {
        // Corrupted JSON — wipe the bad entry so we don't keep failing.
        try {
            window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {
            // sessionStorage might be disabled (private mode some browsers,
            // strict cookie settings, etc.) — silently fail back to memory-
            // only behavior.
        }
        return null;
    }
}

/**
 * Write the snapshot to sessionStorage. Best-effort: if storage is
 * full or disabled, we silently fall back to memory-only.
 */
function writeToSessionStorage(snapshot: CachedZogSnapshot | null): void {
    if (typeof window === "undefined") return;
    try {
        if (snapshot === null) {
            window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } else {
            window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
        }
    } catch (err) {
        console.warn("[zogSnapshotCache] sessionStorage write failed:", err);
    }
}

/**
 * Day 80 (Sasha 2026-05-23): read signature changed from optional
 * `profileId` to REQUIRED `userId` (+ optional `profileId` defense
 * in depth). Any read site that can't prove the current user's
 * identity must NOT receive a cached snapshot. On userId mismatch,
 * the cache is eagerly cleared so the wrong-user snapshot can't
 * leak to a subsequent read either.
 */
export const getCachedZogSnapshot = (
    userId: string,
    profileId?: string,
): CachedZogSnapshot | null => {
    if (!userId) return null;
    // Memory-cache hit — fast path.
    if (cache) {
        if (cache.userId !== userId) {
            console.warn(
                "[zogSnapshotCache] userId mismatch on memory cache (cached:",
                cache.userId,
                "current:",
                userId,
                ") — clearing.",
            );
            clearCachedZogSnapshot();
            return null;
        }
        if (profileId && cache.profileId !== profileId) {
            console.warn(
                "[zogSnapshotCache] profileId mismatch on memory cache — clearing.",
            );
            clearCachedZogSnapshot();
            return null;
        }
        return cache;
    }
    // Memory miss — try sessionStorage.
    const fromSession = readFromSessionStorage();
    if (!fromSession) return null;
    if (fromSession.userId !== userId) {
        console.warn(
            "[zogSnapshotCache] userId mismatch on sessionStorage cache — clearing.",
        );
        clearCachedZogSnapshot();
        return null;
    }
    if (profileId && fromSession.profileId !== profileId) {
        console.warn(
            "[zogSnapshotCache] profileId mismatch on sessionStorage cache — clearing.",
        );
        clearCachedZogSnapshot();
        return null;
    }
    // Hydrate the memory cache so subsequent reads stay fast.
    cache = fromSession;
    return fromSession;
};

export const setCachedZogSnapshot = (snapshot: CachedZogSnapshot): void => {
    if (!snapshot.userId || !snapshot.profileId) {
        console.warn(
            "[zogSnapshotCache] refusing to cache snapshot without userId+profileId",
        );
        return;
    }
    cache = snapshot;
    writeToSessionStorage(snapshot);
};

export const clearCachedZogSnapshot = (): void => {
    cache = null;
    writeToSessionStorage(null);
};
