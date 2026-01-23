-- 1. Missions table: personal mission statements
CREATE TABLE IF NOT EXISTS public.missions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  statement text,
  categories text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS for missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mission"
  ON public.missions FOR SELECT
  USING (profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own mission"
  ON public.missions FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own mission"
  ON public.missions FOR UPDATE
  USING (profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  ));

-- 2. Add mission_id column to game_profiles
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS mission_id uuid REFERENCES public.missions(id);

-- Trigger for updated_at on missions
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();