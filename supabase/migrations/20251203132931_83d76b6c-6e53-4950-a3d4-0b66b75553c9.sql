-- Update genius_offer_requests table with new fields
ALTER TABLE public.genius_offer_requests 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS source_branch text DEFAULT 'ai',
ADD COLUMN IF NOT EXISTS products_sold text,
ADD COLUMN IF NOT EXISTS best_clients text;

-- Update status enum options
COMMENT ON COLUMN public.genius_offer_requests.status IS 'Status: intake_received, apple_seed_in_progress, excalibur_in_progress, completed, cancelled';

-- Create wizard progress table for persistence
CREATE TABLE IF NOT EXISTS public.genius_offer_wizard_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_step integer DEFAULT 1,
  name text,
  email text,
  has_ai_assistant boolean,
  ai_knows_offers boolean,
  ai_summary text,
  zone_of_genius_completed boolean DEFAULT false,
  multiple_intelligences_completed boolean DEFAULT false,
  products_sold text,
  best_clients text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genius_offer_wizard_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own wizard progress
CREATE POLICY "Users can view own wizard progress"
ON public.genius_offer_wizard_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wizard progress"
ON public.genius_offer_wizard_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wizard progress"
ON public.genius_offer_wizard_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create multiple_intelligences_results table linked to users
CREATE TABLE IF NOT EXISTS public.multiple_intelligences_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ordered_intelligences jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.multiple_intelligences_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own results
CREATE POLICY "Users can view own MI results"
ON public.multiple_intelligences_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MI results"
ON public.multiple_intelligences_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MI results"
ON public.multiple_intelligences_results
FOR UPDATE
USING (auth.uid() = user_id);

-- Add zone_of_genius_completed and multiple_intelligences_completed to game_profiles if not exists
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS zone_of_genius_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS multiple_intelligences_completed boolean DEFAULT false;