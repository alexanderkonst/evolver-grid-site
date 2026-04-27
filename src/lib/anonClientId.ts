/**
 * Stable anonymous client identifier — Day 53 (Sasha 2026-04-27).
 *
 * Generates a UUID once per browser, persists it in localStorage, and reuses
 * it across sessions. Used as `client_session_id` on `resonance_events`
 * inserts so we can de-duplicate ratings from the same anonymous visitor
 * without forcing them to sign in.
 *
 * The ID is per-browser, NOT per-person. Same person on a different device
 * is a different anon ID, which is correct — they're a different replication
 * data point. Cleared if user clears site data.
 *
 * Used by:
 *   - AiOsSpotlight (AI OS install + self-experiment rating)
 *   - any future anon-friendly resonance/feedback flow
 */

const STORAGE_KEY = "planetary_os_anon_client_id";

/**
 * Get or create the stable anon client id. Returns empty string in SSR /
 * no-window contexts so callers can safely fall back to a no-op insert.
 */
export const getAnonClientId = (): string => {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      // crypto.randomUUID is widely supported in evergreen browsers.
      // The non-crypto fallback below is for the rare contexts where it isn't.
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage blocked (private mode, storage quota, etc.) —
    // return an ephemeral id so the insert still works, just without
    // de-duplication across reloads.
    return `ephemeral-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
};
