-- Add timezone to events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
