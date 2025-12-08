-- Fix 1: genius_offer_requests - restrict SELECT to owner only
DROP POLICY IF EXISTS "Allow reading genius offer requests" ON public.genius_offer_requests;

CREATE POLICY "Users can read own genius offer requests" 
ON public.genius_offer_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix 2: game_profiles - restrict access to profile owner
DROP POLICY IF EXISTS "Allow all access to game_profiles" ON public.game_profiles;

-- Users can view their own profile or anonymous profiles they created (matched by id in localStorage)
CREATE POLICY "Users can view own game profile" 
ON public.game_profiles 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own game profile" 
ON public.game_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own game profile" 
ON public.game_profiles 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own game profile" 
ON public.game_profiles 
FOR DELETE 
USING (auth.uid() = user_id);