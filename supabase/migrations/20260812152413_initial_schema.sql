-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'team_member')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Languages Table
CREATE TABLE public.languages (
    code TEXT PRIMARY KEY,
    native_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Meditation Tracks Table
CREATE TABLE public.meditation_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_storage_path TEXT,
    source_language_code TEXT NOT NULL REFERENCES public.languages(code),
    speaker_name TEXT,
    duration_seconds INTEGER NOT NULL,
    content_status TEXT NOT NULL CHECK (content_status IN ('draft', 'published', 'archived')),
    is_published BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Meditation Track Translations
CREATE TABLE public.meditation_track_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID NOT NULL REFERENCES public.meditation_tracks(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL REFERENCES public.languages(code),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    transcript TEXT,
    subtitle_vtt_storage_path TEXT,
    UNIQUE(track_id, language_code)
);

-- 5. Q&A Items Table
CREATE TABLE public.qa_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    source_reference TEXT,
    content_status TEXT NOT NULL CHECK (content_status IN ('draft', 'published', 'archived')),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('unverified', 'verified')),
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Q&A Translations Table
CREATE TABLE public.qa_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qa_item_id UUID NOT NULL REFERENCES public.qa_items(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL REFERENCES public.languages(code),
    question TEXT NOT NULL,
    short_answer TEXT NOT NULL,
    detailed_answer TEXT,
    UNIQUE(qa_item_id, language_code)
);

-- 7. DCI Centers Table
CREATE TABLE public.dci_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    map_url TEXT,
    website_url TEXT,
    contact_url TEXT,
    content_status TEXT NOT NULL CHECK (content_status IN ('draft', 'published', 'archived')),
    is_published BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. DCI Center Translations
CREATE TABLE public.dci_center_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.dci_centers(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL REFERENCES public.languages(code),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    UNIQUE(center_id, language_code)
);

-- 9. BioPage Links Table
CREATE TABLE public.bio_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    content_status TEXT NOT NULL CHECK (content_status IN ('draft', 'published', 'archived')),
    is_published BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. BioPage Link Translations
CREATE TABLE public.bio_link_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bio_link_id UUID NOT NULL REFERENCES public.bio_links(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL REFERENCES public.languages(code),
    title TEXT NOT NULL,
    UNIQUE(bio_link_id, language_code)
);

-- 11. Usage Events Table
CREATE TABLE public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('audio_play', 'audio_complete', 'bio_link_click')),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('meditation_track', 'bio_link')),
    resource_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helper function for updated_at trigger
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers for updated_at
CREATE TRIGGER update_meditation_tracks_modtime
BEFORE UPDATE ON public.meditation_tracks
FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

CREATE TRIGGER update_qa_items_modtime
BEFORE UPDATE ON public.qa_items
FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

CREATE TRIGGER update_dci_centers_modtime
BEFORE UPDATE ON public.dci_centers
FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

CREATE TRIGGER update_bio_links_modtime
BEFORE UPDATE ON public.bio_links
FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
