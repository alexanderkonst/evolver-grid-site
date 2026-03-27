CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  title TEXT NOT NULL,
  short_quote TEXT NOT NULL,
  full_quote TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  surface TEXT NOT NULL DEFAULT 'ignite',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active testimonials" ON public.testimonials
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage testimonials" ON public.testimonials
FOR ALL USING (auth.role() = 'authenticated');