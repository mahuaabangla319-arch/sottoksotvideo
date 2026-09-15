ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid REFERENCES public.videos(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  reason text NOT NULL DEFAULT 'video_post',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coin_transactions TO authenticated;
GRANT ALL ON public.coin_transactions TO service_role;

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own coin transactions" ON public.coin_transactions;
CREATE POLICY "Users can view own coin transactions"
  ON public.coin_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS coin_transactions_video_unique
  ON public.coin_transactions(video_id) WHERE video_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS coin_transactions_user_created
  ON public.coin_transactions(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.award_video_coins(_video_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _earned integer;
  _award integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.videos v WHERE v.id = _video_id AND v.user_id = _uid) THEN
    RETURN 0;
  END IF;
  IF EXISTS (SELECT 1 FROM public.coin_transactions t WHERE t.video_id = _video_id) THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO _earned
  FROM public.coin_transactions
  WHERE user_id = _uid AND created_at > now() - interval '24 hours';

  _award := LEAST(50, GREATEST(0, 50 - _earned));
  IF _award <= 0 THEN
    RETURN 0;
  END IF;

  INSERT INTO public.coin_transactions (user_id, video_id, amount, reason)
  VALUES (_uid, _video_id, _award, 'video_post');

  UPDATE public.profiles SET coins = coins + _award WHERE id = _uid;
  RETURN _award;
END;
$$;

REVOKE ALL ON FUNCTION public.award_video_coins(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.award_video_coins(uuid) TO authenticated;