CREATE TABLE public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL,
  to_user uuid NOT NULL,
  video_id uuid REFERENCES public.videos(id) ON DELETE SET NULL,
  gift_type text NOT NULL,
  gift_value integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_gifts_video ON public.gifts(video_id);
CREATE INDEX idx_gifts_to_user ON public.gifts(to_user, created_at DESC);
GRANT SELECT ON public.gifts TO authenticated;
GRANT ALL ON public.gifts TO service_role;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gifts_own_read" ON public.gifts FOR SELECT TO authenticated
  USING (auth.uid() = from_user OR auth.uid() = to_user OR public.is_admin(auth.uid()));
ALTER TABLE public.videos ADD COLUMN gifts_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.send_gift(_video_id uuid, _gift_type text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid(); _owner uuid; _value integer; _bal integer;
BEGIN
  IF _uid IS NULL THEN RETURN 'unauthenticated'; END IF;
  _value := CASE _gift_type WHEN 'rose' THEN 10 WHEN 'heart' THEN 50 WHEN 'crown' THEN 100 WHEN 'ganesh' THEN 260 ELSE NULL END;
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
END; $$;
REVOKE EXECUTE ON FUNCTION public.send_gift(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.send_gift(uuid, text) TO authenticated;