# Login / "logged in but treated as guest" — root cause + fix (Day 148)

## Verified facts (production, read-only)

- The Day-148 `getSession` fix **is live** in the deployed bundle.
- No service worker, no cache: Sasha is running the new code.
- Supabase backend is healthy: anon key valid (exp 2035), clock correct, and
  `/auth/v1/token?grant_type=password` returns a proper `400 invalid_credentials`
  for a fabricated user. **Sign-in itself works.**

So the break is not sign-in, and not the session race (that one is fixed). It is
**profile resolution after sign-in**.

## Root cause

Migration `20260610200315` tightened `game_profiles` RLS to:

```sql
CREATE POLICY "Users can view own game profile"
  ON public.game_profiles FOR SELECT USING (auth.uid() = user_id);
```

There is no policy covering rows where `user_id IS NULL` (the old anonymous /
device-based profiles). In SQL, `auth.uid() = NULL` evaluates to NULL, never
true — so **an unclaimed anonymous profile row is invisible to everyone** through
the client.

That silently broke the anonymous-to-user attach path in
`src/lib/gameProfile.ts` (~line 100):

```js
const anonymousId = window.localStorage.getItem("game_profile_id");
const { data: anonymousProfile } = await supabase
  .from('game_profiles').select('id, user_id').eq('id', anonymousId).maybeSingle();
if (anonymousProfile && !anonymousProfile.user_id) { /* attach — never runs */ }
```

The SELECT is blocked by RLS, so `anonymousProfile` is `null` even when the row
exists. The attach never happens, and the code falls through to **creating a new,
empty profile**.

### Why this hits older accounts specifically

Accounts created before the attach logic (or before June 10) can have their real
data — ZoG snapshots, mission, assets — sitting on a `game_profiles` row whose
`user_id` is still NULL. After sign-in:

- `loadProfile(user.id)` queries `.eq("user_id", uid)` → no row → `profile = null`
  → shell renders the guest state → **menu collapses to JOURNEY / ME**
- `getOrCreateGameProfileId()` → no row by user_id → attach blocked by RLS →
  **creates a fresh empty profile** → **empty PDF export**, no journey progress
- The original row stays orphaned and unreadable

It looks intermittent because on a browser where `localStorage.game_profile_id`
still matched a row that *was* already attached, everything appears normal; on a
fresh browser or after clearing storage, it doesn't.

## Fix — one Lovable prompt (diagnostic first, no destructive change)

Paste verbatim:

```
Please run these read-only SQL queries against the database and paste the full
results back. Do not modify any data. Do not change any RLS policy yet.

1) How many game_profiles rows are orphaned (never linked to a user)?
   select count(*) as orphaned_profiles
   from public.game_profiles
   where user_id is null;

2) Of those, how many actually carry user data worth recovering?
   select count(*) as orphaned_with_data
   from public.game_profiles
   where user_id is null
     and (last_zog_snapshot_id is not null
          or mission_discovered_at is not null
          or resources_mapped_at is not null
          or last_qol_snapshot_id is not null);

3) Does my own account have a linked profile, and does it have data?
   Replace EMAIL_HERE with my login email.
   select p.id, p.user_id, p.first_name, p.onboarding_stage,
          p.last_zog_snapshot_id, p.mission_discovered_at,
          p.resources_mapped_at, p.created_at
   from public.game_profiles p
   join auth.users u on u.id = p.user_id
   where u.email = 'EMAIL_HERE';

4) How many game_profiles rows exist in total, and how many are linked?
   select count(*) filter (where user_id is not null) as linked,
          count(*) filter (where user_id is null) as unlinked,
          count(*) as total
   from public.game_profiles;
```

### Then, depending on the result

- **Query 3 returns no row** → my account has no linked profile. The fix is a
  targeted backfill linking the correct orphaned row to my `user_id` (identified
  from query 2's data), run once as a migration.
- **Query 3 returns a row but with all data columns null** → the empty profile
  was auto-created by the broken attach path; the real data is on an orphan and
  needs the same targeted backfill.
- **Query 3 returns a row with data** → the profile layer is fine and the
  remaining issue is elsewhere; re-open the investigation with that evidence.

### Structural fix (after the data is recovered)

Do **not** add an RLS policy that lets any authenticated user SELECT rows where
`user_id IS NULL` — that would let anyone enumerate and claim unclaimed profiles.
Move the attach server-side instead: the `claim-anonymous-zog` edge function
already runs with the service role and already has a
`getOrCreateGameProfileId(admin, user)` helper. Extend it to also attach an
unclaimed `game_profiles` row when the client supplies its id, with the service
role performing the update. That keeps the security boundary intact and makes the
attach work again for everyone.
