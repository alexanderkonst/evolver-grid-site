-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  QUIZ USER LINK — links transition_quiz_results rows to an auth     ║
-- ║  account, so JOURNEY Step 0 can show a signed-in user their chapter ║
-- ║  and the permalink page can offer a "keep this in my profile" claim.║
-- ║  Additive only. Created: July 30, 2026 (Day 138).                  ║
-- ╚═══════════════════════════════════════════════════════════════════╝

alter table public.transition_quiz_results
  add column if not exists user_id uuid references auth.users(id);

create index if not exists transition_quiz_results_user_id_idx
  on public.transition_quiz_results (user_id)
  where user_id is not null;

-- Select policy: a logged-in user may read their own linked rows (needed
-- for JOURNEY Step 0's mini arc + "most recent result" lookup). Insert/
-- update still flow only through the service-role edge functions
-- (save-quiz-result, claim-quiz-result) — no client insert/update policy
-- is added here.
create policy "transition_quiz_results_select_own"
  on public.transition_quiz_results
  for select
  using (auth.uid() = user_id);
