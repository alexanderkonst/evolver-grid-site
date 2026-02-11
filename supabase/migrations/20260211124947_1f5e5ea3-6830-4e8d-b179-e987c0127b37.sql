
-- Allow anon full access to equilibrium_users
CREATE POLICY "Anon can insert equilibrium users"
ON public.equilibrium_users FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Anon can select equilibrium users"
ON public.equilibrium_users FOR SELECT TO anon
USING (true);

CREATE POLICY "Anon can update equilibrium users"
ON public.equilibrium_users FOR UPDATE TO anon
USING (true) WITH CHECK (true);
