import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const GIFTS = [
  { key: "rose", emoji: "🌹", name: "গোলাপ", value: 10 },
  { key: "heart", emoji: "💖", name: "হার্ট", value: 50 },
  { key: "crown", emoji: "👑", name: "মুকুট", value: 100 },
  { key: "ganesh", emoji: "🐘", name: "গণেশ স্পেশাল", value: 260 },
] as const;

const MESSAGES: Record<string, string> = {
  unauthenticated: "গিফট পাঠাতে লগইন করুন",
  insufficient: "পর্যাপ্ত কয়েন নেই — ভিডিও পোস্ট করে কয়েন জিতুন",
  self: "নিজের ভিডিওতে গিফট দেওয়া যায় না",
  no_video: "ভিডিওটি পাওয়া যায়নি",
  invalid: "ভুল গিফট",
};

export function GiftSheet({ videoId, onClose, onSent }: { videoId: string; onClose: () => void; onSent: (emoji: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  async function send(key: string, emoji: string) {
    setBusy(key);
    const { data, error } = await supabase.rpc("send_gift", { _video_id: videoId, _gift_type: key });
    setBusy(null);
    if (error) return toast.error("গিফট পাঠানো যায়নি");
    if (data !== "ok") return toast.error(MESSAGES[data as string] ?? "গিফট পাঠানো যায়নি");
    toast.success("গিফট পাঠানো হয়েছে!");
    onSent(emoji);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-media/60" onClick={onClose}>
      <div className="w-full rounded-t-3xl bg-card p-5 pb-8 text-card-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        <h3 className="mb-4 text-center text-base font-bold">🎁 গিফট পাঠান</h3>
        <div className="grid grid-cols-4 gap-3">
          {GIFTS.map((g) => (
            <Button key={g.key} variant="outline" disabled={!!busy} onClick={() => send(g.key, g.emoji)} className="h-auto flex-col gap-1 py-3">
              <span className="text-3xl">{g.emoji}</span>
              <span className="text-[11px]">{g.name}</span>
              <span className="text-[11px] font-bold text-gold">🪙 {g.value}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
