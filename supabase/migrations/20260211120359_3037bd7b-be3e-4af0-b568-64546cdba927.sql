
CREATE TABLE public.equilibrium_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT UNIQUE NOT NULL,
  birthday TEXT NOT NULL,
  timezone INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equilibrium_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access"
ON public.equilibrium_users
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
