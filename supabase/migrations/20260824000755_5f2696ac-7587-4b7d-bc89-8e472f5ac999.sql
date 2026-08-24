ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS preferred_skin text;

COMMENT ON COLUMN public.game_profiles.preferred_skin IS
  'First-class theme choice (lapis | aurum), synced from the client theme toggle. NULL = no explicit choice.';

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS preferred_language text;

COMMENT ON COLUMN public.game_profiles.preferred_language IS
  'UI locale choice (en | ru | es), synced from the client language switcher. NULL = no explicit choice.';