-- পুরোনো সব থাকবে, শুধু কয়েন + গিফট যোগ হবে - ডিলিট হবে না

CREATE TABLE IF NOT EXISTS public.gift_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  coin_price int NOT NULL
);
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gift_public ON public.gift_items;
CREATE POLICY gift_public ON public.gift_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- আপনার ওয়ালেটের 10 টা গিফট
INSERT INTO public.gift_items (name, icon, coin_price) VALUES
('Free','✨',0), ('Rose','🌹',10), ('Heart','💖',50), ('Crown','👑',100),
('Elephant','🐘',500), ('Diamond','💎',1000), ('Lion','🦁',2000),
('Rocket','🚀',3000), ('Car','🚗',5000), ('Super Trophy','🏆',10000)
ON CONFLICT (name) DO NOTHING;

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
DROP POLICY IF EXISTS gift_tx ON public.gift_transactions;
CREATE POLICY gift_tx ON public.gift_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);