-- Create connections table for matchmaking connection requests
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text DEFAULT 'pending',
  message text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can view connections where they are requester or receiver
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Users can create connection requests
CREATE POLICY "Users can create connection requests"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update connections where they are receiver (to accept/decline)
CREATE POLICY "Users can update received connections"
  ON public.connections FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Users can delete their own connection requests
CREATE POLICY "Users can delete own connections"
  ON public.connections FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Add visibility columns to game_profiles
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'minimal',
  ADD COLUMN IF NOT EXISTS show_location boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_mission boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_offer boolean DEFAULT false;