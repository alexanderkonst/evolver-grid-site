ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS playbook_visited_at TIMESTAMPTZ;

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS path_visited_at TIMESTAMPTZ;

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS dashboard_visited_at TIMESTAMPTZ;

COMMENT ON COLUMN public.game_profiles.playbook_visited_at IS
  'Day 65 (Sasha 2026-05-15): first-visit timestamp for /playbook. Drives JOURNEY item #2 strikethrough across devices. NULL = not yet visited.';

COMMENT ON COLUMN public.game_profiles.path_visited_at IS
  'Day 65 (Sasha 2026-05-15): first-visit timestamp for /path. Drives JOURNEY item #3 strikethrough across devices. NULL = not yet visited.';

COMMENT ON COLUMN public.game_profiles.dashboard_visited_at IS
  'Day 65 (Sasha 2026-05-15): first-visit timestamp for /dashboard. Drives JOURNEY item #4 strikethrough across devices. NULL = not yet visited.';