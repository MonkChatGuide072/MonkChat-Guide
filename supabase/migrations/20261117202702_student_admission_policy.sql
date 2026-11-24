-- Shared admission policy: only active owners can change it; registration reads it server-side.
BEGIN;
CREATE TABLE public.student_admission_policy (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  mode text NOT NULL CHECK (mode IN ('auto_approve', 'admin_approval')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Preserve the owner's previously selected open-registration mode.
INSERT INTO public.student_admission_policy (id, mode) VALUES (true, 'auto_approve');
ALTER TABLE public.student_admission_policy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_admission_policy FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.student_admission_policy TO authenticated, service_role;
GRANT UPDATE (mode, updated_at) ON public.student_admission_policy TO authenticated;
CREATE POLICY "Active owner reads admission policy"
  ON public.student_admission_policy FOR SELECT TO authenticated
  USING (private.get_user_role() = 'owner');
CREATE POLICY "Active owner updates admission policy"
  ON public.student_admission_policy FOR UPDATE TO authenticated
  USING (private.get_user_role() = 'owner')
  WITH CHECK (private.get_user_role() = 'owner');
COMMIT;
