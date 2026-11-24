-- Explicit account lifecycle. Historical inactive accounts are deliberately not guessed.
BEGIN;
ALTER TABLE public.profiles
  ADD COLUMN student_access_status text,
  ADD COLUMN student_access_note text,
  ADD COLUMN student_access_updated_at timestamptz;
UPDATE public.profiles SET
  student_access_status = CASE WHEN is_active THEN 'active' ELSE 'needs_review' END,
  student_access_updated_at = now()
WHERE role = 'student';
ALTER TABLE public.profiles ADD CONSTRAINT student_access_consistent CHECK (
  (role <> 'student' AND student_access_status IS NULL AND student_access_note IS NULL)
  OR (role = 'student' AND student_access_status IS NOT NULL
    AND student_access_status IN ('pending','active','suspended','needs_review')
    AND is_active = (student_access_status = 'active')
    AND (student_access_note IS NULL OR length(student_access_note) <= 500))
);

CREATE FUNCTION private.normalize_student_access() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.role <> 'student' THEN
    IF NEW.student_access_status IS NOT NULL OR NEW.student_access_note IS NOT NULL THEN
      RAISE EXCEPTION 'Student status cannot be assigned to staff';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.student_access_status := CASE WHEN NEW.is_active THEN 'active' ELSE 'pending' END;
    NEW.student_access_updated_at := now();
  ELSE
    IF NEW.student_access_status IS DISTINCT FROM OLD.student_access_status
       OR NEW.student_access_note IS DISTINCT FROM OLD.student_access_note
       OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      IF auth.uid() IS NOT NULL AND private.get_user_role() IS DISTINCT FROM 'owner' THEN
        RAISE EXCEPTION 'Only an active owner can change student access';
      END IF;
      -- Preserve the older owner API while keeping status and is_active consistent.
      IF NEW.student_access_status IS NOT DISTINCT FROM OLD.student_access_status
         AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        NEW.student_access_status := CASE WHEN NEW.is_active THEN 'active' ELSE 'suspended' END;
        NEW.student_access_note := 'เปลี่ยนสิทธิ์ผ่านระบบเดิม';
      ELSE
        NEW.is_active := (NEW.student_access_status = 'active');
      END IF;
      NEW.student_access_updated_at := now();
    ELSE
      NEW.student_access_updated_at := OLD.student_access_updated_at;
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.normalize_student_access() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER normalize_student_access BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION private.normalize_student_access();

CREATE TABLE public.student_access_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  from_status text CHECK (from_status IN ('pending','active','suspended','needs_review')),
  to_status text NOT NULL CHECK (to_status IN ('pending','active','suspended','needs_review')),
  reason text CHECK (length(reason) <= 500),
  actor_user_id uuid,
  actor_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX student_access_events_student_time_idx ON public.student_access_events(student_id, created_at DESC);
ALTER TABLE public.student_access_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_access_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.student_access_events TO authenticated;
CREATE POLICY "Active owner reads student access history" ON public.student_access_events
  FOR SELECT TO authenticated USING (private.get_user_role() = 'owner');

CREATE FUNCTION private.record_student_access() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE previous_status text; actor_label text;
BEGIN
  IF NEW.role <> 'student' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.student_access_status IS NOT DISTINCT FROM OLD.student_access_status THEN RETURN NEW; END IF;
    previous_status := OLD.student_access_status;
  END IF;
  SELECT display_name INTO actor_label FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.student_access_events(student_id, from_status, to_status, reason, actor_user_id, actor_name)
    VALUES (NEW.id, previous_status, NEW.student_access_status, NEW.student_access_note,
      auth.uid(), coalesce(actor_label, 'ระบบสมัครสมาชิก'));
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.record_student_access() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER record_student_access AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION private.record_student_access();

CREATE FUNCTION public.student_access_version() RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT CASE WHEN private.get_user_role() = 'owner' THEN 1 ELSE NULL END;
$$;
REVOKE ALL ON FUNCTION public.student_access_version() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.student_access_version() TO authenticated;
COMMIT;
