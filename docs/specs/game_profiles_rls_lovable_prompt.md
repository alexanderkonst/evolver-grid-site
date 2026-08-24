# Lovable prompt — is RLS hiding game_profiles from the browser? (Day 148)

One prompt, self-branching. Paste everything inside the fence.

```
CONTEXT
Signed-in users on findyourtoptalent.com see an empty profile: no first/last
name, languages never save, no journey progress, empty PDF export, and the left
rail collapses. This happens on multiple accounts.

But a SQL check you ran earlier showed my game_profiles row exists, is correctly
linked to my user_id, and is fully populated. Those two facts only reconcile one
way: the SQL editor bypasses RLS, the browser does not. A row that RLS hides
returns { data: null, error: null } to the client — identical to "no row" — so
the app silently renders an empty profile and nothing errors.

Please determine whether RLS on public.game_profiles is blocking authenticated
users from SELECTing their own row, then act on the result.

STEP 1 — INSPECT (read-only)

1a) Is RLS enabled, and what policies exist right now?
    select relname, relrowsecurity, relforcerowsecurity
    from pg_class where relname = 'game_profiles';

    select policyname, permissive, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public' and tablename = 'game_profiles'
    order by cmd, policyname;

1b) Simulate the browser's exact read AS my authenticated user.
    Replace MY_USER_ID with the user_id you found for my account earlier.
    begin;
      select set_config('role','authenticated',true);
      select set_config('request.jwt.claims',
        json_build_object('sub','MY_USER_ID','role','authenticated')::text, true);
      select id, first_name, last_name, onboarding_stage
      from public.game_profiles
      where user_id = 'MY_USER_ID';
    rollback;

BRANCH ON 1b.

BRANCH A — 1b returns ZERO rows (but the row exists when queried normally).
  Confirmed: RLS is hiding it. Fix the SELECT policy. Requirements:
   - Do NOT use USING (true). Users must only ever read their own row.
   - Check 1a's output first: if any policy on this table is PERMISSIVE = false
     (i.e. RESTRICTIVE), that is what's blocking reads — report it to me before
     dropping it, because it may have been added deliberately.
   - Otherwise ensure exactly these three policies exist and are permissive,
     granted to the authenticated role:

    DROP POLICY IF EXISTS "Users can view own game profile" ON public.game_profiles;
    CREATE POLICY "Users can view own game profile"
      ON public.game_profiles FOR SELECT TO authenticated
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own game profile" ON public.game_profiles;
    CREATE POLICY "Users can update own game profile"
      ON public.game_profiles FOR UPDATE TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own game profile" ON public.game_profiles;
    CREATE POLICY "Users can insert own game profile"
      ON public.game_profiles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);

  Then re-run 1b and paste the result. It must now return my row.

BRANCH B — 1b DOES return my row.
  Then RLS is not the blocker. Change nothing. Paste 1a and 1b in full and tell
  me so, and also check whether the anon role has any SELECT policy on this
  table that might be shadowing behavior. I will take it from there.

SAFETY
- Never DELETE rows in game_profiles.
- Never create a policy with USING (true) on this table.
- Everything must be idempotent and safe to re-run.
- If anything is ambiguous, stop and report rather than guessing.

FINALLY
Report: 1a output, 1b before/after, which branch you took, and exactly which
policies now exist on public.game_profiles.
```
