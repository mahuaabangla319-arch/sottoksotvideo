import { useQuery } from "@tanstack/react-query";
import { Coins, Wallet } from "lucide-react";
import { DAILY_COIN_LIMIT, coinHistory, earnedToday } from "@/lib/coins";
import { timeAgo } from "@/lib/engagement";

export function WalletCard({ userId, coins }: { userId: string | null; coins: number }) {
  const { data: today = 0 } = useQuery({
    queryKey: ["coins-today", userId],
    enabled: !!userId,
    queryFn: () => earnedToday(userId!),
  });

  const { data: history = [] } = useQuery({
    queryKey: ["coins-history", userId],
    enabled: !!userId,
    queryFn: () => coinHistory(userId!, 5),
  });

  const pct = Math.min(100, (today / DAILY_COIN_LIMIT) * 100);

  return (
    <section className="mt-4 w-full rounded-2xl border border-gold/25 bg-gradient-to-b from-gold/15 to-white/5 p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-white">
          <Wallet className="h-4 w-4 text-gold" /> আমার ওয়ালেট
        </span>
        <span className="inline-flex items-center gap-1 text-[20px] font-bold text-gold">
          <Coins className="h-5 w-5" /> {coins}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-white/60">
        প্রতিটি ভিডিও পোস্টে {DAILY_COIN_LIMIT} কয়েন — ২৪ ঘণ্টায় সর্বোচ্চ {DAILY_COIN_LIMIT} কয়েন।
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-white/50">
        আজ পাওয়া: {today}/{DAILY_COIN_LIMIT} কয়েন
        {today >= DAILY_COIN_LIMIT ? " — আজকের সীমা শেষ, ২৪ ঘণ্টা পর আবার পাবেন।" : ""}
      </p>

      {history.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {history.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-[12px]">
              <span className="text-white/70">ভিডিও পোস্ট • {timeAgo(t.created_at)}</span>
              <span className="font-semibold text-gold">+{t.amount}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
