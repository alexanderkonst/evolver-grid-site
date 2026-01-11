-- Add LinkedIn PDF fields to game profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS linkedin_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_extracted_at TIMESTAMPTZ;
