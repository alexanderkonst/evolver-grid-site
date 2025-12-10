-- Add mastery_action column to zog_snapshots table
ALTER TABLE public.zog_snapshots 
ADD COLUMN mastery_action text;