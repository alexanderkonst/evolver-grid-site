-- Fix: the `avatars` storage bucket exists in prod, but the RLS policies
-- defined in migration 20260421002009 never actually landed there, so every
-- authenticated avatar upload fails with "new row violates row-level
-- security policy". This migration re-asserts the bucket config and the
-- four avatars policies, idempotently, so it is safe to run whether or not
-- any of them already exist. Day 2026-08-21.
--
-- Scope: avatars bucket/policies only. Does not touch linkedin-profiles or
-- any other bucket/policy.

-- Allow direct file fetches via public URLs but disallow listing.
DROP POLICY IF EXISTS "Avatar files publicly readable by direct URL" ON storage.objects;
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