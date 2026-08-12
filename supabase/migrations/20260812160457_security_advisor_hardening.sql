-- A. Function search paths
ALTER FUNCTION public.update_modified_column() SET search_path = '';
ALTER FUNCTION public.enforce_qa_verification() SET search_path = '';

-- B. Anonymous usage-events policy
DROP POLICY IF EXISTS "Usage events public insert" ON public.usage_events;
CREATE POLICY "Usage events public insert" ON public.usage_events FOR INSERT 
WITH CHECK (event_type IN ('audio_play', 'audio_complete', 'bio_link_click'));

-- C. Move get_user_role out of the exposed public schema
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS text AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION private.get_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_user_role() FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO service_role;

-- Update enforce_qa_verification to use private.get_user_role()
CREATE OR REPLACE FUNCTION public.enforce_qa_verification()
RETURNS TRIGGER AS $$
DECLARE
    user_role text;
BEGIN
    user_role := private.get_user_role();
    
    IF TG_OP = 'INSERT' THEN
        IF user_role = 'team_member' THEN
            NEW.verification_status := 'unverified';
            NEW.is_published := false;
            NEW.verified_by := NULL;
            NEW.verified_at := NULL;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF user_role = 'team_member' THEN
            -- Team members cannot change verification status or published status
            NEW.verification_status := OLD.verification_status;
            NEW.verified_by := OLD.verified_by;
            NEW.verified_at := OLD.verified_at;
            
            -- Team members must never change is_published
            NEW.is_published := OLD.is_published;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Recreate policies using private.get_user_role()
DROP POLICY "Profiles view" ON public.profiles;
CREATE POLICY "Profiles view" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR private.get_user_role() = 'owner');

DROP POLICY "Profiles insert" ON public.profiles;
CREATE POLICY "Profiles insert" ON public.profiles FOR INSERT 
WITH CHECK (private.get_user_role() = 'owner');

DROP POLICY "Profiles update" ON public.profiles;
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE 
USING (private.get_user_role() = 'owner');

DROP POLICY "Profiles delete" ON public.profiles;
CREATE POLICY "Profiles delete" ON public.profiles FOR DELETE 
USING (private.get_user_role() = 'owner');

DROP POLICY "Languages owner insert" ON public.languages;
CREATE POLICY "Languages owner insert" ON public.languages FOR INSERT WITH CHECK (private.get_user_role() = 'owner');

DROP POLICY "Languages owner update" ON public.languages;
CREATE POLICY "Languages owner update" ON public.languages FOR UPDATE USING (private.get_user_role() = 'owner');

DROP POLICY "Languages owner delete" ON public.languages;
CREATE POLICY "Languages owner delete" ON public.languages FOR DELETE USING (private.get_user_role() = 'owner');

DROP POLICY "Meditation tracks team view" ON public.meditation_tracks;
CREATE POLICY "Meditation tracks team view" ON public.meditation_tracks FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Meditation tracks team insert" ON public.meditation_tracks;
CREATE POLICY "Meditation tracks team insert" ON public.meditation_tracks FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Meditation tracks team update" ON public.meditation_tracks;
CREATE POLICY "Meditation tracks team update" ON public.meditation_tracks FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Meditation tracks owner delete" ON public.meditation_tracks;
CREATE POLICY "Meditation tracks owner delete" ON public.meditation_tracks FOR DELETE 
USING (private.get_user_role() = 'owner' AND archived_at IS NOT NULL);

DROP POLICY "Meditation translations team view" ON public.meditation_track_translations;
CREATE POLICY "Meditation translations team view" ON public.meditation_track_translations FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Meditation translations team insert" ON public.meditation_track_translations;
CREATE POLICY "Meditation translations team insert" ON public.meditation_track_translations FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Meditation translations team update" ON public.meditation_track_translations;
CREATE POLICY "Meditation translations team update" ON public.meditation_track_translations FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Meditation translations owner delete" ON public.meditation_track_translations;
CREATE POLICY "Meditation translations owner delete" ON public.meditation_track_translations FOR DELETE 
USING (private.get_user_role() = 'owner');

DROP POLICY "QA items team view" ON public.qa_items;
CREATE POLICY "QA items team view" ON public.qa_items FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "QA items team insert" ON public.qa_items;
CREATE POLICY "QA items team insert" ON public.qa_items FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "QA items team update" ON public.qa_items;
CREATE POLICY "QA items team update" ON public.qa_items FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "QA items owner delete" ON public.qa_items;
CREATE POLICY "QA items owner delete" ON public.qa_items FOR DELETE 
USING (private.get_user_role() = 'owner' AND archived_at IS NOT NULL);

DROP POLICY "QA translations team view" ON public.qa_translations;
CREATE POLICY "QA translations team view" ON public.qa_translations FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "QA translations team insert" ON public.qa_translations;
CREATE POLICY "QA translations team insert" ON public.qa_translations FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "QA translations team update" ON public.qa_translations;
CREATE POLICY "QA translations team update" ON public.qa_translations FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "QA translations owner delete" ON public.qa_translations;
CREATE POLICY "QA translations owner delete" ON public.qa_translations FOR DELETE 
USING (private.get_user_role() = 'owner');

DROP POLICY "DCI centers team view" ON public.dci_centers;
CREATE POLICY "DCI centers team view" ON public.dci_centers FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "DCI centers team insert" ON public.dci_centers;
CREATE POLICY "DCI centers team insert" ON public.dci_centers FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "DCI centers team update" ON public.dci_centers;
CREATE POLICY "DCI centers team update" ON public.dci_centers FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "DCI centers owner delete" ON public.dci_centers;
CREATE POLICY "DCI centers owner delete" ON public.dci_centers FOR DELETE 
USING (private.get_user_role() = 'owner' AND archived_at IS NOT NULL);

DROP POLICY "DCI center translations team view" ON public.dci_center_translations;
CREATE POLICY "DCI center translations team view" ON public.dci_center_translations FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "DCI center translations team insert" ON public.dci_center_translations;
CREATE POLICY "DCI center translations team insert" ON public.dci_center_translations FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "DCI center translations team update" ON public.dci_center_translations;
CREATE POLICY "DCI center translations team update" ON public.dci_center_translations FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "DCI center translations owner delete" ON public.dci_center_translations;
CREATE POLICY "DCI center translations owner delete" ON public.dci_center_translations FOR DELETE 
USING (private.get_user_role() = 'owner');

DROP POLICY "Bio links team view" ON public.bio_links;
CREATE POLICY "Bio links team view" ON public.bio_links FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Bio links team insert" ON public.bio_links;
CREATE POLICY "Bio links team insert" ON public.bio_links FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Bio links team update" ON public.bio_links;
CREATE POLICY "Bio links team update" ON public.bio_links FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Bio links owner delete" ON public.bio_links;
CREATE POLICY "Bio links owner delete" ON public.bio_links FOR DELETE 
USING (private.get_user_role() = 'owner' AND archived_at IS NOT NULL);

DROP POLICY "Bio link translations team view" ON public.bio_link_translations;
CREATE POLICY "Bio link translations team view" ON public.bio_link_translations FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Bio link translations team insert" ON public.bio_link_translations;
CREATE POLICY "Bio link translations team insert" ON public.bio_link_translations FOR INSERT 
WITH CHECK (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Bio link translations team update" ON public.bio_link_translations;
CREATE POLICY "Bio link translations team update" ON public.bio_link_translations FOR UPDATE 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Bio link translations owner delete" ON public.bio_link_translations;
CREATE POLICY "Bio link translations owner delete" ON public.bio_link_translations FOR DELETE 
USING (private.get_user_role() = 'owner');

DROP POLICY "Usage events team view" ON public.usage_events;
CREATE POLICY "Usage events team view" ON public.usage_events FOR SELECT 
USING (private.get_user_role() IN ('owner', 'team_member'));

DROP POLICY "Usage events owner delete" ON public.usage_events;
CREATE POLICY "Usage events owner delete" ON public.usage_events FOR DELETE 
USING (private.get_user_role() = 'owner');



-- Drop the old function now that all references are gone
DROP FUNCTION IF EXISTS public.get_user_role();
