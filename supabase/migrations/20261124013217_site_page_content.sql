BEGIN;
CREATE TABLE public.site_page_content (
  section text NOT NULL CHECK(section IN ('home','activities','contact')),
  language_code text NOT NULL CHECK(language_code IN ('th','en')),
  stage text NOT NULL CHECK(stage IN ('draft','published')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid REFERENCES public.profiles(id),
  PRIMARY KEY(section,language_code,stage),
  CHECK(jsonb_typeof(content)='object' AND octet_length(content::text)<=16000)
);
ALTER TABLE public.site_page_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_page_content FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.site_page_content TO anon,authenticated;
GRANT INSERT,UPDATE ON public.site_page_content TO authenticated;
CREATE POLICY "Public reads published page copy" ON public.site_page_content FOR SELECT TO anon USING(stage='published');
CREATE POLICY "Signed-in reads published or managed page copy" ON public.site_page_content FOR SELECT TO authenticated
  USING(stage='published' OR private.get_user_role() IN ('owner','team_member'));
CREATE POLICY "Content team inserts page copy" ON public.site_page_content FOR INSERT TO authenticated
  WITH CHECK(private.get_user_role() IN ('owner','team_member'));
CREATE POLICY "Content team updates page copy" ON public.site_page_content FOR UPDATE TO authenticated
  USING(private.get_user_role() IN ('owner','team_member')) WITH CHECK(private.get_user_role() IN ('owner','team_member'));

CREATE FUNCTION private.validate_site_page_content() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE item record; max_length integer;
BEGIN
  IF jsonb_typeof(NEW.content)<>'object' THEN RAISE EXCEPTION 'Page content must be an object'; END IF;
  FOR item IN SELECT key,value FROM jsonb_each(NEW.content) LOOP
    IF jsonb_typeof(item.value)<>'string' THEN RAISE EXCEPTION 'Page fields must contain plain text'; END IF;
    max_length:=CASE item.key WHEN 'title' THEN 200 WHEN 'description' THEN 2500 WHEN 'tagline' THEN 250 WHEN 'image_url' THEN 1000 WHEN 'link_url' THEN 1000 WHEN 'link_label' THEN 150 ELSE 0 END;
    IF max_length=0 OR length(item.value#>>'{}')>max_length THEN RAISE EXCEPTION 'Invalid field or field length'; END IF;
    IF NEW.section='activities' AND item.key NOT IN ('title','description') THEN RAISE EXCEPTION 'Invalid activity field'; END IF;
    IF NEW.section='home' AND item.key NOT IN ('title','description','tagline','image_url') THEN RAISE EXCEPTION 'Invalid home field'; END IF;
    IF NEW.section='contact' AND item.key NOT IN ('title','description','link_url','link_label') THEN RAISE EXCEPTION 'Invalid contact field'; END IF;
    IF item.key='link_url' AND (item.value#>>'{}')!~'^https://[^/@[:space:]]+([/?#].*)?$' THEN RAISE EXCEPTION 'Use an HTTPS contact URL without credentials'; END IF;
    IF item.key='image_url' AND (item.value#>>'{}')!~'^(https://[^/@[:space:]]+([/?#].*)?|/images/[a-zA-Z0-9/_ .%\-]+)$' THEN RAISE EXCEPTION 'Use an HTTPS image or project image path'; END IF;
  END LOOP;
  NEW.updated_at:=clock_timestamp(); NEW.updated_by:=auth.uid();
  IF TG_OP='UPDATE' THEN NEW.revision:=OLD.revision+1; END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.validate_site_page_content() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER validate_site_page_content BEFORE INSERT OR UPDATE ON public.site_page_content FOR EACH ROW EXECUTE FUNCTION private.validate_site_page_content();

CREATE FUNCTION public.save_site_page_content(p_section text,p_language text,p_content jsonb,p_publish boolean,p_expected_updated_at timestamptz DEFAULT NULL)
RETURNS public.site_page_content LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE saved public.site_page_content; previous public.site_page_content;
BEGIN
  IF private.get_user_role() IS NULL OR private.get_user_role() NOT IN ('owner','team_member') THEN RAISE EXCEPTION 'Content management access required' USING ERRCODE='42501'; END IF;
  IF p_section IS NULL OR p_language IS NULL OR p_content IS NULL OR p_publish IS NULL THEN RAISE EXCEPTION 'Missing page content'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('site_page_content:'||p_section||':'||p_language));
  SELECT * INTO previous FROM public.site_page_content WHERE section=p_section AND language_code=p_language AND stage='draft' FOR UPDATE;
  IF (previous.updated_at IS DISTINCT FROM p_expected_updated_at) THEN RAISE EXCEPTION 'Page copy changed; reload before saving' USING ERRCODE='40001'; END IF;
  INSERT INTO public.site_page_content(section,language_code,stage,content) VALUES(p_section,p_language,'draft',p_content)
    ON CONFLICT(section,language_code,stage) DO UPDATE SET content=EXCLUDED.content RETURNING * INTO saved;
  IF p_publish THEN
    INSERT INTO public.site_page_content(section,language_code,stage,content) VALUES(p_section,p_language,'published',p_content)
      ON CONFLICT(section,language_code,stage) DO UPDATE SET content=EXCLUDED.content;
  END IF;
  RETURN saved;
END $$;
REVOKE ALL ON FUNCTION public.save_site_page_content(text,text,jsonb,boolean,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_site_page_content(text,text,jsonb,boolean,timestamptz) TO authenticated;
COMMIT;
