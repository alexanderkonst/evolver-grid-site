-- 2026-11-25: "Since you were here" on Your House (issue #451, navigation synthesis invariant I5).
--
-- ALL the database work for #451 is in this one file:
--   1. public.house_visits        : one row per player, the last time they stood in Your House
--                                   and which village places they had already seen open
--   2. public.mark_house_visit()  : the only write path; moves the marker, never shrinks the list
--
-- Why server-side: the old memory (`useVillageChanges`) is localStorage, per browser. A player who
-- finishes a module on a phone and opens Your House on a laptop must still be told what changed.
--
-- Additive only: no existing table, policy or function is touched.
--
-- Deploy: held for Sasha's yes (goes through Lovable). Until it is applied the client reads an
-- error, shows nothing and writes nothing (no filler, no crash).
--
-- Privacy: owner-only. RLS lets a player read their own row; nobody writes the table directly.

CREATE TABLE IF NOT EXISTS public.house_visits (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_visit_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Keys of the village places this player has seen open. Only grows, so a save that fails to
  -- load (everything reads closed) can never write the house backwards.
  seen_open     TEXT[] NOT NULL DEFAULT '{}',
  CHECK (cardinality(seen_open) <= 60)
);

ALTER TABLE public.house_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "house_visits_select_own" ON public.house_visits;
CREATE POLICY "house_visits_select_own"
  ON public.house_visits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

REVOKE ALL ON public.house_visits FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.house_visits TO authenticated;
GRANT ALL ON public.house_visits TO service_role;

-- Marks "I was here now" and unions the places seen open. The first call creates the row, which
-- is the baseline: there is nothing to compare to before it, so the client says nothing then.
CREATE OR REPLACE FUNCTION public.mark_house_visit(p_open TEXT[] DEFAULT '{}')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_uid   uuid := auth.uid();
  v_clean text[];
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;

  select coalesce(array_agg(distinct k), '{}')
    into v_clean
    from unnest(coalesce(p_open, '{}')) as k
   where k ~ '^[a-z0-9-]{1,40}$';

  insert into public.house_visits as hv (user_id, last_visit_at, seen_open)
  values (v_uid, now(), v_clean)
  on conflict (user_id) do update
    set last_visit_at = now(),
        seen_open = (
          select coalesce(array_agg(distinct k), '{}')
            from unnest(hv.seen_open || excluded.seen_open) as k
        );
end;
$$;

REVOKE ALL ON FUNCTION public.mark_house_visit(TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_house_visit(TEXT[]) TO authenticated;

COMMENT ON TABLE public.house_visits IS
  'Your House, last visit per player (issue #451): when they were last there and which places they had seen open. Owner-readable only; written only through mark_house_visit().';
