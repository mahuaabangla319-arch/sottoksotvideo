DROP POLICY IF EXISTS user_rings_select_all ON public.user_rings;
CREATE POLICY user_rings_select_auth ON public.user_rings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS videos_storage_read ON storage.objects;
CREATE POLICY videos_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'videos');

DROP POLICY IF EXISTS avatars_read ON storage.objects;
CREATE POLICY avatars_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');