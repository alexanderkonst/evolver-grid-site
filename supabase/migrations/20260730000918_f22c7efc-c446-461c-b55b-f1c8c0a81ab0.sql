create table if not exists public.quiz_email_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  stage integer,
  locale text,
  source text not null default 'transition_quiz'
);

grant all on public.quiz_email_signups to service_role;

create index if not exists quiz_email_signups_created_at_idx
  on public.quiz_email_signups (created_at desc);

create index if not exists quiz_email_signups_email_lower_idx
  on public.quiz_email_signups (lower(email));

alter table public.quiz_email_signups enable row level security;