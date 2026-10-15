-- ===============================
-- 1. NOTIFICATIONS + MESSAGES (আপনার নতুনটা - থাকবেই)
-- ===============================
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

-- ===============================
-- 2. GIFT ITEMS - নতুন পুরো গিফট সিস্টেম
-- ===============================
CREATE TABLE IF NOT EXISTS public.gift_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  coin_price int NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  video_id uuid,
  gift_item_id uuid REFERENCES public.gift_items(id),
  coin_amount int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gift_items_public ON public.gift_items;
CREATE POLICY gift_items_public ON public.gift_items FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS gift_tx_select ON public.gift_transactions;
CREATE POLICY gift_tx_select ON public.gift_transactions FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS gift_tx_insert ON public.gift_transactions;
CREATE POLICY gift_tx_insert ON public.gift_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ডিফল্ট গিফট আইটেম গুলো Add করবে (যদি না থাকে)
INSERT INTO public.gift_items (name, image_url, coin_price) VALUES
('Rose', '🌹', 10),
('Heart', '❤️', 50),
('Diamond', '💎', 100),
('Rocket', '🚀', 500)
ON CONFLICT DO NOTHING;

-- ===============================
-- 3. NOTIFICATION TRIGGER - সব কিছুর জন্য
-- ===============================
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
  ELSIF TG_TABLE_NAME = 'gift_transactions' THEN
    INSERT INTO notifications(user_id, actor_id, type, body) VALUES (NEW.recipient_id, NEW.sender_id, 'gift', 'Sent a gift worth ' || NEW.coin_amount || ' coins');
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
DROP TRIGGER IF EXISTS notify_gift ON public.gift_transactions;
CREATE TRIGGER notify_gift AFTER INSERT ON public.gift_transactions FOR EACH ROW EXECUTE FUNCTION public.notify_event();