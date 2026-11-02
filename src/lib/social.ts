import { supabase } from "@/integrations/supabase/client";

export async function isFollowing(me: string, other: string) {
  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", me)
    .eq("following_id", other)
    .maybeSingle();
  return !!data;
}

export async function setFollow(me: string, other: string, follow: boolean) {
  if (follow) {
    const { error } = await supabase.from("follows").insert({ follower_id: me, following_id: other });
    if (error && error.code !== "23505") throw error;
  } else {
    const { error } = await supabase.from("follows").delete().eq("follower_id", me).eq("following_id", other);
    if (error) throw error;
  }
}

export async function fetchFollowingSet(me: string, ids: string[]) {
  if (!ids.length) return new Set<string>();
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", me)
    .in("following_id", ids);
  return new Set((data ?? []).map((r) => r.following_id));
}

/** Cache of signed video links so repeat opens skip the signing request. */
const videoUrlCache = new Map<string, { url: string; exp: number }>();
const VIDEO_TTL_MS = 6 * 60 * 60 * 1000; // URLs live 8h; refresh before expiry

export async function signVideo(path: string) {
  if (path.startsWith("http")) return path;
  const hit = videoUrlCache.get(path);
  if (hit && hit.exp > Date.now()) return hit.url;
  const { data } = await supabase.storage.from("videos").createSignedUrl(path, 60 * 60 * 8);
  const url = data?.signedUrl ?? "";
  if (url) videoUrlCache.set(path, { url, exp: Date.now() + VIDEO_TTL_MS });
  return url;
}

/** Signs many video paths in one request, reusing cached links to cut API calls. */
export async function signVideos(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const fresh: string[] = [];
  for (const p of paths) {
    if (p.startsWith("http")) {
      map.set(p, p);
      continue;
    }
    const hit = videoUrlCache.get(p);
    if (hit && hit.exp > Date.now()) map.set(p, hit.url);
    else fresh.push(p);
  }
  if (fresh.length) {
    const { data } = await supabase.storage.from("videos").createSignedUrls(fresh, 60 * 60 * 8);
    (data ?? []).forEach((d) => {
      if (d.path && d.signedUrl) {
        map.set(d.path, d.signedUrl);
        videoUrlCache.set(d.path, { url: d.signedUrl, exp: Date.now() + VIDEO_TTL_MS });
      }
    });
  }
  return map;
}

/** Downloads a video file to the device; falls back to opening it in a new tab. */
export async function downloadVideo(url: string, name = "sottok-video") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return true;
  } catch {
    window.open(url, "_blank");
    return false;
  }
}

export const notifText: Record<string, string> = {
  like: "আপনার ভিডিওতে লাইক দিয়েছে",
  comment: "আপনার ভিডিওতে কমেন্ট করেছে",
  follow: "আপনাকে ফলো করেছে",
  message: "আপনাকে মেসেজ পাঠিয়েছে",
};

export function notificationsEnabled() {
  return typeof window !== "undefined" && localStorage.getItem("sottok-notif") !== "off";
}
