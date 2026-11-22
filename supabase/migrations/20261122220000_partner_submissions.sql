-- 2026-11-22: Partner intake form «Bring your module» (issue #383, /bring-your-module).
-- Spec: docs/02-strategy/modular_collaboration/partner_intake.md (terms: partner_offer.md v2.1).
--
-- Additive only: one new table, nothing dropped or rewritten.
--
-- Deploy: held for Sasha's yes (goes through Lovable). The form degrades
-- gracefully while the table is missing: on insert error it opens a prefilled
-- email to the site's contact address and still shows the thank-you screen.
--
-- Privacy contract:
--   * anyone (anon or signed in) may INSERT a submission; nobody can read it back
--     through the API, and nobody can change or delete it
--   * only service_role reads and updates (Hark turns each row into module cards by hand)
--   * honeypot submissions are rejected client-side and never reach this table
--   * partner contact data is stored indefinitely (note for the accountant/lawyer check)

CREATE TABLE IF NOT EXISTS public.partner_submissions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  status                   TEXT NOT NULL DEFAULT 'new',
  name                     TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 200),
  email                    TEXT NOT NULL CHECK (char_length(btrim(email)) BETWEEN 3 AND 320),
  project_name             TEXT NOT NULL CHECK (char_length(btrim(project_name)) BETWEEN 1 AND 200),
  project_url              TEXT NOT NULL CHECK (char_length(btrim(project_url)) BETWEEN 1 AND 2000),
  -- One object per module: kind, place, title, result, price, link, referral_param, referral_id.
  modules                  JSONB NOT NULL CHECK (jsonb_typeof(modules) = 'array' AND jsonb_array_length(modules) >= 1),
  accepted_social_contract BOOLEAN NOT NULL
);

ALTER TABLE public.partner_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partner_submissions_insert_anyone" ON public.partner_submissions;

-- Anyone may submit, and only as a fresh 'new' row that carries the accepted social contract.
-- No SELECT / UPDATE / DELETE policy exists, so those are denied to anon and authenticated.
CREATE POLICY "partner_submissions_insert_anyone"
  ON public.partner_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND accepted_social_contract IS TRUE);

-- Grants: INSERT of the form's columns only; the service role keeps full access.
REVOKE ALL ON public.partner_submissions FROM PUBLIC, anon, authenticated;
GRANT INSERT (name, email, project_name, project_url, modules, accepted_social_contract)
  ON public.partner_submissions TO anon, authenticated;
GRANT ALL ON public.partner_submissions TO service_role;

COMMENT ON TABLE public.partner_submissions IS
  'Partner intake «Bring your module» (issue #383). Insert-only for anon/authenticated; read and update by service_role (Hark). status: new → drafted → confirmed (by hand).';
