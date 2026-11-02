import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function levelFromLikes(likes: number): number {
  return Math.min(10, Math.max(1, Math.floor(likes / 1000) || 1));
}

export function isVerified(followers: number): boolean {
  return followers >= 10_000;
}

export function shareUrl(sotId: string): string {
  return `${window.location.origin}/id/${sotId}`;
}

export function shareText(sotId: string): string {
  return `আমাকে SOT TOK এ ফলো করুন! SOT ID: ${sotId}\n${shareUrl(sotId)}`;
}

/** Shares via the native sheet when available, else copies the link. */
export async function shareProfile(sotId: string): Promise<"shared" | "copied"> {
  const url = shareUrl(sotId);
  const text = shareText(sotId);
  if (navigator.share) {
    try {
      await navigator.share({ title: "SOT TOK", text, url });
      return "shared";
    } catch {
      /* user cancelled — fall through to copy */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  return "copied";
}

/** Loads the signed-in user's profile, creating a row (with a permanent SOT ID) if missing. */
export async function loadOwnProfile(userId: string, meta: Record<string, unknown>) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (data) return data;
  const username =
    (meta["username"] as string) ||
    (meta["email"] as string | undefined)?.split("@")[0] ||
    `sottok_${Math.floor(Math.random() * 10000)}`;
  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      full_name: (meta["full_name"] as string) || username,
    })
    .select("*")
    .maybeSingle();
  return created;
}

/** Cache of signed avatar links so profile pages skip repeat signing requests. */
const avatarCache = new Map<string, { url: string; exp: number }>();

export async function avatarSrc(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const hit = avatarCache.get(path);
  if (hit && hit.exp > Date.now()) return hit.url;
  const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 7);
  const url = data?.signedUrl ?? null;
  if (url) avatarCache.set(path, { url, exp: Date.now() + 6 * 60 * 60 * 24 * 1000 });
  return url;
}
