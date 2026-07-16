-- Day 126 (Sasha 2026-07-16): 3-level profile AUDIENCE visibility.
--
-- IMPORTANT distinction from the existing `game_profiles.visibility` column:
--   - `visibility` (existing, untouched) = HOW MUCH of the profile is shown
--     ('hidden' / 'minimal' / 'medium' / 'full' — a content-depth dial).
--   - `profile_visibility` (new, this migration) = WHO is allowed to see the
--     profile at all ('friends' / 'communities' / 'public' — an audience gate).
-- The audience gate is checked first; the content-depth dial then governs
-- what's shown to anyone who passes the gate.

-- WHO can see the profile: friends (accepted `connections`), communities
-- (membership in one of the owner's chosen communities), or public (today's
-- default behavior — everyone).
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('friends', 'communities', 'public'));

COMMENT ON COLUMN public.game_profiles.profile_visibility IS
  'WHO can see this profile: friends | communities | public. Distinct from visibility, which governs HOW MUCH is shown.';

-- Which communities (by id) the owner has opted to expose their profile to,
-- only consulted when profile_visibility = 'communities'.
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS visible_community_ids UUID[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.game_profiles.visible_community_ids IS
  'Community ids the owner has chosen to expose their profile to. Only consulted when profile_visibility = ''communities''.';

-- Communities themselves. Minimal shape for now — enough to name a community
-- and gate visibility against it. Membership grants happen server-side later
-- (no INSERT/UPDATE policy yet).
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.communities IS
  'Named communities users can belong to; referenced by game_profiles.visible_community_ids for audience-gated profile visibility.';

-- Community membership edges.
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, user_id)
);

COMMENT ON TABLE public.community_members IS
  'Membership edges: user_id belongs to community_id. Granted server-side for now — no client INSERT/UPDATE policy.';

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Communities are public metadata (name/slug) — readable by everyone so the
-- Settings UI and public profile pages can resolve names without auth.
CREATE POLICY "Communities are readable by everyone"
  ON public.communities FOR SELECT
  USING (true);

-- Users can see their own membership rows (used both to populate the
-- Settings "My communities" picker and to gate a viewer's access to a
-- 'communities'-scoped profile). No INSERT/UPDATE/DELETE policy yet —
-- membership is granted server-side.
CREATE POLICY "Users can view own community memberships"
  ON public.community_members FOR SELECT
  USING (auth.uid() = user_id);
