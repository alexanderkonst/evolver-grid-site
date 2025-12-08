-- Fix 1: multiple_intelligences_assessments - restrict SELECT to prevent PII exposure
DROP POLICY IF EXISTS "Allow reading MI assessments" ON public.multiple_intelligences_assessments;

-- No public reads allowed - this table contains PII (names, emails)
CREATE POLICY "No public reads on MI assessments" 
ON public.multiple_intelligences_assessments 
FOR SELECT 
USING (false);

-- Fix 2: quests - restrict access to profile owner
DROP POLICY IF EXISTS "Allow all access to quests" ON public.quests;

-- Users can only manage quests linked to their own game profile
CREATE POLICY "Users can view own quests" 
ON public.quests 
FOR SELECT 
USING (
  profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own quests" 
ON public.quests 
FOR INSERT 
WITH CHECK (
  profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own quests" 
ON public.quests 
FOR UPDATE 
USING (
  profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own quests" 
ON public.quests 
FOR DELETE 
USING (
  profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid())
);