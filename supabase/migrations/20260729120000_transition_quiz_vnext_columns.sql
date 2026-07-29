-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TRANSITION QUIZ RESULTS — vNext (lean 4-question edition) columns. ║
-- ║  Additive, nullable only — the pre-existing aspect-scoring columns   ║
-- ║  (identity_score, economy_score, fit_score, bottleneck_aspect,       ║
-- ║  driver_aspect, aspect_derived_stage, has_stage_gap) stay untouched  ║
-- ║  and simply go unused by new completions. `stage`, `email`,         ║
-- ║  `not_yet`, `locale`, `pattern`, `route_shown` are reused as-is.     ║
-- ║  Created: July 29, 2026 (Day 139), quiz vNext rebuild.               ║
-- ║  Design source: GFOA design conversation, final locked SOW §17-18    ║
-- ║  ("WHERE ARE YOU? ... vNext · Four-Question Edition").               ║
-- ╚═══════════════════════════════════════════════════════════════════╝

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
  'Q2 answer (vNext §7) — the unfinished developmental move: discovery, recognition, integration, vehicle, or transmission. Null for not-yet (stage 1-3) completions.';

comment on column public.transition_quiz_results.emerging_work_stage is
  'Q3 answer (vNext §8) — developmental position of the emerging work: not_visible -> fragments -> felt -> named -> built -> working. Null for not-yet completions.';

comment on column public.transition_quiz_results.clarity_unlock is
  'Q4 answer (vNext §9) — what the right sentence would change first (the live-vehicle read). Null for not-yet completions.';

comment on column public.transition_quiz_results.buying_frame is
  'Optional post-result qualifier (vNext §10), only asked when the Direction Call gate (§13) is met. Null when never shown or not yet answered.';

comment on column public.transition_quiz_results.direction_call_shown is
  'True when the Direction Call gate (§13) was met and the optional Buying Frame qualifier was surfaced. Null for not-yet completions and pre-vNext rows.';

comment on column public.transition_quiz_results.result_template is
  'The uniqueness_category used to render the 3-beat result (vNext §12) — kept as its own column for readability even though it duplicates uniqueness_category today, in case result templates diverge from the raw category later.';
