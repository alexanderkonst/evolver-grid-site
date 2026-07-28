create table if not exists public.transition_quiz_results (
  id uuid primary key default gen_random_uuid(),
  stage integer not null check (stage >= 1 and stage <= 7),
  identity_score integer check (identity_score is null or (identity_score >= 1 and identity_score <= 7)),
  economy_score integer check (economy_score is null or (economy_score >= 1 and economy_score <= 7)),
  fit_score integer check (fit_score is null or (fit_score >= 1 and fit_score <= 7)),
  bottleneck_aspect text check (bottleneck_aspect is null or bottleneck_aspect in ('identity', 'economy', 'fit')),
  driver_aspect text check (driver_aspect is null or driver_aspect in ('identity', 'economy', 'fit')),
  pattern text,
  route_shown text,
  email text,
  not_yet boolean not null default false,
  locale text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

GRANT ALL ON public.transition_quiz_results TO service_role;

alter table public.transition_quiz_results enable row level security;

create index if not exists transition_quiz_results_stage_idx
  on public.transition_quiz_results (stage);
create index if not exists transition_quiz_results_completed_at_idx
  on public.transition_quiz_results (completed_at desc);
create index if not exists transition_quiz_results_email_lower_idx
  on public.transition_quiz_results (lower(email))
  where email is not null;

alter table public.transition_quiz_results
  add column if not exists aspect_derived_stage integer
    check (aspect_derived_stage is null or (aspect_derived_stage >= 1 and aspect_derived_stage <= 7)),
  add column if not exists has_stage_gap boolean;

comment on column public.transition_quiz_results.aspect_derived_stage is
  'Stage implied by round(mean(identity_score, economy_score, fit_score)). Null for not-yet (stage 1-3) completions.';
comment on column public.transition_quiz_results.has_stage_gap is
  'True when abs(aspect_derived_stage - stage) > 2.';