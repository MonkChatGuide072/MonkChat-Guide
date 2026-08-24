-- 1. Add column
ALTER TABLE public.meditation_tracks ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN NOT NULL DEFAULT false;

-- 2. Add partial unique index (max 1 per language)
CREATE UNIQUE INDEX IF NOT EXISTS max_one_recommended_track 
ON public.meditation_tracks (source_language_code) 
WHERE is_recommended = true;

-- 3. Add constraint for is_recommended
ALTER TABLE public.meditation_tracks
ADD CONSTRAINT check_recommended_is_published
CHECK (
  is_recommended = false OR (is_published = true AND content_status = 'published')
);

-- 4. Trigger to prevent non-Owner from changing is_recommended
CREATE OR REPLACE FUNCTION public.check_is_recommended_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_recommended = true THEN
      IF private.get_user_role() IS DISTINCT FROM 'owner' THEN
        RAISE EXCEPTION 'Only owners can set the recommended status.';
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_recommended IS DISTINCT FROM OLD.is_recommended THEN
      IF private.get_user_role() IS DISTINCT FROM 'owner' THEN
        RAISE EXCEPTION 'Only owners can change the recommended status.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = '';

REVOKE ALL ON FUNCTION public.check_is_recommended_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_is_recommended_update() FROM anon;
REVOKE ALL ON FUNCTION public.check_is_recommended_update() FROM authenticated;

DROP TRIGGER IF EXISTS tr_check_is_recommended_update ON public.meditation_tracks;
CREATE TRIGGER tr_check_is_recommended_update
BEFORE INSERT OR UPDATE ON public.meditation_tracks
FOR EACH ROW
EXECUTE FUNCTION public.check_is_recommended_update();

-- 5. RPC for Owner to set recommended track
CREATE OR REPLACE FUNCTION public.set_recommended_track(p_track_id UUID)
RETURNS VOID AS $$
DECLARE
  v_lang_code TEXT;
  v_is_published BOOLEAN;
  v_content_status TEXT;
BEGIN
  -- 1. Check if user is owner
  IF private.get_user_role() IS DISTINCT FROM 'owner' THEN
    RAISE EXCEPTION 'Permission denied. Only Owner can set recommended track.';
  END IF;

  -- 2. Get track info and lock the row
  SELECT source_language_code, is_published, content_status
  INTO v_lang_code, v_is_published, v_content_status
  FROM public.meditation_tracks
  WHERE id = p_track_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Track not found.';
  END IF;

  -- 3. Check published status
  IF v_is_published != true OR v_content_status != 'published' THEN
    RAISE EXCEPTION 'Only published tracks can be recommended.';
  END IF;

  -- Lock other recommended rows for the same language to prevent race condition
  PERFORM 1 FROM public.meditation_tracks
  WHERE source_language_code = v_lang_code AND is_recommended = true
  FOR UPDATE;

  -- 4. Atomic update
  UPDATE public.meditation_tracks
  SET is_recommended = false
  WHERE source_language_code = v_lang_code 
    AND is_recommended = true 
    AND id != p_track_id;

  UPDATE public.meditation_tracks
  SET is_recommended = true
  WHERE id = p_track_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Restrict execute permissions
REVOKE ALL ON FUNCTION public.set_recommended_track(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_recommended_track(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_recommended_track(UUID) TO authenticated;
