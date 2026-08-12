-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_track_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dci_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dci_center_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_link_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Safe helper to get current user role without causing infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- Profiles Policies
CREATE POLICY "Profiles view" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.get_user_role() = 'owner');

CREATE POLICY "Profiles insert" ON public.profiles FOR INSERT 
WITH CHECK (public.get_user_role() = 'owner');

CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE 
USING (public.get_user_role() = 'owner');

CREATE POLICY "Profiles delete" ON public.profiles FOR DELETE 
USING (public.get_user_role() = 'owner');

-- Languages Policies
CREATE POLICY "Languages public view" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Languages owner insert" ON public.languages FOR INSERT WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "Languages owner update" ON public.languages FOR UPDATE USING (public.get_user_role() = 'owner');
CREATE POLICY "Languages owner delete" ON public.languages FOR DELETE USING (public.get_user_role() = 'owner');

-- Meditation Tracks Policies
CREATE POLICY "Meditation tracks public view" ON public.meditation_tracks FOR SELECT 
USING (is_published = true AND content_status = 'published');

CREATE POLICY "Meditation tracks team view" ON public.meditation_tracks FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Meditation tracks team insert" ON public.meditation_tracks FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Meditation tracks team update" ON public.meditation_tracks FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Meditation tracks owner delete" ON public.meditation_tracks FOR DELETE 
USING (public.get_user_role() = 'owner' AND archived_at IS NOT NULL);

-- Meditation Track Translations Policies
CREATE POLICY "Meditation translations public view" ON public.meditation_track_translations FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.meditation_tracks t 
    WHERE t.id = track_id AND t.is_published = true AND t.content_status = 'published'
));

CREATE POLICY "Meditation translations team view" ON public.meditation_track_translations FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Meditation translations team insert" ON public.meditation_track_translations FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Meditation translations team update" ON public.meditation_track_translations FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Meditation translations owner delete" ON public.meditation_track_translations FOR DELETE 
USING (public.get_user_role() = 'owner');

-- QA Items Policies
CREATE POLICY "QA items public view" ON public.qa_items FOR SELECT 
USING (is_published = true AND content_status = 'published' AND verification_status = 'verified');

CREATE POLICY "QA items team view" ON public.qa_items FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "QA items team insert" ON public.qa_items FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "QA items team update" ON public.qa_items FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "QA items owner delete" ON public.qa_items FOR DELETE 
USING (public.get_user_role() = 'owner' AND archived_at IS NOT NULL);

-- QA Translations Policies
CREATE POLICY "QA translations public view" ON public.qa_translations FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.qa_items q 
    WHERE q.id = qa_item_id AND q.is_published = true AND q.content_status = 'published' AND q.verification_status = 'verified'
));

CREATE POLICY "QA translations team view" ON public.qa_translations FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "QA translations team insert" ON public.qa_translations FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "QA translations team update" ON public.qa_translations FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "QA translations owner delete" ON public.qa_translations FOR DELETE 
USING (public.get_user_role() = 'owner');

-- DCI Centers Policies
CREATE POLICY "DCI centers public view" ON public.dci_centers FOR SELECT 
USING (is_published = true AND content_status = 'published');

CREATE POLICY "DCI centers team view" ON public.dci_centers FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "DCI centers team insert" ON public.dci_centers FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "DCI centers team update" ON public.dci_centers FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "DCI centers owner delete" ON public.dci_centers FOR DELETE 
USING (public.get_user_role() = 'owner' AND archived_at IS NOT NULL);

-- DCI Center Translations Policies
CREATE POLICY "DCI center translations public view" ON public.dci_center_translations FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.dci_centers c 
    WHERE c.id = center_id AND c.is_published = true AND c.content_status = 'published'
));

CREATE POLICY "DCI center translations team view" ON public.dci_center_translations FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "DCI center translations team insert" ON public.dci_center_translations FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "DCI center translations team update" ON public.dci_center_translations FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "DCI center translations owner delete" ON public.dci_center_translations FOR DELETE 
USING (public.get_user_role() = 'owner');

-- Bio Links Policies
CREATE POLICY "Bio links public view" ON public.bio_links FOR SELECT 
USING (is_published = true AND content_status = 'published');

CREATE POLICY "Bio links team view" ON public.bio_links FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Bio links team insert" ON public.bio_links FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Bio links team update" ON public.bio_links FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Bio links owner delete" ON public.bio_links FOR DELETE 
USING (public.get_user_role() = 'owner' AND archived_at IS NOT NULL);

-- Bio Link Translations Policies
CREATE POLICY "Bio link translations public view" ON public.bio_link_translations FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.bio_links b 
    WHERE b.id = bio_link_id AND b.is_published = true AND b.content_status = 'published'
));

CREATE POLICY "Bio link translations team view" ON public.bio_link_translations FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Bio link translations team insert" ON public.bio_link_translations FOR INSERT 
WITH CHECK (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Bio link translations team update" ON public.bio_link_translations FOR UPDATE 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Bio link translations owner delete" ON public.bio_link_translations FOR DELETE 
USING (public.get_user_role() = 'owner');

-- Usage Events Policies
CREATE POLICY "Usage events public insert" ON public.usage_events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usage events team view" ON public.usage_events FOR SELECT 
USING (public.get_user_role() IN ('owner', 'team_member'));

CREATE POLICY "Usage events owner delete" ON public.usage_events FOR DELETE 
USING (public.get_user_role() = 'owner');

-- Trigger to enforce QA verification rules
CREATE OR REPLACE FUNCTION public.enforce_qa_verification()
RETURNS TRIGGER AS $$
DECLARE
    user_role text;
BEGIN
    user_role := public.get_user_role();
    
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_qa_verification_trigger
BEFORE INSERT OR UPDATE ON public.qa_items
FOR EACH ROW EXECUTE PROCEDURE public.enforce_qa_verification();
