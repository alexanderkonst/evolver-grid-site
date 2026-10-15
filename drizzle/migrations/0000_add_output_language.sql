ALTER TABLE public.zog_snapshots ADD COLUMN IF NOT EXISTS output_language text;
ALTER TABLE public.user_business_artifacts ADD COLUMN IF NOT EXISTS output_language text;
NOTIFY pgrst, 'reload schema';