-- Add LinkedIn PDF columns to game_profiles
ALTER TABLE public.game_profiles ADD COLUMN IF NOT EXISTS linkedin_pdf_url TEXT;
ALTER TABLE public.game_profiles ADD COLUMN IF NOT EXISTS linkedin_extracted_at TIMESTAMPTZ;