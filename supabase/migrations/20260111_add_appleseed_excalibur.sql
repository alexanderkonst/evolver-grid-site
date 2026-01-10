-- Add Appleseed and Excalibur data columns to zog_snapshots
-- Created: 2026-01-11

-- Add appleseed_data JSONB column
ALTER TABLE public.zog_snapshots
ADD COLUMN IF NOT EXISTS appleseed_data JSONB;

-- Add excalibur_data JSONB column
ALTER TABLE public.zog_snapshots
ADD COLUMN IF NOT EXISTS excalibur_data JSONB;

-- Add timestamps for when each was generated
ALTER TABLE public.zog_snapshots
ADD COLUMN IF NOT EXISTS appleseed_generated_at TIMESTAMPTZ;

ALTER TABLE public.zog_snapshots
ADD COLUMN IF NOT EXISTS excalibur_generated_at TIMESTAMPTZ;

-- Add raw AI response that was used to generate the appleseed
ALTER TABLE public.zog_snapshots
ADD COLUMN IF NOT EXISTS ai_response_raw TEXT;

-- Comment for documentation
COMMENT ON COLUMN public.zog_snapshots.appleseed_data IS 'Full Appleseed JSON object with all 12 perspectives';
COMMENT ON COLUMN public.zog_snapshots.excalibur_data IS 'Full Excalibur JSON object with offer details';
COMMENT ON COLUMN public.zog_snapshots.ai_response_raw IS 'Raw AI response used to generate the Appleseed';
