-- যা আছে তাই থাকবে, শুধু গিফট + রিচার্জ যোগ হবে

-- 1. গিফট আইটেম
CREATE TABLE IF NOT EXISTS public.gift_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  coin_price int NOT NULL
);
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gift_items_all ON public.gift_items;
CREATE POLICY gift_items_all ON public.gift_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.gift_items (name, icon, coin_price) VALUES
('Free','✨',0), ('Rose','🌹',10), ('Heart','💖',50), ('Crown','👑',100),
('Elephant','🐘',500), ('Diamond','💎',1000), ('Lion','🦁',2000),
('Rocket','🚀',3000), ('Car','🚗',5000), ('Super Trophy','🏆',10000)
ON CONFLICT (name) DO NOTHING;

-- 2. গিফট করলে কয়েন কাটবে
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

-- 3. রিচার্জ সিস্টেম - PhonePe, GPay, PayTM
CREATE TABLE IF NOT EXISTS public.recharge_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_inr int NOT NULL,
  coins_to_add int NOT NULL,
  method text NOT NULL DEFAULT 'UPI',
  upi_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.recharge_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recharge_all ON public.recharge_orders;
CREATE POLICY recharge_all ON public.recharge_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. কয়েন কাটা + যোগ করার ফাংশন
CREATE OR REPLACE FUNCTION public.send_gift(p_recipient uuid, p_video uuid, p_gift_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_gift gift_items%ROWTYPE; v_sender uuid := auth.uid(); v_coins int;
BEGIN
  IF v_sender IS NULL THEN RETURN jsonb_build_object('error','login required'); END IF;
  SELECT * INTO v_gift FROM gift_items WHERE name = p_gift_name;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','gift not found'); END IF;
  SELECT coins INTO v_coins FROM profiles WHERE id = v_sender;
  IF v_coins < v_gift.coin_price THEN RETURN jsonb_build_object('error','Not enough coins'); END IF;
  UPDATE profiles SET coins = coins - v_gift.coin_price WHERE id = v_sender;
  UPDATE profiles SET coins = coins + v_gift.coin_price WHERE id = p_recipient;
  INSERT INTO gift_transactions(sender_id, recipient_id, video_id, gift_item_id, coin_amount)
  VALUES (v_sender, p_recipient, p_video, v_gift.id, v_gift.coin_price);
  RETURN jsonb_build_object('success', true, 'deducted', v_gift.coin_price);
END; $$;