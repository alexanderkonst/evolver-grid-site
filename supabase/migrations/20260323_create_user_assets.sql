-- Create user_assets table for cross-user asset matching
CREATE TABLE public.user_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type_id text NOT NULL,        -- 'expertise', 'experiences', 'networks', 'resources', 'ip', 'influence'
  sub_type_id text,             -- e.g. 'scientific-technical', 'business-economics'
  category_id text,             -- e.g. 'engineering', 'entrepreneurship'
  title text NOT NULL,
  description text,
  source text DEFAULT 'manual', -- 'ai' or 'manual'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: anyone authenticated can read all assets (needed for matching), users manage own
ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assets"
  ON public.user_assets
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own assets"
  ON public.user_assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON public.user_assets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON public.user_assets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indices for matching queries
CREATE INDEX idx_user_assets_user ON public.user_assets(user_id);
CREATE INDEX idx_user_assets_type ON public.user_assets(type_id);

-- Prevent duplicate assets per user
CREATE UNIQUE INDEX idx_user_assets_unique
  ON public.user_assets(user_id, type_id, LOWER(TRIM(title)));

-- Trigger for updated_at
CREATE TRIGGER update_user_assets_updated_at
  BEFORE UPDATE ON public.user_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
