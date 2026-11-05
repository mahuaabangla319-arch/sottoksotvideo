
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('ST' || lpad((floor(random()*1000000))::int::text, 6, '0')),
  kind text NOT NULL CHECK (kind IN ('group','audio')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 60),
  description text NOT NULL DEFAULT '',
  cover_url text,
  owner_id uuid NOT NULL,
  member_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms readable" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "create own room" ON public.rooms FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner updates room" ON public.rooms FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner deletes room" ON public.rooms FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX idx_rooms_kind_created ON public.rooms(kind, created_at DESC);

CREATE TABLE public.room_members (
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','moderator','member')),
  seat integer CHECK (seat BETWEEN 1 AND 8),
  muted boolean NOT NULL DEFAULT true,
  force_muted boolean NOT NULL DEFAULT false,
  banned boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
CREATE UNIQUE INDEX uniq_room_seat ON public.room_members(room_id, seat) WHERE seat IS NOT NULL;
GRANT SELECT ON public.room_members TO authenticated;
GRANT ALL ON public.room_members TO service_role;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members readable" ON public.room_members FOR SELECT TO authenticated USING (true);

CREATE TABLE public.room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('text','sticker','gift','system')),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_room_messages_room ON public.room_messages(room_id, created_at DESC);
GRANT SELECT, INSERT ON public.room_messages TO authenticated;
GRANT ALL ON public.room_messages TO service_role;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages readable" ON public.room_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "members send messages" ON public.room_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND kind IN ('text','sticker') AND EXISTS (
    SELECT 1 FROM public.room_members m WHERE m.room_id = room_messages.room_id AND m.user_id = auth.uid() AND NOT m.banned));

-- owner auto-membership + counts
CREATE OR REPLACE FUNCTION public.room_after_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO room_members(room_id, user_id, role, seat) VALUES (NEW.id, NEW.owner_id, 'owner', CASE WHEN NEW.kind='audio' THEN 1 END);
  RETURN NEW;
END $$;
CREATE TRIGGER trg_room_after_insert AFTER INSERT ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.room_after_insert();

CREATE OR REPLACE FUNCTION public.sync_room_member_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _r uuid := COALESCE(NEW.room_id, OLD.room_id);
BEGIN
  UPDATE rooms SET member_count = (SELECT count(*) FROM room_members WHERE room_id = _r AND NOT banned) WHERE id = _r;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_room_member_count AFTER INSERT OR DELETE OR UPDATE OF banned ON public.room_members FOR EACH ROW EXECUTE FUNCTION public.sync_room_member_count();

CREATE OR REPLACE FUNCTION public.room_role(_room uuid, _uid uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM room_members WHERE room_id = _room AND user_id = _uid AND NOT banned
$$;

CREATE OR REPLACE FUNCTION public.join_room(_room uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _m room_members;
BEGIN
  IF _uid IS NULL THEN RETURN 'unauthenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM rooms WHERE id = _room AND is_active) THEN RETURN 'no_room'; END IF;
  SELECT * INTO _m FROM room_members WHERE room_id = _room AND user_id = _uid;
  IF FOUND THEN
    IF _m.banned THEN RETURN 'banned'; END IF;
    RETURN 'ok';
  END IF;
  INSERT INTO room_members(room_id, user_id) VALUES (_room, _uid);
  INSERT INTO room_messages(room_id, user_id, kind, content) VALUES (_room, _uid, 'system', 'joined');
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.leave_room(_room uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM room_members WHERE room_id=_room AND user_id=_uid AND role <> 'owner' AND NOT banned) THEN
    DELETE FROM room_members WHERE room_id=_room AND user_id=_uid;
    INSERT INTO room_messages(room_id, user_id, kind, content) VALUES (_room, _uid, 'system', 'left');
  ELSE
    UPDATE room_members SET seat = CASE WHEN role='owner' THEN seat ELSE NULL END, muted = true WHERE room_id=_room AND user_id=_uid;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.take_seat(_room uuid, _seat integer) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _seat < 1 OR _seat > 8 THEN RETURN 'invalid'; END IF;
  IF public.room_role(_room, _uid) IS NULL THEN RETURN 'not_member'; END IF;
  IF EXISTS (SELECT 1 FROM room_members WHERE room_id=_room AND seat=_seat) THEN RETURN 'taken'; END IF;
  UPDATE room_members SET seat=_seat WHERE room_id=_room AND user_id=_uid;
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.leave_seat(_room uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE room_members SET seat=NULL, muted=true WHERE room_id=_room AND user_id=auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.set_my_mute(_room uuid, _muted boolean) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT _muted AND EXISTS (SELECT 1 FROM room_members WHERE room_id=_room AND user_id=auth.uid() AND force_muted) THEN RETURN 'force_muted'; END IF;
  UPDATE room_members SET muted=_muted WHERE room_id=_room AND user_id=auth.uid();
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.moderate_room(_room uuid, _target uuid, _action text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me text := public.room_role(_room, auth.uid()); _them text := public.room_role(_room, _target); _free int;
BEGIN
  IF _me NOT IN ('owner','moderator') OR _me IS NULL THEN RETURN 'forbidden'; END IF;
  IF _them IS NULL THEN RETURN 'not_member'; END IF;
  IF _them = 'owner' OR (_them = 'moderator' AND _me <> 'owner') THEN RETURN 'forbidden'; END IF;
  IF _action = 'mute' THEN UPDATE room_members SET muted=true, force_muted=true WHERE room_id=_room AND user_id=_target;
  ELSIF _action = 'unmute' THEN UPDATE room_members SET force_muted=false WHERE room_id=_room AND user_id=_target;
  ELSIF _action = 'unseat' THEN UPDATE room_members SET seat=NULL, muted=true WHERE room_id=_room AND user_id=_target;
  ELSIF _action = 'invite' THEN
    SELECT s INTO _free FROM generate_series(1,8) s WHERE NOT EXISTS (SELECT 1 FROM room_members WHERE room_id=_room AND seat=s) ORDER BY s LIMIT 1;
    IF _free IS NULL THEN RETURN 'full'; END IF;
    UPDATE room_members SET seat=_free WHERE room_id=_room AND user_id=_target AND seat IS NULL;
  ELSIF _action = 'kick' THEN
    UPDATE room_members SET banned=true, seat=NULL, muted=true WHERE room_id=_room AND user_id=_target;
    INSERT INTO room_messages(room_id, user_id, kind, content) VALUES (_room, _target, 'system', 'removed');
  ELSIF _action = 'make_mod' AND _me = 'owner' THEN UPDATE room_members SET role='moderator' WHERE room_id=_room AND user_id=_target;
  ELSIF _action = 'remove_mod' AND _me = 'owner' THEN UPDATE room_members SET role='member' WHERE room_id=_room AND user_id=_target;
  ELSE RETURN 'invalid'; END IF;
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.send_room_gift(_room uuid, _to uuid, _gift text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _price int; _bal int;
BEGIN
  IF _uid IS NULL THEN RETURN 'unauthenticated'; END IF;
  IF _uid = _to THEN RETURN 'self'; END IF;
  _price := CASE _gift WHEN 'rose' THEN 1 WHEN 'tiktokstar' THEN 5 WHEN 'heart' THEN 10 WHEN 'diamond' THEN 50
    WHEN 'crown' THEN 100 WHEN 'rocket' THEN 200 WHEN 'lovecar' THEN 500 WHEN 'universe' THEN 1000 END;
  IF _price IS NULL THEN RETURN 'invalid'; END IF;
  IF public.room_role(_room, _uid) IS NULL OR public.room_role(_room, _to) IS NULL THEN RETURN 'not_member'; END IF;
  SELECT coins INTO _bal FROM profiles WHERE id = _uid FOR UPDATE;
  IF COALESCE(_bal,0) < _price THEN RETURN 'insufficient'; END IF;
  UPDATE profiles SET coins = coins - _price WHERE id = _uid;
  UPDATE profiles SET coins = coins + _price WHERE id = _to;
  INSERT INTO coin_transactions(user_id, amount, reason) VALUES (_uid, -_price, 'room_gift_sent:' || _gift), (_to, _price, 'room_gift_received:' || _gift);
  INSERT INTO gifts(from_user, to_user, gift_type, gift_value) VALUES (_uid, _to, _gift, _price);
  INSERT INTO room_messages(room_id, user_id, kind, content) VALUES (_room, _uid, 'gift', _gift || ':' || _to::text);
  RETURN 'ok';
END $$;

REVOKE EXECUTE ON FUNCTION public.join_room(uuid), public.leave_room(uuid), public.take_seat(uuid,integer), public.leave_seat(uuid), public.set_my_mute(uuid,boolean), public.moderate_room(uuid,uuid,text), public.send_room_gift(uuid,uuid,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.join_room(uuid), public.leave_room(uuid), public.take_seat(uuid,integer), public.leave_seat(uuid), public.set_my_mute(uuid,boolean), public.moderate_room(uuid,uuid,text), public.send_room_gift(uuid,uuid,text) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;

-- Secure legacy live room tables
ALTER TABLE public.live_room_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants readable" ON public.live_room_participants FOR SELECT USING (true);
CREATE POLICY "join self" ON public.live_room_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update self or host" ON public.live_room_participants FOR UPDATE TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.live_rooms r WHERE r.room_id = live_room_participants.room_id AND r.host_id = auth.uid()));
CREATE POLICY "leave self or host" ON public.live_room_participants FOR DELETE TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.live_rooms r WHERE r.room_id = live_room_participants.room_id AND r.host_id = auth.uid()));
ALTER TABLE public.live_room_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests visible to requester or host" ON public.live_room_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.live_rooms r WHERE r.room_id = live_room_requests.room_id AND r.host_id = auth.uid()));
CREATE POLICY "request self" ON public.live_room_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "host decides" ON public.live_room_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.live_rooms r WHERE r.room_id = live_room_requests.room_id AND r.host_id = auth.uid()));
ALTER TABLE public.live_room_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live gifts readable" ON public.live_room_gifts FOR SELECT USING (true);
