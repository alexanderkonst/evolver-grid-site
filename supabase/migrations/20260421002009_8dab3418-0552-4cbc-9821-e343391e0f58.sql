-- ============================================================
-- 1. mission_participants: hide email from cross-team reads
-- ============================================================
DROP POLICY IF EXISTS "Users can select shared or own participation" ON public.mission_participants;

CREATE POLICY "Users can select own participation"
ON public.mission_participants
FOR SELECT
USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.mission_participants_public
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  mission_id,
  mission_title,
  outcome_id,
  challenge_id,
  focus_area_id,
  pillar_id,
  first_name,
  intro_text,
  share_consent,
  wants_to_lead,
  wants_to_integrate,
  notify_level,
  email_frequency,
  created_at,
  notified_at
FROM public.mission_participants
WHERE share_consent = true OR auth.uid() = user_id;

GRANT SELECT ON public.mission_participants_public TO anon, authenticated;

-- ============================================================
-- 2. testimonials: admin-only writes
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON public.testimonials;

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ============================================================
-- 3. genius_offer_requests: validate inputs at the DB level
-- ============================================================
ALTER TABLE public.genius_offer_requests
  DROP CONSTRAINT IF EXISTS genius_offer_requests_name_len,
  DROP CONSTRAINT IF EXISTS genius_offer_requests_email_len,
  DROP CONSTRAINT IF EXISTS genius_offer_requests_email_format,
  DROP CONSTRAINT IF EXISTS genius_offer_requests_text_len;

ALTER TABLE public.genius_offer_requests
  ADD CONSTRAINT genius_offer_requests_name_len
    CHECK (char_length(name) BETWEEN 1 AND 200) NOT VALID,
  ADD CONSTRAINT genius_offer_requests_email_len
    CHECK (char_length(email) BETWEEN 3 AND 320) NOT VALID,
  ADD CONSTRAINT genius_offer_requests_email_format
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') NOT VALID,
  ADD CONSTRAINT genius_offer_requests_text_len
    CHECK (
      coalesce(char_length(ai_summary_raw), 0) <= 20000
      AND coalesce(char_length(products_sold), 0) <= 10000
      AND coalesce(char_length(best_clients), 0) <= 10000
      AND coalesce(char_length(offers_sold), 0) <= 10000
      AND coalesce(char_length(best_client_story), 0) <= 10000
      AND coalesce(char_length(no_ai_genius_description), 0) <= 10000
      AND coalesce(char_length(extra_notes), 0) <= 10000
      AND coalesce(char_length(intelligences_note), 0) <= 10000
      AND coalesce(char_length(summary_promise), 0) <= 10000
      AND coalesce(char_length(summary_title), 0) <= 1000
      AND coalesce(char_length(source_branch), 0) <= 50
    ) NOT VALID;

-- ============================================================
-- 4. set_updated_at: pin search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 5. Storage: stop anonymous listing of the public avatars bucket
-- ============================================================
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatar files are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Avatar files publicly readable by direct URL" ON storage.objects;

-- Allow direct file fetches via public URLs but disallow listing
CREATE POLICY "Avatar files publicly readable by direct URL"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars' AND owner IS NOT NULL);

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);