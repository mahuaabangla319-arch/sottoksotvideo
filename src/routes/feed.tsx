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

// ===== FIX 1: ডাউনলোড - Watermark না বসলে সাধারণ ডাউনলোড হবে, আটকাবে না =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে…");
  try {
    // ডেমো ভিডিওতে CORS এর জন্য Watermark বসে না, তাই সরাসরি ডাউনলোড
    if (item.id.startsWith("demo-") || item.url.includes("gtv-videos-bucket")) {
      const a = document.createElement("a");
      a.href = item.url; a.download = `SOTTOK-${item.username.replace("@","")}.mp4`; a.target = "_blank";
      document.body.appendChild(a); a.click(); a.remove();
      toast.success("ডাউনলোড হয়ে গেছে");
      return;
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
      a.href = URL.createObjectURL(blob); a.download = `SOTTOK-${item.username.replace("@","")}.webm`; a.click();
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
    // 30 সেকেন্ডের বেশি হলে অটো বন্ধ
    setTimeout(() => { try { if (rec.state === "recording") rec.stop(); } catch {} }, 30000);
  } catch {
    try { await downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`); } catch {
      window.open(item.url, "_blank");
    }
  }
}

// ===== FIX 2: সবার কমেন্ট - Supabase না থাকলেও লোকালে চলবে =====
function UniversalComments({ videoId, open, onClose, onCountChange }: any) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const local = JSON.parse(localStorage.getItem(`sottok_comments_${videoId}`) || "[]");
    setList(local);
    (async () => {
      try {
        const { data } = await supabase.from("comments").select("*, profiles(username)").eq("video_id", videoId).order("created_at", { ascending: false });
        if (data && data.length) {
          // ডুপ্লিকেট ছাড়া মেশাও
          setList((prev) => {
            const ids = new Set(prev.map((x: any) => String(x.id)));
            const fresh = data.filter((x: any) => !ids.has(String(x.id)));
            return [...prev, ...fresh];
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, [videoId, open]);

  const send = async () => {
    if (!text.trim()) return;
    const savedName = localStorage.getItem("sottok_username") || localStorage.getItem("vigo_user_name") || user?.email?.split("@")[0] || "Guest";
    const newC = { id: "local-" + Date.now(), content: text.trim(), created_at: new Date().toISOString(), profiles: { username: savedName } };
    setList((p) => [newC, ...p]);
    const old = JSON.parse(localStorage.getItem(`sottok_comments_${videoId}`) || "[]");
    localStorage.setItem(`sottok_comments_${videoId}`, JSON.stringify([newC, ...old]));
    setText("");
    toast.success("কমেন্ট হয়ে গেছে ❤️");
    onCountChange?.(1);
    if (user && !videoId.startsWith("demo-")) {
      try { await supabase.from("comments").insert({ video_id: videoId, user_id: user.id, content: newC.content }); } catch {}
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-[420px] max-h-[70vh] bg-[#111] rounded-t-3xl p-4 flex flex-col text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <b>💬 কমেন্ট ({list.length})</b>
          <button onClick={onClose} className="text-2xl leading-none px-2">×</button>
        </div>
        <div className="flex-1 overflow-y-auto mt-3 space-y-3 min-h-[150px]">
          {loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">লোড হচ্ছে…</p>}
          {!loading && list.length === 0 && <p className="text-white/50 text-center text-sm mt-6">এখনো কোনো কমেন্ট নেই<br/>তুমিই প্রথম কমেন্ট করো 👇</p