-- Add missing columns to game_profiles that code is referencing
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS spoken_languages text[] DEFAULT '{}';

-- Create index for location searches  
CREATE INDEX IF NOT EXISTS idx_game_profiles_location ON public.game_profiles(location);

-- Add qol_priorities column (alias for qol_priority_order for backward compatibility)
-- Note: qol_priority_order was already added, this ensures both work
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS qol_priorities jsonb DEFAULT '[]'::jsonb;