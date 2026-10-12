-- Four editorial slots for the public Home carousel. Existing bundled images
-- remain visible until a slot is explicitly published from the CMS.
CREATE TABLE public.home_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot smallint NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 4),
  storage_path text NOT NULL CHECK (char_length(storage_path) BETWEEN 1 AND 250),
  caption_th text NOT NULL CHECK (char_length(caption_th) BETWEEN 1 AND 80),
  caption_en text NOT NULL CHECK (char_length(caption_en) BETWEEN 1 AND 80),
  is_published boolean NOT NULL DEFAULT false,
  updated_by uuid NOT NULL REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_media ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.home_media FROM anon, authenticated;
GRANT SELECT ON public.home_media TO anon, authenticated;
GRANT INSERT, UPDATE ON public.home_media TO authenticated;

CREATE POLICY "Published Home media public view" ON public.home_media
FOR SELECT TO anon USING (is_published);
CREATE POLICY "Owner Home media view" ON public.home_media
FOR SELECT TO authenticated USING (private.get_user_role() = 'owner' OR is_published);
CREATE POLICY "Owner Home media insert" ON public.home_media
FOR INSERT TO authenticated WITH CHECK (
  private.get_user_role() = 'owner' AND updated_by = (select auth.uid())
);
CREATE POLICY "Owner Home media update" ON public.home_media
FOR UPDATE TO authenticated USING (private.get_user_role() = 'owner')
WITH CHECK (private.get_user_role() = 'owner' AND updated_by = (select auth.uid()));

CREATE TRIGGER audit_home_media_changes
AFTER INSERT OR UPDATE ON public.home_media
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('home-photos', 'home-photos', true, 2097152, '{image/jpeg,image/png,image/webp}')
ON CONFLICT (id) DO UPDATE SET
  public = true, file_size_limit = 2097152,
  allowed_mime_types = '{image/jpeg,image/png,image/webp}';

CREATE POLICY "Owner Home photo upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'home-photos' AND private.get_user_role() = 'owner'
);
CREATE POLICY "Owner Home photo view" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'home-photos' AND private.get_user_role() = 'owner'
);
CREATE POLICY "Owner Home photo cleanup" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'home-photos' AND private.get_user_role() = 'owner'
);
