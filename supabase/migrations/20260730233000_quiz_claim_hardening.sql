-- Harden quiz ownership without changing the public-result contract.
-- Anonymous results remain public and useful; account ownership is attached
-- only by the auth-gated claim-quiz-result function.

alter table public.transition_quiz_results
  add column if not exists claimed_at timestamptz;

alter table public.transition_quiz_results
  drop constraint if exists transition_quiz_results_user_id_fkey;

alter table public.transition_quiz_results
  add constraint transition_quiz_results_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;
