import { createFileRoute } from "@tanstack/react-router";
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
  head: () => ({ meta: [{ title: "For You — SOT TOK" }, { name: "description", content: DESC }] }),
  component: FeedPage,
});

type FeedItem = { id: string; userId?: string; sotId?: string; username: string; caption: string; url: string; sound: string; views: number; likes: number; comments: number; };
const PAGE_SIZE = 6;
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

// ===== গ্যালারি থেকে ডাউনলোড করলেই - VIGO ডিজাইনে SOT TOK Watermark =====
// পুরোনো ভিডিও সব থাকবে, শুধু ডাউনলোডের সময় Watermark বসবে
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে… Vigo স্টাইল Watermark বসানো হচ্ছে");
  try {
    const ownerName = item.username;
    const ownerId = item.sotId || item.userId || item.username;

    // গ্যালারির ভিডিও Blob করে আনা - যাতে Watermark বসানো যায়
    let videoUrl = item.url;
    try {
      const res = await fetch(item.url, { mode: "cors" });
      if (res.ok) videoUrl = URL.createObjectURL(await res.blob());
      else { const r2 = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(item.url)}`); if (r2.ok) videoUrl = URL.createObjectURL(await r2.blob()); }
    } catch { try { const r3 = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(item.url)}`); if (r3.ok) videoUrl = URL.createObjectURL(await r3.blob()); } catch {} }

    const v = document.createElement("video");
    v.src = videoUrl; v.muted = true; v.playsInline = true; v.crossOrigin = "anonymous";
    await v.play().catch(() => {});
    await new Promise((r) => { if (v.videoWidth) return r(null); v.onloadedmetadata = () => r(null); setTimeout(() => r(null), 1500); });
    if (!v.videoWidth) throw new Error("x");

    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 720; canvas.height = v.videoHeight || 1280;
    const ctx = canvas.getContext("2d")!;
    const stream = (canvas as any).captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: any[] = []; rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const b = new Blob(chunks, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `SOTTOK-${ownerName.replace("@", "")}-${ownerId}.webm`;
      document.body.appendChild(a); a.click(); a.remove();
      toast.success("ডাউনলোড হয়ে গেছে - Vigo স্টাইল Watermark সহ ✅");
    };
    rec.start(200);

    const logo = new Image(); logo.src = "/sottok-logo.png";
    await new Promise((r) => { logo.onload = r; logo.onerror = r; setTimeout(r, 500); });

    const st = Date.now(); let stopped = false;
    const stopRec = () => { if (!stopped) { stopped = true; try { rec.stop(); } catch {} } };

    const draw = () => {
      if (v.ended) { stopRec(); return; }
      try { ctx.drawImage(v, 0, 0, canvas.width, canvas.height); } catch { stopRec(); return; }

      // ===== VIGO ডিজাইন - উপর-নিচ ঘুরবে, কাটা যাবে না =====
      const t = (Date.now() - st) / 7000;
      const p = Math.abs((t % 2) - 1);
      const y = 60 + p * (canvas.height - 280);

      // 1. বড় Watermark - ঘুরন্ত - Vigo-র মতো
      const txt2 = `${ownerName}  •  ID: ${ownerId}`;
      ctx.font = "bold 32px Arial";
      const w = ctx.measureText(txt2).width + 110;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(20, y, w, 78, 39); else ctx.rect(20, y, w, 78);
      ctx.fill();

      if (logo.complete && logo.naturalWidth) {
        ctx.save(); ctx.beginPath(); ctx.arc(59, y + 39, 30, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(logo, 29, y + 9, 60, 60); ctx.restore();
      } else {
        ctx.fillStyle = "#fe2c55"; ctx.beginPath(); ctx.arc(59, y + 39, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 24px Arial"; ctx.fillText("S", 51, y + 47);
      }

      ctx.fillStyle = "#fff"; ctx.font = "bold 28px Arial"; ctx.fillText("SOT TOK", 102, y + 32);
      ctx.font = "20px Arial"; ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fillText(txt2, 102, y + 58);

      // 2. উপরে ডান দিকে সবসময়
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(canvas.width - 210, 20, 190, 40, 20); else ctx.rect(canvas.width - 210, 20, 190, 40);
      ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.fillText("SOT TOK  ▶", canvas.width - 195, 47);

      // 3. নিচে সবসময় - Vigo-র মতো
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
      ctx.fillStyle = "#fff"; ctx.font = "18px Arial";
      ctx.fillText(`Made on SOT TOK  •  ${ownerName}  •  ID: ${ownerId}`, 14, canvas.height - 12);

      if (!stopped) requestAnimationFrame(draw);
    };
    draw();
    v.onended = () => stopRec();
    setTimeout(() => stopRec(), 30000);
  } catch {
    try { await downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`); } catch { window.open(item.url, "_blank"); }
  }
}

// ===== কমেন্ট - সবাই সব ভিডিওতে =====
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
    <div className="