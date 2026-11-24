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
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { migrateGuestDataToProfile } from "@/modules/zone-of-genius/saveToDatabase";
// 2026-10-24 incident: claims go through the ownership guard (see file).
import { claimAnonymousZogIfAllowed } from "@/lib/anonClaimGuard";

// One guest-result sync per user ID per page load, memoised as a promise so every
// caller (the SIGNED_IN listener below, and the gating loaders via
// `awaitGuestResultSync`) shares the SAME in-flight run. Prevents redundant calls when
// SIGNED_IN fires multiple times for the same user (token refresh in some supabase-js
// versions) and prevents the migrate/claim double-INSERT race documented above.
// Cleared on SIGNED_OUT so the next sign-in (potentially a different user on a shared
// browser) is processed fresh. Also cleared per-user when claim exhausts retries so a
// future SIGNED_IN can re-attempt.
const syncByUser = new Map<string, Promise<void>>();

// Issue #370: a loader (not a sign-in transition) only needs to run the sync the first
// time on this device. Once it has finished cleanly for a user, remember that.
const SYNC_DONE_KEY_PREFIX = "fytt:guest-sync-done:v1:";

function wasSyncedBefore(userId: string): boolean {
    try {
        return typeof window !== "undefined" && window.localStorage.getItem(SYNC_DONE_KEY_PREFIX + userId) === "1";
    } catch {
        return false;
    }
}

function rememberSynced(userId: string): void {
    try {
        if (typeof window !== "undefined") window.localStorage.setItem(SYNC_DONE_KEY_PREFIX + userId, "1");
    } catch {
        // storage disabled: the loader just re-runs the (idempotent) sync next load.
    }
}

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
async function attemptClaimWithRetry(): Promise<boolean> {
    const MAX_ATTEMPTS = 2;
    const RETRY_DELAY_MS = 1500;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const result = await claimAnonymousZogIfAllowed("postAuth");
            if (result === "error") throw new Error("claim-anonymous-zog failed");
            return true; // success (or deliberately skipped) — done
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

    // All attempts exhausted. The caller clears the memoised entry so the next
    // SIGNED_IN for this user (next session, magic-link click, manual
    // sign-out + sign-in) re-attempts cleanly. The unclaimed row in
    // `anonymous_genius_results` is preserved server-side, so eventual
    // success is just a matter of one more SIGNED_IN happening.
    console.error(
        "[postAuthSideEffects] claim exhausted retries — will retry on next sign-in. Snapshot data is preserved server-side.",
    );
    return false;
}

/**
 * Sync the guest Top Talent result into the signed-in account: migrate the localStorage
 * buffer FIRST, claim the anonymous row SECOND (see the sequencing note in the listener).
 * Memoised per user; callers share one run. `force` (a real sign-in transition) ignores
 * the "already synced on this device" memory.
 */
function syncGuestResult(userId: string, force: boolean): Promise<void> {
    const existing = syncByUser.get(userId);
    if (existing) return existing;
    if (!force && wasSyncedBefore(userId)) return Promise.resolve();

    const run = (async () => {
        // Issue #419: seed the game_profiles row (with the signup first/last name from auth
        // metadata) on a real sign-in, so House shows the name before any module has run.
        // Runs first and is awaited, so migrate/claim below find the row instead of racing to
        // insert it. Only on a sign-in transition: loaders must not re-trigger profile reads.
        if (force) {
            try {
                await getOrCreateGameProfileId();
            } catch (err) {
                console.warn("[postAuthSideEffects] profile seed failed:", err);
            }
        }
        let migrated = true;
        try {
            await migrateGuestDataToProfile();
        } catch (err) {
            migrated = false;
            console.warn("[postAuthSideEffects] migrateGuestDataToProfile failed:", err);
        }
        // attemptClaimWithRetry handles its own retries.
        const claimed = await attemptClaimWithRetry();
        // Whatever was cached before the result reached the account is stale now.
        clearCachedZogSnapshot();
        if (claimed) {
            if (migrated) rememberSynced(userId);
        } else {
            syncByUser.delete(userId); // let a later SIGNED_IN / load try again
        }
    })();
    syncByUser.set(userId, run);
    return run;
}

/**
 * Issue #370: gate on the sync. A player who just confirmed their email lands on a gated
 * route (e.g. /mission-discovery) with a session but with the guest Top Talent not yet in
 * the account; reading the save before the sync finishes showed «Not open yet». The
 * loaders call this before they read, so the gate is decided AFTER the result is synced.
 * Bounded: a slow edge function never holds the page (the sync keeps running; `onLate`
 * fires if it finishes after the wait gave up so the caller can re-read). Never throws.
 */
export async function awaitGuestResultSync(
    userId: string,
    opts: { timeoutMs?: number; onLate?: () => void } = {},
): Promise<void> {
    const { timeoutMs = 6000, onLate } = opts;
    try {
        const sync = syncGuestResult(userId, false);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const timedOut = new Promise<"timeout">((resolve) => {
            timer = setTimeout(() => resolve("timeout"), timeoutMs);
        });
        const outcome = await Promise.race([sync.then(() => "done" as const), timedOut]);
        if (timer) clearTimeout(timer);
        if (outcome === "timeout" && onLate) void sync.then(onLate, () => {});
    } catch (err) {
        console.warn("[postAuthSideEffects] awaitGuestResultSync failed:", err);
    }
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
            syncByUser.clear();
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
            if (syncByUser.has(userId)) return;

            // Day 61 (Sasha 2026-05-04 20:00): MIGRATE guest data
            // BEFORE claim, via ANY sign-in path (signup, magic-link,
            // password) — see syncGuestResult for the sequencing and the
            // reasons (migrate = SELECT-then-UPDATE-or-INSERT, claim =
            // blind INSERT; parallel runs would duplicate the snapshot).
            // Issue #370: the same memoised run is what the gating loaders
            // await, so they never read the save before it is synced.
            //
            // Not awaited here: the listener callback itself returns
            // synchronously (doesn't block other listeners).
            void syncGuestResult(userId, true);

            // Cache invalidation is decoupled from migrate/claim success.
            // Even if either is still in flight (or fails permanently),
            // the user's auth state is now canonical — any cached
            // snapshot tied to their pre-auth anon profileId is no
            // longer the right thing to serve.
            clearCachedZogSnapshot();
        }
    });
}
