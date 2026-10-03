DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','super_admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE POLICY roles_select_own_or_admin ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY roles_super_manage ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') AND role = 'admin')
  WITH CHECK (public.has_role(auth.uid(),'super_admin') AND role = 'admin');
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS golden_frame boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS crown_badge boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level_badge boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS admin_hidden boolean NOT NULL DEFAULT false;

-- keep sottok_id editable by admins only
CREATE OR REPLACE FUNCTION public.set_sot_id()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.sottok_id IS NULL OR NEW.sottok_id !~ '^[89][0-9]{7}$' THEN
      NEW.sottok_id := public.generate_sot_id();
    END IF;
  ELSE
    IF NOT public.is_admin(auth.uid()) THEN
      NEW.sottok_id := OLD.sottok_id;
      NEW.verified := OLD.verified;
      NEW.golden_frame := OLD.golden_frame;
      NEW.crown_badge := OLD.crown_badge;
      NEW.is_blocked := OLD.is_blocked;
      NEW.followers_count := OLD.followers_count;
      NEW.likes_count := OLD.likes_count;
      NEW.level := OLD.level;
      NEW.coins := OLD.coins;
    END IF;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END; $function$;

CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY videos_admin_select ON public.videos FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY videos_admin_update ON public.videos FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY videos_admin_delete ON public.videos FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY reports_admin_select ON public.video_reports FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY reports_admin_update ON public.video_reports FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
GRANT UPDATE ON public.video_reports TO authenticated;

CREATE TABLE public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Trending',
  audio_url text NOT NULL,
  cover_url text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  plays integer NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.songs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO authenticated;
GRANT ALL ON public.songs TO service_role;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY songs_public_read ON public.songs FOR SELECT USING (is_hidden = false OR public.is_admin(auth.uid()));
CREATE POLICY songs_admin_write ON public.songs FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.app_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  css text NOT NULL DEFAULT 'none',
  enabled boolean NOT NULL DEFAULT true,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_filters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_filters TO authenticated;
GRANT ALL ON public.app_filters TO service_role;
ALTER TABLE public.app_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY filters_read ON public.app_filters FOR SELECT USING (true);
CREATE POLICY filters_admin_write ON public.app_filters FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.app_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  app_name text NOT NULL DEFAULT 'SOT TOK',
  logo_url text,
  theme_color text NOT NULL DEFAULT '#fe2c55',
  maintenance_mode boolean NOT NULL DEFAULT false,
  announcement text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_read ON public.app_settings FOR SELECT USING (true);
CREATE POLICY settings_admin_write ON public.app_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY logs_admin_read ON public.admin_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY logs_admin_insert ON public.admin_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND admin_id = auth.uid());

CREATE POLICY songs_bucket_read ON storage.objects FOR SELECT USING (bucket_id = 'songs');
CREATE POLICY songs_bucket_admin_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'songs' AND public.is_admin(auth.uid()));
CREATE POLICY songs_bucket_admin_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'songs' AND public.is_admin(auth.uid()));
CREATE POLICY videos_bucket_admin_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'videos' AND public.is_admin(auth.uid()));