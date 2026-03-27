CREATE TABLE IF NOT EXISTS public.founder_canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  archetype TEXT NOT NULL,
  tagline TEXT NOT NULL,
  session_date TEXT NOT NULL,
  session_number TEXT NOT NULL,
  sigil TEXT NOT NULL DEFAULT '◉',
  uniqueness TEXT NOT NULL,
  myth_lie TEXT NOT NULL,
  myth_truth TEXT NOT NULL,
  myth_line TEXT NOT NULL,
  tribe TEXT NOT NULL,
  pain TEXT NOT NULL,
  promise TEXT NOT NULL,
  color_primary TEXT NOT NULL DEFAULT '#8460ea',
  color_glow TEXT NOT NULL DEFAULT 'rgba(132,96,234,0.35)',
  color_bg TEXT NOT NULL DEFAULT 'rgba(132,96,234,0.06)',
  color_border TEXT NOT NULL DEFAULT 'rgba(132,96,234,0.25)',
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('complete', 'in-progress')),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_canvases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active canvases" ON public.founder_canvases
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage canvases" ON public.founder_canvases
FOR ALL USING (auth.role() = 'authenticated');