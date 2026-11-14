import { supabase } from "@/integrations/supabase/client";

// ================= TYPES =================
export type VideoFilter = "natural" | "beauty" | "vintage" | "bw" | "cinema" | "warm";
export type VideoSpeed = 0.5 | 1 | 2;
export type VideoDuration = 15 | 30 | 60 | 180;

export type VideoItem = {
  id: string;
  user_id: string;
  video_url: string;
  cover_url?: string | null;
  caption: string;
  hashtags: string[];
  filter: string;
  music_id?: string | null;
  music_title?: string | null;
  views: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_draft: boolean;
  created_at: string;
  profiles?: {
    sot_id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
};

// ================= FILTERS - Moj এর মতো =================
export const VIDEO_FILTERS: { id: VideoFilter; name: string; css: string }[] = [
  { id: "natural", name: "Natural", css: "none" },
  { id: "beauty", name: "Beauty", css: "brightness(1.12) saturate(1.25) contrast(1.05) blur(0.2px)" },
  { id: "vintage", name: "Vintage", css: "sepia(0.35) contrast(1.1) brightness(1.05)" },
  { id: "bw", name: "B & W", css: "grayscale(1) contrast(1.1)" },
  { id: "cinema", name: "Cinema", css: "contrast(1.25) saturate(1.35) brightness(0.95)" },
  { id: "warm", name: "Warm", css: "sepia(0.15) saturate(1.3) brightness(1.08)" },
];

export const VIDEO_DURATIONS: { label: string; value: VideoDuration }[] = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "3min", value: 180 },
];

export const VIDEO_SPEEDS: { label: string; value: VideoSpeed }[] = [
  { label: "0.5x Slow", value: 0.5 },
  { label: "1x Normal", value: 1 },
  { label: "2x Fast", value: 2 },
];

// ================= MUSIC - Trending =================
export const TRENDING_MUSIC = [
  { id: "sot-1", title: "Bangla Viral Beat", artist: "SOT Beats", duration: 15, category: "bangla" },
  { id: "sot-2", title: "Hindi Trending", artist: "SOT Music", duration: 30, category: "hindi" },
  { id: "sot-3", title: "SOT TOK Original", artist: "SOT TOK", duration: 15, category: "original" },
  { id: "sot-4", title: "Romantic Slow", artist: "SOT Beats", duration: 30, category: "romantic" },
  { id: "sot-5", title: "Dance Dhamaka", artist: "SOT Music", duration: 60, category: "dance" },
  { id: "sot-6", title: "Lo-Fi Chill", artist: "SOT Beats", duration: 60, category: "chill" },
];

export function getFilterCss(filter: string): string {
  const f = VIDEO_FILTERS.find((x) => x.id === filter);
  return f ? f.css : "none";
}

// ================= HASHTAG =================
// #sottok #viral -> ["sottok","viral"]
export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  const clean = matches.map((t) => t.replace("#", "").toLowerCase());
  return [...new Set(clean)];
}

// ================= UPLOAD VIDEO =================
export async function uploadVideo(
  file: File,
  userId: string,
  data: {
    caption: string;
    filter: VideoFilter;
    musicId?: string;
    musicTitle?: string;
    coverFile?: File | null;
    isDraft?: boolean;
  }
) {
  // ১. ভিডিও ফাইল Storage-এ তোলো
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
  const fileName = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw new Error("ভিডিও আপলোড হয়নি, আবার চেষ্টা করো: " + uploadError.message);

  const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);

  // ২. Cover ছবি থাকলে তোলো
  let coverUrl: string | null = null;
  if (data.coverFile) {
    const coverName = `${userId}/cover-${Date.now()}-${data.coverFile.name.replace(/[^a-zA-Z0-9.]/g, "-")}`;
    const { error: coverErr } = await supabase.storage.from("videos").upload(coverName, data.coverFile);
    if (!coverErr) {
      const { data: cUrl } = supabase.storage.from("videos").getPublicUrl(coverName);
      coverUrl = cUrl.publicUrl;
    }
  }

  // ৩. Database-এ ভিডিও Save করো - পুরনো ভিডিও ডিলিট হবে না
  const hashtags = extractHashtags(data.caption);

  const { data: video, error: dbError } = await supabase
    .from("videos")
    .insert({
      user_id: userId,
      video_url: urlData.publicUrl,
      cover_url: coverUrl,
      caption: data.caption,
      hashtags: hashtags,
      filter: data.filter,
      music_id: data.musicId || null,
      music_title: data.musicTitle || null,
      is_draft: data.isDraft || false,
      views: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
    })
    .select()
    .single();

  if (dbError) throw new Error("ভিডিও Save হয়নি: " + dbError.message);
  return video;
}

// ================= FETCH VIDEOS =================
// Feed - For You
export async function getFeedVideos(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      profiles ( sot_id, full_name, avatar_url )
    `)
    .eq("is_draft", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as VideoItem[];
}

// Trending - বেশি ভিউ যেগুলোর
export async function getTrendingVideos(limit = 20) {
  const { data, error } = await supabase
    .from("videos")
    .select(`*, profiles ( sot_id, full_name, avatar_url )`)
    .eq("is_draft", false)
    .order("views", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as VideoItem[];
}

// একজনের সব ভিডিও - Profile-এ দেখানোর জন্য
export async function getUserVideos(userId: string) {
  const { data, error } = await supabase
    .from("videos")
    .select(`*, profiles ( sot_id, full_name, avatar_url )`)
    .eq("user_id", userId)
    .eq("is_draft", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as VideoItem[];
}

// Draft ভিডিও
export async function getMyDrafts(userId: string) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", userId)
    .eq("is_draft", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as VideoItem[];
}

// Draft থেকে Publish করো
export async function publishDraft(videoId: string) {
  const { error } = await supabase.from("videos").update({ is_draft: false }).eq("id", videoId);
  if (error) throw error;
  return true;
}

// ভিডিও ডিলিট - শুধু নিজেরটা ডিলিট হবে
export async function deleteVideo(videoId: string, userId: string) {
  const { error } = await supabase.from("videos").delete().eq("id", videoId).eq("user_id", userId);
  if (error) throw error;
  return true;
}

// ভিউ বাড়াও - Moj এর মতো, Creator Fund এর জন্য
export async function incrementView(videoId: string) {
  const { data: v } = await supabase.from("videos").select("views").eq("id", videoId).single();
  if (!v) return;
  await supabase.from("videos").update({ views: (v.views || 0) + 1 }).eq("id", videoId);
}