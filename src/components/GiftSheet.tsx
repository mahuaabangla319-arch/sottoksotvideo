import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { GIFTS, fetchMyCoins, sendGift, type Gift } from "@/lib/gifts";

export function GiftSheet({
  videoId,
  open,
  onClose,
}: {
  videoId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number | null>(null);
  const [sendingKey, setSendingKey] = useState<string | null>(null);

  const demo = videoId.startsWith("demo-");

  useEffect(() => {
    if (!open || !user || demo) return;
    let alive = true;
    fetchMyCoins(user.id)
      .then((c) => {
        if (alive) setCoins(c);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open, user, demo]);

  if (!open) return null;

  async function gift(g: Gift) {
    if (!user) {
      toast.error("গিফট পাঠাতে লগইন করুন");
      return;
    }
    if (demo) {
      toast.error("ডেমো ভিডিওতে গিফট দেওয়া যাবে না");
      return;
    }
    if (coins !== null && coins < g.cost) {
      toast.error("কয়েন যথেষ্ট নেই — রিচার্জ করুন");
      return;
    }
    setSendingKey(g.key);
    try {
      const left = await sendGift(videoId, g.key, g.cost);
      if (left < 0) {
        toast.error("কয়েন যথেষ্ট নেই — রিচার্জ করুন");
      } else {
        setCoins(left);
        toast.success(`${g.emoji} ${g.name} পাঠানো হয়েছে! বাকি কয়েন: ${left}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("cannot_gift_own_video")) toast.error("নিজের ভিডিওতে গিফট দেওয়া যায় না");
      else if (msg.includes("not_authenticated")) toast.error("গিফট পাঠাতে লগইন করুন");
      else toast.error("গিফট পাঠানো যায়নি");
    } finally {
      setSendingKey(null);
    }
  }

  const lowCoins = coins !== null && coins < GIFTS[0].cost;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex max-h-[70vh] w-full max-w-[420px] flex-col rounded-t-[24px] border border-white/10 bg-neutral-950 text-white"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[15px] font-semibold">উপহার পাঠান</span>
          <span className="text-[13px] font-semibold text-gold">🪙 {coins ?? "—"}</span>
          <button onClick={onClose} aria-label="বন্ধ করুন">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 px-4 py-2">
          {GIFTS.map((g) => {
            const canAfford = coins === null || coins >= g.cost;
            return (
              <div
                key={g.key}
                className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-2"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-[11px] text-white/80">{g.name}</span>
                <span className={`text-[11px] font-semibold ${canAfford ? "text-gold" : "text-red-400"}`}>
                  🪙 {g.cost}
                </span>
                <button
                  onClick={() => void gift(g)}
                  disabled={sendingKey === g.key || !canAfford}
                  className="w-full rounded-full bg-brand py-1 text-[11px] font-semibold text-white disabled:opacity-40"
                >
                  {sendingKey === g.key ? "…" : "পাঠান"}
                </button>
              </div>
            );
          })}
        </div>

        {lowCoins && (
          <div className="mx-4 my-3 rounded-2xl border border-gold/30 bg-gold/10 p-3">
            <p className="text-[13px] font-semibold text-gold">কয়েন কম পড়েছে!</p>
            <p className="mt-0.5 text-[11px] text-white/60">
              ভিডিও পোস্ট করলেই দিনে ৫০ কয়েন পাবেন। পেমেন্ট দিয়ে রিচার্জ শীঘ্রই আসছে।
            </p>
            <Link
              to="/create"
              className="mt-2 inline-flex rounded-full bg-gold px-4 py-1.5 text-[12px] font-semibold text-black"
            >
              রিচার্জ করুন
            </Link>
          </div>
        )}

        <p className="px-4 pb-4 pt-1 text-center text-[11px] text-white/40">
          গিফট পাঠালে কয়েন ওয়ালেট থেকে কাটা হবে এবং ক্রিয়েটরের ওয়ালেটে যোগ হবে।
        </p>
      </div>
    </div>
  );
}
