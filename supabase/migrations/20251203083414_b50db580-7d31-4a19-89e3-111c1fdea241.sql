-- Create genius_offer_requests table
CREATE TABLE public.genius_offer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  has_ai_assistant BOOLEAN NOT NULL,
  ai_summary_raw TEXT,
  no_ai_genius_description TEXT,
  offers_sold TEXT,
  best_client_story TEXT,
  extra_notes TEXT,
  intelligences_note TEXT,
  status TEXT NOT NULL DEFAULT 'intake_received'
);

-- Enable RLS
ALTER TABLE public.genius_offer_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public intake form)
CREATE POLICY "Anyone can submit genius offer requests"
ON public.genius_offer_requests
FOR INSERT
WITH CHECK (true);

-- Allow reading own submissions by email (for admin or future use)
CREATE POLICY "Allow reading genius offer requests"
ON public.genius_offer_requests
FOR SELECT
USING (true);

-- Allow updates (for admin status changes)
CREATE POLICY "Allow updating genius offer requests"
ON public.genius_offer_requests
FOR UPDATE
USING (true);

-- Create multiple_intelligences_assessments table
CREATE TABLE public.multiple_intelligences_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  ranking JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE public.multiple_intelligences_assessments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public assessment)
CREATE POLICY "Anyone can submit MI assessments"
ON public.multiple_intelligences_assessments
FOR INSERT
WITH CHECK (true);

-- Allow reading (for admin)
CREATE POLICY "Allow reading MI assessments"
ON public.multiple_intelligences_assessments
FOR SELECT
USING (true);