# Lovable prompt — session drops mid-use ("login disappears after a bit")

Paste the fenced block into Lovable.

```
CURRENT SYMPTOM (still happening after the last round of fixes)

Signed-in users on findyourtoptalent.com:
- log in successfully, but the login "disappears after a bit" — the session
  dies WHILE using the app, not only at boot
- journey progress does not show even while apparently logged in
- overall it flips between signed-in and guest states — "a mess"

This is a SESSION LIFECYCLE problem (a session that works then dies), which is a
different signal from the earlier empty-profile-at-boot issue. Please focus the
investigation on the token refresh lifecycle and the server-side session/JWT
configuration.

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

WHAT I NEED BACK

1. Whether GameShellV2's refreshSession/signOut path (suspect #1) is firing
   during normal use and destroying live sessions — with the captured events.
2. The configured JWT/access-token expiry, and whether refresh calls succeed.
3. Whether a "Multiple GoTrueClient" warning appears.
4. Your recommended fix, as an exact diff to review before you apply it.

SAFETY
- Do not delete any auth.users, game_profiles, zog_snapshots, qol_snapshots or
  user_assets rows.
- Do not change RLS policies (proven correct) and never USING (true).
- Client code changes: propose the diff first, do not apply until I approve.
- If anything is ambiguous, stop and report.
```
