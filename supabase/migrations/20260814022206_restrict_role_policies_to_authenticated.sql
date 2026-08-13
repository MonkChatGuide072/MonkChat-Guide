-- Restrict all role-based policies to authenticated users to prevent anon access errors

ALTER POLICY "Profiles insert" ON public.profiles TO authenticated;
ALTER POLICY "Profiles update" ON public.profiles TO authenticated;
ALTER POLICY "Profiles delete" ON public.profiles TO authenticated;

ALTER POLICY "Languages owner insert" ON public.languages TO authenticated;
ALTER POLICY "Languages owner update" ON public.languages TO authenticated;
ALTER POLICY "Languages owner delete" ON public.languages TO authenticated;

ALTER POLICY "Meditation tracks team view" ON public.meditation_tracks TO authenticated;
ALTER POLICY "Meditation tracks team insert" ON public.meditation_tracks TO authenticated;
ALTER POLICY "Meditation tracks team update" ON public.meditation_tracks TO authenticated;
ALTER POLICY "Meditation tracks owner delete" ON public.meditation_tracks TO authenticated;

ALTER POLICY "Meditation translations team view" ON public.meditation_track_translations TO authenticated;
ALTER POLICY "Meditation translations team insert" ON public.meditation_track_translations TO authenticated;
ALTER POLICY "Meditation translations team update" ON public.meditation_track_translations TO authenticated;
ALTER POLICY "Meditation translations owner delete" ON public.meditation_track_translations TO authenticated;

ALTER POLICY "QA items team view" ON public.qa_items TO authenticated;
ALTER POLICY "QA items team insert" ON public.qa_items TO authenticated;
ALTER POLICY "QA items team update" ON public.qa_items TO authenticated;
ALTER POLICY "QA items owner delete" ON public.qa_items TO authenticated;

ALTER POLICY "QA translations team view" ON public.qa_translations TO authenticated;
ALTER POLICY "QA translations team insert" ON public.qa_translations TO authenticated;
ALTER POLICY "QA translations team update" ON public.qa_translations TO authenticated;
ALTER POLICY "QA translations owner delete" ON public.qa_translations TO authenticated;

ALTER POLICY "DCI centers team view" ON public.dci_centers TO authenticated;
ALTER POLICY "DCI centers team insert" ON public.dci_centers TO authenticated;
ALTER POLICY "DCI centers team update" ON public.dci_centers TO authenticated;
ALTER POLICY "DCI centers owner delete" ON public.dci_centers TO authenticated;

ALTER POLICY "DCI center translations team view" ON public.dci_center_translations TO authenticated;
ALTER POLICY "DCI center translations team insert" ON public.dci_center_translations TO authenticated;
ALTER POLICY "DCI center translations team update" ON public.dci_center_translations TO authenticated;
ALTER POLICY "DCI center translations owner delete" ON public.dci_center_translations TO authenticated;

ALTER POLICY "Bio links team view" ON public.bio_links TO authenticated;
ALTER POLICY "Bio links team insert" ON public.bio_links TO authenticated;
ALTER POLICY "Bio links team update" ON public.bio_links TO authenticated;
ALTER POLICY "Bio links owner delete" ON public.bio_links TO authenticated;

ALTER POLICY "Bio link translations team view" ON public.bio_link_translations TO authenticated;
ALTER POLICY "Bio link translations team insert" ON public.bio_link_translations TO authenticated;
ALTER POLICY "Bio link translations team update" ON public.bio_link_translations TO authenticated;
ALTER POLICY "Bio link translations owner delete" ON public.bio_link_translations TO authenticated;

ALTER POLICY "Usage events team view" ON public.usage_events TO authenticated;
ALTER POLICY "Usage events owner delete" ON public.usage_events TO authenticated;
