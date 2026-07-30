-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  QUIZ EMAIL SIGNUPS — every "send me the map" email captured on    ║
-- ║  the Transition Quiz (settled + itch/tremors not-yet screens).     ║
-- ║  Separate from transition_quiz_results (which already stores email ║
-- ║  inline on the completion row) so the AI partner and any future    ║
-- ║  send-template job have one clean, dedicated list to read.         ║
-- ║  Created: July 29, 2026 (Day 139).                                 ║
-- ║  Spec: docs/specs/quiz/quiz_product_spec.md.                       ║
-- ╚═══════════════════════════════════════════════════════════════════╝

create table if not exists public.quiz_email_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  stage integer,
  locale text,
  source text not null default 'transition_quiz'
);

create index if not exists quiz_email_signups_created_at_idx
  on public.quiz_email_signups (created_at desc);

create index if not exists quiz_email_signups_email_lower_idx
  on public.quiz_email_signups (lower(email));

-- RLS on, no policies = no direct client access (mirrors
-- transition_quiz_results). All writes flow through the save-quiz-email
-- edge function (service role). Reads for the AI partner go through the
-- token-gated quiz-results-export edge function, not direct table access.
alter table public.quiz_email_signups enable row level security;
