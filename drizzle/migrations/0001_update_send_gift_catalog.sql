DROP FUNCTION IF EXISTS public.send_gift(uuid, text);
DROP FUNCTION IF EXISTS public.send_gift(uuid, text, integer);

CREATE FUNCTION public.send_gift(_video_id uuid, _gift_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _owner uuid; _value integer; _bal integer;
BEGIN
  IF _uid IS NULL THEN RETURN 'unauthenticated'; END IF;
  _value := CASE _gift_type
    WHEN 'rose' THEN 1
    WHEN 'tiktokstar' THEN 5
    WHEN 'heart' THEN 10
    WHEN 'diamond' THEN 50
    WHEN 'crown' THEN 100
    WHEN 'rocket' THEN 200
    WHEN 'lovecar' THEN 500
    WHEN 'universe' THEN 1000
    WHEN 'ganesh' THEN 260
    ELSE NULL END;
  IF _value IS NULL THEN RETURN 'invalid'; END IF;
  SELECT user_id INTO _owner FROM videos WHERE id = _video_id AND NOT is_deleted;
  IF _owner IS NULL THEN RETURN 'no_video'; END IF;
  IF _owner = _uid THEN RETURN 'self'; END IF;
  SELECT coins INTO _bal FROM profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL OR _bal < _value THEN RETURN 'insufficient'; END IF;
  UPDATE profiles SET coins = coins - _value WHERE id = _uid;
  UPDATE profiles SET coins = coins + _value WHERE id = _owner;
  UPDATE videos SET gifts_count = gifts_count + 1 WHERE id = _video_id;
  INSERT INTO gifts(from_user, to_user, video_id, gift_type, gift_value) VALUES (_uid, _owner, _video_id, _gift_type, _value);
  INSERT INTO notifications(user_id, actor_id, type, video_id, body) VALUES (_owner, _uid, 'gift', _video_id, _gift_type);
  RETURN 'ok';
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.send_gift(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.send_gift(uuid, text) TO authenticated;

-- keep gifts readable by owner and sender for future history views
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gifts' AND policyname='gifts_select_own') THEN
    CREATE POLICY gifts_select_own ON public.gifts FOR SELECT
    TO authenticated
    USING (from_user = auth.uid() OR to_user = auth.uid());
  END IF;
END $$;

GRANT SELECT ON public.gifts TO authenticated;
GRANT ALL ON public.gifts TO service_role;