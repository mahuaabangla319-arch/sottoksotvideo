CREATE UNIQUE INDEX IF NOT EXISTS user_rings_user_ring_key ON public.user_rings(user_id, ring_key);

CREATE OR REPLACE FUNCTION public.purchase_ring(_ring_key text, _price integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _balance integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN 'unauthenticated';
  END IF;
  IF _price < 0 THEN
    RETURN 'invalid';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_rings r WHERE r.user_id = _uid AND r.ring_key = _ring_key) THEN
    RETURN 'owned';
  END IF;

  SELECT coins INTO _balance FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _balance IS NULL THEN
    RETURN 'no_profile';
  END IF;
  IF _balance < _price THEN
    RETURN 'insufficient';
  END IF;

  UPDATE public.profiles SET coins = coins - _price WHERE id = _uid;
  INSERT INTO public.user_rings (user_id, ring_key, price) VALUES (_uid, _ring_key, _price);

  INSERT INTO public.profile_rings (user_id, ring_key)
  VALUES (_uid, _ring_key)
  ON CONFLICT (user_id) DO UPDATE SET ring_key = EXCLUDED.ring_key, updated_at = now();

  RETURN 'ok';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purchase_ring(text, integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.purchase_ring(text, integer) TO authenticated;