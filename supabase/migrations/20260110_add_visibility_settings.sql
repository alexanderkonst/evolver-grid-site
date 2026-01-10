-- Visibility settings for profile data sections
-- Created: 2026-01-10

CREATE TABLE public.visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'community', 'public')),
  UNIQUE(user_id, data_type)
);

CREATE INDEX idx_visibility_settings_user
  ON public.visibility_settings(user_id);

ALTER TABLE public.visibility_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their visibility settings"
  ON public.visibility_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their visibility settings"
  ON public.visibility_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their visibility settings"
  ON public.visibility_settings FOR UPDATE
  USING (auth.uid() = user_id);
