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
 */
import type { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

export interface CachedZogSnapshot {
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
        return JSON.parse(raw) as CachedZogSnapshot;
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

export const getCachedZogSnapshot = (
    profileId?: string,
): CachedZogSnapshot | null => {
    // Memory-cache hit — fast path.
    if (cache) {
        if (profileId && cache.profileId !== profileId) return null;
        return cache;
    }
    // Memory miss — try sessionStorage. If we find a valid entry,
    // hydrate the memory cache so subsequent reads stay fast.
    const fromSession = readFromSessionStorage();
    if (fromSession) {
        cache = fromSession;
        if (profileId && fromSession.profileId !== profileId) return null;
        return fromSession;
    }
    return null;
};

export const setCachedZogSnapshot = (snapshot: CachedZogSnapshot): void => {
    cache = snapshot;
    writeToSessionStorage(snapshot);
};

export const clearCachedZogSnapshot = (): void => {
    cache = null;
    writeToSessionStorage(null);
};
