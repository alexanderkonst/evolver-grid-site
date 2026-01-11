-- Add avatar URL to game profiles (if not exists)
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add RSVP email fields (if not exists)
ALTER TABLE public.event_rsvps
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS wants_reminder BOOLEAN DEFAULT false;

-- Add timezone to events (if not exists)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Create linkedin-profiles storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('linkedin-profiles', 'linkedin-profiles', false)
ON CONFLICT (id) DO NOTHING;

-- Create avatars storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket (public read, authenticated upload to own folder)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for linkedin-profiles bucket (private, authenticated upload to own folder)
CREATE POLICY "Users can view their own linkedin profiles"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'linkedin-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own linkedin profile"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'linkedin-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own linkedin profile"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'linkedin-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own linkedin profile"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'linkedin-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);