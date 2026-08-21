# One-shot conditional Lovable prompt — orphaned profile fix (Day 148)

Single prompt: diagnose, then act on the result without a second round trip.
Paste everything inside the fence verbatim.

```
CONTEXT
Signed-in users (especially older accounts) are being treated as guests: the
left menu collapses to JOURNEY/ME, journey steps stop showing as completed, and
the profile PDF exports empty. Sign-in itself works — I verified the backend is
healthy and the frontend session fix is deployed.

Suspected cause: migration 20260610200315 set the game_profiles SELECT policy to
USING (auth.uid() = user_id), with no policy covering rows where user_id IS NULL.
Because auth.uid() = NULL is never true, unclaimed anonymous profile rows became
invisible to the client. That broke the anonymous-to-user attach in
src/lib/gameProfile.ts (its SELECT of the localStorage profile id returns null
even when the row exists), so the code falls through and creates a NEW EMPTY
profile while the real data stays orphaned on the unlinked row.

This prompt is conditional. Run STEP 1, then follow whichever branch the results
match. Report what you found and what you did at the end.

SAFETY RULES (apply to every step)
- Never DELETE any row in game_profiles, zog_snapshots, qol_snapshots, or
  user_assets. This is a recovery task, not a cleanup task.
- Never add an RLS policy that lets authenticated users SELECT or UPDATE rows
  where user_id IS NULL. That would let any user claim anyone's orphaned
  profile. If you think you need that, stop and tell me instead.
- Every write must be idempotent and safe to re-run.
- game_profiles.user_id has a UNIQUE index. Never try to attach a second row to
  a user_id that already has one.
- If anything is ambiguous, STOP and report rather than guessing.

STEP 1 — DIAGNOSE (read-only)

1a) select count(*) filter (where user_id is not null) as linked,
           count(*) filter (where user_id is null)     as unlinked,
           count(*) as total
    from public.game_profiles;

1b) select count(*) as orphaned_with_data
    from public.game_profiles
    where user_id is null
      and (last_zog_snapshot_id is not null
           or mission_discovered_at is not null
           or resources_mapped_at is not null
           or last_qol_snapshot_id is not null);

1c) My account. Replace EMAIL_HERE with the email I give you.
    select p.id, p.user_id, p.first_name, p.onboarding_stage,
           p.last_zog_snapshot_id, p.mission_discovered_at,
           p.resources_mapped_at, p.last_qol_snapshot_id, p.created_at
    from auth.users u
    left join public.game_profiles p on p.user_id = u.id
    where u.email = 'EMAIL_HERE';

1d) Candidate orphaned rows that could be mine, newest first:
    select p.id, p.first_name, p.last_name, p.created_at,
           p.last_zog_snapshot_id, p.mission_discovered_at, p.resources_mapped_at
    from public.game_profiles p
    where p.user_id is null
      and (p.last_zog_snapshot_id is not null
           or p.mission_discovered_at is not null
           or p.resources_mapped_at is not null
           or p.last_qol_snapshot_id is not null)
    order by p.created_at desc
    limit 20;

NOW BRANCH ON THE RESULTS.

BRANCH A — 1c returns NO profile row (p.id is null) and 1d shows exactly ONE
plausible match for me by name/date.
  Attach that orphan to my user, in a single transaction:
    update public.game_profiles
    set user_id = (select id from auth.users where email = 'EMAIL_HERE')
    where id = 'ORPHAN_ID_FROM_1d'
      and user_id is null;
  Then re-run 1c and paste the result to confirm it now returns my data.

BRANCH B — 1c returns a profile row but ALL of
last_zog_snapshot_id / mission_discovered_at / resources_mapped_at /
last_qol_snapshot_id are null (an empty auto-created profile), AND 1d shows
exactly ONE plausible match for me.
  Do NOT change user_id on either row (the UNIQUE index forbids it).
  Instead copy the data across to my existing linked profile and repoint the
  child records, in one transaction. Let MY_ID = the id from 1c and
  ORPHAN_ID = the id from 1d:
    update public.game_profiles dst
    set last_zog_snapshot_id = coalesce(dst.last_zog_snapshot_id, src.last_zog_snapshot_id),
        mission_discovered_at = coalesce(dst.mission_discovered_at, src.mission_discovered_at),
        resources_mapped_at   = coalesce(dst.resources_mapped_at,   src.resources_mapped_at),
        last_qol_snapshot_id  = coalesce(dst.last_qol_snapshot_id,  src.last_qol_snapshot_id),
        mission_statement     = coalesce(dst.mission_statement,     src.mission_statement),
        onboarding_stage      = coalesce(nullif(dst.onboarding_stage,'new'), src.onboarding_stage)
    from public.game_profiles src
    where dst.id = 'MY_ID' and src.id = 'ORPHAN_ID';

    update public.zog_snapshots set profile_id = 'MY_ID' where profile_id = 'ORPHAN_ID';
    update public.qol_snapshots set profile_id = 'MY_ID' where profile_id = 'ORPHAN_ID';
  Leave the orphan row in place (do not delete it). Re-run 1c and paste it.

BRANCH C — 1c returns a profile row that ALREADY has data in those columns.
  Then my data is linked correctly and the diagnosis is wrong. Do NOT change any
  data. Just paste the results of 1a-1d and stop. I will re-open the
  investigation with that evidence.

BRANCH D — 1d shows MORE THAN ONE plausible match, or none, or you are unsure
which row is mine.
  Do NOT guess and do NOT modify anything. Paste the full 1d list and stop.

STRUCTURAL FIX (do this in ALL branches except C, so the bug stops recurring
for every other user)

The anonymous-to-user attach must move server-side, because the client can no
longer read unclaimed rows and must not be allowed to.

In supabase/functions/claim-anonymous-zog/index.ts there is already a service-
role admin client and a getOrCreateGameProfileId(admin, user) helper. Extend
that function to accept an optional anonymous_profile_id in the request body.
When it is supplied, and only using the service-role client:
  1. Look up that game_profiles row.
  2. If and only if its user_id IS NULL, and the caller's user does not already
     have a linked profile, set its user_id to the caller's user id.
  3. If the caller already has a linked profile, copy the non-null data columns
     across with coalesce and repoint zog_snapshots/qol_snapshots.profile_id,
     exactly as in BRANCH B. Never delete the source row.
  4. Return which action was taken.
Keep it idempotent: a second call with the same id must be a harmless no-op.
Do not change any RLS policy to make this work — the service role bypasses RLS
by design, which is exactly why the attach belongs here.

Then in src/lib/gameProfile.ts, where the code currently tries to SELECT the
localStorage anonymous profile id directly (that SELECT is blocked by RLS and
always returns null), replace it with a call to that edge function, passing the
localStorage game_profile_id. Keep all existing fallback behavior if the call
fails.

FINALLY
Report: which branch you took, the before/after of query 1c, what you changed in
the edge function and gameProfile.ts, and confirm you deleted nothing.
```

## Notes for Sasha

- Replace `EMAIL_HERE` with your login email in three places (1c, and in
  branch A/B), or just tell Lovable the email once at the top.
- Branch C is the honest exit: if my diagnosis is wrong, it changes nothing and
  reports back, so a wrong guess costs you data-safety nothing.
- The structural fix is what stops this happening to every future user; the
  branch work only recovers your own account.
