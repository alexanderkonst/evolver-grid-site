-- Enable RLS on quests table
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for quests (allow all access for now since this is device-based)
CREATE POLICY "Allow all access to quests"
ON public.quests
FOR ALL
USING (true)
WITH CHECK (true);