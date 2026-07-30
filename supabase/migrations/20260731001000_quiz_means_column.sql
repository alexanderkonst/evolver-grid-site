-- Means companion question (Gate 2 of the Idealest Client checklist),
-- asked post-result after a non-"closed" Buying Frame answer.
-- Additive and nullable; historical rows untouched.
alter table public.transition_quiz_results
  add column if not exists means text
  check (means in ('yes_comfortably', 'yes_if_fit', 'maybe_depending', 'not_now'));
