-- Create upgrade_catalog table
CREATE TABLE IF NOT EXISTS public.upgrade_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_label TEXT NOT NULL,
  description TEXT NOT NULL,
  path_slug TEXT NOT NULL,
  branch TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  xp_reward INTEGER NOT NULL DEFAULT 20,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upgrade_catalog ENABLE ROW LEVEL SECURITY;

-- Policy: everyone can read upgrade catalog
CREATE POLICY "Anyone can read upgrade catalog"
ON public.upgrade_catalog
FOR SELECT
USING (true);

-- Create player_upgrades table
CREATE TABLE IF NOT EXISTS public.player_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  upgrade_id UUID NOT NULL REFERENCES public.upgrade_catalog(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'completed',
  completed_at TIMESTAMPTZ NULL DEFAULT now(),
  UNIQUE(profile_id, upgrade_id)
);

-- Enable RLS
ALTER TABLE public.player_upgrades ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations on player_upgrades
CREATE POLICY "Allow all access to player_upgrades"
ON public.player_upgrades
FOR ALL
USING (true)
WITH CHECK (true);

-- Upsert the 8 upgrades for Path of Genius
INSERT INTO public.upgrade_catalog (code, title, short_label, description, path_slug, branch, is_paid, xp_reward, sort_order)
VALUES
  ('zog_intro_video_watched', 'Watch the Genius · Purpose · Mission Intro', 'Intro Video: Genius, Purpose & Mission', 'Watch a short video that clearly explains Zone of Genius, Purpose, and Mission, so you feel the deeper context of your path instead of treating this as just another test.', 'uniqueness_work', 'mastery_of_genius', FALSE, 20, 10),
  ('personality_tests_completed', 'Explore Your Inner Landscape', 'Personality Tests (optional)', 'Optionally take 2–3 personality/self-knowledge tests (MBTI, Enneagram, Multiple Intelligences) to enrich your understanding of how your Genius expresses through your patterns, strengths, and preferences.', 'uniqueness_work', 'mastery_of_genius', FALSE, 20, 20),
  ('zog_assessment_completed', 'Complete Your Zone of Genius Assessment', 'Zone of Genius Assessment', 'Take the Zone of Genius Discovery process and receive your core Genius pattern and top talents. This is the foundational upgrade and is required to create your character.', 'uniqueness_work', 'mastery_of_genius', FALSE, 40, 30),
  ('appleseed_received', 'Receive Your AppleSeed', 'AppleSeed – Genius Applications', 'Receive your AppleSeed – a clear mapping of how your Genius naturally wants to express itself in life: situations, roles, and contexts where you are most alive and valuable.', 'uniqueness_work', 'mastery_of_genius', TRUE, 40, 40),
  ('excalibur_received', 'Receive Your Excalibur', 'Excalibur – Genius Offer', 'Receive your Excalibur – a precise, unique Genius offer that makes your Genius concretely useful for others. This is typically a 90-minute 1:1 session (currently $297) to forge your positioning and transmission.', 'uniqueness_work', 'mastery_of_genius', TRUE, 60, 50),
  ('destiny_business_defined', 'Design Your Destiny Business', 'Destiny – Minimum Viable Genius Business', 'Define your minimally viable Genius-based business (Destiny): a simple, alive business model rooted in your Excalibur. Financial condition: 10% of revenue generated from this business is shared until a cumulative cap of $3,000 is reached.', 'uniqueness_work', 'entrepreneurial_path', TRUE, 70, 60),
  ('first_transformational_product_listed', 'Showcase Your First Transformational Product', 'First Transformational Product', 'Create and publicly showcase your first transformational product or offer based on your Genius in the emerging marketplace of transformational products (the Library will evolve into this marketplace).', 'uniqueness_work', 'entrepreneurial_path', FALSE, 70, 70),
  ('venture_cooperative_joined', 'Enter the Venture Cooperative', 'Venture Cooperative', 'Join the Venture Cooperative: a collaborative venture-building ecosystem where your Genius, offers, and assets can connect with others for co-creation, shared ventures, and long-term impact.', 'uniqueness_work', 'entrepreneurial_path', TRUE, 80, 80)
ON CONFLICT (code) 
DO UPDATE SET
  title = EXCLUDED.title,
  short_label = EXCLUDED.short_label,
  description = EXCLUDED.description,
  path_slug = EXCLUDED.path_slug,
  branch = EXCLUDED.branch,
  is_paid = EXCLUDED.is_paid,
  xp_reward = EXCLUDED.xp_reward,
  sort_order = EXCLUDED.sort_order;