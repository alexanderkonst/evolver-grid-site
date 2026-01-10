-- Add Appleseed and Excalibur JSONB columns to zog_snapshots
ALTER TABLE public.zog_snapshots 
ADD COLUMN appleseed_data JSONB,
ADD COLUMN excalibur_data JSONB,
ADD COLUMN appleseed_generated_at TIMESTAMPTZ,
ADD COLUMN excalibur_generated_at TIMESTAMPTZ,
ADD COLUMN ai_response_raw TEXT;