CREATE TABLE public.user_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type_id text NOT NULL,
  sub_type_id text,
  category_id text,
  title text NOT NULL,
  description text,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assets" ON public.user_assets FOR SELECT USING (true);
CREATE POLICY "Users can insert own assets" ON public.user_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON public.user_assets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON public.user_assets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_assets_user ON public.user_assets(user_id);
CREATE INDEX idx_user_assets_type ON public.user_assets(type_id);