ALTER TABLE public.user_business_artifacts
  DROP CONSTRAINT IF EXISTS user_business_artifacts_step_number_check;

ALTER TABLE public.user_business_artifacts
  ADD CONSTRAINT user_business_artifacts_step_number_check
  CHECK (step_number >= 1 AND step_number <= 19);