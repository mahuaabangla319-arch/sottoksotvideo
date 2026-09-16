-- 1. videos: visibility + soft delete
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS videos_public_read ON public.videos;
CREATE POLICY videos_public_read ON public.videos
  FOR SELECT USING ((visibility = 'public' AND is_deleted = false) OR auth.uid() = user_id);

DROP POLICY IF EXISTS videos_update_own ON public.videos;
CREATE POLICY videos_update_own ON public.videos
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS videos_delete_own ON public.videos;
CREATE POLICY videos_delete_own ON public.videos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_videos_visible ON public.videos(created_at DESC) WHERE visibility = 'public' AND is_deleted = false;

-- 2. user_coins
CREATE TABLE IF NOT EXISTS public.user_coins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_coins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_coins TO authenticated;
GRANT ALL ON public.user_coins TO service_role;
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_coins_select_all ON public.user_coins;
CREATE POLICY user_coins_select_all ON public.user_coins FOR SELECT USING (true);
DROP POLICY IF EXISTS user_coins_insert_own ON public.user_coins;
CREATE POLICY user_coins_insert_own ON public.user_coins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS user_coins_update_own ON public.user_coins;
CREATE POLICY user_coins_update_own ON public.user_coins FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS user_coins_delete_own ON public.user_coins;
CREATE POLICY user_coins_delete_own ON public.user_coins FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS user_coins_updated_at ON public.user_coins;
CREATE TRIGGER user_coins_updated_at BEFORE UPDATE ON public.user_coins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. user_rings (owned rings)
CREATE TABLE IF NOT EXISTS public.user_rings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ring_key text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ring_key)
);
GRANT SELECT ON public.user_rings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_rings TO authenticated;
GRANT ALL ON public.user_rings TO service_role;
ALTER TABLE public.user_rings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_rings_select_all ON public.user_rings;
CREATE POLICY user_rings_select_all ON public.user_rings FOR SELECT USING (true);
DROP POLICY IF EXISTS user_rings_insert_own ON public.user_rings;
CREATE POLICY user_rings_insert_own ON public.user_rings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS user_rings_update_own ON public.user_rings;
CREATE POLICY user_rings_update_own ON public.user_rings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS user_rings_delete_own ON public.user_rings;
CREATE POLICY user_rings_delete_own ON public.user_rings FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS user_rings_updated_at ON public.user_rings;
CREATE TRIGGER user_rings_updated_at BEFORE UPDATE ON public.user_rings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. profile_rings (equipped ring)
CREATE TABLE IF NOT EXISTS public.profile_rings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ring_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile_rings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_rings TO authenticated;
GRANT ALL ON public.profile_rings TO service_role;
ALTER TABLE public.profile_rings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profile_rings_select_all ON public.profile_rings;
CREATE POLICY profile_rings_select_all ON public.profile_rings FOR SELECT USING (true);
DROP POLICY IF EXISTS profile_rings_insert_own ON public.profile_rings;
CREATE POLICY profile_rings_insert_own ON public.profile_rings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS profile_rings_update_own ON public.profile_rings;
CREATE POLICY profile_rings_update_own ON public.profile_rings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS profile_rings_delete_own ON public.profile_rings;
CREATE POLICY profile_rings_delete_own ON public.profile_rings FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS profile_rings_updated_at ON public.profile_rings;
CREATE TRIGGER profile_rings_updated_at BEFORE UPDATE ON public.profile_rings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. video_reports
CREATE TABLE IF NOT EXISTS public.video_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT 'other',
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.video_reports TO authenticated;
GRANT ALL ON public.video_reports TO service_role;
ALTER TABLE public.video_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS video_reports_insert_any_auth ON public.video_reports;
CREATE POLICY video_reports_insert_any_auth ON public.video_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS video_reports_select_own ON public.video_reports;
CREATE POLICY video_reports_select_own ON public.video_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_video ON public.video_reports(video_id);
DROP TRIGGER IF EXISTS video_reports_updated_at ON public.video_reports;
CREATE TRIGGER video_reports_updated_at BEFORE UPDATE ON public.video_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();