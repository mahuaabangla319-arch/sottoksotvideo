ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';
CREATE INDEX IF NOT EXISTS videos_category_feed_idx ON public.videos(category, is_pinned DESC, created_at DESC) WHERE visibility = 'public' AND NOT is_deleted AND NOT admin_hidden;
CREATE OR REPLACE FUNCTION public.daily_creator_ranking()
RETURNS TABLE(sottok_id text, username text, video_count bigint, total_views bigint, total_likes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
SELECT p.sottok_id, p.username, count(v.id), coalesce(sum(v.views),0)::bigint, coalesce(sum(v.likes),0)::bigint
FROM public.videos v JOIN public.profiles p ON p.id = v.user_id
WHERE v.created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'
AND v.visibility = 'public' AND NOT v.is_deleted AND NOT v.admin_hidden AND NOT p.is_blocked AND NOT p.is_hidden
GROUP BY p.id, p.sottok_id, p.username
ORDER BY coalesce(sum(v.likes),0) DESC, coalesce(sum(v.views),0) DESC, p.sottok_id ASC LIMIT 20;
$$;
REVOKE ALL ON FUNCTION public.daily_creator_ranking() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.daily_creator_ranking() TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.can_read_song_object(object_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.songs s WHERE NOT s.is_hidden AND (s.audio_url = object_name OR s.cover_url = object_name OR split_part(s.audio_url, '?', 1) LIKE '%/songs/' || object_name OR split_part(coalesce(s.cover_url,''), '?', 1) LIKE '%/songs/' || object_name)); $$;
REVOKE ALL ON FUNCTION public.can_read_song_object(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_song_object(text) TO anon, authenticated, service_role;
DROP POLICY IF EXISTS songs_bucket_read ON storage.objects;
CREATE POLICY songs_published_read ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'songs' AND public.can_read_song_object(name));
CREATE POLICY songs_owner_or_admin_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'songs' AND (owner_id = (SELECT auth.uid()::text) OR public.is_admin((SELECT auth.uid()))));