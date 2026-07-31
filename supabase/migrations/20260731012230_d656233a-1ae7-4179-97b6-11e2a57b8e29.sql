alter table public.transition_quiz_results
  add column if not exists user_id uuid references auth.users(id);

create index if not exists transition_quiz_results_user_id_idx
  on public.transition_quiz_results (user_id)
  where user_id is not null;

grant select on public.transition_quiz_results to authenticated;

create policy "transition_quiz_results_select_own"
  on public.transition_quiz_results
  for select
  using (auth.uid() = user_id);