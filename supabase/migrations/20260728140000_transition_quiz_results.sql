-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TRANSITION QUIZ RESULTS — every quiz completion, including       ║
-- ║  not-yet completions (stages 1-3). Feeds the Ripeness Vector       ║
-- ║  (Phase Shift Technology 123). Created: July 28, 2026 (Day 138).   ║
-- ║  Spec: docs/specs/quiz/quiz_product_spec.md §1.5 Extensions.       ║
-- ╚═══════════════════════════════════════════════════════════════════╝

create table if not exists public.transition_quiz_results (
  id uuid primary key default gen_random_uuid(),

  -- Placement (S2/S3). 1-7, always present.
  stage integer not null check (stage >= 1 and stage <= 7),

  -- Aspect scores (S4a-c). Null for stage 1-3 completions, which stop at
  -- the not-yet branch (S3a) before the aspect questions.
  identity_score integer check (identity_score is null or (identity_score >= 1 and identity_score <= 7)),
  economy_score integer check (economy_score is null or (economy_score >= 1 and economy_score <= 7)),
  fit_score integer check (fit_score is null or (fit_score >= 1 and fit_score <= 7)),

  -- Derived at S5/diagnose(). Null for not-yet completions.
  bottleneck_aspect text check (bottleneck_aspect is null or bottleneck_aspect in ('identity', 'economy', 'fit')),
  driver_aspect text check (driver_aspect is null or driver_aspect in ('identity', 'economy', 'fit')),
  pattern text,
  route_shown text,

  -- Optional email (S3a-2, stages 2-3 only). Never required.
  email text,

  -- Completion bookkeeping. not_yet = true for stage 1-3 (record written at
  -- S3a); false for stage 4-7 (record written at S7).
  not_yet boolean not null default false,
  locale text,

  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists transition_quiz_results_stage_idx
  on public.transition_quiz_results (stage);

create index if not exists transition_quiz_results_completed_at_idx
  on public.transition_quiz_results (completed_at desc);

create index if not exists transition_quiz_results_email_lower_idx
  on public.transition_quiz_results (lower(email))
  where email is not null;

-- RLS on, no policies = no direct client access. All writes flow through
-- the save-quiz-result edge function (service role). No reads are needed
-- client-side: the result itself is computed and rendered entirely in the
-- browser (see engine.ts / share-state encoding), this table exists only
-- for the dataset.
alter table public.transition_quiz_results enable row level security;
