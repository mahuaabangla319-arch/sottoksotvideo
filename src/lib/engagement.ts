import { supabase } from "@/integrations/supabase/client";

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

/** Which of these videos the signed-in user already liked (one query). */
export async function fetchMyLikes(videoIds: string[], userId?: string): Promise<Set<string>> {
  if (!userId || !videoIds.length) return new Set();
  const { data } = await supabase
    .from("video_likes")
    .select("video_id")
    .eq("user_id", userId)
    .in("video_id", videoIds);
  return new Set((data ?? []).map((r) => r.video_id));
}

export async function likeVideo(videoId: string, userId: string) {
  const { error } = await supabase.from("video_likes").insert({ video_id: videoId, user_id: userId });
  if (error && error.code !== "23505") throw error;
}

export async function unlikeVideo(videoId: string, userId: string) {
  const { error } = await supabase.from("video_likes").delete().eq("video_id", videoId).eq("user_id", userId);
  if (error) throw error;
}

export type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
};

export async function fetchComments(videoId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id")
    .eq("video_id", videoId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", ids);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));
  return rows.map((r) => ({ ...r, username: nameById.get(r.user_id) || "sottok" }));
}

export async function addComment(videoId: string, userId: string, content: string) {
  const { error } = await supabase
    .from("comments")
    .insert({ video_id: videoId, user_id: userId, content: content.trim() });
  if (error) throw error;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

const counted = new Set<string>();
/** Count a view once per session per video; ignores demo rows. */
export async function countView(videoId: string) {
  if (counted.has(videoId) || videoId.startsWith("demo-")) return;
  counted.add(videoId);
  await supabase.rpc("increment_video_view", { _video_id: videoId });
}

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} সেকেন্ড আগে`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  return `${d} দিন আগে`;
}
