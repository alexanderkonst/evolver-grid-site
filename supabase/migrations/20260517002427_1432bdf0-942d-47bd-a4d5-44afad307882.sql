ALTER TABLE public.equilibrium_state
  ADD COLUMN IF NOT EXISTS birthday DATE;

COMMENT ON COLUMN public.equilibrium_state.birthday IS
  'Birthday for the Equilibrium v2 personal solar cycle anchor. Optional. Format YYYY-MM-DD.';