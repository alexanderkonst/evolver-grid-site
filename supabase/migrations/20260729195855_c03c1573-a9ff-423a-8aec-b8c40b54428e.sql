alter table public.transition_quiz_results
  add column if not exists uniqueness_category text
    check (uniqueness_category is null or uniqueness_category in
      ('discovery', 'recognition', 'integration', 'vehicle', 'transmission')),
  add column if not exists emerging_work_stage text
    check (emerging_work_stage is null or emerging_work_stage in
      ('not_visible', 'fragments', 'felt', 'named', 'built', 'working')),
  add column if not exists clarity_unlock text
    check (clarity_unlock is null or clarity_unlock in
      ('personal', 'direction', 'current_work', 'emerging_business', 'near_term_exchange')),
  add column if not exists buying_frame text
    check (buying_frame is null or buying_frame in
      ('open', 'mixed', 'open_no_history', 'closed')),
  add column if not exists direction_call_shown boolean,
  add column if not exists result_template text;

comment on column public.transition_quiz_results.uniqueness_category is
  'Q2 answer (vNext §7) — the unfinished developmental move. Null for not-yet (stage 1-3) completions.';

comment on column public.transition_quiz_results.emerging_work_stage is
  'Q3 answer (vNext §8) — developmental position of the emerging work. Null for not-yet completions.';

comment on column public.transition_quiz_results.clarity_unlock is
  'Q4 answer (vNext §9) — what the right sentence would change first. Null for not-yet completions.';

comment on column public.transition_quiz_results.buying_frame is
  'Optional post-result qualifier (vNext §10), only asked when the Direction Call gate (§13) is met.';

comment on column public.transition_quiz_results.direction_call_shown is
  'True when the Direction Call gate (§13) was met and the Buying Frame qualifier was surfaced.';

comment on column public.transition_quiz_results.result_template is
  'The uniqueness_category used to render the 3-beat result (vNext §12).';