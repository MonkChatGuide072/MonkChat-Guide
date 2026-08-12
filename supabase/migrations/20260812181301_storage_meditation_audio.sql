-- 1. Create the bucket idempotently
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('meditation-audio', 'meditation-audio', false, 26214400, '{audio/mpeg}')
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = '{audio/mpeg}';

-- 2. Drop existing policies to be fully reproducible
DROP POLICY IF EXISTS "Public users can read published audio" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can read all audio" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can update audio" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete audio" ON storage.objects;

-- 3. Create RLS Policies for storage.objects

-- Public User / anon:
-- May read/download only an audio object whose storage.objects.name exactly matches
-- audio_storage_path of a meditation_tracks record that is:
--   - content_status = 'published'
--   - is_published = true
-- Cannot upload, update, or delete files.
CREATE POLICY "Public users can read published audio"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'meditation-audio'
  AND EXISTS (
    SELECT 1 FROM public.meditation_tracks
    WHERE audio_storage_path = storage.objects.name
      AND content_status = 'published'
      AND is_published = true
  )
);

-- Authenticated active Team Member:
-- May read files.
CREATE POLICY "Team Members can read all audio"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'meditation-audio'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_active = true 
      AND role IN ('owner', 'team_member')
  )
);

-- May upload MP3 files to meditation-audio.
CREATE POLICY "Team Members can upload audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meditation-audio'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_active = true 
      AND role IN ('owner', 'team_member')
  )
);

-- May update or replace files.
CREATE POLICY "Team Members can update audio"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meditation-audio'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_active = true 
      AND role IN ('owner', 'team_member')
  )
)
WITH CHECK (
  bucket_id = 'meditation-audio'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_active = true 
      AND role IN ('owner', 'team_member')
  )
);

-- Authenticated active Owner:
-- May read, upload, update, and permanently delete files.
CREATE POLICY "Owners can delete audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'meditation-audio'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_active = true 
      AND role = 'owner'
  )
);