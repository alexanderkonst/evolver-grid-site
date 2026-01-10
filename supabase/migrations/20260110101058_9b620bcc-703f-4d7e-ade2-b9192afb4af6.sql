-- Create visibility_settings table for user data privacy controls
CREATE TABLE public.visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'zog', 'qol', 'assets', 'offer'
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'community', 'public')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, data_type)
);

-- Enable Row Level Security
ALTER TABLE public.visibility_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own visibility settings
CREATE POLICY "Users can view own visibility settings"
ON public.visibility_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visibility settings"
ON public.visibility_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visibility settings"
ON public.visibility_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visibility settings"
ON public.visibility_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_visibility_settings_updated_at
BEFORE UPDATE ON public.visibility_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();