# Lovable handoff — signed-in users see an empty profile (Day 148)

Everything below is already verified. Paste the fenced block into Lovable.

```
SYMPTOM (reproducible on at least two accounts)

I sign in successfully. The app shows me as signed in — my email renders in
Settings. But the profile is empty everywhere:
- First Name / Last Name show "—" (the DB row HAS first_name = 'Aleksandr')
- Languages are blank and never save (Save appears to do nothing)
- Avatar shows email-derived initials, no photo
- Journey steps show no completion (step 1 is not struck through)
- The left rail collapses to JOURNEY only
- The "complete profile" PDF export comes out empty

Critically: in Settings, the EMAIL comes from the Supabase auth user object and
it renders correctly, while FIRST/LAST NAME come from the game_profiles row and
render as "—". So the session is valid and the auth user is present, but the
client's game_profiles lookup resolves to nothing.

WHAT IS ALREADY RULED OUT — please do not re-test these, they cost me credits

1. RLS is fine. You already proved it: with a real user JWT over the Data API,
   GET /rest/v1/game_profiles?select=...&user_id=eq.d57e77a6-… returned the
   populated row (HTTP 200). Policies are all PERMISSIVE, no RESTRICTIVE policy,
   grants correct.
2. The rows exist and are correctly linked:
   - personalytics@gmail.com -> profile e20f8a34-d257-4239-b286-64c3b59dfab7,
     user_id 20830cf8-6d0f-4591-8ef3-90881ae8866e, first_name 'Aleksandr',
     onboarding_stage 'zog_complete'
   - alexanderkonst@gmail.com -> profile cb270523-9f09-4696-9fc7-549aaa2da88d,
     user d57e77a6-…-2c92, fully populated
3. No missing columns. Every column list the app selects from game_profiles was
   tested against the live REST API and all returned HTTP 200 (settings pane,
   app shell, journey-progress hook). No schema drift.
4. The correct frontend build is deployed. No service worker, no cache;
   index.html is no-cache.
5. Supabase backend is healthy: anon key valid, clock correct,
   /auth/v1/token?grant_type=password returns a proper 400 invalid_credentials
   for a fabricated user.
6. Frontend session handling was already hardened (deployed): all auth gates now
   use getSession() instead of getUser(); auth-state listeners re-verify before
   demoting to guest; both profile readers self-heal via
   getOrCreateGameProfileId(); Save no longer fails silently.

LEADING HYPOTHESIS — please test this FIRST

The browser may be signed in as a DIFFERENT auth.users id than the one the
profile row is attached to. That happens when the same email exists more than
once in auth.users (e.g. one user created by email+password and another by
magic link or OAuth). The client then queries
.eq('user_id', <the id I am logged in as>) and matches nothing — no error, empty
result — which is exactly the symptom, and it would explain why BOTH of my
accounts behave the same.

  select email, count(*) as user_count,
         array_agg(id) as user_ids,
         array_agg(created_at order by created_at) as created,
         array_agg(last_sign_in_at) as last_sign_in
  from auth.users
  where email in ('personalytics@gmail.com','alexanderkonst@gmail.com')
  group by email;

  -- also catch case/whitespace variants and soft-deleted rows
  select id, email, created_at, last_sign_in_at, deleted_at
  from auth.users
  where lower(trim(email)) in ('personalytics@gmail.com','alexanderkonst@gmail.com')
  order by email, created_at;

IF DUPLICATES EXIST
  Report, per email: which auth id owns the game_profiles row, and which auth id
  I actually sign in as (the one with the most recent last_sign_in_at).
  Then STOP and propose the merge before doing it. Do not delete any auth user
  and do not delete any profile row without my explicit go-ahead. The likely fix
  is to repoint the existing profile (and its zog_snapshots / qol_snapshots /
  user_assets) to the auth id I actually log in with — but I want to approve the
  exact plan first.

IF THERE ARE NO DUPLICATES
  Then please do the live trace you offered. Mint a real session for
  personalytics@gmail.com, load the app in a real browser as that user, and
  capture:
  a) the exact REST request the app issues to /rest/v1/game_profiles on load —
     full URL with the user_id filter, request headers (is the Authorization
     bearer token present and is it the USER token, not the anon key?), and the
     raw response body
  b) the value of the session user id the client is actually holding
     (localStorage key 'evolver-auth-token' -> user.id) compared to
     20830cf8-6d0f-4591-8ef3-90881ae8866e
  c) any console errors or warnings, especially anything prefixed
     [GameShellV2] or [ProfileSettingsSection]
  Tell me where the read diverges: wrong user id, missing/incorrect auth header,
  request never fired, or a response that arrives correctly but gets discarded
  by the client.

SAFETY
- Do not delete any row in auth.users, game_profiles, zog_snapshots,
  qol_snapshots or user_assets.
- Do not change RLS policies — they are proven correct.
- Do not create a policy with USING (true) on game_profiles.
- Everything must be idempotent. If anything is ambiguous, stop and report.

FINALLY
Report exactly: the duplicate-user query output, which hypothesis held, the
evidence, and your recommended fix — but do not apply a data merge until I
approve it.
```
