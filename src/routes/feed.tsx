import { createFileRoute, Link } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Gift as GiftIcon, X, Users, Play, Camera, Image as ImageIcon, Home, Compass, Bell, User, CircleDot } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GiftSheet } from "@/components/GiftSheet";
import { GiftAnimation } from "@/components/GiftAnimation";
import { useAuth } from "@/lib/auth";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";

const DESC = "ভারতের শর্ট ভিডিও ফিড — ড্যান্স, কমেডি, রান্না আর ফ্যামিলি ভিডিও।";
export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "For You — SOT TOK" }, { name: "description", content: DESC }] }),
  component: FeedPage,
});

type FeedItem = { id: string; userId?: string | undefined; sotId?: string | undefined; username: string; caption: string; url: string; sound: string; views: number; likes: number; comments: number; };
const PAGE_SIZE = 6;
const demoVideos: FeedItem[] = [
  { id: "demo-1", username: "@india_kitchen", caption: "আজকের রেসিপি: ঘরোয়া পনির বাটার মশলা 🔥", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", sound: "Original sound - SOT TOK Artist", views: 1000000, likes: 4000, comments: 0 },
  { id: "demo-2", username: "@rannaghor", caption: "৫ মিনিটে চিকেন কারি 🍛", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", sound: "Original sound - SOT TOK Artist", views: 820000, likes: 3200, comments: 0 },
  { id: "demo-3", username: "@sottok_food", caption: "গরম গরম পিঠা 😍", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", sound: "Original sound - SOT TOK Artist", views: 610000, likes: 2700, comments: 0 },
];
const getLocal = (k: string, d: any) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
const setLocal = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const myName = () => localStorage.getItem("sottok_username") || localStorage.getItem("vigo_user_name") || localStorage.getItem("vigo_user_email")?.split("@")[0] || "Guest";
const timeAgo = (t: number) => { const d = Date.now() - t; if (d < 60000) return "এখনই"; if (d < 3600000) return `${Math.floor(d / 60000)} মিনিট আগে`; if (d < 86400000) return `${Math.floor(d / 3600000)} ঘণ্টা আগে`; return `${Math.floor(d / 86400000)} দিন আগে`; };
async function signBatch(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const storagePaths = paths.filter((p) => !p.startsWith("http"));
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  if (storagePaths.length) { try { const { data } = await supabase.storage.from("videos").createSignedUrls(storagePaths, 60 * 60 * 8); (data ?? []).forEach((d) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); }); } catch {} }
  return map;
}

// ===== ডাউনলোড - শুধু ডাউনলোড করলেই Vigo Watermark, প্লে করলে নয় =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে… Vigo স্টাইল Watermark বসানো হচ্ছে");
  try {
    const ownerName = item.username; const ownerId = item.sotId || item.userId || item.username;
    let videoUrl = item.url;
    try { const res = await fetch(item.url, { mode: "cors" }); if (res.ok) videoUrl = URL.createObjectURL(await res.blob()); else { const r2 = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(item.url)}`); if (r2.ok) videoUrl = URL.createObjectURL(await r2.blob()); } } catch { try { const r3 = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(item.url)}`); if (r3.ok) videoUrl = URL.createObjectURL(await r3.blob()); } catch {} }
    const videoEl = document.createElement("video"); videoEl.src = videoUrl; videoEl.muted = true; videoEl.playsInline = true; videoEl.crossOrigin = "anonymous";
    await videoEl.play().catch(() => {}); await new Promise((r) => { if (videoEl.videoWidth) return r(null); videoEl.onloadedmetadata = () => r(null); setTimeout(() => r(null), 1500); });
    if (!videoEl.videoWidth) throw new Error("no video");
    const canvas = document.createElement("canvas"); canvas.width = videoEl.videoWidth || 720; canvas.height = videoEl.videoHeight || 1280;
    const ctx = canvas.getContext("2d")!; const stream = (canvas as any).captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: any[] = []; rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => { const b = new Blob(chunks, { type: "video/webm" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `SOTTOK-${ownerName.replace("@", "")}-${ownerId}.webm`; document.body.appendChild(a); a.click(); a.remove(); toast.success("ডাউনলোড হয়ে গেছে - Vigo স্টাইল Watermark সহ"); };
    rec.start(200);
    const logo = new Image(); logo.src = "/sottok-logo.png";
    await new Promise((r) => { logo.onload = r; logo.onerror = r; setTimeout(r, 500); });
    const startTime = Date.now(); let stopped = false;
    const stopRec = () => { if (!stopped) { stopped = true; try { rec.stop(); } catch {} } };
    const draw = () => {
      if (videoEl.ended) { stopRec(); return; }
      try { ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height); } catch { stopRec(); return; }
      const t = (Date.now() - startTime) / 6000; const progress = Math.abs((t % 2) - 1); const y = 40 + progress * (canvas.height - 140);
      const text = `SOT TOK  •  ${ownerName}  •  ID: ${ownerId}`;
      ctx.font = "bold 26px Arial"; const w = ctx.measureText(text).width + 90;
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(canvas.width - w - 20, y, w, 52);
      if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, canvas.width - w - 10, y + 4, 44, 44);
      ctx.fillStyle = "#fff"; ctx.fillText(text, canvas.width - w + 42, y + 34);
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "18px Arial"; ctx.fillText(`Made on SOT TOK  •  ${ownerName}  •  ID: ${ownerId}`, 14, canvas.height - 12);
      if (!stopped) requestAnimationFrame(draw);
    }; draw(); videoEl.onended = () => stopRec(); setTimeout(() => stopRec(), 30000);
  } catch { try { await downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`); } catch { window.open(item.url, "_blank"); } }
}

// ===== সবার কমেন্ট =====
function UniversalComments({ video, open, onClose, onCountChange }: any) {
  const { user } = useAuth();
  const [text, setText] = useState(""); const [list, setList] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!open) return; setLoading(true); const local = getLocal(`sottok_comments_${video.id}`, []); setList(local);
    (async () => { try { const { data } = await supabase.from("comments").select("*, profiles(username)").eq("video_id", video.id).order("created_at", { ascending: false }); if (data && data.length) setList((prev) => { const ids = new Set(prev.map((x: any) => String(x.id))); const fresh = data.filter((x: any) => !ids.has(String(x.id))); return [...prev, ...fresh]; }); } catch {} setLoading(false); })();
  }, [open, video.id]);
  const send = async () => {
    if (!text.trim()) return;
    const savedName = localStorage.getItem("sottok_username") || localStorage.getItem("vigo_user_name") || user?.email?.split("@")[0] || myName();
    const newC = { id: "local-" + Date.now(), content: text.trim(), created_at: new Date().toISOString(), profiles: { username: savedName } };
    setList((p) => [newC, ...p]); const old = getLocal(`sottok_comments_${video.id}`, []); setLocal(`sottok_comments_${video.id}`, [newC, ...old]); setText(""); toast.success("কমেন্ট হয়ে গেছে ❤️"); if (onCountChange) onCountChange(1);
    if (user && !String(video.id).startsWith("demo-")) { try { await supabase.from("comments").insert({ video_id: video.id, user_id: user.id, content: newC.content }); } catch {} }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-[420px] max-h-[70vh] bg-[#111] rounded-t-3xl p-4 flex flex-col text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center"><b>💬 কমেন্ট ({list.length}) - সবাই করতে পারবে</b><button onClick={onClose} className="text-2xl leading-none px-2">×</button></div>
        <p className="text-[12px] text-white/50 mt-1">{video.caption}</p>
        <div className="flex-1 overflow-y-auto mt-3 space-y-3 min-h-[150px]">
          {loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">লোড হচ্ছে…</p>}
          {!loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">এখনো কোনো কমেন্ট নেই<br />তুমিই প্রথম কমেন্ট করো 👇</p>}
          {list.map((c: any) => (<div key={c.id} className="flex gap-2"><div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-sm">{(c.profiles?.username || "S")[0].toUpperCase()}</div><div className="bg-zinc-900 rounded-2xl px-3 py-2 flex-1"><p className="text-[12px] font-bold">@{c.profiles?.username || "sottok"}</p><p className="text-[13px]">{c.content}</p></div></div>))}
        </div>
        <div className="flex gap-2 mt-3"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="কমেন্ট লিখো... ❤️" className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm outline-none text-white" /><button onClick={send} className="rounded-full bg-[#fe2c55] px-5 font-bold text-sm text-white">পাঠাও</button></div>
      </div>
    </div>
  );
}

// ===== STATUS - Add + Viewer =====
function AddStatusSheet({ onClose, onAdded }: any) {
  const [text, setText] = useState(""); const [preview, setPreview] = useState("");
  const bg = ["from-purple-500 to-pink-500", "from-blue-500 to-teal-500", "from-orange-500 to-red-500", "from-green-500 to-teal-600"][text.length % 4];
  const post = () => {
    if (!text.trim() && !preview) return toast.error("কিছু লিখো বা ছবি দাও");
    const s = { id: "st-" + Date.now(), username: myName(), text: text.trim() || "📸 ছবি Status", image: preview, createdAt: Date.now(), likes: 0 };
    const old = getLocal("sottok_status_list", []); setLocal("sottok_status_list", [s, ...old]); onAdded(s); toast.success("Status দেওয়া হয়ে গেছে ✅ সবাই দেখতে পাবে"); onClose();
  };
  return (
    <div className="fixed inset-0 z-[120] bg-black/80 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-white rounded-t-3xl p-4 text-black" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between"><b>✍️ Status দাও — সবাই দেখতে পাবে</b><button onClick={onClose} className="text-2xl px-2">×</button></div>
        <div className={`mt-3 rounded-2xl p-4 min-h-[120px] bg-gradient-to-br ${bg} flex items-center justify-center`}>{preview ? <img src={preview} className="max-h-[160px] rounded-xl object-cover" alt="" /> : <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="তুমি কী ভাবছো? লিখো... ❤️" className="w-full bg-transparent text-white placeholder-white/80 text-center font-bold text-[16px] outline-none resize-none" rows={3} />}</div>
        {preview && <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ছবির সাথে কিছু লিখো..." className="w-full mt-2 bg-zinc-100 rounded-2xl px-4 py-2.5 text-sm outline-none" />}
        <label className="block mt-3 bg-zinc-100 rounded-2xl py-3 text-center text-sm font-bold cursor-pointer"><ImageIcon className="inline h-4 w-4 mr-1" /> গ্যালারি থেকে ছবি দাও<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} /></label>
        <button onClick={post} className="w-full mt-3 bg-[#fe2c55] text-white rounded-full py-3 font-bold">Status দাও → সবাই দেখবে</button>
      </div>
    </div>
  );
}
function StatusViewer({ statuses, index, onClose, onLike }: any) {
  const [idx, setIdx] = useState(index);
  const s = statuses[idx]; if (!s) return null;
  return (
    <div className="fixed inset-0 z-[130] bg-black text-white flex flex-col">
      <div className="flex gap-1 p-3">{statuses.map((_: any, i: number) => (<div key={i} className={`flex-1 h-1 rounded-full ${i === idx ? "bg-white" : i < idx ? "bg-white/70" : "bg-white/30"}`} />))}</div>
      <div className="flex items-center gap-2 px-4"><div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold">{s.username[0].toUpperCase()}</div><div><p className="font-bold text-sm">{s.username}</p><p className="text-[11px] text-white/60">{timeAgo(s.createdAt)} • সবাই দেখতে পাচ্ছে</p></div><button onClick={onClose} className="ml-auto bg-white/20 p-2 rounded-full"><X className="h-4 w-4" /></button></div>
      <div className="flex-1 flex items-center justify-center p-4" onClick={() => { if (idx < statuses.length - 1) setIdx(idx + 1); else onClose(); }}>{s.image ? <img src={s.image} className="max-h-full max-w-full rounded-2xl object-contain" alt="" /> : <div className="w-full max-w-[320px] aspect-square rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-6 text-center text-[20px] font-bold leading-snug">{s.text}</div>}</div>
      <div className="p-4 flex gap-2"><button onClick={() => onLike(s.id)} className="flex-1 bg-zinc-900 rounded-full py-3 font-bold text-sm">❤️ লাইক ({s.likes || 0})</button><button onClick={() => { if (idx < statuses.length - 1) setIdx(idx + 1); else onClose(); }} className="flex-1 bg-[#fe2c55] rounded-full py-3 font-bold text-sm">পরের Status →</button></div>
    </div>
  );
}

// ===== ✅ নিচে লাইভের জায়গায় পুরো সিস্টেম - স্ট্যাটাস পেজ =====
function StatusPage({ statuses, creators, sounds, onClose, onAddStatus, onOpenStatus, onOpenProfile, onOpenSound, onShowAllCreators }: any) {
  return (
    <div className="fixed inset-0 z-[110] bg-white text-black overflow-y-auto pb-24">
      <div className="sticky top-0 bg-white z-10 flex items-center gap-2 px-3 py-3 border-b border-zinc-200">
        <button onClick={onClose} className="bg-zinc-100 p-2 rounded-full"><X className="h-4 w-4" /></button>
        <p className="font-bold text-[16px]">🟢 স্ট্যাটাস</p>
        <button onClick={onAddStatus} className="ml-auto bg-[#fe2c55] text-white text-[12px] font-bold px-3 py-2 rounded-full">+ Status</button>
      </div>
      {/* 1. Status দেওয়া + দেখা */}
      <div className="px-3 pt-3 pb-3">
        <div className="flex items-center gap-2"><div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white">{myName()[0].toUpperCase()}</div><button onClick={onAddStatus} className="flex-1 text-left bg-zinc-100 rounded-full px-4 py-2.5 text-[13px] text-zinc-500">তুমি কী ভাবছো? Status দাও... ✍️</button></div>
        <div className="flex gap-2 mt-2"><button onClick={onAddStatus} className="flex-1 bg-zinc-100 rounded-full py-2 text-[12px] font-bold flex items-center justify-center gap-1"><Camera className="h-3.5 w-3.5" /> ছবি Status</button><button onClick={onAddStatus} className="flex-1 bg-zinc-100 rounded-full py-2 text-[12px] font-bold">✍️ লেখা Status</button></div>
        <p className="text-[13px] font-bold mt-3">🟢 Status ({statuses.length} জন দিয়েছে) — সবাই দেখতে পাবে</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-2 pb-1">
          <button onClick={onAddStatus} className="flex flex-col items-center shrink-0 w-[72px]"><div className="relative h-[96px] w-[72px] rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center"><div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white">{myName()[0].toUpperCase()}</div><span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#fe2c55] text-white text-[16px] font-bold h-6 w-6 rounded-full flex items-center justify-center">+</span></div><span className="text-[11px] font-medium mt-1">তোমার Status</span></button>
          {statuses.map((s: any, i: number) => (<button key={s.id} onClick={() => onOpenStatus(i)} className="flex flex-col items-center shrink-0 w-[72px]"><div className="relative h-[96px] w-[72px] rounded-xl overflow-hidden border-2 border-[#fe2c55]">{s.image ? <img src={s.image} className="h-full w-full object-cover" alt="" /> : <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-2 text-center text-white text-[11px] font-bold leading-tight">{s.text}</div>}<div className="absolute top-1 left-1 h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-[11px] font-bold text-white border-2 border-white">{s.username[0].toUpperCase()}</div></div><span className="text-[11px] font-medium max-w-[72px] truncate mt-1">{s.username}</span><span className="text-[10px] text-zinc-500">{timeAgo(s.createdAt)}</span></button>))}
          {statuses.length === 0 && <p className="text-[12px] text-zinc-500 self-center">এখনো কেউ Status দেয়নি — তুমিই প্রথম দাও 👆</p>}
        </div>
      </div>
      {/* 2. কারা ভিডিও ছেড়েছে */}
      <div className="px-3 py-2 border-t border-zinc-200 flex items-center justify-between"><p className="text-[13px] font-bold">👥 ভিডিও ছেড়েছে ({creators.length} জন) — {creators.reduce((s: number, c: any) => s + c.count, 0)} টা ভিডিও</p><button onClick={onShowAllCreators} className="text-[12px] text-[#fe2c55] font-bold">সবাইকে দেখো →</button></div>
      <div className="px-3 pb-3 flex gap-3 overflow-x-auto no-scrollbar">{creators.map((c: any) => (<button key={c.sotId || c.username} onClick={() => onOpenProfile(c.sotId || c.username.replace("@", ""))} className="flex flex-col items-center shrink-0 w-[64px]"><div className="relative"><div className="h-14 w-14 rounded-full p-[2px] bg-gradient-to-br from-orange-500 to-pink-600"><div className="h-full w-full rounded-full bg-zinc-200 flex items-center justify-center font-bold text-lg">{c.username.replace("@", "")[0].toUpperCase()}</div></div><span className="absolute -bottom-1 -right-1 bg-[#fe2c55] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">▶ {c.count}</span></div><span className="text-[11px] font-medium max-w-[64px] truncate mt-1">{c.username}</span><span className="text-[10px] text-zinc-500">{c.count} টা ভিডিও</span></button>))}</div>
      {/* 3. ট্রেন্ডিং গান */}
      <div className="px-3 py-2 border-t border-zinc-200"><p className="text-[13px] font-bold">🔥 ট্রেন্ডিং গান - এই গান দিয়ে ভিডিও বানাও</p><div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1">{sounds.map(([s, cnt]: any) => (<button key={s} onClick={() => onOpenSound(s)} className="shrink-0 bg-zinc-100 rounded-full px-3 py-2 text-[12px] font-bold">🎵 {s} • {cnt} টা ভিডিও</button>))}</div></div>
      {/* 4. সব Status-এর লিস্ট */}
      <div className="px-3 py-2 border-t border-zinc-200"><p className="text-[13px] font-bold">📋 সবার Status লিস্ট</p>{statuses.map((s: any, i: number) => (<button key={s.id} onClick={() => onOpenStatus(i)} className="w-full flex items-center gap-3 bg-zinc-100 rounded-2xl p-3 mt-2 text-left"><div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white">{s.username[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-bold text-[14px] truncate">{s.username}</p><p className="text-[12px] text-zinc-500 truncate">{s.text} • {timeAgo(s.createdAt)}</p></div><span className="text-[12px] font-bold text-[#fe2c55]">দেখো →</span></button>))}{statuses.length === 0 && <p className="text-[12px] text-zinc-500 mt-2">এখনো কোনো Status নেই</p>}</div>
    </div>
  );
}

// ===== গান দিয়ে ভিডিও =====
function SoundPage({ sound, allVideos, onClose, onOpenVideo, onUseSound }: any) {
  const list = allVideos.filter((v: any) => v.sound === sound); const first = list[0];
  return (
    <div className="fixed inset-0 z-[95] bg-black text-white overflow-y-auto"><button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2"><X /></button><div className="pt-10 px-4"><div className="flex items-center gap-3"><div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#fe2c55] to-orange-500 flex items-center justify-center text-3xl">🎵</div><div><p className="font-bold text-[16px]">{sound}</p><p className="text-white/60 text-[12px]">Original sound • {first?.username || "@sottok"}</p><p className="text-[12px] text-white/70 mt-0.5">{list.length} জন এই গান দিয়ে ভিডিও বানিয়েছে</p></div></div><button onClick={() => onUseSound(sound)} className="w-full mt-4 bg-[#fe2c55] rounded-full py-3 font-bold text-sm">🎵 এই গান দিয়ে ভিডিও বানাও</button></div><p className="px-4 mt-5 font-bold text-[14px]">🎬 এই গান দিয়ে বানানো ভিডিও ({list.length})</p><div className="grid grid-cols-3 gap-[2px] mt-2 pb-24">{list.map((v: any) => (<div key={v.id} onClick={() => onOpenVideo(v)} className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer"><video src={v.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="absolute bottom-1 left-1 text-[11px]">❤️ {v.likes}</div><p className="absolute top-1 left-1 text-[10px] bg-black/60 px-1.5 rounded-full max-w-[90%] truncate">{v.username}</p></div>))}</div></div>
  );
}
function CreateWithSoundSheet({ sound, onClose }: any) {
  const [caption, setCaption] = useState(""); const [file, setFile] = useState<any>(null);
  const doUpload = async () => { if (!file) return toast.error("একটা ভিডিও বেছে নাও"); toast("আপলোড হচ্ছে..."); try { const { data: { user } } = await supabase.auth.getUser(); if (!user) return toast.error("আগে লগইন করো"); const path = `${user.id}/${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("videos").upload(path, file); if (error) throw error; await supabase.from("videos").insert({ user_id: user.id, video_url: path, caption: caption || `এই গান দিয়ে বানালাম 🎵`, sound_name: sound, visibility: "public" }); toast.success("হয়ে গেছে ✅"); onClose(); window.location.reload(); } catch { toast.error("আপলোড হয়নি"); } };
  return (<div className="fixed inset-0 z-[120] bg-black/80 flex items-end justify-center" onClick={onClose}><div className="w-full max-w-[420px] bg-white rounded-t-3xl p-4 text-black" onClick={(e) => e.stopPropagation()}><div className="flex justify-between"><b>🎵 এই গান দিয়ে ভিডিও বানাও</b><button onClick={onClose} className="text-2xl px-2">×</button></div><p className="text-[12px] text-zinc-500 mt-1 bg-zinc-100 rounded-full px-3 py-2">🎵 {sound}</p><label className="block mt-3 bg-zinc-100 rounded-2xl p-6 text-center cursor-pointer"><p className="text-3xl">📹</p><p className="font-bold text-sm mt-1">{file ? file.name : "গ্যালারি থেকে ভিডিও বেছে নাও"}</p><input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ক্যাপশন লিখো..." className="w-full mt-3 bg-zinc-100 rounded-2xl px-4 py-3 text-sm outline-none" /><button onClick={doUpload} className="w-full mt-3 bg-[#fe2c55] text-white rounded-full py-3 font-bold">🎵 এই গান দিয়ে পোস্ট করো →</button></div></div>);
}

// ===== অন্যের প্রোফাইল =====
function ProfileView({ sotId, onClose, allVideos, onOpenVideo }: any) {
  const [info, setInfo] = useState<any>(null); const [myVideos, setMyVideos] = useState<any[]>([]);
  useEffect(() => { (async () => { try { const { data } = await supabase.from("profiles").select("*").eq("sottok_id", sotId).single(); if (data) setInfo(data); } catch {} const mine = allVideos.filter((v: any) => v.sotId === sotId || v.username.replace("@", "") === sotId); setMyVideos(mine.length ? mine : allVideos.slice(0, 3)); })(); }, [sotId, allVideos]);
  return (<div className="fixed inset-0 z-[90] bg-black text-white overflow-y-auto"><button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2"><X /></button><div className="flex flex-col items-center pt-10 px-4 text-center">{info?.avatar_url ? <img src={info.avatar_url} className="h-24 w-24 rounded-full object-cover border-2 border-white" alt="" /> : <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-4xl font-bold">{(info?.username || sotId || "S")[0].toUpperCase()}</div>}<h2 className="mt-2 font-bold text-lg">@{info?.username || sotId}</h2><p className="text-white/60 text-[12px]">SOT TOK ID: {sotId}</p><p className="text-[13px] text-white/70 mt-1">{info?.bio || "SOT TOK Creator"}</p><p className="mt-2 text-sm">{myVideos.length} টা ভিডিও</p></div><div className="grid grid-cols-3 gap-[2px] mt-5 pb-24">{myVideos.map((v: any) => (<div key={v.id} onClick={() => onOpenVideo(v)} className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer"><video src={v.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="absolute bottom-1 left-1 text-[11px]">❤️ {v.likes}</div><button onClick={(e) => { e.stopPropagation(); void downloadWithWatermark(v); }} className="absolute bottom-1 right-1 bg-black/70 p-1.5 rounded-full"><Download className="h-3.5 w-3.5" /></button></div>))}</div></div>);
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

function VideoCard({ item, muted, onToggleMute, active, liked, onToggleLike, onOpenComments, followed, onFollow, onOpenProfile, onOpenGift, onOpenSound }: any) {
  const ref = useRef<HTMLVideoElement>(null); const [saved, setSaved] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; if (active) { void el.play().catch(() => {}); try { void countView(item.id); } catch {} } else { el.pause(); el.currentTime = 0; } }, [active, item.id]);
  async function share() { const url = `${window.location.origin}/feed`; try { if (navigator.share) await navigator.share({ title: "SOT TOK", text: item.caption, url }); else { await navigator.clipboard.writeText(url); toast.success("লিঙ্ক কপি হয়েছে"); } } catch {} }
  return (
    <section className="snap-item relative h-screen w-full">
      <video ref={ref} src={active ? item.url : undefined} loop muted={muted} playsInline preload="none" onClick={onToggleMute} className="h-full w-full bg-black object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />
      {muted && <span className="absolute right-3 top-14 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">Tap for sound</span>}
      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
        <div className="relative mb-1"><button onClick={onOpenProfile} className="block h-12 w-12 rounded-full border-2 border-white bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white">{item.username.replace("@", "")[0].toUpperCase()}</button><button onClick={onFollow} className={`absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full ${followed ? "bg-white" : "bg-red-600"}`}>{followed ? <Check className="h-3.5 w-3.5 text-red-600" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />}</button></div>
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1"><Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} /><span className="text-[11px] text-white">{formatCompact(item.likes)}</span></button>
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1"><MessageCircle className="h-8 w-8 text-white" /><span className="text-[11px] text-white">{formatCompact(item.comments)}</span></button>
        <button onClick={onOpenGift} className="flex flex-col items-center gap-1"><GiftIcon className="h-8 w-8 text-yellow-400" /><span className="text-[11px] text-white">গিফট</span></button>
        <button onClick={share} className="flex flex-col items-center gap-1"><Share2 className="h-8 w-8 text-white" /><span className="text-[11px] text-white">Share</span></button>
        <button onClick={() => { void downloadWithWatermark(item); }} className="flex flex-col items-center gap-1"><Download className="h-8 w-8 text-white" /><span className="text-[11px] text-white">ডাউনলোড</span></button>
        <button onClick={() => { setSaved(!saved); toast.success(saved ? "সেভ থেকে সরানো হয়েছে" : "সেভ হয়ে গেছে"); }} className="flex flex-col items-center gap-1"><Bookmark className={`h-8 w-8 ${saved ? "fill-yellow-400 text-yellow-400" : "text-white"}`} /><span className="text-[11px] text-white">Save</span></button>
      </div>
      <div className="absolute bottom-24 left-4 right-24"><button onClick={onOpenProfile} className="text-[15px] font-semibold text-white">{item.username}</button><p className="text-[12px] text-white/70">{formatCompact(item.views)} views • ID: {item.sotId || item.username}</p><p className="mt-1 text-[13px] text-white">{item.caption}</p><button onClick={onOpenSound} className="mt-1 flex items-center gap-1 text-[12px] text-white/80"><Music2 className="h-3.5 w-3.5" /> 🎵 {item.sound} • এই গান দিয়ে বানাও</button><button onClick={onOpenSound} className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] text-white backdrop-blur"><Music2 className="h-3.5 w-3.5" /> Use this sound</button></div>
    </section>
  );
}

// ===== ✅ BottomNav এই একই ফাইলে - লাইভ মুছে স্ট্যাটাস =====
function BottomNav({ statusCount, onOpenStatus }: any) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 bg-[#111] border-t border-zinc-800 flex justify-around items-center py-2 px-1 text-white">
      <Link to="/feed" className="flex flex-col items-center gap-0.5 w-[60px]"><Home className="h-6 w-6 text-[#fe2c55]" /><span className="text-[11px] font-bold text-[#fe2c55]">হোম</span><span className="h-1 w-1 rounded-full bg-[#fe2c55]" /></Link>
      <Link to="/feed" className="flex flex-col items-center gap-0.5 w-[60px]"><Compass className="h-6 w-6 text-white/80" /><span className="text-[11px] text-white/70">এক্সপ্লোরার</span></Link>
      {/* ❌ লাইভ মুছে দেওয়া — ✅ এখানে স্ট্যাটাস */}
      <button onClick={onOpenStatus} className="flex flex-col items-center gap-0.5 w-[60px] relative"><span className="relative"><CircleDot className="h-6 w-6 text-green-400" />{statusCount ? <span className="absolute -top-1 -right-2 bg-[#fe2c55] text-[9px] font-bold px-1 rounded-full">{statusCount}</span> : null}</span><span className="text-[11px] font-bold text-green-400">স্ট্যাটাস</span></button>
      <Link to="/upload" className="flex flex-col items-center w-[60px]"><span className="h-10 w-10 rounded-full bg-[#fe2c55] flex items-center justify-center"><Plus className="h-6 w-6 text-white" /></span></Link>
      <Link to="/inbox" className="flex flex-col items-center gap-0.5 w-[60px]"><Bell className="h-6 w-6 text-white/80" /><span className="text-[11px] text-white/70">ইনবক্স</span></Link>
      <Link to="/profile" className="flex flex-col items-center gap-0.5 w-[60px]"><User className="h-6 w-6 text-white/80" /><span className="text-[11px] text-white/70">প্রোফাইল</span></Link>
    </div>
  );
}

function FeedPage() {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const [muted, setMuted] = useState(true); const [tab, setTab] = useState<"following" | "foryou">("foryou");
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(getLocal("sottok_liked", [])));
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({}); const [commentDelta, setCommentDelta] = useState<Record<string, number>>({});
  const [openGift, setOpenGift] = useState<string | null>(null); const [giftAnim, setGiftAnim] = useState<{ emoji: string; name: string } | null>(null);
  const [openComments, setOpenComments] = useState<FeedItem | null>(null); const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const [fullVideo, setFullVideo] = useState<FeedItem | null>(null); const [followSet, setFollowSet] = useState<Set<string>>(() => new Set(getLocal("sottok_follow", [])));
  const [openSound, setOpenSound] = useState<string | null>(null); const [showCreateWithSound, setShowCreateWithSound] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<any[]>(() => getLocal("sottok_status_list", []));
  const [showAddStatus, setShowAddStatus] = useState(false); const [viewStatusIdx, setViewStatusIdx] = useState<number | null>(null);
  const [showStatusPage, setShowStatusPage] = useState(false); const [showAllCreators, setShowAllCreators] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const baseItems = useMemo(() => { const rows = (data?.pages ?? []).flat(); return rows.length ? rows : demoVideos; }, [data]);
  const items = useMemo(() => baseItems.map((i) => ({ ...i, likes: Math.max(0, i.likes + (likeDelta[i.id] ?? 0)), comments: Math.max(0, i.comments + (commentDelta[i.id] ?? 0)) })), [baseItems, likeDelta, commentDelta]);
  const creators = useMemo(() => { const map = new Map<string, any>(); items.forEach((v) => { const key = v.sotId || v.username; if (!map.has(key)) map.set(key, { username: v.username, sotId: v.sotId || v.username, count: 0, totalLikes: 0 }); const c = map.get(key); c.count += 1; c.totalLikes += v.likes || 0; }); return [...map.values()].sort((a, b) => b.count - a.count); }, [items]);
  const sounds = useMemo(() => { const map = new Map<string, number>(); items.forEach((v) => { if (v.sound) map.set(v.sound, (map.get(v.sound) || 0) + 1); }); return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5); }, [items]);
  useEffect(() => { const ids = baseItems.map((i) => i.id).filter((id) => !id.startsWith("demo-")); if (!user || !ids.length) return; let alive = true; void fetchMyLikes(ids, user.id).then((s) => alive && setLikedIds((prev) => new Set([...prev, ...s]))).catch(() => {}); return () => { alive = false; }; }, [baseItems, user]);
  useEffect(() => { const ids = [...new Set(baseItems.map((i) => i.userId).filter((x): x is string => !!x))]; if (!user || !ids.length) return; void fetchFollowingSet(user.id, ids).then((s) => setFollowSet((prev) => new Set([...prev, ...s]))).catch(() => {}); }, [baseItems, user]);
  async function toggleFollow(other?: string) { if (!other) return; const was = followSet.has(other); const next = new Set(followSet); if (was) next.delete(other); else next.add(other); setFollowSet(next); setLocal("sottok_follow", [...next]); if (user) { try { await setFollow(user.id, other, !was); } catch {} } toast.success(was ? "আনফলো করা হয়েছে" : "ফলো করা হয়েছে"); }
  async function toggleLike(id: string) { const wasLiked = likedIds.has(id); const next = new Set(likedIds); if (wasLiked) next.delete(id); else next.add(id); setLikedIds(next); setLocal("sottok_liked", [...next]); setLikeDelta((d) => ({ ...d, [id]: (d[id] ?? 0) + (wasLiked ? -1 : 1) })); if (!wasLiked) toast.success("❤️ লাইক হয়ে গেছে"); if (user && !id.startsWith("demo-")) { try { if (wasLiked) await unlikeVideo(id, user.id); else await likeVideo(id, user.id); } catch {} } }
  const onScroll = useCallback(() => { const el = scrollerRef.current; if (!el) return; const index = Math.round(el.scrollTop / el.clientHeight); setActiveIndex((prev) => (prev === index ? prev : index)); if (hasNextPage && !isFetchingNextPage && index >= items.length - 2) void fetchNextPage(); }, [fetchNextPage, hasNextPage, isFetchingNextPage, items.length]);
  const visibleItems = tab === "foryou" ? items : items.filter((it) => it.userId && followSet.has(it.userId));
  const likeStatus = (id: string) => { setStatuses((prev) => { const next = prev.map((s) => s.id === id ? { ...s, likes: (s.likes || 0) + 1 } : s); setLocal("sottok_status_list", next); return next; }); };
  return (
    <div className="mx-auto w-full max-w-[420px] bg-black">
      {/* ✅ উপরে এখন পরিষ্কার - নীল দাগের Status/Creator/Trending উপরে আর নেই, সব নিচে স্ট্যাটাসে চলে গেছে */}
      <div className="fixed left-1/2 top-0 z-40 flex w-full max-w-[420px] -translate-x-1/2 justify-center gap-6 pt-4 pb-2 bg-black">
        <button onClick={() => setTab("following")} className={tab === "following" ? "text-[15px] font-bold text-white" : "text-[15px] text-white/60"}>Following</button>
        <button onClick={() => setTab("foryou")} className={tab === "foryou" ? "text-[15px] font-bold text-white" : "text-[15px] text-white/60"}>For You</button>
      </div>
      <div ref={scrollerRef} onScroll={onScroll} className="snap-feed no-scrollbar h-screen overflow-y-scroll pt-12">
        {isLoading ? <div className="flex h-screen items-center justify-center text-white/50">লোড হচ্ছে…</div>
        : visibleItems.length === 0 ? <div className="flex h-screen items-center justify-center text-white/60 text-center px-6">এখনো কাউকে ফলো করোনি<br />For You থেকে + চেপে ফলো করো</div>
        : visibleItems.map((item, i) => (<VideoCard key={item.id} item={item} active={i === activeIndex} muted={muted} onToggleMute={() => setMuted((m) => !m)} liked={likedIds.has(item.id)} onToggleLike={() => void toggleLike(item.id)} onOpenComments={() => setOpenComments(item)} followed={!!item.userId && followSet.has(item.userId)} onFollow={() => void toggleFollow(item.userId)} onOpenProfile={() => setOpenProfileId(item.sotId || item.username.replace("@", ""))} onOpenSound={() => setOpenSound(item.sound)} onOpenGift={() => { if (!user) return void toast.error("গিফট পাঠাতে লগইন করুন"); if (item.id.startsWith("demo-")) return void toast.error("ডেমো ভিডিওতে গিফট পাঠানো যাবে না"); if (item.userId === user.id) return void toast.error("নিজের ভিডিওতে গিফট পাঠানো যাবে না"); setOpenGift(item.id); }} />))}
      </div>
      {/* ✅ নিচে লাইভের জায়গায় স্ট্যাটাস চাপ দিলে পুরো সিস্টেম */}
      {showStatusPage && <StatusPage statuses={statuses} creators={creators} sounds={sounds} onClose={() => setShowStatusPage(false)} onAddStatus={() => setShowAddStatus(true)} onOpenStatus={(i: number) => setViewStatusIdx(i)} onOpenProfile={(id: string) => { setShowStatusPage(false); setOpenProfileId(id); }} onOpenSound={(s: string) => { setShowStatusPage(false); setOpenSound(s); }} onShowAllCreators={() => setShowAllCreators(true)} />}
      {showAddStatus && <AddStatusSheet onClose={() => setShowAddStatus(false)} onAdded={(s: any) => setStatuses((p) => [s, ...p])} />}
      {viewStatusIdx !== null && statuses[viewStatusIdx] && <StatusViewer statuses={statuses} index={viewStatusIdx} onClose={() => setViewStatusIdx(null)} onLike={likeStatus} />}
      {showAllCreators && (<div className="fixed inset-0 z-[115] bg-black/80 flex items-end justify-center" onClick={() => setShowAllCreators(false)}><div className="w-full max-w-[420px] bg-white rounded-t-3xl p-4 max-h-[75vh] overflow-y-auto text-black" onClick={(e) => e.stopPropagation()}><div className="flex justify-between"><b>👥 যারা যারা ভিডিও ছেড়েছে ({creators.length} জন)</b><button onClick={() => setShowAllCreators(false)} className="text-2xl px-2">×</button></div><div className="mt-3 space-y-2">{creators.map((c: any, idx: number) => (<button key={c.sotId || c.username} onClick={() => { setShowAllCreators(false); setShowStatusPage(false); setOpenProfileId(c.sotId || c.username.replace("@", "")); }} className="w-full flex items-center gap-3 bg-zinc-100 rounded-2xl p-3 text-left"><span className="text-zinc-400 font-bold text-sm w-5">{idx + 1}</span><div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-lg text-white">{c.username.replace("@", "")[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-bold text-[14px] truncate">{c.username}</p><p className="text-[12px] text-zinc-500">ID: {c.sotId || c.username} • {c.totalLikes} লাইক</p></div><div className="text-right shrink-0"><p className="font-bold text-[14px] text-[#fe2c55]">{c.count} টা</p><p className="text-[11px] text-zinc-500">ভিডিও</p></div></button>))}</div></div></div>)}
      {openComments && <UniversalComments video={openComments} open onClose={() => setOpenComments(null)} onCountChange={(d: number) => setCommentDelta((x) => ({ ...x, [openComments.id]: (x[openComments.id] ?? 0) + d }))} />}
      {openProfileId && <ProfileView sotId={openProfileId} onClose={() => setOpenProfileId(null)} allVideos={items} onOpenVideo={(v: any) => { setOpenProfileId(null); setFullVideo(v); }} />}
      {fullVideo && (<div className="fixed inset-0 z-[95] bg-black flex flex-col"><button onClick={() => setFullVideo(null)} className="absolute top-4 right-4 z-10 bg-black/60 p-2 rounded-full text-white"><X /></button><video src={fullVideo.url} controls autoPlay loop className="flex-1 w-full object-contain" /><div className="p-4 text-white"><p className="font-bold">{fullVideo.username} • ID: {fullVideo.sotId || fullVideo.username}</p><p className="text-[13px] mt-1">{fullVideo.caption}</p><div className="flex gap-5 mt-3"><button onClick={() => toggleLike(fullVideo.id)} className="flex items-center gap-1"><Heart className={`h-6 w-6 ${likedIds.has(fullVideo.id) ? "fill-red-500 text-red-500" : "text-white"}`} />{fullVideo.likes}</button><button onClick={() => setOpenComments(fullVideo)} className="flex items-center gap-1"><MessageCircle className="h-6 w-6" /> কমেন্ট</button><button onClick={() => downloadWithWatermark(fullVideo)} className="flex items-center gap-1"><Download className="h-6 w-6" /> ডাউনলোড</button></div></div></div>)}
      {openSound && <SoundPage sound={openSound} allVideos={items} onClose={() => setOpenSound(null)} onOpenVideo={(v: any) => { setOpenSound(null); setFullVideo(v); }} onUseSound={(s: string) => { setOpenSound(null); setShowCreateWithSound(s); }} />}
      {showCreateWithSound && <CreateWithSoundSheet sound={showCreateWithSound} onClose={() => setShowCreateWithSound(null)} />}
      {openGift && <GiftSheet videoId={openGift} open onClose={() => setOpenGift(null)} onSent={setGiftAnim} />}
      <GiftAnimation gift={giftAnim} onDone={() => setGiftAnim(null)} />
      {/* ✅ একই ফাইলে BottomNav - লাইভ নেই, স্ট্যাটাস আছে */}
      <BottomNav statusCount={statuses.length} onOpenStatus={() => setShowStatusPage(true)} />
    </div>
  );
}