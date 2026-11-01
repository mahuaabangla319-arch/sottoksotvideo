import { supabase } from "@/integrations/supabase/client";

export type Gift = { key: string; emoji: string; name: string; cost: number };

export const GIFTS: Gift[] = [
  { key: "rose", emoji: "🌹", name: "গোলাপ", cost: 10 },
  { key: "heart", emoji: "❤️", name: "হার্ট", cost: 30 },
  { key: "diamond", emoji: "💎", name: "হীরা", cost: 100 },
  { key: "car", emoji: "🚗", name: "গাড়ি", cost: 1000 },
  { key: "crown", emoji: "👑", name: "মুকুট", cost: 10000 },
];

/** The signed-in user's current wallet balance. */
export async function fetchMyCoins(userId: string): Promise<number> {
  const { data } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", userId)
    .maybeSingle();
  return data?.coins ?? 0;
}

/**
 * Sends a gift to the creator of a video. Deducts the cost from the sender's
 * wallet and credits the creator. Returns the new balance, or -1 when the
 * wallet doesn't have enough coins.
 */
export async function sendGift(videoId: string, giftKey: string, cost: number): Promise<number> {
  const { data, error } = await supabase.rpc("send_gift", {
    _video_id: videoId,
    _gift_type: giftKey,
    _cost: cost,
  });
  if (error) throw error instanceof Error ? error : new Error("gift_failed");
  return Number(data ?? -1);
}
