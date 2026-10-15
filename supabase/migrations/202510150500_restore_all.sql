CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  type text NOT NULL,
  video_id uuid,
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notif_select_own ON public.notifications;
CREATE POLICY notif_select_own ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS notif_update_own ON public.notifications;
CREATE POLICY notif_update_own ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS notif_delete_own ON public.notifications;
CREATE POLICY notif_delete_own ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS msg_select ON public.messages;
CREATE POLICY msg_select ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS msg_insert ON public.messages;
CREATE POLICY msg_insert ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND sender_id <> recipient_id AND length(btrim(content)) BETWEEN 1 AND 1000);
DROP POLICY IF EXISTS msg_update ON public.messages;
CREATE POLICY msg_update ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON public.messages(sender_id, recipient_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.notify_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  IF TG_TABLE_NAME = 'video_likes' THEN
    SELECT user_id INTO _owner FROM videos WHERE id = NEW.video_id;
    IF _owner IS NOT NULL AND _owner <> NEW.user_id THEN
      INSERT INTO notifications(user_id, actor_id, type, video_id) VALUES (_owner, NEW.user_id, 'like', NEW.video_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    SELECT user_id INTO _owner FROM videos WHERE id = NEW.video_id;
    IF _owner IS NOT NULL AND _owner <> NEW.user_id THEN
      INSERT INTO notifications(user_id, actor_id, type, video_id, body) VALUES (_owner, NEW.user_id, 'comment', NEW.video_id, left(NEW.content, 120));
    END IF;
  ELSIF TG_TABLE_NAME = 'follows' THEN
    INSERT INTO notifications(user_id, actor_id, type) VALUES (NEW.following_id, NEW.follower_id, 'follow');
  ELSIF TG_TABLE_NAME = 'messages' THEN
    INSERT INTO notifications(user_id, actor_id, type, body) VALUES (NEW.recipient_id, NEW.sender_id, 'message', left(NEW.content, 120));
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS notify_like ON public.video_likes;
CREATE TRIGGER notify_like AFTER INSERT ON public.video_likes FOR EACH ROW EXECUTE FUNCTION public.notify_event();
DROP TRIGGER IF EXISTS notify_comment ON public.comments;
CREATE TRIGGER notify_comment AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.notify_event();
DROP TRIGGER IF EXISTS notify_follow ON public.follows;
CREATE TRIGGER notify_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_event();
DROP TRIGGER IF EXISTS notify_message ON public.messages;
CREATE TRIGGER notify_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_event();
