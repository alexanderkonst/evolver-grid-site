-- Add RSVP reminder email fields
ALTER TABLE public.event_rsvps
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS wants_reminder BOOLEAN DEFAULT false;
