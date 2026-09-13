ALTER TABLE public.profiles ALTER COLUMN location SET DEFAULT 'ভারত';
UPDATE public.profiles SET location = 'ভারত' WHERE location = 'বাংলাদেশ' OR location = '';

CREATE INDEX IF NOT EXISTS videos_created_at_idx ON public.videos (created_at DESC);
CREATE INDEX IF NOT EXISTS videos_user_created_idx ON public.videos (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (lower(username));
CREATE INDEX IF NOT EXISTS profiles_followers_idx ON public.profiles (followers_count DESC);
CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows (following_id);