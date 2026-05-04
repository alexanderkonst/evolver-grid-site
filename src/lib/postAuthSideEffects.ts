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
import { migrateGuestDataToProfile } from "@/modules/zone-of-genius/saveToDatabase";

// Track which user IDs have had `claim-anonymous-zog` invoked for them
// in this browser session. Prevents redundant calls when SIGNED_IN
// fires multiple times for the same user (which can happen on token
// refresh in some supabase-js versions). Cleared on SIGNED_OUT so the
// next sign-in (potentially a different user on a shared browser) is
// processed fresh. Also cleared per-user when claim exhausts retries
// so a future SIGNED_IN can re-attempt.
const claimAttemptedFor = new Set<string>();

let installed = false;

/**
 * Self-healing claim with one auto-retry on transient failure. Why
 * not surface failures to the user? Three reasons:
 *
 *   1. The user's snapshot is SAFE either way — it lives in
 *      `anonymous_genius_results` marked unclaimed until promoted
 *      into a `zog_snapshots` row. Nothing is lost on failure.
 *   2. Most failures are transient (cold-start latency, network
 *      blips). One retry after a brief delay catches them.
 *   3. For permanent failures, there's nothing the USER can do to
 *      recover — the system has to handle it. Their next sign-in
 *      (or magic-link click, or page reload that re-fires SIGNED_IN)
 *      automatically re-attempts. Showing a toast that says "try
 *      signing out and back in" puts work on them for a system
 *      problem.
 *
 * On final failure: clear the dedup-set entry so the next SIGNED_IN
 * for this user retries cleanly. console.error surfaces in dev for
 * debugging; for prod observability, edge-function logs in the
 * Supabase dashboard show failure rates.
 */
async function attemptClaimWithRetry(userId: string): Promise<void> {
    const MAX_ATTEMPTS = 2;
    const RETRY_DELAY_MS = 1500;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            await supabase.functions.invoke("claim-anonymous-zog");
            return; // success — done
        } catch (err) {
            console.warn(
                `[postAuthSideEffects] claim attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
                err,
            );
            if (attempt < MAX_ATTEMPTS) {
                await new Promise((resolve) =>
                    setTimeout(resolve, RETRY_DELAY_MS),
                );
            }
        }
    }

    // All attempts exhausted. Clear the dedup-set entry so the next
    // SIGNED_IN for this user (next session, magic-link click, manual
    // sign-out + sign-in) re-attempts cleanly. The unclaimed row in
    // `anonymous_genius_results` is preserved server-side, so eventual
    // success is just a matter of one more SIGNED_IN happening.
    console.error(
        "[postAuthSideEffects] claim exhausted retries — will retry on next sign-in. Snapshot data is preserved server-side.",
    );
    claimAttemptedFor.delete(userId);
}

/**
 * Install the global auth-state listener. Call once from main.tsx
 * (or App root). Idempotent — second call is a no-op.
 */
export function installPostAuthSideEffects(): void {
    if (installed) return;
    installed = true;

    supabase.auth.onAuthStateChange((event, session) => {
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

            // Day 61 (Sasha 2026-05-04 20:00): MIGRATE guest data
            // BEFORE claim. Closes Case 2 from the edge-case audit:
            // user took quiz unauthed → guest_appleseed_data lives in
            // localStorage → user signs in via ANY path (signup,
            // magic-link recovery for already-registered email,
            // password). Without this hook, only MeGate.onSuccess
            // (fresh signup) called migrateGuestDataToProfile —
            // every other sign-in path orphaned the localStorage
            // data, and the user's NEW quiz results were silently
            // lost in favor of their OLD existing snapshot.
            //
            // Sequencing: migrate FIRST (awaited), claim SECOND.
            // Why: claim-anonymous-zog INSERTs blindly when it
            // finds an unclaimed anonymous_genius_results row.
            // Migrate uses getOrCreateSnapshot (SELECT-then-UPDATE-
            // or-INSERT). If both fired in parallel, both might
            // INSERT and create duplicate snapshots. Sequencing
            // means by the time claim runs, the snapshot row from
            // migrate already exists — claim will still create one
            // for the rare overlap user (had BOTH localStorage AND
            // anonymous_genius_results) but that's an acceptable
            // edge case (getOrCreateSnapshot returns most recent;
            // user sees their data correctly).
            //
            // Async IIFE so the listener callback itself returns
            // synchronously (doesn't block other listeners).
            // claimAttemptedFor dedup at top of block prevents
            // double-firing if SIGNED_IN repeats for same user.
            void (async () => {
                try {
                    await migrateGuestDataToProfile();
                } catch (err) {
                    console.warn(
                        "[postAuthSideEffects] migrateGuestDataToProfile failed:",
                        err,
                    );
                }
                // attemptClaimWithRetry handles its own retries + cleanup.
                attemptClaimWithRetry(userId);
            })();

            // Cache invalidation is decoupled from migrate/claim success.
            // Even if either is still in flight (or fails permanently),
            // the user's auth state is now canonical — any cached
            // snapshot tied to their pre-auth anon profileId is no
            // longer the right thing to serve.
            clearCachedZogSnapshot();
        }
    });
}
