-- Applied to the hosted project as migration 20260923020015.
BEGIN;

-- Existing policies call this helper. Preserve its signature and permissions,
-- but an inactive account must not receive any management role.
CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$;
REVOKE ALL ON FUNCTION private.get_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated, service_role;

-- Prevent accidental owner lockout and role escalation via direct Data API calls.
-- Ownership transfer is a separate administrative operation, outside this UI.
CREATE FUNCTION private.guard_managed_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND (NEW.id IS DISTINCT FROM OLD.id OR NEW.role IS DISTINCT FROM OLD.role) THEN
    RAISE EXCEPTION 'Profile identity and role cannot be changed through the CMS';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Owner accounts cannot be suspended through the CMS';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.role <> 'team_member' THEN
    RAISE EXCEPTION 'The CMS may create team member accounts only';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.guard_managed_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_managed_profile BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION private.guard_managed_profile();

-- No hard-delete path in the CMS; suspend accounts to preserve content/audit links.
REVOKE DELETE ON public.profiles FROM anon, authenticated;

CREATE FUNCTION private.guard_core_language()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.code IN ('th', 'en') THEN RAISE EXCEPTION 'Core languages cannot be deleted'; END IF;
    RETURN OLD;
  END IF;
  IF NEW.code IS DISTINCT FROM OLD.code THEN RAISE EXCEPTION 'Language codes are immutable'; END IF;
  IF OLD.code IN ('th', 'en') AND NOT NEW.is_active THEN RAISE EXCEPTION 'Core languages must stay active'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.guard_core_language() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_core_language BEFORE UPDATE OR DELETE ON public.languages
FOR EACH ROW EXECUTE FUNCTION private.guard_core_language();

CREATE FUNCTION public.cms_security_version()
RETURNS integer LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$ SELECT 1 WHERE private.get_user_role() = 'owner'; $$;
REVOKE ALL ON FUNCTION public.cms_security_version() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cms_security_version() TO authenticated;
COMMIT;
