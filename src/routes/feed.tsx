import { createFileRoute, Link } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Gift as GiftIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { GiftSheet } from "@/components/GiftSheet";
import { GiftAnimation } from "@/components/GiftAnimation";
import { useAuth } from "@/lib/auth";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";

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
  { id: "demo-1", username: "@india_kitchen", caption: "আজকের রেসিপি: ঘরোয়া পনির বাটার মশলা 🔥", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", sound: "Original sound - SOT TOK Artist", views: 1000000, likes: 4000, comments: 0 },
  { id: "demo-2", username: "@rannaghor", caption: "৫ মিনিটে চিকেন কারি 🍛", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", sound: "Original sound - SOT TOK Artist", views: 820000, likes: 3200, comments: 0 },
  { id: "demo-3", username: "@sottok_food", caption: "গরম গরম পিঠা 😍", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", sound: "Original sound - SOT TOK Artist", views: 610000, likes: 2700, comments: 0 },
];

// ===== লোকাল সেভ - Supabase ফেল করলেও ফোনে চলবে =====
const getLocal = (k: string, d: any) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
const setLocal = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const myName = () => localStorage.getItem("sottok_username") || localStorage.getItem("vigo_user_name") || localStorage.getItem("vigo_user_email")?.split("@")[0] || "Guest";

async function signBatch(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const storagePaths = paths.filter((p) => !p.startsWith("http"));
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  if (storagePaths.length) {
    try {
      const { data } = await supabase.storage.from("videos").createSignedUrls(storagePaths, 60 * 60 * 8);
      (data ?? []).forEach((d) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); });
    } catch {}
  }
  return map;
}

// ===== ডাউনলোড - Watermark সহ, না হলে সাধারণ ডাউনলোড =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে…");
  try {
    if (item.id.startsWith("demo-") || item.url.includes("gtv-videos-bucket")) {
      const a = document.createElement("a");
      a.href = item.url; a.download = `SOTTOK-${item.username.replace("@", "")}.mp4`; a.target = "_blank";
      document.body.appendChild(a); a.click(); a.remove();
      toast.success("ডাউনলোড হয়ে গেছে"); return;
    }
    const videoEl = document.createElement("video");
    videoEl.src = item.url; videoEl.muted = true; videoEl.playsInline = true; videoEl.crossOrigin = "anonymous";
    await videoEl.play().catch(() => {});
    await new Promise((r) => setTimeout(r, 500));
    if (!videoEl.videoWidth) throw new Error("no video");
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 720; canvas.height = videoEl.videoHeight || 1280;
    const ctx = canvas.getContext("2d")!;
    const stream = (canvas as any).captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: any[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `SOTTOK-${item.username.replace("@", "")}.webm`; a.click();
      toast.success("ডাউনলোড হয়ে গেছে - Watermark সহ");
    };
    rec.start();
    const logo = new Image(); logo.src = "/sottok-logo.png";
    await new Promise((r) => { logo.onload = r; logo.onerror = r; setTimeout(r, 500); });
    const startTime = Date.now();
    const draw = () => {
      if (videoEl.ended || videoEl.paused) { try { rec.stop(); } catch {} return; }
      try { ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height); } catch { try { rec.stop(); } catch {} return; }
      const t = (Date.now() - startTime) / 6000;
      const progress = Math.abs((t % 2) - 1);
      const y = 40 + progress * (canvas.height - 140);
      const text = `SOT TOK  •  ${item.username}  •  ID: ${item.sotId || item.username}`;
      ctx.font = "bold 26px Arial";
      const w = ctx.measureText(text).width + 90;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(canvas.width - w - 20, y, w, 52);
      if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, canvas.width - w - 10, y + 4, 44, 44);
      ctx.fillStyle = "#fff"; ctx.fillText(text, canvas.width - w + 42, y + 34);
      requestAnimationFrame(draw);
    };
    draw();
    setTimeout(() => { try { if (rec.state === "recording") rec.stop(); } catch {} }, 30000);
  } catch {
    try { await downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`); } catch { window.open(item.url, "_blank"); }
  }
}

// ===== সবার কমেন্ট - সবাই করতে পারবে, লগইন লাগবে না =====
function UniversalComments({ video, open, onClose, onCountChange }: any) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const local = getLocal(`sottok_comments_${video.id}`, []);
    setList(local);
    (async () => {
      try {
        const { data } = await supabase.from("comments").select("*, profiles(username)").eq("video_id", video.id).order("created_at", { ascending: false });
        if (data && data.length) {
          setList((prev) => {
            const ids = new Set(prev.map((x: any) => String(x.id)));
            const fresh = data.filter((x: any) => !ids.has(String(x.id)));
            return [...prev, ...fresh];
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, [open, video.id]);
  const send = async () => {
    if (!text.trim()) return;
    const savedName = localStorage.getItem("sottok_username") || localStorage.getItem("vigo_user_name") || user?.email?.split("@")[0] || myName();
    const newC = { id: "local-" + Date.now(), content: text.trim(), created_at: new Date().toISOString(), profiles: { username: savedName } };
    setList((p) => [newC, ...p]);
    const old = getLocal(`sottok_comments_${video.id}`, []);
    setLocal(`sottok_comments_${video.id}`, [newC, ...old]);
    setText("");
    toast.success("কমেন্ট হয়ে গেছে ❤️");
    if (onCountChange) onCountChange(1);
    if (user && !String(video.id).startsWith("demo-")) {
      try { await supabase.from("comments").insert({ video_id: video.id, user_id: user.id, content: newC.content }); } catch {}
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-[420px] max-h-[70vh] bg-[#111] rounded-t-3xl p-4 flex flex-col text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <b>💬 কমেন্ট ({list.length}) - সবাই করতে পারবে</b>
          <button onClick={onClose} className="text-2xl leading-none px-2">×</button>
        </div>
        <p className="text-[12px] text-white/50 mt-1">{video.caption}</p>
        <div className="flex-1 overflow-y-auto mt-3 space-y-3 min-h-[150px]">
          {loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">লোড হচ্ছে…</p>}
          {!loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">এখনো কোনো কমেন্ট নেই<br />তুমিই প্রথম কমেন্ট করো 👇</p>}
          {list.map((c: any) => (
            <div key={c.id} className="flex gap-2">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-sm">{(c.profiles?.username || "S")[0].toUpperCase()}</div>
              <div className="bg-zinc-900 rounded-2xl px-3 py-2 flex-1">
                <p className="text-[12px] font-bold">@{c.profiles?.username || "sottok"}</p>
                <p className="text-[13px]">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="কমেন্ট লিখো... ❤️" className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm outline-none text-white" />
          <button onClick={send} className="rounded-full bg-[#fe2c55] px-5 font-bold text-sm text-white">পাঠাও</button>
        </div>
      </div>
    </div>
  );
}

// ===== অন্যের প্রোফাইল দেখা =====
function ProfileView({ sotId, onClose, allVideos, onOpenVideo }: any) {
  const [info, setInfo] = useState<any>(null);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try { const { data } = await supabase.from("profiles").select("*").eq("sottok_id", sotId).single(); if (data) setInfo(data); } catch {}
      const mine = allVideos.filter((v: any) => v.sotId === sotId || v.username.replace("@", "") === sotId);
      setMyVideos(mine.length ? mine : allVideos.slice(0, 3));
    })();
  }, [sotId, allVideos]);
  return (
    <div className="fixed inset-0 z-[90] bg-black text-white overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2"><X /></button>
      <div className="flex flex-col items-center pt-10">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-3xl font-bold">{(info?.username || sotId || "S")[0].toUpperCase()}</div>
        <h2 className="mt-2 font-bold text-lg">@{info?.username || sotId}</h2>
        <p className="text-white/60 text-[12px]">SOT TOK ID: {sotId}</p>
        <p className="text-[13px] text-white/70 mt-1">{info?.bio || "SOT TOK Creator"}</p>
        <p className="mt-2 text-sm">{myVideos.length} টা ভিডিও</p>
      </div>
      <div className="grid grid-cols-3 gap-[2px] mt-5 pb-24">
        {myVideos.map((v: any) => (
          <div key={v.id} onClick={() => onOpenVideo(v)} className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer">
            <video src={v.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            <div className="absolute top-1 right-1 bg-black/60 text-[8px] px-1.5 rounded-full font-bold">SOT TOK</div>
            <div className="absolute bottom-1 left-1 text-[11px]">❤️ {v.likes}</div>
          </div>
        ))}
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
      try {
        const { data } = await supabase.from("videos").select("id, caption, video_url, sound_name, views, likes, comments_count, user_id").eq("visibility", "public").eq("is_deleted", false).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
        const rows = data ?? [];
        if (!rows.length) return [];
        const ids = [...new Set(rows.map((v) => v.user_id))];
        const [{ data: profiles }, urls] = await Promise.all([
          supabase.from("profiles").select("id, username, sottok_id").in("id", ids),
          signBatch(rows.map((v) => v.video_url)),
        ]);
        const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));
        const sotById = new Map((profiles ?? []).map((p) => [p.id, p.sottok_id]));
        return rows.map((v) => {
          const lc = getLocal(`sottok_comments_${v.id}`, []).length;
          return { id: v.id, userId: v.user_id, sotId: sotById.get(v.user_id), username: "@" + (nameById.get(v.user_id) || "sottok"), caption: v.caption, url: urls.get(v.video_url) ?? "", sound: v.sound_name, views: v.views ?? 0, likes: v.likes ?? 0, comments: (v.comments_count ?? 0) + lc };
        }).filter((r) => r.url);
      } catch { return []; }
    },
  });
}

function VideoCard({ item, muted, onToggleMute, active, liked, onToggleLike, onOpenComments, followed, onFollow, onOpenProfile, onOpenGift }: any) {
  const ref = useRef<HTMLVideoElement>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (active) { void el.play().catch(() => {}); try { void countView(item.id); } catch {} } else { el.pause(); el.currentTime = 0; }
  }, [active, item.id]);
  async function share() {
    const url = `${window.location.origin}/feed`;
    try { if (navigator.share) await navigator.share({ title: "SOT TOK", text: item.caption, url }); else { await navigator.clipboard.writeText(url); toast.success("লিঙ্ক কপি হয়েছে"); } } catch {}
  }
  return (
    <section className="snap-item relative h-screen w-full">
      <video ref={ref} src={active ? item.url : undefined} data-src={item.url} loop muted={muted} playsInline preload="none" onClick={onToggleMute} className="h-full w-full bg-black object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />
      <style>{`@keyframes sotMove { 0% { top: 60px; } 50% { top: 45%; } 100% { top: 78%; } } .sot-wm { animation: sotMove 6s ease-in-out infinite alternate; }`}</style>
      <div className="sot-wm pointer-events-none absolute right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5">
        <img src="/sottok-logo.png" className="h-5 w-5 rounded-md" alt="SOT TOK" onError={(e: any) => { e.target.style.display = "none"; }} />
        <span className="text-[11px] font-bold text-white">SOT TOK • {item.username} • ID: {item.sotId || item.username}</span>
      </div>
      {muted && <span className="absolute right-3 top-14 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">Tap for sound</span>}
      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
        <div className="relative mb-1">
          <button onClick={onOpenProfile} className="block h-12 w-12 rounded-full border-2 border-white bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white">{item.username.replace("@", "")[0].toUpperCase()}</button>
          <button onClick={onFollow} aria-label={followed ? "আনফলো" : "ফলো"} className={`absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full ${followed ? "bg-white" : "bg-red-600"}`}>{followed ? <Check className="h-3.5 w-3.5 text-red-600" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />}</button>
        </div>
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1" aria-label="লাইক"><Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} /><span className="text-[11px] text-white">{formatCompact(item.likes)}</span></button>
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1" aria-label="কমেন্ট"><MessageCircle className="h-8 w-8 text-white" /><span className="text-[11px] text-white">{formatCompact(item.comments)}</span></button>
        <button onClick={onOpenGift} className="flex flex-col items-center gap-1" aria-label="গিফট"><GiftIcon className="h-8 w-8 text-yellow-400" /><span className="text-[11px] text-white">গিফট</span></button>
        <button onClick={share} className="flex flex-col items-center gap-1" aria-label="শেয়ার"><Share2 className="h-8 w-8 text-white" /><span className="text-[11px] text-white">Share</span></button>
        <button onClick={() => { void downloadWithWatermark(item); }} className="flex flex-col items-center gap-1" aria-label="ডাউনলোড"><Download className="h-8 w-8 text-white" /><span className="text-[11px] text-white">ডাউনলোড</span></button>
        <button onClick={() => { setSaved(!saved); toast.success(saved ? "সেভ থেকে সরানো হয়েছে" : "সেভ হয়ে গেছে"); }} className="flex flex-col items-center gap-1" aria-label="সেভ"><Bookmark className={`h-8 w-8 ${saved ? "fill-yellow-400 text-yellow-400" : "text-white"}`} /><span className="text-[11px] text-white">Save</span></button>
      </div>
      <div className="absolute bottom-24 left-4 right-24">
        <button onClick={onOpenProfile} className="text-[15px] font-semibold text-white">{item.username}</button>
        <p className="text-[12px] text-white/70">{formatCompact(item.views)} views • ID: {item.sotId || item.username}</p>
        <p className="mt-1 text-[13px] text-white">{item.caption}</p>
        <p className="mt-1 text-[12px] text-white/80">{item.sound}</p>
        <button className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] text-white backdrop-blur"><Music2 className="h-3.5 w-3.5" /> Use this sound</button>
      </div>
    </section>
  );
}

function FeedPage() {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const [muted, setMuted] = useState(true);
  const [tab, setTab] = useState<"following" | "foryou">("foryou");
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(getLocal("sottok_liked", [])));
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({});
  const [commentDelta, setCommentDelta] = useState<Record<string, number>>({});
  const [openGift, setOpenGift] = useState<string | null>(null);
  const [giftAnim, setGiftAnim] = useState<{ emoji: string; name: string } | null>(null);
  const [openComments, setOpenComments] = useState<FeedItem | null>(null);
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const [fullVideo, setFullVideo] = useState<FeedItem | null>(null);
  const [followSet, setFollowSet] = useState<Set<string>>(() => new Set(getLocal("sottok_follow", [])));
  const scrollerRef = useRef<HTMLDivElement>(null);

  const baseItems = useMemo(() => { const rows = (data?.pages ?? []).flat(); return rows.length ? rows : demoVideos; }, [data]);
  const items = useMemo(() => baseItems.map((i) => ({ ...i, likes: Math.max(0, i.likes + (likeDelta[i.id] ?? 0)), comments: Math.max(0, i.comments + (commentDelta[i.id] ?? 0)) })), [baseItems, likeDelta, commentDelta]);

  useEffect(() => {
    const ids = baseItems.map((i) => i.id).filter((id) => !id.startsWith("demo-"));
    if (!user || !ids.length) return;
    let alive = true;
    void fetchMyLikes(ids, user.id).then((s) => alive && setLikedIds((prev) => new Set([...prev, ...s]))).catch(() => {});
    return () => { alive = false; };
  }, [baseItems, user]);

  useEffect(() => {
    const ids = [...new Set(baseItems.map((i) => i.userId).filter((x): x is string => !!x))];
    if (!user || !ids.length) return;
    void fetchFollowingSet(user.id, ids).then((s) => setFollowSet((prev) => new Set([...prev, ...s]))).catch(() => {});
  }, [baseItems, user]);

  async function toggleFollow(other?: string) {
    if (!other) return;
    const was = followSet.has(other);
    const next = new Set(followSet); if (was) next.delete(other); else next.add(other);
    setFollowSet(next); setLocal("sottok_follow", [...next]);
    if (user) { try { await setFollow(user.id, other, !was); } catch {} }
    toast.success(was ? "আনফলো করা হয়েছে" : "ফলো করা হয়েছে");
  }

  async function toggleLike(id: string) {
    const wasLiked = likedIds.has(id);
    const next = new Set(likedIds); if (wasLiked) next.delete(id); else next.add(id);
    setLikedIds(next); setLocal("sottok_liked", [...next]);
    setLikeDelta((d) => ({ ...d, [id]: (d[id] ?? 0) + (wasLiked ? -1 : 1) }));
    if (!wasLiked) toast.success("❤️ লাইক হয়ে গেছে");
    if (user && !id.startsWith("demo-")) { try { if (wasLiked) await unlikeVideo(id, user.id); else await likeVideo(id, user.id); } catch {} }
  }

  const onScroll = useCallback(() => {
    const el = scrollerRef.current; if (!el) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex((prev) => (prev === index ? prev : index));
    if (hasNextPage && !isFetchingNextPage && index >= items.length - 2) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, items.length]);

  const visibleItems = tab === "foryou" ? items : items.filter((it) => it.userId && followSet.has(it.userId));

  return (
    <div className="mx-auto w-full max-w-[420px] bg-black">
      <div className="fixed left-1/2 top-0 z-40 flex w-full max-w-[420px] -translate-x-1/2 justify-center gap-6 pt-4">
        <button onClick={() => setTab("following")} className={tab === "following" ? "text-[15px] font-bold text-white" : "text-[15px] text-white/60"}>Following</button>
        <button onClick={() => setTab("foryou")} className={tab === "foryou" ? "text-[15px] font-bold text-white" : "text-[15px] text-white/60"}>For You</button>
      </div>
      <div ref={scrollerRef} onScroll={onScroll} className="snap-feed no-scrollbar h-screen overflow-y-scroll">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center text-white/50">লোড হচ্ছে…</div>
        ) : visibleItems.length === 0 ? (
          <div className="flex h-screen items-center justify-center text-white/60 text-center px-6">এখনো কাউকে ফলো করোনি<br />For You থেকে + চেপে ফলো করো</div>
        ) : (
          visibleItems.map((item, i) => (
            <VideoCard key={item.id} item={item} active={i === activeIndex} muted={muted} onToggleMute={() => setMuted((m) => !m)} liked={likedIds.has(item.id)} onToggleLike={() => void toggleLike(item.id)} onOpenComments={() => setOpenComments(item)} followed={!!item.userId && followSet.has(item.userId)} onFollow={() => void toggleFollow(item.userId)} onOpenProfile={() => setOpenProfileId(item.sotId || item.username.replace("@", ""))} onOpenGift={() => { if (!user) return void toast.error("গিফট পাঠাতে লগইন করুন"); if (item.id.startsWith("demo-")) return void toast.error("ডেমো ভিডিওতে গিফট পাঠানো যাবে না"); if (item.userId === user.id) return void toast.error("নিজের ভিডিওতে গিফট পাঠানো যাবে না"); setOpenGift(item.id); }} />
          ))
        )}
      </div>

      {openComments && <UniversalComments video={openComments} open onClose={() => setOpenComments(null)} onCountChange={(d: number) => setCommentDelta((x) => ({ ...x, [openComments.id]: (x[openComments.id] ?? 0) + d }))} />}
      {openProfileId && <ProfileView sotId={openProfileId} onClose={() => setOpenProfileId(null)} allVideos={items} onOpenVideo={(v: any) => { setOpenProfileId(null); setFullVideo(v); }} />}
      {fullVideo && (
        <div className="fixed inset-0 z-[95] bg-black flex flex-col">
          <button onClick={() => setFullVideo(null)} className="absolute top-4 right-4 z-10 bg-black/60 p-2 rounded-full text-white"><X /></button>
          <video src={fullVideo.url} controls autoPlay loop className="flex-1 w-full object-contain" />
          <div className="p-4 text-white">
            <p className="font-bold">{fullVideo.username} • ID: {fullVideo.sotId || fullVideo.username}</p>
            <p className="text-[13px] mt-1">{fullVideo.caption}</p>
            <div className="flex gap-5 mt-3">
              <button onClick={() => toggleLike(fullVideo.id)} className="flex items-center gap-1"><Heart className={`h-6 w-6 ${likedIds.has(fullVideo.id) ? "fill-red-500 text-red-500" : "text-white"}`} />{fullVideo.likes}</button>
              <button onClick={() => setOpenComments(fullVideo)} className="flex items-center gap-1"><MessageCircle className="h-6 w-6" /> কমেন্ট</button>
              <button onClick={() => downloadWithWatermark(fullVideo)} className="flex items-center gap-1"><Download className="h-6 w-6" /> ডাউনলোড</button>
            </div>
          </div>
        </div>
      )}
      {openGift && <GiftSheet videoId={openGift} open onClose={() => setOpenGift(null)} onSent={setGiftAnim} />}
      <GiftAnimation gift={giftAnim} onDone={() => setGiftAnim(null)} />
      <BottomNav />
    </div>
  );
}