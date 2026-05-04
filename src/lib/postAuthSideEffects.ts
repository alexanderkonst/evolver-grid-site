/**
 * postAuthSideEffects — single source of truth for what happens after
 * a Supabase auth state transition.
 *
 * Day 60+ (Sasha 2026-05-04): consolidates the post-auth logic that
 * previously lived in two parallel places (AuthCallback for the
 * magic-link flow, MeGate for the inline password-signup gate).
 * Karime walkthrough surfaced the cost of that drift: MeGate's
 * onSuccess called `getOrCreateGameProfileId()` but never invoked
 * `claim-anonymous-zog`, so users who signed up via the inline ME
 * gate had their anonymous ZoG snapshot orphaned (lived in
 * `anonymous_genius_results` table, never promoted into a real
 * `zog_snapshots` row tied to their new account).
 *
 * The architecture lesson: per-form post-auth hooks DRIFT. Every new
 * auth entry point (today: 2; in 6 months: more) is a fresh chance to
 * forget the side effects. A single auth-state listener at App root
 * removes that risk — new entry points automatically get the correct
 * behavior because the side effects fire from the auth event, not the
 * form's success callback.
 *
 * What runs on SIGNED_IN:
 *   1. `claim-anonymous-zog` edge function — promotes any unclaimed
 *      anonymous ZoG result row (matched by email) into a real
 *      `zog_snapshots` row tied to the user's `game_profile`.
 *      Idempotent: returns `{ claimed: false }` if there's nothing
 *      to claim, so it's safe to call regardless of how the user
 *      signed in.
 *   2. `clearCachedZogSnapshot` — invalidates the in-memory +
 *      sessionStorage cache so the next page paint refetches from
 *      Supabase and picks up the just-claimed snapshot, instead of
 *      serving a stale "empty" cache from the pre-auth session.
 *
 * What runs on SIGNED_OUT:
 *   • `clearCachedZogSnapshot` — prevents user-A's snapshot leaking
 *     into user-B's session if they share a browser.
 *   • Reset the per-user dedup set so the next sign-in (potentially
 *     a different user) is processed cleanly.
 *
 * Race-condition note: `claim-anonymous-zog` is NOT transactionally
 * atomic. If two callers fire concurrently for the same user, both
 * may find the same unclaimed row and both insert into
 * `zog_snapshots` → duplicate row. To avoid this, this module is
 * the SOLE caller of `claim-anonymous-zog` in client code. Per-form
 * explicit calls in AuthCallback / MeGate were removed when this
 * module was introduced.
 */
import { supabase } from "@/integrations/supabase/client";
import { clearCachedZogSnapshot } from "@/lib/zogSnapshotCache";

// Track which user IDs have had `claim-anonymous-zog` invoked for them
// in this browser session. Prevents redundant calls when SIGNED_IN
// fires multiple times for the same user (which can happen on token
// refresh in some supabase-js versions). Cleared on SIGNED_OUT so the
// next sign-in (potentially a different user on a shared browser) is
// processed fresh.
const claimAttemptedFor = new Set<string>();

let installed = false;

/**
 * Install the global auth-state listener. Call once from main.tsx
 * (or App root). Idempotent — second call is a no-op.
 */
export function installPostAuthSideEffects(): void {
    if (installed) return;
    installed = true;

    supabase.auth.onAuthStateChange(async (event, session) => {
        // SIGNED_OUT — clear cache, reset dedup set so next sign-in
        // (potentially a different user on a shared browser) is
        // processed fresh.
        if (event === "SIGNED_OUT") {
            clearCachedZogSnapshot();
            claimAttemptedFor.clear();
            return;
        }

        // SIGNED_IN — only on actual sign-in transitions, NOT on
        // INITIAL_SESSION (which fires on page load when a returning
        // user's session restores from storage). The latter would
        // re-call claim on every page reload, which is wasted network
        // and (more importantly) a useless edge-function invocation
        // since returning users have already been claimed.
        if (event === "SIGNED_IN" && session?.user?.id) {
            const userId = session.user.id;
            if (claimAttemptedFor.has(userId)) return;
            claimAttemptedFor.add(userId);

            try {
                await supabase.functions.invoke("claim-anonymous-zog");
            } catch (err) {
                console.warn(
                    "[postAuthSideEffects] claim-anonymous-zog failed:",
                    err,
                );
                // Allow retry on the next SIGNED_IN for this user
                // (e.g., they sign out + back in to recover).
                claimAttemptedFor.delete(userId);
            }
            // Always clear the cache after an auth transition — even
            // if claim was a no-op (returning user, nothing to claim),
            // we want the next page paint to refetch fresh data
            // tied to the now-authenticated user.
            clearCachedZogSnapshot();
        }
    });
}
