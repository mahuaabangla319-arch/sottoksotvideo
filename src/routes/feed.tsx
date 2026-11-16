import { createFileRoute } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Gift as GiftIcon, X, Radio, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { GiftSheet } from "@/components/GiftSheet";
import { GiftAnimation } from "@/components/GiftAnimation";
import { useAuth } from "@/lib/auth";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";

const DESC = "ভারতের শর্ট ভিডিও ফিড — ড্যান্স, কমেডি, রান্না আর ফ্যামিলি ভিডিও।";
export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "For You — SOT TOK" }, { name: "description", content: DESC }] }),
  component: FeedPage,
});

type FeedItem = { id: string; userId?: string; sotId?: string; username: string; caption: string; url: string; sound: string; views: number; likes: number; comments: number; };
const PAGE_SIZE = 6;
const demoVideos: FeedItem[] = [
  { id: "demo-1", username: "@india_kitchen", caption: "আজকের রেসিপি: ঘরোয়া পনির বাটার মশলা 🔥", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", sound: "Original sound - SOT TOK Artist", views: 1000000, likes: 4000, comments: 0 },
  { id: "demo-2", username: "@rannaghor", caption: "৫ মিনিটে চিকেন কারি 🍛", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", sound: "Original sound - SOT TOK Artist", views: 820000, likes: 3200, comments: 0 },
  { id: "demo-3", username: "@sottok_food", caption: "গরম গরম পিঠা 😍", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", sound: "Original sound - SOT TOK Artist", views: 610000, likes: 2700, comments: 0 },
];
const getLocal = (k: string, d: any) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
const setLocal = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const myName = () => localStorage.getItem("sottok_username") || localStorage.getItem("vigo_user_name") || "Guest";

async function signBatch(paths: string[]) {
  const map = new Map<string, string>();
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  const rest = paths.filter((p) => !p.startsWith("http"));
  if (rest.length) { try { const { data } = await supabase.storage.from("videos").createSignedUrls(rest, 60 * 60 * 8); (data ?? []).forEach((d: any) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); }); } catch {} }
  return map;
}

// ===== ২. VIGO STYLE ডাউনলোড - SOT TOK লোগো + নাম + ID =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে…");
  try {
    if (item.id.startsWith("demo-") || item.url.includes("gtv-videos-bucket")) {
      const a = document.createElement("a"); a.href = item.url; a.download = `SOTTOK-${item.username.replace("@", "")}-${item.sotId || item.username}.mp4`; a.target = "_blank";
      document.body.appendChild(a); a.click(); a.remove(); toast.success("ডাউনলোড হয়ে গেছে"); return;
    }
    const v = document.createElement("video"); v.src = item.url; v.muted = true; v.playsInline = true; v.crossOrigin = "anonymous";
    await v.play().catch(() => {}); await new Promise((r) => setTimeout(r, 600));
    if (!v.videoWidth) throw new Error("x");
    const canvas = document.createElement("canvas"); canvas.width = v.videoWidth || 720; canvas.height = v.videoHeight || 1280;
    const ctx = canvas.getContext("2d")!;
    const stream = (canvas as any).captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: any[] = []; rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => { const b = new Blob(chunks, { type: "video/webm" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `SOTTOK-${item.username.replace("@", "")}-${item.sotId || item.username}.webm`; a.click(); toast.success("ডাউনলোড হয়ে গেছে - Watermark সহ"); };
    rec.start();
    const logo = new Image(); logo.src = "/sottok-logo.png";
    await new Promise((r) => { logo.onload = r; logo.onerror = r; setTimeout(r, 500); });
    const st = Date.now(); const ownerName = item.username; const ownerId = item.sotId || item.userId || item.username;
    const draw = () => {
      if (v.ended || v.paused) { try { rec.stop(); } catch {} return; }
      try { ctx.drawImage(v, 0, 0, canvas.width, canvas.height); } catch { try { rec.stop(); } catch {} return; }
      const t = (Date.now() - st) / 7000; const p = Math.abs((t % 2) - 1); const y = 60 + p * (canvas.height - 280);
      const txt2 = `${ownerName}  •  ID: ${ownerId}`;
      ctx.font = "bold 32px Arial"; const w = ctx.measureText(txt2).width + 110;
      ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(20, y, w, 78, 39); else ctx.rect(20, y, w, 78); ctx.fill();
      if (logo.complete && logo.naturalWidth) { ctx.save(); ctx.beginPath(); ctx.arc(59, y + 39, 30, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, 29, y + 9, 60, 60); ctx.restore(); }
      else { ctx.fillStyle = "#fe2c55"; ctx.beginPath(); ctx.arc(59, y + 39, 30, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.fillText("S", 52, y + 46); }
      ctx.fillStyle = "#fff"; ctx.font = "bold 28px Arial"; ctx.fillText("SOT TOK", 102, y + 32);
      ctx.font = "20px Arial"; ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillText(txt2, 102, y + 58);
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(canvas.width - 210, 20, 190, 40, 20); else ctx.rect(canvas.width - 210, 20, 190, 40); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.fillText("SOT TOK  ▶", canvas.width - 195, 47);
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "18px Arial"; ctx.fillText(`Made on SOT TOK  •  ${ownerName}  •  ID: ${ownerId}`, 14, canvas.height - 12);
      requestAnimationFrame(draw);
    }; draw();
    setTimeout(() => { try { if (rec.state === "recording") rec.stop(); } catch {} }, 30000);
  } catch { try { await downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`); } catch { window.open(item.url, "_blank"); } }
}

// ===== ৩. কমেন্ট - সব ইউজার সব ভিডিওতে =====
function UniversalComments({ video, open, onClose, onCountChange }: any) {
  const { user } = useAuth();
  const [text, setText] = useState(""); const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    if (!open) return; setList(getLocal(`sottok_comments_${video.id}`, []));
    (async () => { try { const { data } = await supabase.from("comments").select("*, profiles(username)").eq("video_id", video.id).order("created_at", { ascending: false }); if (data?.length) setList((p) => { const s = new Set(p.map((x: any) => String(x.id))); return [...p, ...data.filter((x: any) => !s.has(String(x.id)))]; }); } catch {} })();
  }, [open, video.id]);
  const send = async () => {
    if (!text.trim()) return;
    const n = localStorage.getItem("sottok_username") || user?.email?.split("@")[0] || myName();
    const c = { id: "local-" + Date.now(), content: text.trim(), profiles: { username: n } };
    setList((p) => [c, ...p]); setLocal(`sottok_comments_${video.id}`, [c, ...getLocal(`sottok_comments_${video.id}`, [])]);
    setText(""); toast.success("কমেন্ট হয়ে গেছে ❤️"); if (onCountChange) onCountChange(1);
    if (user && !String(video.id).startsWith("demo-")) { try { await supabase.from("comments").insert({ video_id: video.id, user_id: user.id, content: c.content }); } catch {} }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-[420px] max-h-[70vh] bg-[#111] rounded-t-3xl p-4 flex flex-col text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center"><b>💬 কমেন্ট ({list.length}) - সবাই করতে পারবে</b><button onClick={onClose} className="text-2xl px-2">×</button></div>
        <p className="text-[12px] text-white/50 mt-1">{video.caption}</p>
        <div className="flex-1 overflow-y-auto mt-3 space-y-3 min-h-[150px]">
          {list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">এখনো কোনো কমেন্ট নেই<br />তুমিই প্রথম কমেন্ট করো 👇</p>}
          {list.map((c: any) => (
            <div key={c.id} className="flex gap-2"><div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-sm">{(c.profiles?.username || "S")[0].toUpperCase()}</div><div className="bg-zinc-900 rounded-2xl px-3 py-2 flex-1"><p className="text-[12px] font-bold">@{c.profiles?.username}</p><p className="text-[13px]">{c.content}</p></div></div>
          ))}
        </div>
        <div className="flex gap-2 mt-3"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="কমেন্ট লিখো... ❤️" className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm outline-none" /><button onClick={send} className="rounded-full bg-[#fe2c55] px-5 font-bold text-sm">পাঠাও</button></div>
      </div>
    </div>
  );
}

// ===== ১. LIVE ROOM =====
function LiveRoom({ host, onClose, onEndLive }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewers] = useState(18); const [likes, setLikes] = useState(24); const [msg, setMsg] = useState("");
  const [chats, setChats] = useState<any[]>([{ user: host.username.replace("@", ""), text: "সবাই LIVE এ আসো ❤️" }, { user: "Rahul", text: "Hi! 🔥" }]);
  const isMe = host.username.replace("@", "") === myName();
  useEffect(() => {
    let stream: any = null;
    (async () => {
      try {
        if (isMe && navigator.mediaDevices?.getUserMedia) { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); } }
        else if (videoRef.current) { videoRef.current.src = host.url; await videoRef.current.play().catch(() => {}); }
      } catch { if (videoRef.current) { videoRef.current.src = host.url; videoRef.current.play().catch(() => {}); } }
    })();
    return () => { if (stream) stream.getTracks().forEach((t: any) => t.stop()); };
  }, [isMe, host.url]);
  const sendChat = () => { if (!msg.trim()) return; setChats((p) => [...p, { user: myName(), text: msg }]); setMsg(""); };
  return (
    <div className="fixed inset-0 z-[110] bg-black text-white flex flex-col">
      <div className="relative flex-1">
        <video ref={videoRef} autoPlay playsInline muted={isMe} loop={!isMe} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 pointer-events-none" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="relative"><div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold border-[3px] border-red-500 animate-pulse">{host.username.replace("@", "")[0].toUpperCase()}</div><span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">LIVE</span></div>
          <div><p className="font-bold text-[14px]">{host.username}</p><p className="text-[11px] text-white/70">ID: {host.sotId || host.username}</p></div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2"><span className="bg-black/60 px-2 py-1.5 rounded-full text-[12px] flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {viewers} দেখছে</span><button onClick={onClose} className="bg-black/60 p-2 rounded-full"><X className="h-4 w-4" /></button></div>
        <div className="absolute bottom-24 left-3 right-3 space-y-1.5 max-h-[180px] overflow-hidden pointer-events-none">{chats.slice(-4).map((c, i) => (<div key={i} className="bg-black/50 rounded-2xl px-3 py-1.5 w-fit text-[13px]"><b className="text-yellow-300">@{c.user}: </b>{c.text}</div>))}</div>
        <button onClick={() => setLikes((l) => l + 1)} className="absolute bottom-32 right-4 flex flex-col items-center"><Heart className="h-9 w-9 fill-red-500 text-red-500" /><span className="text-[12px]">{likes}</span></button>
      </div>
      <div className="p-3 flex gap-2 bg-zinc-950"><input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="LIVE এ কমেন্ট করো..." className="flex-1 bg-zinc-900 rounded-full px-4 py-2.5 text-sm outline-none" /><button onClick={sendChat} className="bg-[#fe2c55] rounded-full p-2.5"><Send className="h-4 w-4" /></button>{isMe && <button onClick={() => { if (onEndLive) onEndLive(host); onClose(); }} className="bg-red-600 rounded-full px-4 font-bold text-sm">LIVE শেষ</button>}</div>
    </div>
  );
}

function GoLiveSheet({ onClose, onStart }: any) {
  const [title, setTitle] = useState("আমার LIVE এ সবাই আসো ❤️");
  return (
    <div className="fixed inset-0 z-[105] bg-black/70 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-[#111] rounded-t-3xl p-5 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between"><b className="text-lg">🔴 LIVE শুরু করো</b><button onClick={onClose}><X /></button></div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-4 bg-zinc-900 rounded-2xl px-4 py-3 text-sm outline-none" />
        <button onClick={() => onStart(title)} className="w-full mt-4 bg-red-600 rounded-full py-3 font-bold">🔴 LIVE শুরু করো</button>
      </div>
    </div>
  );
}

function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"], initialPageParam: 0, staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false,
    getNextPageParam: (last: FeedItem[], pages) => (last.length < PAGE_SIZE ? undefined : pages.length),
    queryFn: async ({ pageParam }): Promise<FeedItem[]> => {
      const from = (pageParam as number) * PAGE_SIZE;
      try {
        const { data } = await supabase.from("videos").select("id, caption, video_url, sound_name, views, likes, comments_count, user_id").eq("visibility", "public").eq("is_deleted", false).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
        const rows = data ?? []; if (!rows.length) return [];
        const ids = [...new Set(rows.map((v) => v.user_id))];
        const [{ data: profiles }, urls] = await Promise.all([supabase.from("profiles").select("id, username, sottok_id").in("id", ids), signBatch(rows.map((v) => v.video_url))]);
        const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username])); const sotById = new Map((profiles ?? []).map((p) => [p.id, p.sottok_id]));
        return rows.map((v) => { const lc = getLocal(`sottok_comments_${v.id}`, []).length; return { id: v.id, userId: v.user_id, sotId: sotById.get(v.user_id), username: "@" + (nameById.get(v.user_id) || "sottok"), caption: v.caption, url: urls.get(v.video_url) ?? "", sound: v.sound_name, views: v.views ?? 0, likes: v.likes ?? 0, comments: (v.comments_count ?? 0) + lc }; }).filter((r) => r.url);
      } catch { return []; }
    },
  });
}

function VideoCard({ item, muted, onToggleMute, active, liked, onToggleLike, onOpenComments, followed, onFollow, onOpenGift, isLive, onJoinLive }: any) {
  const ref = useRef<HTMLVideoElement>(null); const [saved, setSaved] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; if (active) { void el.play().catch(() => {}); try { void countView(item.id); } catch {} } else { el.pause(); el.currentTime = 0; } }, [active, item.id]);
  async function share() { const url = `${window.location.origin}/feed`; try { if (navigator.share) await navigator.share({ title: "SOT TOK", text: item.caption, url }); else { await navigator.clipboard.writeText(url); toast.success("লিঙ্ক কপি হয়েছে"); } } catch {} }
  return (
    <section className="snap-item relative h-screen w-full">
      <video ref={ref} src={active ? item.url : undefined} loop muted={muted} playsInline preload="none" onClick={onToggleMute} className="h-full w-full bg-black object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />
      <style>{`@keyframes sotMove { 0% { top: 60px; } 50% { top: 45%; } 100% { top: 78%; } } .sot-wm { animation: sotMove 7s ease-in-out infinite alternate; }`}</style>
      <div className="sot-wm pointer-events-none absolute left-3 flex items-center gap-2 rounded-full bg-black/60 pl-1 pr-3 py-1">
        <img src="/sottok-logo.png" className="h-9 w-9 rounded-full" alt="SOT TOK" onError={(e: any) => { e.target.style.display = "none"; }} />
        <div className="leading-tight"><p className="text-[13px] font-bold text-white leading-none">SOT TOK</p><p className="text-[11px] text-white/90 leading-none mt-0.5">{item.username} • ID: {item.sotId || item.username}</p></div>
      </div>
      <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white">SOT TOK ▶</div>
      {isLive && <button onClick={onJoinLive} className="absolute top-12 left-3 bg-red-600 px-3 py-1 rounded-full text-[12px] font-bold animate-pulse">🔴 LIVE - দেখো</button>}
      {muted && <span className="absolute right-3 top-14 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">Tap for sound</span>}
      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
        <div className="relative mb-1">
          <div className="relative">
            <div className={`block h-12 w-12 rounded-full border-2 bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white ${isLive ? "border-red-500 ring-2 ring-red-500 animate-pulse" : "border-white"}`}>{item.username.replace("@", "")[0].toUpperCase()}</div>
            {isLive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full">LIVE</span>}
          </div>
          {!isLive && <button onClick={onFollow} className={`absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full ${followed ? "bg-white" : "bg-red-600"}`}>{followed ? <Check className="h-3.5 w-3.5 text-red-600" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />}</button>}
        </div>
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1"><Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} /><span className="text-[11px] text-white">{formatCompact(item.likes)}</span></button>
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1"><MessageCircle className="h-8 w-8 text-white" /><span className="text-[11px] text-white">{formatCompact(item.comments)}</span></button>
        <button onClick={onOpenGift} className="flex flex-col items-center gap-1"><GiftIcon className="h-8 w-8 text-yellow-400" /><span className="text-[11px] text-white">গিফট</span></button>
        <button onClick={share} className="flex flex-col items-center gap-1"><Share2 className="h-8 w-8 text-white" /><span className="text-[11px] text-white">Share</span></button>
        <button onClick={() => { void downloadWithWatermark(item); }} className="flex flex-col items-center gap-1"><Download className="h-8 w-8 text-white" /><span className="text-[11px] text-white">ডাউনলোড</span></button>
        <button onClick={() => { setSaved(!saved); toast.success(saved ? "সেভ থেকে সরানো হয়েছে" : "সেভ হয়ে গেছে"); }} className="flex flex-col items-center gap-1"><Bookmark className={`h-8 w-8 ${saved ? "fill-yellow-400 text-yellow-400" : "text-white"}`} /><span className="text-[11px] text-white">Save</span></button>
      </div>
      <div className="absolute bottom-24 left-4 right-24">
        <p className="text-[15px] font-semibold text-white">{item.username}</p>
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
  const [muted, setMuted] = useState(true); const [tab, setTab] = useState<"following" | "foryou" | "live">("foryou");
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(getLocal("sottok_liked", [])));
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({}); const [commentDelta, setCommentDelta] = useState<Record<string, number>>({});
  const [openGift, setOpenGift] = useState<string | null>(null); const [giftAnim, setGiftAnim] = useState<any>(null);
  const [openComments, setOpenComments] = useState<FeedItem | null>(null);
  const [followSet, setFollowSet] = useState<Set<string>>(() => new Set(getLocal("sottok_follow", [])));
  const [liveList, setLiveList] = useState<any[]>(() => getLocal("sottok_live_list", []));
  const [showGoLive, setShowGoLive] = useState(false); const [watchingLive, setWatchingLive] = useState<any>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const baseItems = useMemo(() => { const rows = (data?.pages ?? []).flat(); return rows.length ? rows : demoVideos; }, [data]);
  const items = useMemo(() => baseItems.map((i) => ({ ...i, likes: Math.max(0, i.likes + (likeDelta[i.id] ?? 0)), comments: Math.max(0, i.comments + (commentDelta[i.id] ?? 0)) })), [baseItems, likeDelta, commentDelta]);
  const isLiveUser = (item: any) => liveList.some((l: any) => l.username === item.username);
  const startLive = (title: string) => {
    const me = { id: "live-" + Date.now(), username: "@" + myName(), sotId: myName(), userId: myName(), caption: title, url: items[0]?.url || demoVideos[0].url };
    const next = [me, ...liveList.filter((l: any) => l.username !== me.username)]; setLiveList(next); setLocal("sottok_live_list", next);
    setShowGoLive(false); setWatchingLive(me); toast.success("🔴 LIVE শুরু হয়েছে! Home-এ সবাই দেখতে পাচ্ছে");
  };
  const endLive = (host: any) => { const next = liveList.filter((l: any) => l.username !== host.username); setLiveList(next); setLocal("sottok_live_list", next); setWatchingLive(null); toast.success("LIVE শেষ হয়েছে"); };
  useEffect(() => { const ids = baseItems.map((i) => i.id).filter((id) => !id.startsWith("demo-")); if (!user || !ids.length) return; let alive = true; void fetchMyLikes(ids, user.id).then((s) => alive && setLikedIds((prev) => new Set([...prev, ...s]))).catch(() => {}); return () => { alive = false; }; }, [baseItems, user]);
  useEffect(() => { const ids = [...new Set(baseItems.map((i) => i.userId).filter((x): x is string => !!x))]; if (!user || !ids.length) return; void fetchFollowingSet(user.id, ids).then((s) => setFollowSet((prev) => new Set([...prev, ...s]))).catch(() => {}); }, [baseItems, user]);
  async function toggleFollow(other?: string) { if (!other) return; const was = followSet.has(other); const next = new Set(followSet); if (was) next.delete(other); else next.add(other); setFollowSet(next); setLocal("sottok_follow", [...next]); if (user) { try { await setFollow(user.id, other, !was); } catch {} } toast.success(was ? "আনফলো করা হয়েছে" : "ফলো করা হয়েছে"); }
  async function toggleLike(id: string) { const was = likedIds.has(id); const next = new Set(likedIds); if (was) next.delete(id); else next.add(id); setLikedIds(next); setLocal("sottok_liked", [...next]); setLikeDelta((d) => ({ ...d, [id]: (d[id] ?? 0) + (was ? -1 : 1) })); if (!was) toast.success("❤️ লাইক হয়ে গেছে"); if (user && !id.startsWith("demo-")) { try { if (was) await unlikeVideo(id, user.id); else await likeVideo(id, user.id); } catch {} } }
  const onScroll = useCallback(() => { const el = scrollerRef.current; if (!el) return; const idx = Math.round(el.scrollTop / el.clientHeight); setActiveIndex((p) => (p === idx ? p : idx)); if (hasNextPage && !isFetchingNextPage && idx >= items.length - 2) void fetchNextPage(); }, [fetchNextPage, hasNextPage, isFetchingNextPage, items.length]);
  const visibleItems = tab === "foryou" ? items : tab === "following" ? items.filter((it) => it.userId && followSet.has(it.userId)) : items.filter((it) => isLiveUser(it));
  return (
    <div className="mx-auto w-full max-w-[420px] bg-black">
      <div className="fixed left-1/2 top-0 z-40 flex w-full max-w-[420px] -translate-x-1/2 justify-center gap-3 pt-4 items-center">
        <button onClick={() => setTab("following")} className={tab === "following" ? "text-[14px] font-bold text-white" : "text-[14px] text-white/60"}>Following</button>
        <button onClick={() => setTab("foryou")} className={tab === "foryou" ? "text-[14px] font-bold text-white" : "text-[14px] text-white/60"}>For You</button>
        <button onClick={() => setTab("live")} className={tab === "live" ? "text-[14px] font-bold text-red-500" : "text-[14px] text-white/60"}>🔴 LIVE {liveList.length > 0 ? `(${liveList.length})` : ""}</button>
        <button onClick={() => setShowGoLive(true)} className="bg-red-600 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><Radio className="h-3.5 w-3.5" /> GO LIVE</button>
      </div>
      {/* ১. Home-এ LIVE - ছবি + LIVE লেখা */}
      {liveList.length > 0 && (
        <div className="fixed left-1/2 -translate-x-1/2 top-12 z-30 w-full max-w-[420px] px-3 flex gap-3 overflow-x-auto no-scrollbar py-1">
          {liveList.map((l: any) => (
            <button key={l.id} onClick={() => setWatchingLive(l)} className="flex flex-col items-center shrink-0">
              <div className="h-14 w-14 rounded-full p-[3px] bg-red-500 animate-pulse"><div className="h-full w-full rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white border-2 border-black">{l.username.replace("@", "")[0].toUpperCase()}</div></div>
              <span className="bg-red-600 text-[8px] font-bold px-1.5 rounded-full -mt-1">LIVE</span><span className="text-[10px] text-white max-w-[56px] truncate">{l.username}</span>
            </button>
          ))}
        </div>
      )}
      <div ref={scrollerRef} onScroll={onScroll} className="snap-feed no-scrollbar h-screen overflow-y-scroll">
        {isLoading ? <div className="flex h-screen items-center justify-center text-white/50">লোড হচ্ছে…</div>
        : tab === "live" && liveList.length === 0 ? <div className="flex h-screen items-center justify-center text-white/60 text-center px-6">এখন কেউ LIVE নেই<br />তুমি GO LIVE চাপ দিয়ে LIVE শুরু করো 🔴</div>
        : visibleItems.length === 0 ? <div className="flex h-screen items-center justify-center text-white/60 text-center px-6">এখনো কাউকে ফলো করোনি<br />For You থেকে + চেপে ফলো করো</div>
        : visibleItems.map((item, i) => (
          <VideoCard key={item.id} item={item} active={i === activeIndex} muted={muted} onToggleMute={() => setMuted((m) => !m)} liked={likedIds.has(item.id)} onToggleLike={() => void toggleLike(item.id)} onOpenComments={() => setOpenComments(item)} followed={!!item.userId && followSet.has(item.userId)} onFollow={() => void toggleFollow(item.userId)} isLive={isLiveUser(item)} onJoinLive={() => setWatchingLive(liveList.find((l: any) => l.username === item.username) || item)} onOpenGift={() => { if (!user) return void toast.error("গিফট পাঠাতে লগইন করুন"); if (item.id.startsWith("demo-")) return void toast.error("ডেমো ভিডিওতে গিফট পাঠানো যাবে না"); setOpenGift(item.id); }} />
        ))}
      </div>
      {openComments && <UniversalComments video={openComments} open onClose={() => setOpenComments(null)} onCountChange={(d: number) => setCommentDelta((x) => ({ ...x, [openComments.id]: (x[openComments.id] ?? 0) + d }))} />}
      {showGoLive && <GoLiveSheet onClose={() => setShowGoLive(false)} onStart={startLive} />}
      {watchingLive && <LiveRoom host={watchingLive} onClose={() => setWatchingLive(null)} onEndLive={endLive} />}
      {openGift && <GiftSheet videoId={openGift} open onClose={() => setOpenGift(null)} onSent={setGiftAnim} />}
      <GiftAnimation gift={giftAnim} onDone={() => setGiftAnim(null)} />
      <BottomNav />
    </div>
  );
}