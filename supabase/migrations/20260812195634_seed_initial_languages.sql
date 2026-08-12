-- Seed initial language reference data
-- This satisfies the foreign key requirements for meditation_tracks.source_language_code
-- and meditation_track_translations.language_code

INSERT INTO public.languages (code, native_name, is_active)
VALUES
    ('th', 'ภาษาไทย', true),
    ('en', 'English', true)
ON CONFLICT (code) DO UPDATE
SET
    native_name = EXCLUDED.native_name,
    is_active = EXCLUDED.is_active;
