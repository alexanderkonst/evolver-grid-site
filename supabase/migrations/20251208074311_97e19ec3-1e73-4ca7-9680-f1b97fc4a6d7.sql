-- Create ai_boost_purchases table for tracking Stripe purchases
CREATE TABLE public.ai_boost_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT,
  stripe_session_id TEXT,
  CONSTRAINT unique_user_purchase UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.ai_boost_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchase
CREATE POLICY "Users can view their own purchase" 
ON public.ai_boost_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own purchase (for Stripe success callback)
CREATE POLICY "Users can insert their own purchase" 
ON public.ai_boost_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);