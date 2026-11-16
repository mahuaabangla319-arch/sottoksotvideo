import { createFileRoute, Link } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Gift as GiftIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { GiftSheet } from "@/components/GiftSheet";
import { GiftAnimation } from "@/components/GiftAnimation";
import { useAuth } from "@/lib/auth";
import {
  countView,
  fetchMyLikes,
  formatCompact,
  likeVideo,
  unlikeVideo,
} from "@/lib/engagement";

const DESC = "ভারতের শর্ট ভিডিও ফিড — ড্যান্স, কমেডি, রান্না আর ফ্যামিলি ভিডিও।";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "For You — SOT TOK" },
      { name: "description", content: DESC },
      { property: "og:title", content: "For You — SOT TOK" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

type FeedItem = {
  id: string;
  userId?: string | undefined;
  sotId?: string | undefined;
  username: string;
  caption: string;
  url: string;
  sound: string;
  views: number;
  likes: number;
  comments: number;
};

const PAGE_SIZE = 6;

const demoVideos: FeedItem[] = [
  {
    id: "demo-1",
    username: "@india_kitchen",
    caption: "আজকের রেসিপি: ঘরোয়া পনির বাটার মশলা 🔥",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: 1_000_000,
    likes: 4000,
    comments: 0,
  },
  {
    id: "demo-2",
    username: "@rannaghor",
    caption: "৫ মিনিটে চিকেন কারি 🍛",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: 820_000,
    likes: 3200,
    comments: 0,
  },
  {
    id: "demo-3",
    username: "@sottok_food",
    caption: "গরম গরম পিঠা 😍",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: 610_000,
    likes: 2700,
    comments: 0,
  },
];

async function signBatch(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const storagePaths = paths.filter((p) => !p.startsWith("http"));
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  if (storagePaths.length) {
    const { data } = await supabase.storage.from("videos").createSignedUrls(storagePaths, 60 * 60 * 8);
    (data ?? []).forEach((d) => {
      if (d.path && d.signedUrl) map.set(d.path, d.signedUrl);
    });
  }
  return map;
}

// ===== SOT TOK - VIGO STYLE ঘুরন্ত WATERMARK দিয়ে ডাউনলোড =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে… Watermark বসানো হচ্ছে");
  try {
    const videoEl = document.createElement('video');
    videoEl.src = item.url;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.crossOrigin = "anonymous";
    await videoEl.play().catch(() => {});
    await new Promise(r => setTimeout(r, 600));
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 720;
    canvas.height = videoEl.videoHeight || 1280;
    const ctx = canvas.getContext('2d')!;
    const stream = (canvas as any).captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: any[] = [];
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `SOTTOK-${item.username.replace('@','')}.webm`;
      a.click();
      toast.success("ডাউনলোড হয়ে গেছে - SOT TOK Watermark সহ");
    };
    rec.start();
    const logo = new Image();
    logo.src = '/sottok-logo.png';
    await new Promise(r => { logo.onload = r; logo.onerror = r; });
    const startTime = Date.now();
    const draw = () => {
      if (videoEl.ended || videoEl.paused) { try { rec.stop(); } catch {} return; }
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const t = (Date.now() - startTime) / 6000;
      const progress = Math.abs((t % 2) - 1);
      const y = 40 + progress * (canvas.height - 140);
      const text = `SOT TOK  •  ${item.username}  •  ID: ${item.sotId || item.userId || item.username}`;
      ctx.font = 'bold 26px Arial';
      const w = ctx.measureText(text).width + 90;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      // @ts-ignore
      if (ctx.roundRect) ctx.roundRect(canvas.width - w - 20, y, w, 52, 26); else ctx.rect(canvas.width - w - 20, y, w, 52);
      ctx.fill();
      if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, canvas.width - w - 10, y + 4, 44, 44);
      ctx.fillStyle = '#fff';
      ctx.fillText(text, canvas.width - w + 42, y + 34);
      requestAnimationFrame(draw);
    };
    draw();
  } catch {
    void downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`);
  }
}

// ===== SOT TOK - সবার ভিডিওতে সবাই কমেন্ট করতে পারবে =====
function UniversalComments({ videoId, open, onClose, onCountChange }: any) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      let all: any[] = [];
      try {
        const { data } = await supabase.from("comments")
          .select("*, profiles(username)").eq("video_id", videoId)
          .order("created_at", { ascending: false });
        if (data) all = [...data];
      } catch {}
      const local = JSON.parse(localStorage.getItem(`sottok_comments_${videoId}`) || "[]");
      // লোকালটা আগে দেখাও, তারপর সার্ভারেরটা
      setList([...local, ...all]);
    })();
  }, [videoId, open]);

  const send = async () => {
    if (!text.trim()) return;
    const myName = user?.email?.split("@")[0] || localStorage.getItem("vigo_user_name") || localStorage.getItem("vigo_user_email")?.split("@")[0] || "Guest";
    const newC = { id: Date.now(), content: text, created_at: new Date().toISOString(), profiles: { username: myName } };
    setList((p) => [newC, ...p]);
    const old = JSON.parse(localStorage.getItem(`sottok_comments_${videoId}`) || "[]");
    localStorage.setItem(`sottok_comments_${videoId}`, JSON.stringify([newC, ...old]));
    if (user) {
      try { await supabase.from("comments").insert({ video_id: videoId, user_id: user.id, content: text }); } catch {}
    }
    onCountChange?.(1);
    setText("");
    toast.success("কমেন্ট হয়ে গেছে ❤️");
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-[420px] max-h-[70vh] bg-[#111] rounded-t-3xl p-4 flex flex-col text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <b>💬 কমেন্ট ({list.length}) - সবাই কমেন্ট করতে পারবে</b>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto mt-3 space-y-3 min-h-[150px]">
          {list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">এখনো কোনো কমেন্ট নেই<br/>তুমিই প্রথম কমেন্ট করো 👇</p>}
          {list.map((c: any) => (
            <div key={c.id} className="flex gap-2">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-sm">
                {(c.profiles?.username || "S")[0].toUpperCase()}
              </div>
              <div className="bg-zinc-900 rounded-2xl px-3 py-2 flex-1">
                <p className="text-[12px] font-bold">@{c.profiles?.username || "sottok"}</p>
                <p className="text-[13px]">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="সবাইকে কিছু বলো... ❤️"
            className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm outline-none text-white"
          />
          <button onClick={send} className="rounded-full bg-[#fe2c55] px-5 font-bold text-sm text-white">পাঠাও</button>
        </div>
        <p className="text-center text-[11px] text-white/40 mt-2">লগইন না করলেও Guest হিসেবে কমেন্ট করা যাবে</p>
      </div>
    </div>
  );
}

function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    initialPageParam: 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    getNextPageParam: (last: FeedItem[], pages) => (last.length < PAGE_SIZE ? undefined : pages.length),
    queryFn: async ({ pageParam }): Promise<FeedItem[]> => {
      const from = (pageParam as number) * PAGE_SIZE;
      const { data } = await supabase
        .from("videos")
        .select("id, caption, video_url, sound_name, views, likes, comments_count, user_id")
        .eq("visibility", "public")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      const rows = data ?? [];
      if (!rows.length) return [];
      const ids = [...new Set(rows.map((v) => v.user_id))];
      const [{ data: profiles }, urls] = await Promise.all([
        supabase.from("profiles").select("id, username, sottok_id").in("id", ids),
        signBatch(rows.map((v) => v.video_url)),
      ]);
      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));
      const sotById = new Map((profiles ?? []).map((p) => [p.id, p.sottok_id]));
      return rows
        .map((v) => ({
          id: v.id,
          userId: v.user_id,
          sotId: sotById.get(v.user_id),
          username: "@" + (nameById.get(v.user_id) || "sottok"),
          caption: v.caption,
          url: urls.get(v.video_url) ?? "",
          sound: v.sound_name,
          views: v.views ?? 0,
          likes: v.likes ?? 0,
          comments: v.comments_count ?? 0,
        }))
        .filter((r) => r.url);
    },
  });
}

function VideoCard({
  item,
  muted,
  onToggleMute,
  active,
  liked,
  onToggleLike,
  commentCount,
  onOpenComments,
  followed,
  onFollow,
  isMe,
  onOpenGift,
}: {
  onOpenGift: () => void;
  followed: boolean;
  onFollow: () => void;
  isMe: boolean;
  item: FeedItem;
  muted: boolean;
  onToggleMute: () => void;
  active: boolean;
  liked: boolean;
  onToggleLike: () => void;
  commentCount: number;
  onOpenComments: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      void el.play().catch(() => {});
      void countView(item.id);
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [active, item.id]);

  async function share() {
    const url = `${window.location.origin}/feed`;
    try {
      if (navigator.share) await navigator.share({ title: "SOT TOK", text: item.caption, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("লিঙ্ক কপি হয়েছে");
      }
    } catch {}
  }

  return (
    <section className="snap-item relative h-screen w-full">
      <video
        ref={ref}
        src={active ? item.url : undefined}
        data-src={item.url}
        loop
        muted={muted}
        playsInline
        preload="none"
        onClick={onToggleMute}
        className="h-full w-full bg-black object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />

      {/* ===== VIGO STYLE - উপর নিচ ঘোরা WATERMARK ===== */}
      <div className="pointer-events-none absolute right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 animate-[sotWatermarkMove_6s_ease-in-out_infinite_alternate]">
        <img src="/sottok-logo.png" className="h-5 w-5 rounded-md" alt="SOT TOK" />
        <span className="text-[11px] font-bold text-white">SOT TOK • {item.username} • ID: {item.sotId || item.username}</span>
      </div>
      <style>{`@keyframes sotWatermarkMove { 0% { top: 56px; } 50% { top: 45%; } 100% { top: 78%; } }`}</style>

      {muted && (
        <span className="absolute right-3 top-14 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">
          Tap for sound
        </span>
      )}

      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
        <div className="relative mb-1">
          {item.sotId ? (
            <Link to="/id/$sotId" params={{ sotId: item.sotId }} aria-label="প্রোফাইল দেখুন" className="block h-12 w-12 rounded-full border-2 border-white bg-flame" />
          ) : (
            <div className="h-12 w-12 rounded-full border-2 border-white bg-flame" />
          )}
          {!isMe && (
            <button
              onClick={onFollow}
              aria-label={followed ? "আনফলো" : "ফলো"}
              className={`absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full ${followed ? "bg-white" : "bg-red-600"}`}
            >
              {followed ? <Check className="h-3.5 w-3.5 text-red-600" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </button>
          )}
        </div>
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1" aria-label="লাইক">
          <Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          <span className="text-[11px] text-white">{formatCompact(item.likes)}</span>
        </