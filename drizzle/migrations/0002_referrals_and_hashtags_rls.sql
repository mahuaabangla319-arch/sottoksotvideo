ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid;

CREATE OR REPLACE FUNCTION public.claim_referral(_sot_id text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _ref uuid; _already uuid;
BEGIN
  IF _uid IS NULL THEN RETURN 'unauthenticated'; END IF;
  SELECT referred_by INTO _already FROM profiles WHERE id = _uid FOR UPDATE;
  IF _already IS NOT NULL THEN RETURN 'already'; END IF;
  SELECT id INTO _ref FROM profiles WHERE sottok_id = trim(_sot_id);
  IF _ref IS NULL THEN RETURN 'invalid'; END IF;
  IF _ref = _uid THEN RETURN 'self'; END IF;
  UPDATE profiles SET referred_by = _ref WHERE id = _uid;
  UPDATE profiles SET coins = coins + 40 WHERE id = _ref;
  INSERT INTO coin_transactions(user_id, amount, reason) VALUES (_ref, 40, 'referral');
  RETURN 'ok';
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_referral(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;

ALTER TABLE public.contest_hashtags ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.contest_hashtags TO anon, authenticated;
GRANT ALL ON public.contest_hashtags TO service_role;
CREATE POLICY contest_hashtags_read ON public.contest_hashtags FOR SELECT USING (true);
CREATE POLICY contest_hashtags_admin ON public.contest_hashtags FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));