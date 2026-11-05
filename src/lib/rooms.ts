import { supabase } from "@/integrations/supabase/client";
import { avatarSrc } from "@/lib/profile";
import type { Tables } from "@/integrations/supabase/types";

export type Room = Tables<"rooms">;
export type RoomMember = Tables<"room_members">;
export type RoomMessage = Tables<"room_messages">;
export type RoomKind = "group" | "audio";
export type MiniProfile = { id: string; username: string; avatar: string | null };

export const STICKERS = ["🔥", "😂", "😍", "🥳", "👏", "🙏", "💯", "😎", "🤩", "❤️‍🔥", "🎉", "🪔"];
export const EMOJIS = ["😀", "😂", "😍", "😘", "😢", "😡", "👍", "🙌", "🔥", "❤️", "🎶", "✨"];

export const COVER_GRADIENTS = [
  "from-fuchsia-600 via-rose-500 to-orange-400",
  "from-cyan-500 via-blue-600 to-violet-700",
  "from-emerald-500 via-teal-600 to-sky-700",
  "from-amber-400 via-orange-500 to-red-600",
];

export function gradientFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COVER_GRADIENTS[h % COVER_GRADIENTS.length];
}

const cache = new Map<string, MiniProfile>();

/** Loads usernames + avatars for a list of user ids, cached per session. */
export async function loadProfiles(ids: string[]): Promise<Record<string, MiniProfile>> {
  const missing = [...new Set(ids)].filter((id) => !cache.has(id));
  if (missing.length) {
    const { data } = await supabase.from("profiles").select("id, username, avatar_url").in("id", missing);
    await Promise.all(
      (data ?? []).map(async (p) => {
        cache.set(p.id, { id: p.id, username: p.username, avatar: await avatarSrc(p.avatar_url) });
      }),
    );
  }
  const out: Record<string, MiniProfile> = {};
  for (const id of ids) {
    const p = cache.get(id);
    if (p) out[id] = p;
  }
  return out;
}

export async function coverSrc(path: string | null) {
  return avatarSrc(path);
}

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
    ...(import.meta.env['VITE_TURN_URL']
      ? [
          {
            urls: import.meta.env['VITE_TURN_URL'] as string,
            username: import.meta.env['VITE_TURN_USERNAME'] as string,
            credential: import.meta.env['VITE_TURN_CREDENTIAL'] as string,
          },
        ]
      : []),
  ],
};

export const RESULT_TEXT: Record<string, string> = {
  insufficient: "কয়েন যথেষ্ট নেই",
  self: "নিজেকে গিফট পাঠানো যায় না",
  not_member: "এই রুমের সদস্য নন",
  forbidden: "অনুমতি নেই",
  taken: "এই সিটে কেউ আছে",
  full: "সব সিট ভর্তি",
  banned: "আপনাকে এই রুম থেকে সরানো হয়েছে",
  force_muted: "হোস্ট আপনাকে মিউট করেছেন",
  no_room: "রুম পাওয়া যায়নি",
};
