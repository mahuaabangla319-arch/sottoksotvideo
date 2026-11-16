import { createFileRoute, Link } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Gift as GiftIcon, X, Users, Play, Camera, Image as ImageIcon, Home, Compass, Bell, User, CircleDot, LogOut, ShieldCheck, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GiftSheet } from "@/components/GiftSheet";
import { GiftAnimation } from "@/components/GiftAnimation";
import { useAuth } from "@/lib/auth";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";

const DESC = "ভারতের শর্ট ভিডিও ফিড — ড্যান্স, কমেডি, রান্না আর ফ্যামিলি ভিডিও।";
export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "For You — Short Tok" }, { name: "description", content: DESC }, { property: "og:title", content: "For You — Short Tok" }, { property: "og:description", content: DESC }] }),
  component: FeedPage,
});

type FeedItem = { id: string; userId?: string | undefined; sotId?: string | undefined; username: string; caption: string; url: string; sound: string; views: number; likes: number; comments: number; };
const PAGE_SIZE = 6;
const demoVideos: FeedItem[] = [
  { id: "demo-1", username: "@india_kitchen", caption: "আজকের রেসিপি: ঘরোয়া পনির বাটার মশলা 🔥", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", sound: "Original sound - Short Tok Artist", views: 1000000, likes: 4000, comments: 0 },
  { id: "demo-2", username: "@rannaghor", caption: "৫ মিনিটে চিকেন কারি 🍛", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", sound: "Original sound - Short Tok Artist", views: 820000, likes: 3200, comments: 0 },
  { id: "demo-3", username: "@shorttok_food", caption: "গরম গরম পিঠা 😍", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", sound: "Original sound - Short Tok Artist", views: 610000, likes: 2700, comments: 0 },
];
const getLocal = (k: string, d: any) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
const setLocal = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const myName = () => localStorage.getItem("shorttok_username") || localStorage.getItem("shorttok_user_name") || localStorage.getItem("shorttok_user_email")?.split("@")[0] || "Guest";
const timeAgo = (t: number) => { const d = Date.now() - t; if (d < 60000) return "এখনই"; if (d < 3600000) return `${Math.floor(d / 60000)} মিনিট আগে`; if (d < 86400000) return `${Math.floor(d / 3600000)} ঘণ্টা আগে`; return `${Math.floor(d / 86400000)} দিন আগে`; };
async function signBatch(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const storagePaths = paths.filter((p) => !p.startsWith("http"));
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  if (storagePaths.length) { try { const { data } = await supabase.storage.from("videos").createSignedUrls(storagePaths, 60 * 60 * 8); (data ?? []).forEach((d) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); }); } catch {} }
  return map;
}

// ===== ✅ Gmail লগইন - একবার করলে থেকে যাবে, Log Out না চাপলে যাবে না =====
function usePersistLogin() {
  const { user } = useAuth();
  const [savedUser, setSavedUser] = useState<any>(() => getLocal("shorttok_persist_login", null));
  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        const info = { id: u.id, email: u.email, name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User", avatar: u.user_metadata?.avatar_url || "", at: Date.now() };
        setLocal("shorttok_persist_login", info); localStorage.setItem("shorttok_username", info.name); localStorage.setItem("shorttok_user_email", info.email || ""); localStorage.removeItem("shorttok_logged_out"); setSavedUser(info);
      } else {
        const saved = getLocal("shorttok_persist_login", null); const loggedOut = localStorage.getItem("shorttok_logged_out");
        if (saved && !loggedOut) setSavedUser(saved);
      }
    });
    const { data: l } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        const u = session.user; const info = { id: u.id, email: u.email, name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User", avatar: u.user_metadata?.avatar_url || "", at: Date.now() };
        setLocal("shorttok_persist_login", info); localStorage.setItem("shorttok_username", info.name); localStorage.removeItem("shorttok_logged_out"); setSavedUser(info);
      }
    });
    return () => l.subscription.unsubscribe();
  }, []);
  const loginWithGoogle = async () => { try { const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/feed", queryParams: { prompt: "select_account" } } }); if (error) throw error; } catch { toast.error("Gmail লগইন হয়নি, আবার চেষ্টা করো"); } };
  const logout = async () => {
    if (!confirm("Log Out করতে চাও? এরপর আবার Gmail দিয়ে লগইন করতে হবে।")) return;
    try { await supabase.auth.signOut(); } catch {}
    localStorage.setItem("shorttok_logged_out", "1"); localStorage.removeItem("shorttok_persist_login"); setSavedUser(null); toast.success("Log Out হয়ে গেছে"); window.location.href = "/feed";
  };
  const deleteAccount = async () => {
    if (!confirm("তুমি কি সত্যিই তোমার অ্যাকাউন্ট + সব ভিডিও + Status মুছে ফেলতে চাও? এটা ফেরানো যাবে না।")) return;
    if (!confirm("আবার কনফার্ম করো - অ্যাকাউন্ট ডিলিট হয়ে যাবে।")) return;
    try { const uid = savedUser?.id || user?.id; if (uid) { await supabase.from("videos").delete().eq("user_id", uid); await supabase.from("profiles").delete().eq("id", uid); } await supabase.auth.signOut(); } catch {}
    localStorage.clear(); toast.success("অ্যাকাউন্ট ডিলিট হয়ে গেছে"); window.location.href = "/feed";
  };
  return { currentUser: user || savedUser, showLogin, setShowLogin, loginWithGoogle, logout, deleteAccount };
}
function LoginSheet({ onClose, onGoogle }: any) {
  return (
    <div className="fixed inset-0 z-[140] bg-black/80 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-white rounded-t-3xl p-5 text-black text-center" onClick={(e) => e.stopPropagation()}>
        <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-[#fe2c55] to-orange-500 flex items-center justify-center text-2xl font-bold text-white">S</div>
        <b className="block mt-2 text-[18px]">Short Tok এ স্বাগতম</b>
        <p className="text-[12px] text-zinc-500 mt-1">Gmail দিয়ে একবার লগইন করো — এরপর বারবার লগইন করতে হবে না,<br />যতক্ষণ না তুমি Log Out করছো</p>
        <button onClick={onGoogle} className="w-full mt-4 bg-white border-2 border-zinc-200 rounded-full py-3 font-bold flex items-center justify-center gap-2">G Gmail দিয়ে লগইন করো</button>
        <button onClick={onClose} className="w-full mt-2 bg-zinc-100 rounded-full py-3 font-bold text-sm">পরে করবো — এমনি দেখবো</button>
      </div>
    </div>
  );
}
function PrivacySheet({ onClose }: any) {
  return (
    <div className="fixed inset-0 z-[145] bg-white text-black overflow-y-auto">
      <div className="sticky top-0 bg-white flex items-center gap-2 px-3 py-3 border-b"><button onClick={onClose} className="bg-zinc-100 p-2 rounded-full"><X className="h-4 w-4" /></button><b>Privacy Policy & Terms — Short Tok</b></div>
      <div className="p-4 text-[13px] leading-relaxed space-y-3">
        <p><b>1. আমরা কী নিই:</b> তোমার Gmail নাম, ইমেইল, প্রোফাইল ছবি, তুমি যে ভিডিও / Status দাও — শুধু সেটাই। আমরা তোমার ফোনের কন্ট্যাক্ট, SMS, কল লগ নিই না।</p>
        <p><b>2. কীভাবে ব্যবহার হয়:</b> তোমার ভিডিও সবাইকে দেখাতে, তোমার নাম ভিডিওতে দেখাতে, আর লাইক / কমেন্ট / গিফট গুনতে।</p>
        <p><b>3. ডাউনলোড:</b> তুমি ডাউনলোড করলে ভিডিওতে Short Tok Watermark বসে — এটা আসল মালিককে চিনতে সাহায্য করে।</p>
        <p><b>4. ডিলিট:</b> তুমি চাইলে যেকোনো সময় Status পেজ / প্রোফাইল থেকে <b>Delete Account</b> চাপলে তোমার অ্যাকাউন্ট + ভিডিও + Status মুছে যাবে।</p>
        <p><b>5. বাচ্চাদের জন্য:</b> 13 বছরের নিচে কেউ অ্যাকাউন্ট খুলবে না। খারাপ / নগ্ন / হিংসার ভিডিও দিলে অ্যাকাউন্ট বন্ধ হবে।</p>
        <p><b>6. যোগাযোগ:</b> কোনো সমস্যা হলে অ্যাপের ভিতরে Report বাটন থেকে জানাও।</p>
        <p className="text-zinc-500">Last updated: 2026 • Short Tok • Made in India</p>
        <button onClick={onClose} className="w-full bg-[#fe2c55] text-white rounded-full py-3 font-bold">বুঝেছি, বন্ধ করো</button>
      </div>
    </div>
  );
}

// ===== ডাউনলোড - শুধু ডাউনলোড করলেই Short Tok Watermark, প্লে করলে নয় =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে… Short Tok Watermark বসানো হচ্ছে");
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
    rec.onstop = () => { const b = new Blob(chunks, { type: "video/webm" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `ShortTok-${ownerName.replace("@", "")}-${ownerId}.webm`; document.body.appendChild(a); a.click(); a.remove(); toast.success("ডাউনলোড হয়ে গেছে - Short Tok Watermark সহ"); };
    rec.start(200);
    const logo = new Image(); logo.src = "/shorttok-logo.png";
    await new Promise((r) => { logo.onload = r; logo.onerror = r; setTimeout(r, 500); });
    const startTime = Date.now(); let stopped = false;
    const stopRec = () => { if (!stopped) { stopped = true; try { rec.stop(); } catch {} } };
    const draw = () => {
      if (videoEl.ended) { stopRec(); return; }
      try { ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height); } catch { stopRec(); return; }
      const t = (Date.now() - startTime) / 6000; const progress = Math.abs((t % 2) - 1); const y = 40 + progress * (canvas.height - 140);
      const text = `Short Tok  •  ${ownerName}  •  ID: ${ownerId}`;
      ctx.font = "bold 26px Arial"; const w = ctx.measureText(text).width + 90;
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(canvas.width - w - 20, y, w, 52);
      if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, canvas.width - w - 10, y + 4, 44, 44);
      ctx.fillStyle = "#fff"; ctx.fillText(text, canvas.width - w + 42, y + 34);
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "18px Arial"; ctx.fillText(`Made on Short Tok  •  ${ownerName}  •  ID: ${ownerId}`, 14, canvas.height - 12);
      if (!stopped) requestAnimationFrame(draw);
    }; draw(); videoEl.onended = () => stopRec(); setTimeout(() => stopRec(), 30000);
  } catch { try { await downloadVideo(item.url, `shorttok-${item.id.slice(0, 8)}`); } catch { window.open(item.url, "_blank"); } }
}

function UniversalComments({ video, open, onClose, onCountChange }: any) {
  const { user } = useAuth();
  const [text, setText] = useState(""); const [list, setList] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!open) return; setLoading(true); const local = getLocal(`shorttok_comments_${video.id}`, []); setList(local);
    (async () => { try { const { data } = await supabase.from("comments").select("*, profiles(username)").eq("video_id", video.id).order("created_at", { ascending: false }); if (data && data.length) setList((prev) => { const ids = new Set(prev.map((x: any) => String(x.id))); const fresh = data.filter((x: any) => !ids.has(String(x.id))); return [...prev, ...fresh]; }); } catch {} setLoading(false); })();
  }, [open, video.id]);
  const send = async () => {
    if (!text.trim()) return;
    const savedName = localStorage.getItem("shorttok_username") || localStorage.getItem("shorttok_user_name") || user?.email?.split("@")[0] || myName();
    const newC = { id: "local-" + Date.now(), content: text.trim(), created_at: new Date().toISOString(), profiles: { username: savedName } };
    setList((p) => [newC, ...p]); const old = getLocal(`shorttok_comments_${video.id}`, []); setLocal(`shorttok_comments_${video.id}`, [newC, ...old]); setText(""); toast.success("কমেন্ট হয়ে গেছে ❤️"); if (onCountChange) onCountChange(1);
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
          {list.map((c: any) => (<div key={c.id} className="flex gap-2"><div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-sm">{(c.profiles?.username || "S")[0].toUpperCase()}</div><div className="bg-zinc-900 rounded-2xl px-3 py-2 flex-1"><p className="text-[12px] font-bold">@{c.profiles?.username || "shorttok"}</p><p className="text-[13px]">{c.content}</p></div></div>))}
        </div>
        <div className="flex gap-2 mt-3"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="কমেন্ট লিখো... ❤️" className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm outline-none text-white" /><button onClick={send} className="rounded-full bg-[#fe2c55] px-5 font-bold text-sm text-white">পাঠাও</button></div>
      </div>
    </div>
  );
}

function AddStatusSheet({ onClose, onAdded }: any) {
  const [text, setText] = useState(""); const [preview, setPreview] = useState("");
  const bg = ["from-purple-500 to-pink-500", "from-blue-500 to-teal-500", "from-orange-500 to-red-500", "from-green-500 to-teal-600"][text.length % 4];
  const post = () => {
    if (!text.trim() && !preview) return toast.error("কিছু লিখো বা ছবি দাও");
    const s = { id: "st-" + Date.now(), username: myName(), text: text.trim() || "📸 ছবি Status", image: preview, createdAt: Date.now(), likes: 0 };
    const old = getLocal("shorttok_status_list", []); setLocal("shorttok_status_list", [s, ...old]); onAdded(s); toast.success("Status দেওয়া হয়ে গেছে ✅ সবাই দেখতে পাবে"); onClose();
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
function StatusPage({ statuses, creators, sounds, currentUser, onLogout, onLogin, onDeleteAccount, onPrivacy, onClose, onAddStatus, onOpenStatus, onOpenProfile, onOpenSound, onShowAllCreators }: any) {
  return (
    <div className="fixed inset-0 z-[110] bg-white text-black overflow-y-auto pb-24">
      <div className="sticky top-0 bg-white z-10 flex items-center gap-2 px-3 py-3 border-b border-zinc-200">
        <button onClick={onClose} className="bg-zinc-100 p-2 rounded-full"><X className="h-4 w-4" /></button>
        <p className="font-bold text-[16px]">🟢 স্ট্যাটাস</p>
        <button onClick={onAddStatus} className="ml-auto bg-[#fe2c55] text-white text-[12px] font-bold px-3 py-2 rounded-full">+ Status</button>
      </div>
      <div className="mx-3 mt-3 bg-zinc-100 rounded-2xl p-3 flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white">{currentUser ? (currentUser.name?.[0] || "S").toUpperCase() : "?"}</div>
        <div className="flex-1 min-w-0"><p className="font-bold text-[14px] truncate">{currentUser ? `👋 ${currentUser.name || currentUser.email}` : "লগইন করোনি"}</p><p className="text-[12px] text-zinc-500">{currentUser ? "লগইন থেকে যাবে • Log Out না চাপলে যাবে না" : "Gmail দিয়ে একবার লগইন করো — এরপর চাইবে না"}</p></div>
        {currentUser ? <button onClick={onLogout} className="bg-red-600 text-white text-[12px] font-bold px-3 py-2 rounded-full flex items-center gap-1 shrink-0"><LogOut className="h-3.5 w-3.5" /> Log Out</button> : <button onClick={onLogin} className="bg-white border-2 border-zinc-200 text-[12px] font-bold px-3 py-2 rounded-full shrink-0">G Gmail লগইন</button>}
      </div>
      <div className="mx-3 mt-2 bg-zinc-100 rounded-2xl p-3">
        <p className="font-bold text-[13px] flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> অ্যাকাউন্ট & সুরক্ষা</p>
        <div className="flex gap-2 mt-2">
          <button onClick={onPrivacy} className="flex-1 bg-white rounded-full py-2 text-[12px] font-bold flex items-center justify-center gap-1"><FileText className="h-3.5 w-3.5" /> Privacy Policy</button>
          {currentUser && <button onClick={onDeleteAccount} className="flex-1 bg-red-100 text-red-600 rounded-full py-2 text-[12px] font-bold flex items-center justify-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Account Delete</button>}
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">Delete চাপলে তোমার অ্যাকাউন্ট + সব ভিডিও চিরতরে মুছে যাবে।</p>
      </div>
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
      <div className="px-3 py-2 border-t border-zinc-200 flex items-center justify-between"><p className="text-[13px] font-bold">👥 ভিডিও ছেড়েছে ({creators.length} জন) — {creators.reduce((s: number, c: any) => s + c.count, 0)} টা ভিডিও</p><button onClick={onShowAllCreators} className="text-[12px] text-[#fe2c55] font-bold">সবাইকে দেখো →</button></div>
      <div className="px-3 pb-3 flex gap-3 overflow-x-auto no-scrollbar">{creators.map((c: any) => (<button key={c.sotId || c.username} onClick={() => onOpenProfile(c.sotId || c.username.replace("@", ""))} className="flex flex-col items-center shrink-0 w-[64px]"><div className="relative"><div className="h-14 w-14 rounded-full p-[2px] bg-gradient-to-br from-orange-500 to-pink-600"><div className="h-full w-full rounded-full bg-zinc-200 flex items-center justify-center font-bold text-lg">{c.username.replace("@", "")[0].toUpperCase()}</div></div><span className="absolute -bottom-1 -right-1 bg-[#fe2c55] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">▶ {c.count}</span></div><span className="text-[11px] font-medium max-w-[64px] truncate mt-1">{c.username}</span><span className="text-[10px] text-zinc-500">{c.count} টা ভিডিও</span></button>))}</div>
      <div className="px-3 py-2 border-t border-zinc-200"><p className="text-[13px] font-bold">🔥 ট্রেন্ডিং গান - এই গান দিয়ে ভিডিও বানাও</p><div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1">{sounds.map(([s, cnt]: any) => (<button key={s} onClick={() => onOpenSound(s)} className="shrink-0 bg-zinc-100 rounded-full px-3 py-2 text-[12px] font-bold">🎵 {s} • {cnt} টা ভিডিও</button>))}</div></div>
      <div className="px-3 py-2 border-t border-zinc-200"><p className="text-[13px] font-bold">📋 সবার Status লিস্ট</p>{statuses.map((s: any, i: number) => (<button key={s.id} onClick={() => onOpenStatus(i)} className="w-full flex items-center gap-3 bg-zinc-100 rounded-2xl p-3 mt-2 text-left"><div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white">{s.username[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-bold text-[14px] truncate">{s.username}</p><p className="text-[12px] text-zinc-500 truncate">{s.text} • {timeAgo(s.createdAt)}</p></div><span className="text-[12px] font-bold text-[#fe2c55]">দেখো →</span></button>))}{statuses.length === 0 && <p className="text-[12px] text-zinc-500 mt-2">এখনো কোনো Status নেই</p>}</div>
    </div>
  );
}

function SoundPage({ sound, allVideos, onClose, onOpenVideo, onUseSound }: any) {
  const list = allVideos.filter((v: any) => v.sound === sound); const first = list[0];
  return (
    <div className="fixed inset-0 z-[95] bg-black text-white overflow-y-auto"><button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2"><X /></button><div className="pt-10 px-4"><div className="flex items-center gap-3"><div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#fe2c55] to-orange-500 flex items-center justify-center text-3xl">🎵</div><div><p className="font-bold text-[16px]">{sound}</p><p className="text-white/60 text-[12px]">Original sound • {first?.username || "@shorttok"}</p><p className="text-[12px] text-white/70 mt-0.5">{list.length} জন এই গান দিয়ে ভিডিও বানিয়েছে</p></div></div><button onClick={() => onUseSound(sound)} className="w-full mt-4 bg-[#fe2c55] rounded-full py-3 font-bold text-sm">🎵 এই গান দিয়ে ভিডিও বানাও</button></div><p className="px-4 mt-5 font-bold text-[14px]">🎬 এই গান দিয়ে বানানো ভিডিও ({list.length})</p><div className="grid grid-cols-3 gap-[2px] mt-2 pb-24">{list.map((v: any) => (<div key={v.id} onClick={() => onOpenVideo(v)} className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer"><video src={v.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="absolute bottom-1 left-1 text-[11px]">❤️ {v.likes}</div><p className="absolute top-1 left-1 text-[10px] bg-black/60 px-1.5 rounded-full max-w-[90%] truncate">{v.username}</p></div>))}</div></div>
  );
}
function CreateWithSoundSheet({ sound, onClose }: any) {
  const [caption, setCaption] = useState(""); const [file, setFile] = useState<any>(null);
  const doUpload = async () => { if (!file) return toast.error("একটা ভিডিও বেছে নাও"); toast("আপলোড হচ্ছে..."); try { const { data: { user } } = await supabase.auth.getUser(); if (!user) return toast.error("আগে লগইন করো"); const path = `${user.id}/${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("videos").upload(path, file); if (error) throw error; await supabase.from("videos").insert({ user_id: user.id, video_url: path, caption: caption || `এই গান দিয়ে বানালাম 🎵`, sound_name: sound, visibility: "public" }); toast.success("হয়ে গেছে ✅"); onClose(); window.location.reload(); } catch { toast.error("আপলোড হয়নি"); } };
  return (<div className="fixed inset-0 z-[120] bg-black/80 flex items-end justify-center" onClick={onClose}><div className="w-full max-w-[420px] bg-white rounded-t-3xl p-4 text-black" onClick={(e) => e.stopPropagation()}><div className="flex justify-between"><b>🎵 এই গান দিয়ে ভিডিও বানাও</b><button onClick={onClose} className="text-2xl px-2">×</button></div><p className="text-[12px] text-zinc-500 mt-1 bg-zinc-100 rounded-full px-3 py-2">🎵 {sound}</p><label className="block mt-3 bg-zinc-100 rounded-2xl p-6 text-center cursor-pointer"><p className="text-3xl">📹</p><p className="font-bold text-sm mt-1">{file ? file.name : "গ্যালারি থেকে ভিডিও বেছে নাও"}</p><input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ক্যাপশন লিখো..." className="w-full mt-3 bg-zinc-100 rounded-2xl px-4 py-3 text-sm outline-none" /><button onClick={doUpload} className="w-full mt-3 bg-[#fe2c55] text-white rounded-full py-3 font-bold">🎵 এই গান দিয়ে পোস্ট করো →</button></div></div>);
}

function ProfileView({ sotId, onClose, allVideos, onOpenVideo, currentUser, onLogout, onLogin }: any) {
  const [info, setInfo] = useState<any>(null); const [myVideos, setMyVideos] = useState<any[]>([]);
  useEffect(() => { (async () => { try { const { data } = await supabase.from("profiles").select("*").eq("sottok_id", sotId).single(); if (data) setInfo(data); } catch {} const mine = allVideos.filter((v: any) => v.sotId === sotId || v.username.replace("@", "") === sotId); setMyVideos(mine.length ? mine : allVideos.slice(0, 3)); })(); }, [sotId, allVideos]);
  const isMe = currentUser && (currentUser.name === (info?.username || sotId) || currentUser.email?.split("@")[0] === sotId);
  return (<div className="fixed inset-0 z-[90] bg-black text-white overflow-y-auto"><button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2"><X /></button><div className="flex flex-col items-center pt-10 px-4 text-center">{info?.avatar_url ? <img src={info.avatar_url} className="h-24 w-24 rounded-full object-cover border-2 border-white" alt="" /> : <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-4xl font-bold">{(info?.username || sotId || "S")[0].toUpperCase()}</div>}<h2 className="mt-2 font-bold text-lg">@{info?.username || sotId}</h2><p className="text-white/60 text-[12px]">Short Tok ID: {sotId}</p><p className="text-[13px] text-white/70 mt-1">{info?.bio || "Short Tok Creator"}</p><p className="mt-2 text-sm">{myVideos.length} টা ভিডিও</p>{currentUser ? <button onClick={onLogout} className="mt-3 bg-red-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1"><LogOut className="h-4 w-4" /> Log Out</button> : <button onClick={onLogin} className="mt-3 bg-white text-black px-4 py-2 rounded-full text-sm font-bold">G Gmail লগইন</button>}{isMe && <p className="text-[11px] text-green-400 mt-1">✅ তুমি লগইন আছো — Log Out না চাপলে লগইন থাকবে</p>}</div><div className="grid grid-cols-3 gap-[2px] mt-5 pb-24">{myVideos.map((v: any) => (<div key={v.id} onClick={() => onOpenVideo(v)} className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer"><video src={v.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="absolute bottom-1 left-1 text-[11px]">❤️ {v.likes}</div><button onClick={(e) => { e.stopPropagation(); void downloadWithWatermark(v); }} className="absolute bottom-1 right-1 bg-black/70 p-1.5 rounded-full"><Download className="h-3.5 w-3.5" /></button></div>))}</div></div>);
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
        return rows.map((v) => { const lc = getLocal(`shorttok_comments_${v.id}`, []).length; return { id: v.id, userId: v.user_id, sotId: sotById.get(v.user_id), username: "@" + (nameById.get(v.user_id) || "shorttok"), caption: v.caption, url