
-- comments count on videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

-- LIKES
CREATE TABLE IF NOT EXISTS public.video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (video_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.video_likes TO authenticated;
GRANT SELECT ON public.video_likes TO anon;
GRANT ALL ON public.video_likes TO service_role;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON public.video_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.video_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.video_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video ON public.video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user ON public.video_likes(user_id);

-- COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.comments TO anon;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND length(btrim(content)) > 0);
CREATE POLICY "Users can edit own comment" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users or video owner can delete comment" ON public.comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.videos v WHERE v.id = comments.video_id AND v.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_comments_video_created ON public.comments(video_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- counters
CREATE OR REPLACE FUNCTION public.sync_like_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos SET likes = likes + 1 WHERE id = NEW.video_id;
    UPDATE public.profiles p SET likes_count = p.likes_count + 1
      FROM public.videos v WHERE v.id = NEW.video_id AND p.id = v.user_id;
  ELSE
    UPDATE public.videos SET likes = greatest(likes - 1, 0) WHERE id = OLD.video_id;
    UPDATE public.profiles p SET likes_count = greatest(p.likes_count - 1, 0)
      FROM public.videos v WHERE v.id = OLD.video_id AND p.id = v.user_id;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER video_likes_sync AFTER INSERT OR DELETE ON public.video_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_like_counts();

CREATE OR REPLACE FUNCTION public.sync_comment_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos SET comments_count = comments_count + 1 WHERE id = NEW.video_id;
  ELSE
    UPDATE public.videos SET comments_count = greatest(comments_count - 1, 0) WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER comments_sync AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.sync_comment_counts();

-- view counting (works for anonymous viewers too)
CREATE OR REPLACE FUNCTION public.increment_video_view(_video_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.videos SET views = views + 1 WHERE id = _video_id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_video_view(uuid) TO anon, authenticated;

-- backfill existing counts
UPDATE public.videos v SET likes = (SELECT count(*) FROM public.video_likes l WHERE l.video_id = v.id),
  comments_count = (SELECT count(*) FROM public.comments c WHERE c.video_id = v.id);
