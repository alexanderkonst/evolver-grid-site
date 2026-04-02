-- ============================================================================
-- Phase 2: Silent Account Creation + Result Persistence
-- Adds email and access_token to game_profiles for ownership-first flow
-- ============================================================================

-- Add email column for quick lookup (mirrors auth.users.email)
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add access_token for magic link result viewing (no auth required)
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_game_profiles_access_token
  ON public.game_profiles(access_token);

-- Index for email lookups (find existing profile by email)
CREATE INDEX IF NOT EXISTS idx_game_profiles_email
  ON public.game_profiles(email);

-- Ensure existing profiles get access tokens
UPDATE public.game_profiles
SET access_token = gen_random_uuid()
WHERE access_token IS NULL;

COMMENT ON COLUMN public.game_profiles.email IS 'User email, set during ownership-first save flow. Mirrors auth.users.email for quick lookup.';
COMMENT ON COLUMN public.game_profiles.access_token IS 'UUID token for magic link access to results without authentication.';
