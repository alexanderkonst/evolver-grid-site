-- Day 52 (Sasha 2026-04-26): public Top Talent reveal — share_slug column.
alter table public.zog_snapshots
  add column if not exists share_slug text;

create unique index if not exists idx_zog_snapshots_share_slug_unique
  on public.zog_snapshots (lower(share_slug))
  where share_slug is not null;

comment on column public.zog_snapshots.share_slug is
  'URL-safe slug for public /reveal/<slug> page. Auto-generated 6-char short id on first share; user-editable later.';

create or replace function public.get_public_zog_snapshot(p_slug text)
returns table (
  share_slug          text,
  archetype_title     text,
  core_pattern        text,
  appleseed_data      jsonb,
  mastery_action      text,
  appleseed_generated_at timestamptz,
  created_at          timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    z.share_slug,
    z.archetype_title,
    z.core_pattern,
    z.appleseed_data,
    z.mastery_action,
    z.appleseed_generated_at,
    z.created_at
  from public.zog_snapshots z
  where lower(z.share_slug) = lower(p_slug)
    and z.appleseed_data is not null
  limit 1;
$$;

comment on function public.get_public_zog_snapshot(text) is
  'Public-safe read by share_slug. Returns only fields the /reveal/<slug> page renders. Bypasses RLS via SECURITY DEFINER but exposes no sensitive columns.';

grant execute on function public.get_public_zog_snapshot(text) to anon, authenticated;