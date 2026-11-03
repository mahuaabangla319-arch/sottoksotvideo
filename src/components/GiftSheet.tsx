import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Gift as GiftIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { GIFTS, sendGift, type Gift } from "@/lib/gifts";

/** Gift panel — pick a gift, tap Send; coins are spent from the wallet. */
export function GiftSheet({
  videoId,
  open,
  onClose,
  onSent,
}: {
  videoId: string;
  open: boolean;
  onClose: () => void;
  onSent: (gift: Gift) => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Gift>(GIFTS[0]);
  const [sending, setSending] = useState(false);

  const { data: coins = 0 } = useQuery({
    queryKey: ["coins", user?.id],
    enabled: !!user && open,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("coins").eq("id", user!.id).maybeSingle();
      return data?.coins ?? 0;
    },
  });

  if (!open) return null;

  const send = async () => {
    if (!user) {
      toast.error("গিফট পাঠাতে লগইন করুন");
      return;
    }
    if (videoId.startsWith("demo-")) {
      toast.error("ডেমো ভিডিওতে গিফট পাঠানো যাবে না");
      return;
    }
    if (coins < selected.price) {
      toast.error(`${selected.price} কয়েন দরকার — আপনার আছে ${coins} কয়েন`);
      return;
    }
    setSending(true);
    const res = await sendGift(videoId, selected.key);
    setSending(false);
    if (res === "ok") {
      void qc.invalidateQueries({ queryKey: ["coins", user.id] });
      onSent(selected);
      onClose();
    } else if (res === "insufficient") toast.error(`${selected.price} কয়েন দরকার — আপনার আছে ${coins} কয়েন`);
    else if (res === "self") toast.error("নিজের ভিডিওতে গিফট পাঠানো যাবে না");
    else toast.error("গিফট পাঠানো যায়নি, আবার চেষ্টা করুন");
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-[70] mx-auto max-h-[62%] w-full max-w-[420px] overflow-hidden rounded-t-[24px] border-t border-white/10 bg-neutral-950/95 backdrop-blur">
      <button onClick={onClose} aria-label="বন্ধ করুন" className="absolute right-3 top-3 rounded-full bg-white/10 p-1.5">
        <X className="h-4 w-4 text-white" />
      </button>

      <div className="grid grid-cols-4 gap-px overflow-y-auto bg-white/5 px-3 py-4">
        {GIFTS.map((g) => {
          const active = selected.key === g.key;
          const afford = coins >= g.price;
          return (
            <button
              key={g.key}
              onClick={() => setSelected(g)}
              className={`flex flex-col items-center gap-1 rounded-2xl bg-neutral-950 px-1 py-3 ${
                active ? "ring-2 ring-pink" : "ring-1 ring-transparent"
              }`}
            >
              <span className={`text-[34px] leading-none ${afford ? "" : "opacity-40"}`}>{g.emoji}</span>
              <span className="text-[12px] font-medium text-white">{g.name}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-gold">
                <Coins className="h-3 w-3" /> {g.price}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[13px] font-semibold text-gold">
          <Coins className="h-4 w-4" /> {coins}
        </span>
        <button
          onClick={() => void send()}
          disabled={sending}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink to-flame py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
        >
          <Gift className="h-4 w-4" /> {sending ? "পাঠানো হচ্ছে…" : "Send"}
        </button>
      </div>
    </div>
  );
}
