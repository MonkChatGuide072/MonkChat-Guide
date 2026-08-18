-- Store an optional Supabase Storage object path for each BioPage link image.
ALTER TABLE public.bio_links
  ADD COLUMN IF NOT EXISTS image_storage_path text;

COMMENT ON COLUMN public.bio_links.image_storage_path IS
  'Optional object path in the public bio-link-images Storage bucket.';

-- Public images are deliberately used on the public BioPage. File names are generated
-- by the CMS and uploads remain restricted to active CMS users through policies below.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bio-link-images',
  'bio-link-images',
  true,
  2097152,
  '{image/jpeg,image/png,image/webp}'
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = '{image/jpeg,image/png,image/webp}';

DROP POLICY IF EXISTS "Public users can read BioPage images" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can read BioPage images" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can upload BioPage images" ON storage.objects;
DROP POLICY IF EXISTS "Team Members can update BioPage images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete BioPage images" ON storage.objects;

CREATE POLICY "Public users can read BioPage images"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'bio-link-images');

CREATE POLICY "Team Members can read BioPage images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bio-link-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (select auth.uid())
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
);

CREATE POLICY "Team Members can upload BioPage images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bio-link-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (select auth.uid())
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
);

CREATE POLICY "Team Members can update BioPage images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bio-link-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (select auth.uid())
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
)
WITH CHECK (
  bucket_id = 'bio-link-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (select auth.uid())
      AND is_active = true
      AND role IN ('owner', 'team_member')
  )
);

CREATE POLICY "Owners can delete BioPage images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bio-link-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (select auth.uid())
      AND is_active = true
      AND role = 'owner'
  )
);
