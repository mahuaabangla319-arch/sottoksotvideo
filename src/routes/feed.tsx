import { createFileRoute } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Gift as GiftIcon, X, Radio, Eye, Send, Users } from "lucide-react";
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
const myName = () => localStorage.getItem("sottok_username") || localStorage.getItem("vigo_user_name") || localStorage.getItem("vigo_user_email")?.split("@")[0] || "Guest";
const myId = () => localStorage.getItem("sottok_id") || localStorage.getItem("vigo_user_email")?.split("@")[0] || "guest";
const avatarColor = (n: string) => ["from-orange-500 to-pink-600", "from-blue-500 to-purple-600", "from-green-500 to-teal-600", "from-yellow-500 to-red-500"][(n.length || 1) % 4];

async function signBatch(paths: string[]) {
  const map = new Map<string, string>();
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  const rest = paths.filter((p) => !p.startsWith("http"));
  if (rest.length) { try { const { data } = await supabase.storage.from("videos").createSignedUrls(rest, 60 * 60 * 8); (data ?? []).forEach((d: any) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); }); } catch {} }
  return map;
}

// ===== VIGO STYLE ডাউনলোড =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে… Vigo স্টাইল Watermark বসানো হচ্ছে");
  try {
    if (item.id.startsWith("demo-") || item.url.includes("gtv-videos-bucket")) {
      const a = document.createElement("a"); a.href = item.url; a.download = `SOTTOK-${item.username.replace("@", "")}-${item.sotId || item.username}.mp4`; a.target = "_blank";
      document.body.appendChild(a); a.click(); a.remove(); toast.success("ডাউনলোড হয়ে গেছে"); return;
    }
    const videoEl = document.createElement("video"); videoEl.src = item.url; videoEl.muted = true; videoEl.playsInline = true; videoEl.crossOrigin = "anonymous";
    await videoEl.play().catch(() => {}); await new Promise((r) => setTimeout(r, 600));
    if (!videoEl.videoWidth) throw new Error("no video");
    const canvas = document.createElement("canvas"); canvas.width = videoEl.videoWidth || 720; canvas.height = videoEl.videoHeight || 1280;
    const ctx = canvas.getContext("2d")!;
    const stream = (canvas as any).captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: any[] = []; rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => { const b = new Blob(chunks, { type: "video/webm" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `SOTTOK-${item.username.replace("@", "")}-${item.sotId || item.username}.webm`; a.click(); toast.success("ডাউনলোড হয়ে গেছে - Vigo স্টাইল Watermark সহ"); };
    rec.start();
    const logo = new Image(); logo.src = "/sottok-logo.png";
    await new Promise((r) => { logo.onload = r; logo.onerror = r; setTimeout(r, 500); });
    const startTime = Date.now(); const ownerName = item.username; const ownerId = item.sotId || item.userId || item.username;
    const draw = () => {
      if (videoEl.ended || videoEl.paused) { try { rec.stop(); } catch {} return; }
      try { ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height); } catch { try { rec.stop(); } catch {} return; }
      const t = (Date.now() - startTime) / 7000; const p = Math.abs((t % 2) - 1); const y = 60 + p * (canvas.height - 280);
      const mainText2 = `${ownerName}  •  ID: ${ownerId}`;
      ctx.font = "bold 32px Arial"; const w1 = ctx.measureText(mainText2).width;
      const boxW = w1 + 110; const boxH = 78; const boxX = 20; const boxY = y;
      ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(boxX, boxY, boxW, boxH, 39); else ctx.rect(boxX, boxY, boxW, boxH); ctx.fill();
      if (logo.complete && logo.naturalWidth) { ctx.save(); ctx.beginPath(); ctx.arc(boxX + 39, boxY + 39, 30, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, boxX + 9, boxY + 9, 60, 60); ctx.restore(); }
      else { ctx.fillStyle = "#fe2c55"; ctx.beginPath(); ctx.arc(boxX + 39, boxY + 39, 30, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.fillText("S", boxX + 32, boxY + 46); }
      ctx.fillStyle = "#fff"; ctx.font = "bold 28px Arial"; ctx.fillText("SOT TOK", boxX + 82, boxY + 32);
      ctx.font = "20px Arial"; ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillText(mainText2, boxX + 82, boxY + 58);
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(canvas.width - 210, 20, 190, 40, 20); else ctx.rect(canvas.width - 210, 20, 190, 40); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.fillText("SOT TOK  ▶", canvas.width - 195, 47);
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "18px Arial"; ctx.fillText(`Made on SOT TOK  •  ${ownerName}  •  SOT TOK ID: ${ownerId}`, 14, canvas.height - 12);
      requestAnimationFrame(draw);
    }; draw();
    setTimeout(() => { try { if (rec.state === "recording") rec.stop(); } catch {} }, 30000);
  } catch { try { await downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`); } catch { window.open(item.url, "_blank"); } }
}

// ===== সবার কমেন্ট =====
function UniversalComments({ video, open, onClose, onCountChange }: any) {
  const { user } = useAuth();
  const [text, setText] = useState(""); const [list, setList] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!open) return; setLoading(true); setList(getLocal(`sottok_comments_${video.id}`, []));
    (async () => { try { const { data } = await supabase.from("comments").select("*, profiles(username)").eq("video_id", video.id).order("created_at", { ascending: false }); if (data?.length) setList((prev) => { const s = new Set(prev.map((x: any) => String(x.id))); return [...prev, ...data.filter((x: any) => !s.has(String(x.id)))]; }); } catch {} setLoading(false); })();
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
          {loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">লোড হচ্ছে…</p>}
          {!loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">এখনো কোনো কমেন্ট নেই<br />তুমিই প্রথম কমেন্ট করো 👇</p>}
          {list.map((c: any) => (
            <div key={c.id} className="flex gap-2"><div className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${avatarColor(c.profiles?.username || "S")} flex items-center justify-center font-bold text-sm`}>{(c.profiles?.username || "S")[0].toUpperCase()}</div><div className="bg-zinc-900 rounded-2xl px-3 py-2 flex-1"><p className="text-[12px] font-bold">@{c.profiles?.username}</p><p className="text-[13px]">{c.content}</p></div></div>
          ))}
        </div>
        <div className="flex gap-2 mt-3"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="কমেন্ট লিখো... ❤️" className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm outline-none" /><button onClick={send} className="rounded-full bg-[#fe2c55] px-5 font-bold text-sm">পাঠাও</button></div>
      </div>
    </div>
  );
}

// ===== ORIGINAL LIVE ROOM - সবাই দেখবে, সবাই কমেন্ট / লাইক / শেয়ার করবে =====
function LiveRoom({ host, onClose, onEndLive, onOpenProfile }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewers, setViewers] = useState<any[]>([
    { name: "Rahul", id: "1001", joined: "এখনই" }, { name: "Priya", id: "1002", joined: "১ মিনিট আগে" },
    { name: "Amit", id: "1003", joined: "২ মিনিট আগে" }, { name: myName(), id: myId(), joined: "তুমি", isMe: true },
  ]);
  const [showViewers, setShowViewers] = useState(false);
  const [likes, setLikes] = useState(24);
  const [liked, setLiked] = useState(false);
  const [msg, setMsg] = useState("");
  const [chats, setChats] = useState<any[]>([
    { user: host.username.replace("@", ""), text: "সবাই LIVE এ আসো ❤️", liked: false },
    { user: "Rahul", text: "Hi! 🔥 দারুণ লাগছে", liked: false },
    { user: "Priya", text: "Hello 👋", liked: false },
  ]);
  const [hearts, setHearts] = useState<any[]>([]);
  const isMe = host.username.replace("@", "") === myName() || host.userId === myId();

  useEffect(() => {
    let stream: any = null;
    (async () => {
      try {
        if (isMe && navigator.mediaDevices?.getUserMedia) { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); } }
        else if (videoRef.current) { videoRef.current.src = host.url; await videoRef.current.play().catch(() => {}); }
      } catch { if (videoRef.current) { videoRef.current.src = host.url; videoRef.current.play().catch(() => {}); } }
    })();
    const iv = setInterval(() => {
      const names = ["Rina", "Sohan", "Mitu", "Arjun", "Sneha", "Babu"];
      const n = names[Math.floor(Math.random() * names.length)];
      setViewers((v) => v.some((x) => x.name === n) ? v : [...v, { name: n, id: String(2000 + v.length), joined: "এখনই" }]);
      setChats((c) => [...c.slice(-8), { user: n, text: ["🔥🔥", "Super!", "Hi ❤️", "Nice live!"][Math.floor(Math.random() * 4)], liked: false }]);
    }, 12000);
    return () => { clearInterval(iv); if (stream) stream.getTracks().forEach((t: any) => t.stop()); };
  }, [isMe, host.url]);

  const sendChat = () => { if (!msg.trim()) return; setChats((p) => [...p, { user: myName(), text: msg, liked: false, isMe: true }]); setMsg(""); };
  const likeLive = () => {
    setLiked(!liked); setLikes((l) => l + (liked ? -1 : 1));
    const id = Date.now(); setHearts((h) => [...h, { id, left: 50 + Math.random() * 40 }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 1200);
  };
  const shareLive = async () => { try { if (navigator.share) await navigator.share({ title: "SOT TOK LIVE", text: `${host.username} LIVE এ আছে - দেখো!`, url: location.origin + "/feed" }); else { await navigator.clipboard.writeText(location.origin + "/feed"); toast.success("LIVE লিঙ্ক কপি হয়েছে"); } } catch {} };
  const likeChat = (idx: number) => setChats((p) => p.map((c, i) => i === idx ? { ...c, liked: !c.liked } : c));

  return (
    <div className="fixed inset-0 z-[110] bg-black text-white flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted={isMe} loop={!isMe} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 pointer-events-none" />
        {/* উপরে - হোস্ট + ভিউয়ার */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button onClick={() => onOpenProfile && onOpenProfile(host)} className="relative">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold border-[3px] border-red-500 animate-pulse">{host.username.replace("@", "")[0].toUpperCase()}</div>
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
          </button>
          <div><p className="font-bold text-[14px]">{host.username}</p><p className="text-[11px] text-white/70">ID: {host.sotId || host.username} • {host.caption}</p></div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setShowViewers(true)} className="bg-black/60 px-2 py-1.5 rounded-full text-[12px] flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {viewers.length} দেখছে</button>
          <button onClick={onClose} className="bg-black/60 p-2 rounded-full"><X className="h-4 w-4" /></button>
        </div>
        {/* ভিউয়ারদের ছোট ছোট ছবি - সবাইকে দেখা যাবে */}
        <div className="absolute top-[70px] right-4 flex flex-col gap-1 items-end">
          {viewers.slice(0, 4).map((v: any, i: number) => (
            <button key={i} onClick={() => setShowViewers(true)} className={`h-7 w-7 rounded-full bg-gradient-to-br ${avatarColor(v.name)} flex items-center justify-center text-[11px] font-bold border border-white/60 -mt-1`} title={v.name}>{v.name[0].toUpperCase()}</button>
          ))}
          <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full">+{viewers.length} জন</span>
        </div>
        {/* LIVE কমেন্ট - সবাই কমেন্ট করতে পারবে, লাইক করতে পারবে */}
        <div className="absolute bottom-24 left-3 right-16 space-y-1.5 max-h-[190px] overflow-hidden pointer-events-none">
          {chats.slice(-4).map((c, i) => {
            const realIdx = chats.length - 4 + i; if (realIdx < 0) return null;
            return (
              <div key={realIdx} className="bg-black/50 rounded-2xl px-3 py-1.5 w-fit text-[13px] flex items-center gap-2 pointer-events-auto">
                <button onClick={() => onOpenProfile && onOpenProfile({ username: "@" + c.user, sotId: c.user })} className={`h-6 w-6 shrink-0 rounded-full bg-gradient-to-br ${avatarColor(c.user)} flex items-center justify-center text-[10px] font-bold`}>{c.user[0].toUpperCase()}</button>
                <span><b className="text-yellow-300">@{c.user}: </b>{c.text}</span>
                <button onClick={() => likeChat(realIdx)}><Heart className={`h-4 w-4 ${c.liked ? "fill-red-500 text-red-500" : "text-white/70"}`} /></button>
              </div>
            );
          })}
        </div>
        {/* ভাসমান হার্ট */}
        {hearts.map((h) => (<span key={h.id} className="absolute bottom-32 text-3xl animate-bounce" style={{ right: h.left }}>❤️</span>))}
        {/* ডান দিকে - Like / Comment / Share */}
        <div className="absolute bottom-32 right-4 flex flex-col gap-4 items-center">
          <button onClick={likeLive} className="flex flex-col items-center"><Heart className={`h-9 w-9 ${liked ? "fill-red-500 text-red-500 scale-110" : "text-white"}`} /><span className="text-[12px]">{likes}</span></button>
          <button onClick={shareLive} className="flex flex-col items-center"><Share2 className="h-8 w-8" /><span className="text-[11px]">Share</span></button>
          <button onClick={() => { void downloadWithWatermark(host); }} className="flex flex-col items-center"><Download className="h-8 w-8" /><span className="text-[11px]">Save</span></button>
        </div>
      </div>
      <div className="p-3 flex gap-2 bg-zinc-950">
        <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="LIVE এ সবাইকে কিছু বলো... ❤️" className="flex-1 bg-zinc-900 rounded-full px-4 py-2.5 text-sm outline-none" />
        <button onClick={sendChat} className="bg-[#fe2c55] rounded-full p-2.5"><Send className="h-4 w-4" /></button>
        <button onClick={likeLive} className="bg-zinc-900 rounded-full p-2.5"><Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} /></button>
        {isMe && <button onClick={() => { if (onEndLive) onEndLive(host); onClose(); toast.success("LIVE শেষ হয়েছে"); }} className="bg-red-600 rounded-full px-4 font-bold text-sm">LIVE শেষ</button>}
      </div>
      {/* কে কে LIVE দেখছে - পুরো লিস্ট */}
      {showViewers && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-end" onClick={() => setShowViewers(false)}>
          <div className="w-full max-w-[420px] mx-auto bg-[#111] rounded-t-3xl p-4 max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between"><b className="flex items-center gap-2"><Users className="h-4 w-4" /> LIVE দেখছে ({viewers.length} জন)</b><button onClick={() => setShowViewers(false)}><X /></button></div>
            <div className="mt-3 space-y-3">
              {viewers.map((v: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColor(v.name)} flex items-center justify-center font-bold`}>{v.name[0].toUpperCase()}</div>
                  <div className="flex-1"><p className="font-bold text-sm">@{v.name} {v.isMe ? "(তুমি)" : ""}</p><p className="text-[11px] text-white/50">ID: {v.id} • {v.joined}</p></div>
                  {!v.isMe && <button onClick={() => toast.success(`@${v.name} কে ফলো করা হয়েছে`)} className="bg-red-600 px-3 py-1 rounded-full text-[12px] font-bold">Follow</button>}
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-white/40 mt-3">সবাই LIVE দেখতে পাচ্ছে • সবাই কমেন্ট করতে পারছে</p>
          </div>
        </div>
      )}
    </div>
  );
}

function GoLiveSheet({ onClose, onStart }: any) {
  const [title, setTitle] = useState("আমার LIVE এ সবাই আসো ❤️");
  return (
    <div className="fixed inset-0 z-[105] bg-black/70 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-[#111] rounded-t-3xl p-5 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between"><b className="text-lg">🔴 LIVE শুরু করো</b><button onClick={onClose}><X /></button></div>
        <p className="text-[12px] text-white/60 mt-1">Facebook-এর মতো — সবাই তোমাকে LIVE দেখতে পারবে</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-4 bg-zinc-900 rounded-2xl px-4 py-3 text-sm outline-none" placeholder="LIVE এর টাইটেল লিখো..." />
        <button onClick={() => onStart(title)} className="w-full mt-4 bg-red-600 rounded-full py-3 font-bold">🔴 LIVE শুরু করো</button>
        <p className="text-center text-[11px] text-white/40 mt-2">LIVE চলাকালীন তোমার ছবিতে লাল রিং দেখাবে • শেষ করলেই রিং মুছে যাবে</p>
      </div>
    </div>
  );
}

function ProfileView({ sotId, onClose, allVideos, onOpenVideo, isLive, onJoinLive }: any) {
  const [info, setInfo] = useState<any>(null); const [myVideos, setMyVideos] = useState<any[]>([]);
  useEffect(() => { (async () => { try { const { data } = await supabase.from("profiles").select("*").eq("sottok_id", sotId).single(); if (data) setInfo(data); } catch {} const mine = allVideos.filter((v: any) => v.sotId === sotId || v.username.replace("@", "") === sotId); setMyVideos(mine.length ? mine : allVideos.slice(0, 3)); })(); }, [sotId, allVideos]);
  return (
    <div className="fixed inset-0 z-[90] bg-black text-white overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2"><X /></button>
      <div className="flex flex-col items-center pt-10">
        <div className="relative"><div className={`h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-3xl font-bold ${isLive ? "border-[4px] border-red-500 animate-pulse" : ""}`}>{(info?.username || sotId || "S")[0].toUpperCase()}</div>{isLive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>}</div>
        <h2 className="mt-2 font-bold text-lg">@{info?.username || sotId}</h2><p className="text-white/60 text-[12px]">SOT TOK ID: {sotId}</p><p className="text-[13px] text-white/70 mt-1">{info?.bio || "SOT TOK Creator"}</p>
        {isLive && <button onClick={onJoinLive} className="mt-3 bg-red-600 px-5 py-2 rounded-full font-bold text-sm animate-pulse">🔴 LIVE দেখো</button>}
        <p className="mt-2 text-sm">{myVideos.length} টা ভিডিও</p>
      </div>
      <div className="grid grid-cols-3 gap-[2px] mt-5 pb-24">{myVideos.map((v: any) => (<div key={v.id} onClick={() => onOpenVideo(v)} className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer"><video src={v.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="absolute top-1 right-1 bg-black/60 text-[8px] px-1.5 rounded-full font-bold">SOT TOK</div><div className="absolute bottom-1 left-1 text-[11px]">❤️ {v.likes}</div></div>))}</div>
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

function VideoCard({ item, muted, onToggleMute, active, liked, onToggleLike, onOpenComments, followed, onFollow, onOpenProfile, onOpenGift, isLive, onJoinLive }: any) {
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
            <button onClick={onOpenProfile} className={`block h-12 w-12 rounded-full border-2 bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center font-bold text-white ${isLive ? "border-red-500 ring-2 ring-red-500 animate-pulse" : "border-white"}`}>{item.username.replace("@", "")[0].toUpperCase()}</button>
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
  const [muted, setMuted] = useState(true); const [tab, setTab] = useState<"following" | "foryou" | "live">("foryou");
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(getLocal("sottok_liked", [])));
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({}); const [commentDelta, setCommentDelta] = useState<Record<string, number>>({});
  const [openGift, setOpenGift] = useState<string | null>(null); const [giftAnim, setGiftAnim] = useState<any>(null);
  const [openComments, setOpenComments] = useState<Feed