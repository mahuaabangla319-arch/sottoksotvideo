import { supabase } from "@/integrations/supabase/client";

export type Gift = {
  key: string;
  name: string;
  price: number;
  emoji: string;
};

/** The full SOT TOK gift catalog, ordered the way the gift panel shows it. */
export const GIFTS: Gift[] = [
  { key: "rose", name: "Rose", price: 1, emoji: "🌹" },
  { key: "tiktokstar", name: "TikTok Star", price: 5, emoji: "⭐" },
  { key: "heart", name: "Heart", price: 10, emoji: "❤️" },
  { key: "diamond", name: "Diamond", price: 50, emoji: "💎" },
  { key: "crown", name: "Crown", price: 100, emoji: "👑" },
  { key: "rocket", name: "Rocket", price: 200, emoji: "🚀" },
  { key: "lovecar", name: "Love Car", price: 500, emoji: "🚗" },
  { key: "universe", name: "Universe", price: 1000, emoji: "🪐" },
];

export function giftByKey(key: string): Gift | undefined {
  return GIFTS.find((g) => g.key === key);
}

export type GiftResult = "ok" | "insufficient" | "self" | "no_video" | "invalid" | "unauthenticated" | "error";

/** Sends a gift to the creator of a video; spends coins from the caller's wallet. */
export async function sendGift(videoId: string, giftKey: string): Promise<GiftResult> {
  const { data, error } = await supabase.rpc("send_gift", {
    _video_id: videoId,
    _gift_type: giftKey,
  });
  if (error) return "error";
  return (data ?? "error") as GiftResult;
}
