alter table public.transition_quiz_results
  add column if not exists means text
  check (means in ('yes_comfortably', 'yes_if_fit', 'maybe_depending', 'not_now'));