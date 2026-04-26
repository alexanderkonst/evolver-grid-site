-- Day 52 (Sasha 2026-04-26): public Top Talent reveal — share_slug column.
--
-- Adds a short, URL-safe, optionally human-customizable slug to each
-- zog_snapshot so a user can share their reveal as a public page at
-- /reveal/<slug>. Nullable so existing rows aren't broken; backfilled
-- the first time a user clicks "Share" or downloads their snapshot.
--
-- Slug shape: 6-char alphanumeric short id by default (matches the
-- UBB dossier pattern used elsewhere in the codebase). Users may later
-- pick a human-readable username via UI override; uniqueness is
-- guaranteed by the index regardless of source.
--
-- Privacy: existence of a slug does NOT make the row public — public
-- access requires the slug to be known (high entropy). RLS on the
-- table already restricts writes to the row's profile owner; the
-- public-read path is via a SECURITY DEFINER function that returns
-- ONLY the appleseed_data + archetype fields (never user_id, raw AI
-- response, or resonance ratings).

alter table public.zog_snapshots
  add column if not exists share_slug text;

-- Case-insensitive uniqueness so /reveal/Aleksandr and /reveal/aleksandr
-- are the same canonical row. Allows nulls (most rows pre-share).
create unique index if not exists idx_zog_snapshots_share_slug_unique
  on public.zog_snapshots (lower(share_slug))
  where share_slug is not null;

comment on column public.zog_snapshots.share_slug is
  'URL-safe slug for public /reveal/<slug> page. Auto-generated 6-char short id on first share; user-editable later.';

-- Public-read helper. Returns ONLY the fields the /reveal/<slug> page
-- needs to render. Deliberately excludes:
--   - ai_response_raw      (the user's private prompt input)
--   - resonance_rating     (user's own self-rating)
--   - excalibur_*          (business-layer; not part of the public Top Talent reveal)
--   - profile_id, xp_awarded (internal)
-- Anyone with a valid slug can call this; the slug itself is the
-- capability token. RLS on the underlying table stays unchanged.
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

-- Allow anyone (including anon) to call the function. RLS on the
-- table itself remains restrictive — direct SELECT requires ownership.
grant execute on function public.get_public_zog_snapshot(text) to anon, authenticated;
