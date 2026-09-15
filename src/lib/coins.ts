import { supabase } from "@/integrations/supabase/client";

export const DAILY_COIN_LIMIT = 50;
export const COINS_PER_VIDEO = 50;

export type CoinTx = {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
  video_id: string | null;
};

/** Awards coins for a freshly posted video. Returns how many coins were granted (0 if the daily limit is used up). */
export async function awardVideoCoins(videoId: string): Promise<number> {
  const { data, error } = await supabase.rpc("award_video_coins", { _video_id: videoId });
  if (error) return 0;
  return Number(data ?? 0);
}

/** Coins earned by the signed-in user in the last 24 hours. */
export async function earnedToday(userId: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("coin_transactions")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", since);
  return (data ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0);
}

/** Recent coin history for the signed-in user. */
export async function coinHistory(userId: string, limit = 20): Promise<CoinTx[]> {
  const { data } = await supabase
    .from("coin_transactions")
    .select("id, amount, reason, created_at, video_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as CoinTx[];
}
