ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('friends', 'communities', 'public'));

COMMENT ON COLUMN public.game_profiles.profile_visibility IS
  'WHO can see this profile: friends | communities | public. Distinct from visibility, which governs HOW MUCH is shown.';

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS visible_community_ids UUID[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.game_profiles.visible_community_ids IS
  'Community ids the owner has chosen to expose their profile to. Only consulted when profile_visibility = ''communities''.';

CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.communities IS
  'Named communities users can belong to; referenced by game_profiles.visible_community_ids for audience-gated profile visibility.';

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, user_id)
);

COMMENT ON TABLE public.community_members IS
  'Membership edges: user_id belongs to community_id. Granted server-side for now — no client INSERT/UPDATE policy.';

GRANT SELECT ON public.communities TO anon, authenticated;
GRANT ALL ON public.communities TO service_role;

GRANT SELECT ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='communities' AND policyname='Communities are readable by everyone') THEN
    CREATE POLICY "Communities are readable by everyone"
      ON public.communities FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='community_members' AND policyname='Users can view own community memberships') THEN
    CREATE POLICY "Users can view own community memberships"
      ON public.community_members FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;