import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

      {userId && <ReferralBox userId={userId} />}

      {history.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {history.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-[12px]">
              <span className="text-white/70">{t.reason === "referral" ? "রেফার বোনাস" : t.reason === "gift" ? "গিফট" : "ভিডিও পোস্ট"} • {timeAgo(t.created_at)}</span>
              <span className="font-semibold text-gold">+{t.amount}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

const REFER_MSG: Record<string, string> = {
  ok: "রেফার সফল! আপনার বন্ধু ৪০ কয়েন পেয়েছেন",
  already: "আপনি আগেই একটি রেফার কোড ব্যবহার করেছেন",
  invalid: "এই SOT ID পাওয়া যায়নি",
  self: "নিজের কোড ব্যবহার করা যাবে না",
  unauthenticated: "লগইন করুন",
};

function ReferralBox({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: me } = useQuery({
    queryKey: ["refer-me", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("sottok_id, referred_by").eq("id", userId).maybeSingle();
      return data;
    },
  });
  const link = me ? `${typeof window !== "undefined" ? window.location.origin : ""}/login?ref=${me.sottok_id}` : "";

  async function share() {
    const text = `SOT TOK এ যোগ দিন! আমার রেফার কোড: ${me?.sottok_id}`;
    try {
      if (navigator.share) await navigator.share({ title: "SOT TOK", text, url: link });
      else { await navigator.clipboard.writeText(`${text} ${link}`); toast.success("রেফার লিঙ্ক কপি হয়েছে"); }
    } catch { /* cancelled */ }
  }

  async function claim() {
    if (!code.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("claim_referral", { _sot_id: code.trim() });
    setBusy(false);
    const r = error ? "error" : String(data);
    if (r === "ok") { toast.success(REFER_MSG.ok); void qc.invalidateQueries({ queryKey: ["refer-me", userId] }); }
    else toast.error(REFER_MSG[r] ?? "চেষ্টা ব্যর্থ হয়েছে");
  }

  return (
    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
      <p className="text-[12px] text-white/80">বন্ধুকে রেফার করুন — প্রতি রেফারে ৪০ কয়েন</p>
      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
        <span className="text-[13px] font-semibold text-gold">কোড: {me?.sottok_id ?? "…"}</span>
        <button onClick={share} className="rounded-full bg-gold px-3 py-1 text-[12px] font-semibold text-black">শেয়ার</button>
      </div>
      {me && !me.referred_by && (
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="বন্ধুর SOT ID লিখুন" inputMode="numeric"
            className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-[13px] text-white outline-none" />
          <button disabled={busy} onClick={claim} className="rounded-xl bg-primary px-3 text-[12px] font-semibold text-white">জমা দিন</button>
        </div>
      )}
    </div>
  );
}
