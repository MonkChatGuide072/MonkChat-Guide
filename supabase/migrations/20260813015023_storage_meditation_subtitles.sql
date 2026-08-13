-- 1. Create the bucket idempotently
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('meditation-subtitles', 'meditation-subtitles', false, 1048576, '{text/vtt}')
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 1048576,
  allowed_mime_types = '{text/vtt}';

-- 2. Drop existing policies to be fully reproducible
DROP POLICY IF EXISTS "Public users can read published subtitles" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can read all subtitles" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can upload subtitles" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can update subtitles" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete subtitles" ON storage.objects;

-- 3. Create RLS Policies for storage.objects

-- Public User / anon:
-- May read/download only an object whose name exactly matches
-- subtitle_vtt_storage_path of a meditation_track_translations record
-- AND the related meditation_tracks parent must have:
--   - content_status = 'published'
--   - is_published = true
CREATE POLICY "Public users can read published subtitles"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'meditation-subtitles'
  AND EXISTS (
    SELECT 1 FROM public.meditation_track_translations mtt
    JOIN public.meditation_tracks mt ON mtt.track_id = mt.id
    WHERE mtt.subtitle_vtt_storage_path = storage.objects.name
      AND mt.content_status = 'published'
      AND mt.is_published = true
  )
);

-- Authenticated active Team Member & Owner:
-- May read files.
CREATE POLICY "Team Members can read all subtitles"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'meditation-subtitles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
);

-- May upload files to meditation-subtitles.
CREATE POLICY "Team Members can upload subtitles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meditation-subtitles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
);

-- May update or replace files.
CREATE POLICY "Team Members can update subtitles"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meditation-subtitles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
)
WITH CHECK (
  bucket_id = 'meditation-subtitles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
);

-- Active Owner only:
-- May delete files.
CREATE POLICY "Owners can delete subtitles"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'meditation-subtitles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role = 'owner'
  )
);
