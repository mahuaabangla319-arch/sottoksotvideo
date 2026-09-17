ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS user_coins_select_all ON public.user_coins;
CREATE POLICY user_coins_select_own ON public.user_coins FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE SELECT ON public.user_coins FROM anon;