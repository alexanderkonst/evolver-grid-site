
CREATE TABLE public.match_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposed_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_type text NOT NULL CHECK (gift_type IN ('mirror','compass','door','co_creation','motivation')),
  proposed_at timestamptz NOT NULL DEFAULT now(),
  response text DEFAULT 'pending' CHECK (response IN ('pending','accepted','declined','ignored')),
  responded_at timestamptz,
  match_interest_id uuid REFERENCES public.match_interests(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_proposals_user_id ON public.match_proposals(user_id);
CREATE INDEX idx_match_proposals_user_pair ON public.match_proposals(user_id, proposed_user_id);
CREATE INDEX idx_match_proposals_match_interest_id ON public.match_proposals(match_interest_id);

GRANT SELECT ON public.match_proposals TO authenticated;
GRANT ALL ON public.match_proposals TO service_role;

ALTER TABLE public.match_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own proposals"
  ON public.match_proposals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS match_digest_opt_in boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS match_digest_paused_until timestamptz;
