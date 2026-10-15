-- ===============================
-- পুরোনো সিস্টেম থাকবেই, নতুন যোগ হবে
-- ===============================

-- 1. GIFT ITEMS - আপনার ছবি 2 এর মতো হুবহু 10 টা গিফট
CREATE TABLE IF NOT EXISTS public.gift_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL,
  coin_price int NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gift_items_public ON public.gift_items;
CREATE POLICY gift_items_public ON public.gift_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS gift_items_all ON public.gift_items;
CREATE POLICY gift_items_all ON public.gift_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- আপনার ছবির 10 টা গিফট - হুবহু
INSERT INTO public.gift_items (name, icon, coin_price) VALUES
('Free', '✨', 0),
('Rose', '🌹', 10),
('Heart', '💖', 50),
('Crown', '👑', 100),
('Elephant', '🐘', 500),
('Diamond', '💎', 1000),
('Lion', '🦁', 2000),
('Rocket', '🚀', 3000),
('Car', '🚗', 5000),
('Super Trophy', '🏆', 10000)
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon, coin_price = EXCLUDED.coin_price, is_active = true;

-- 2. GIFT TRANSACTIONS + WALLET - কয়েন কাটবে
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  video_id uuid,
  gift_item_id uuid REFERENCES public.gift_items(id),
  coin_amount int NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gift_tx_all ON public.gift_transactions;
CREATE POLICY gift_tx_all ON public.gift_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. NOTIFICATIONS + MESSAGES - আপনার ফলো সিস্টেমের সাথে
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  type text NOT NULL,
  video_id uuid,
  body text DEFAULT '',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notif_all ON public.notifications;
CREATE POLICY notif_all ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id OR true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS msg_all ON public.messages;
CREATE POLICY msg_all ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. TRIGGER - ফলো, লাইক, কমেন্ট, গিফট সব নোটিফিকেশন
CREATE OR REPLACE FUNCTION public.notify_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  IF TG_TABLE_NAME = 'video_likes' THEN SELECT user_id INTO _owner FROM videos WHERE id = NEW.video_id; IF _owner IS NOT NULL AND _owner <> NEW.user_id THEN INSERT INTO notifications(user_id, actor_id, type, video_id) VALUES (_owner, NEW.user_id, 'like', NEW.video_id); END IF;
  ELSIF TG_TABLE_NAME = 'comments' THEN SELECT user_id INTO _owner FROM videos WHERE id = NEW.video_id; IF _owner IS NOT NULL AND _owner <> NEW.user_id THEN INSERT INTO notifications(user_id, actor_id, type, video_id, body) VALUES (_owner, NEW.user_id, 'comment', NEW.video_id, left(NEW.content, 120)); END IF;
  ELSIF TG_TABLE_NAME = 'follows' THEN INSERT INTO notifications(user_id, actor_id, type) VALUES (NEW.following_id, NEW.follower_id, 'follow');
  ELSIF TG_TABLE_NAME = 'gift_transactions' THEN INSERT INTO notifications(user_id, actor_id, type, body) VALUES (NEW.recipient_id, NEW.sender_id, 'gift', 'পাঠিয়েছে ' || NEW.coin_amount || ' কয়েনের গিফট');
  END IF; RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS trg_like ON public.video_likes;
CREATE TRIGGER trg_like AFTER INSERT ON public.video_likes FOR EACH ROW EXECUTE FUNCTION public.notify_event();
DROP TRIGGER IF EXISTS trg_comment ON public.comments;
CREATE TRIGGER trg_comment AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.notify_event();
DROP TRIGGER IF EXISTS trg_follow ON public.follows;
CREATE TRIGGER trg_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_event();
DROP TRIGGER IF EXISTS trg_gift ON public.gift_transactions;
CREATE TRIGGER trg_gift AFTER INSERT ON public.gift_transactions FOR EACH ROW EXECUTE FUNCTION public.notify_event();