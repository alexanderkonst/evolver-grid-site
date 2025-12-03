-- Add pdf_url, summary_title, summary_promise columns to genius_offer_requests
ALTER TABLE public.genius_offer_requests
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS summary_title text,
ADD COLUMN IF NOT EXISTS summary_promise text;