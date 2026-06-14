-- $37 deeper Top Talent view paywall
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS activation_unlocked_at timestamptz;

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS activation_stripe_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS game_profiles_activation_stripe_session_id_key
  ON public.game_profiles (activation_stripe_session_id)
  WHERE activation_stripe_session_id IS NOT NULL;

UPDATE public.game_profiles
  SET activation_unlocked_at = now()
  WHERE activation_unlocked_at IS NULL;

CREATE OR REPLACE FUNCTION public.protect_activation_unlocked_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('service_role', 'supabase_admin', 'postgres')
     OR coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role'
  THEN
    RETURN NEW;
  END IF;
  NEW.activation_unlocked_at := OLD.activation_unlocked_at;
  NEW.activation_stripe_session_id := OLD.activation_stripe_session_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_activation_unlocked_at ON public.game_profiles;
CREATE TRIGGER trg_protect_activation_unlocked_at
  BEFORE UPDATE ON public.game_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_activation_unlocked_at();