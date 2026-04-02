
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_game_profiles_access_token
  ON public.game_profiles(access_token);

CREATE INDEX IF NOT EXISTS idx_game_profiles_email
  ON public.game_profiles(email);

UPDATE public.game_profiles
SET access_token = gen_random_uuid()
WHERE access_token IS NULL;
