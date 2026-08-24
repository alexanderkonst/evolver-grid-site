# Lovable prompt — session drops mid-use ("login disappears after a bit")

Paste the fenced block into Lovable.

```
CURRENT SYMPTOM (still happening after the last round of fixes)

PRIMARY, PERSISTENT: when I log in, NO game/journey progress shows at all. The
journey steps are not struck through, the rail does not unlock. This reproduces
on THREE different accounts:
  - alexanderkonst@gmail.com  (user d57e77a6-…, profile cb270523-…, zog_complete)
  - personalytics@gmail.com   (user 20830cf8-…, profile e20f8a34-…, zog_complete)
  - me@sloan.mit.edu          (please look this one up — user id, profile id,
                               onboarding_stage, and whether it actually HAS
                               progress data: last_zog_snapshot_id,
                               mission_discovered_at, resources_mapped_at,
                               last_qol_snapshot_id)

SECONDARY: the login also "disappears after a bit" — the session seems to die
WHILE using the app, and the UI flips between signed-in and guest.

Working theory: these are ONE root. If the session is unstable (drops or fails
to refresh mid-use), every authenticated read — the profile AND the journey-
progress read — intermittently falls back to the guest/empty path, so progress
never renders reliably. Please focus on (a) is the session stable for the whole
page lifecycle, and (b) does the journey-progress read actually return the
completion signals for these accounts when the session IS valid.

PRIME SUSPECT #1 — a client change I made last round that may be CAUSING the
"disappears after a bit"

In src/components/game/GameShellV2.tsx, the onAuthStateChange handler, when it
sees a null session on an event, re-verifies via getSession(); if that is null
and a stored token exists it calls supabase.auth.refreshSession(), and IF THAT
REFRESH FAILS it calls supabase.auth.signOut() and clears the session (around
lines 1030-1060, log strings "stored session failed to validate AND refresh"
and "stale session recovered via refreshSession").

My concern: onAuthStateChange can fire transient/benign null-ish events, and a
refreshSession() call can fail transiently (network blip, a refresh already in
flight in another tab, rotation timing). When it does, this code now ACTIVELY
signs the user out and deletes their token — which would look exactly like
"the login disappears after a bit," and would be WORSE than before (previously
a transient just glitched and recovered on reload; now the token is destroyed).

Please evaluate this first:
- Add temporary logging (or use the existing console lines) and, in a real
  signed-in browser session, watch for: does refreshSession() get called during
  normal use? Does it ever fail? Does signOut() fire? Capture the auth event
  name and the refreshError each time the "failed to validate AND refresh" line
  logs.
- If this handler is the trigger, the fix is to make the sign-out path far less
  aggressive: only sign the user out on an explicit SIGNED_OUT event or a
  DEFINITIVE invalid-refresh-token error (e.g. refresh_token_not_found /
  refresh_token_already_used), never on a transient network failure or an
  in-flight-refresh race. On a transient failure, keep the existing session and
  retry later rather than destroying the token. Propose the exact diff and show
  it to me before applying.

PRIME SUSPECT #2 — token refresh / rotation itself

- What is the Supabase Auth JWT expiry (access token lifetime) for this project?
  If it is set unusually short, sessions will die "after a bit" regardless of
  client code. Report the configured value.
- Is refresh token reuse detection / rotation causing failures? In a live signed-
  in session, watch the network tab for POST /auth/v1/token?grant_type=refresh_token
  calls: do they succeed (200) or fail (400/401)? Capture the response body of
  any failure.
- Multiple GoTrueClient: the app should instantiate exactly ONE supabase client
  (src/integrations/supabase/client.ts, storageKey 'evolver-auth-token',
  persistSession true, autoRefreshToken true). Confirm the browser console does
  NOT show a "Multiple GoTrueClient instances detected" warning during a normal
  session. If it does, two clients are fighting over the same refresh token and
  rotating each other out — report it.
- Does opening the app in more than one tab reproduce it faster? (Two tabs
  sharing one refresh token is a classic cause of mid-session logout.)

ALREADY VERIFIED — do not re-test (it costs credits)

- RLS on game_profiles is correct: a real user JWT reads the populated row over
  the Data API (you proved this).
- Profile rows exist and are correctly linked for both my emails
  (personalytics@gmail.com -> user 20830cf8-…; alexanderkonst@gmail.com ->
  user d57e77a6-…), both onboarding_stage zog_complete.
- Only ONE auth.users row per email — no duplicates, no soft-deletes, no case
  variants.
- preferred_skin and preferred_language columns were missing and you already
  added them (that fixed "languages never save").
- No missing columns otherwise; correct build deployed; no service worker/cache;
  backend healthy (valid anon key, correct clock).

PRIME SUSPECT #3 — the journey-progress read specifically

The progress the user sees comes from the hook src/hooks/useJourneyProgress.ts.
It reads game_profiles by user_id (via getSession) plus probes zog_snapshots /
qol_snapshots / user_assets. In a real signed-in browser session for
personalytics@gmail.com (which has full data), please confirm:
  - the hook's game_profiles read returns the row (not null) with the pointer
    columns populated
  - the zog_snapshots probe (by profile_id) and qol/user_assets probes return
    rows
  - the computed progress flags (journey-start-here, journey-mission-discovery,
    journey-asset-mapper, journey-qol-assess) come out TRUE
  - and that the value actually reaches the UI (SectionsPanel strikethrough) and
    is not discarded by a re-render — check whether the flaky auth listener in
    GameShellV2 is causing repeated remounts/state resets that wipe the loaded
    progress. Capture whether loadProfile / the journey hook run repeatedly.

WHAT I NEED BACK

1. me@sloan.mit.edu: its user id, profile id, onboarding_stage, and whether it
   holds any progress data at all (so we know if "no progress" is expected there
   or a real defect).
2. Whether GameShellV2's refreshSession/signOut path (suspect #1) is firing
   during normal use and destroying live sessions — with the captured events.
3. Whether the journey-progress read (suspect #3) returns TRUE flags for a
   full-data account with a stable session, and whether those flags reach the UI
   or get wiped by re-renders.
4. The configured JWT/access-token expiry, and whether refresh calls succeed.
5. Whether a "Multiple GoTrueClient" warning appears.
6. Your recommended fix, as an exact diff to review before you apply it.

SAFETY
- Do not delete any auth.users, game_profiles, zog_snapshots, qol_snapshots or
  user_assets rows.
- Do not change RLS policies (proven correct) and never USING (true).
- Client code changes: propose the diff first, do not apply until I approve.
- If anything is ambiguous, stop and report.
```
