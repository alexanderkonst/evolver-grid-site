-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  SESSION TESTIMONIALS — Post-session feedback collection         ║
-- ║  Created: April 3, 2026                                         ║
-- ╚═══════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.session_testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Who submitted
  name text NOT NULL,
  email text,
  
  -- The testimonial content
  short_quote text NOT NULL,         -- 1-2 sentences (shown collapsed)
  full_quote text,                    -- Full story (shown expanded)
  
  -- Context
  session_type text DEFAULT 'ignition',  -- 'ignition', 'build', 'group'
  session_date date,
  before_state text,                  -- "Before:" subtitle for Ignite page
  
  -- Admin fields
  is_approved boolean DEFAULT false,  -- Admin must approve before display
  is_featured boolean DEFAULT false,  -- Show on /ignite page
  sort_order integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fetching approved testimonials
CREATE INDEX IF NOT EXISTS idx_session_testimonials_approved 
  ON public.session_testimonials (is_approved, is_featured, sort_order);

-- RLS
ALTER TABLE public.session_testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public feedback form)
CREATE POLICY "Anyone can submit testimonials"
  ON public.session_testimonials
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated can read (admin + display)
CREATE POLICY "Authenticated can read approved testimonials"
  ON public.session_testimonials
  FOR SELECT
  TO authenticated
  USING (true);

-- Public can read approved+featured testimonials (for display on pages)
CREATE POLICY "Public can read featured testimonials"
  ON public.session_testimonials
  FOR SELECT
  TO anon
  USING (is_approved = true AND is_featured = true);

COMMENT ON TABLE public.session_testimonials IS 
  'Post-session testimonials submitted via /feedback. Admin approves before display on /ignite and other pages.';
