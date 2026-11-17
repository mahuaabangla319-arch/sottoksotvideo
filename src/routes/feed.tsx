// @ts-nocheck
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { X, Camera, Image as ImageIcon, Bell, Check, Music2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;
export const Route = createFileRoute("/upload")({ component: UploadPage });
export function pushNotify(title: string, msg: string) {
  try {
    const old = JSON.parse(localStorage.getItem("shorttok_notifications") || "[]");
    const n = { id: Date.now(), title, msg, time: Date.now(), read: false };
    localStorage.setItem("shorttok_notifications", JSON.stringify([n, ...old].slice(0, 50)));
    if ("Notification" in window && Notification.permission === "granted") { try { new Notification(title, { body: msg }); } catch {} }
  } catch {}
}
const SONGS = [
  { name: "Original sound - Short Tok Artist", url: "" },
  { name: "🔥 Trending Beat - Short Tok", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "💃 Dance Beat - Short Tok", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "😂 Funny Beat - Short Tok", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { name: "❤️ Romantic - Short Tok", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { name: "🍛 Cooking Vibe - Short Tok", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
];
function UploadPage() {
  const nav = useNavigate();
  const [caption, setCaption] = useState("");
  const [songIdx, setSongIdx] = useState(0);
  const [file, setFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mode, setMode] = useState<"camera" | "gallery">("gallery");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [notifOn, setNotifOn] = useState(() => { try { return localStorage.getItem("shorttok_notif_on") !== "off"; } catch { return true; } });
  const videoRef = useRef<any>(null);
  const musicRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const recorderRef = useRef<any>(null);
  const chunksRef = useRef<any[]>([]);
  const song = SONGS[songIdx];

  useEffect(() => { if ("Notification" in window && Notification.permission === "default" && notifOn) { Notification.requestPermission().catch(() => {}); } }, []);
  useEffect(() => { return () => { stopCamera(); stopMusic(); }; }, []);

  function stopCamera() { try { streamRef.current?.getTracks().forEach((t: any) => t.stop()); streamRef.current = null; } catch {} try { if (videoRef.current) videoRef.current.srcObject = null; } catch {} setCameraOn(false); setRecording(false); }
  function playMusic() { if (!song.url) { toast("এই গানটা Original sound — নিজের মুখে বলো / গান গাও"); return; } try { if (musicRef.current) { musicRef.current.currentTime = 0; musicRef.current.play(); setMusicPlaying(true); } } catch {} }
  function stopMusic() { try { musicRef.current?.pause(); } catch {} setMusicPlaying(false); }

  async function startCamera() {
    setCameraError(""); setMode("camera"); stopMusic();
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError("এই ব্রাউজারে ক্যামেরা চলবে না। Chrome দিয়ে খোলো।"); return; }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
      setCameraOn(true); toast.success("📷 ক্যামেরা চালু হয়ে গেছে");
    } catch (e: any) {
      if (e?.name === "NotAllowedError") setCameraError("❌ ক্যামেরা Block আছে। উপরে URL এর পাশে 🔒 তালা → Camera → Allow → Refresh করো।");
      else if (e?.name === "NotFoundError") setCameraError("❌ ফোনে ক্যামেরা পাওয়া যাচ্ছে না। গ্যালারি থেকে নাও।");
      else if (e?.name === "NotReadableError") setCameraError("❌ ক্যামেরা অন্য অ্যাপ ব্যবহার করছে। WhatsApp / ক্যামেরা অ্যাপ বন্ধ করে আবার চেষ্টা করো।");
      else setCameraError("❌ ক্যামেরা খুলছে না। Refresh করে আবার চেষ্টা করো।");
      setCameraOn(false);
    }
  }
  function startRecording() {
    if (!streamRef.current) return toast.error("আগে ক্যামেরা চালু করো");
    try {
      chunksRef.current = [];
      const mime = (window as any).MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
      const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
      recorderRef.current = rec;
      rec.ondataavailable = (e: any) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => { const blob = new Blob(chunksRef.current, { type: "video/webm" }); const f = new File([blob], `camera-${Date.now()}.webm`, { type: "video/webm" }); setFile(f); setPreviewUrl(URL.createObjectURL(blob)); stopMusic(); toast.success("✅ রেকর্ড হয়ে গেছে — এবার নিচে পোস্ট করো"); };
      rec.start(200); setRecording(true);
      if (song.url) playMusic();
      toast("🔴 রেকর্ড হচ্ছে + গান বাজছে... শেষ করতে থামাও চাপ দাও");
    } catch { toast.error("রেকর্ড শুরু হয়নি"); }
  }
  function stopRecording() { try { recorderRef.current?.stop(); } catch {} setRecording(false); stopMusic(); }
  function onGalleryFile(f: any) { if (!f) return; setMode("gallery"); stopCamera(); stopMusic(); setFile(f); setPreviewUrl(URL.createObjectURL(f)); toast.success("✅ ভিডিও নেওয়া হয়ে গেছে — এবার গান বেছে লিপসিং দেখো"); }
  function toggleNotif() {
    const next = !notifOn; setNotifOn(next);
    try { localStorage.setItem("shorttok_notif_on", next ? "on" : "off"); } catch {}
    if (next) { if ("Notification" in window) Notification.requestPermission().then((p) => { if (p === "granted") { toast.success("🔔 নোটিফিকেশন চালু"); pushNotify("Short Tok", "নোটিফিকেশন চালু হয়ে গেছে ✅"); } else toast.error("নোটিফিকেশন Block আছে — ব্রাউজার সেটিং থেকে Allow করো"); }); }
    else toast.success("🔕 নোটিফিকেশন বন্ধ");
  }
  async function doPost() {
    if (!file) return toast.error("আগে ক্যামেরা দিয়ে রেকর্ড করো বা গ্যালারি থেকে ভিডিও নাও");
    if (uploading) return; setUploading(true); stopMusic(); toast("আপলোড হচ্ছে... একটু অপেক্ষা করো");
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { toast.error("আগে Gmail দিয়ে লগইন করো"); setUploading(false); nav({ to: "/feed" }); return; }
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await sb.storage.from("videos").upload(path, file, { contentType: file.type || "video/webm", upsert: true });
      if (upErr) throw upErr;
      const { error: dbErr } = await sb.from("videos").insert({ user_id: user.id, video_url: path, caption: caption.trim() || "Short Tok থেকে পোস্ট করলাম ❤️", sound_name: song.name, visibility: "public", views: 0, likes: 0 });
      if (dbErr) throw dbErr;
      // ⚡ ফিড যাতে সাথে সাথে নতুন ভিডিও দেখায় - এই ২টা লাইনই আসল ফিক্স
      try { localStorage.setItem("shorttok_just_posted", String(Date.now())); localStorage.setItem("shorttok_new_video", JSON.stringify({ caption: caption.trim(), sound: song.name, time: Date.now() })); } catch {}
      pushNotify("✅ ভিডিও পোস্ট হয়ে গেছে", "তোমার ভিডিও এখন সবার ফিডে যাবে");
      toast.success("✅ পোস্ট হয়ে গেছে — এখন সবার কাছে যাবে");
      stopCamera(); stopMusic();
      setTimeout(() => { window.location.href = "/feed?fresh=" + Date.now(); }, 700);
    } catch (e: any) {
      if (String(e?.message || "").includes("policy") || String(e?.message || "").includes("row-level")) toast.error("পোস্ট হয়নি — Supabase Policy বন্ধ আছে। আমাকে বলো, আমি Policy ঠিক করে দেবো।");
      else toast.error("আপলোড হয়নি, নেট চেক করে আবার চেষ্টা করো");
    } finally { setUploading(false); }
  }
  return (
    <div className="mx-auto w-full max-w-[420px] bg-black text-white min-h-screen pb-24">
      <div className="flex items-center gap-2 px-3 py-3 sticky top-0 bg-black z-10">
        <Link to="/feed" className="bg-zinc-800 p-2 rounded-full"><X className="h-4 w-4" /></Link>
        <b className="text-[17px]">📹 ভিডিও পোস্ট করো</b>
        <button onClick={toggleNotif} className={`ml-auto flex items-center gap-1 text-[12px] font-bold px-3 py-2 rounded-full ${notifOn ? "bg-[#fe2c55]" : "bg-zinc-800"}`}><Bell className="h-4 w-4" /> {notifOn ? "🔔 অন" : "🔕 বন্ধ"}</button>
      </div>
      <audio ref={musicRef} src={song.url} loop preload="auto" />
      <div className="px-3">
        <div className="flex gap-2 mt-1">
          <button onClick={startCamera} className={`flex-1 py-2.5 rounded-full text-[13px] font-bold flex items-center justify-center gap-1 ${mode === "camera" ? "bg-[#fe2c55]" : "bg-zinc-800"}`}><Camera className="h-4 w-4" /> 📷 ক্যামেরা</button>
          <label className={`flex-1 py-2.5 rounded-full text-[13px] font-bold flex items-center justify-center gap-1 cursor-pointer ${mode === "gallery" ? "bg-white text-black" : "bg-zinc-800"}`}><ImageIcon className="h-4 w-4" /> 🖼️ গ্যালারি<input type="file" accept="video/*" className="hidden" onChange={(e) => onGalleryFile(e.target.files?.[0])} /></label>
        </div>
        <div className="mt-3 rounded-2xl overflow-hidden bg-zinc-900 aspect-[9/16] relative flex items-center justify-center">
          {mode === "camera" ? (<>
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />
            {!cameraOn && !cameraError && <div className="text-center p-4"><p className="text-4xl">📷</p><p className="text-sm mt-2 text-white/70">ক্যামেরা চালু করতে উপরে<br />📷 ক্যামেরা বাটনে চাপ দাও</p><button onClick={startCamera} className="mt-3 bg-[#fe2c55] px-5 py-2.5 rounded-full font-bold text-sm">📷 ক্যামেরা চালু করো</button></div>}
            {cameraError && <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center"><p className="text-[13px] leading-relaxed">{cameraError}</p><button onClick={startCamera} className="mt-3 bg-[#fe2c55] px-5 py-2.5 rounded-full font-bold text-sm">আবার চেষ্টা করো</button></div>}
            {cameraOn && <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2"><button onClick={recording ? stopRecording : startRecording} className={`px-4 py-3 rounded-full font-bold text-sm ${recording ? "bg-white text-red-600" : "bg-red-600"}`}>{recording ? "⏹️ থামাও" : "🔴 রেকর্ড + গান"}</button><button onClick={stopCamera} className="bg-zinc-800 px-3 py-3 rounded-full font-bold text-sm">বন্ধ</button></div>}
            {recording && <span className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-full text-[12px] font-bold animate-pulse">🔴 REC + 🎵 গান বাজছে</span>}
          </>) : previewUrl ? (<video src={previewUrl} controls autoPlay loop className="h-full w-full object-cover" />) : (
            <label className="text-center cursor-pointer p-6"><p className="text-5xl">📹</p><p className="font-bold mt-2">গ্যালারি থেকে ভিডিও নাও</p><p className="text-[12px] text-white/60 mt-1">বা উপরে 📷 ক্যামেরা চাপ দিয়ে<br />সরাসরি রেকর্ড করো</p><span className="inline-block mt-3 bg-[#fe2c55] px-5 py-2.5 rounded-full font-bold text-sm">ভিডিও বেছে নাও</span><input type="file" accept="video/*" className="hidden" onChange={(e) => onGalleryFile(e.target.files?.[0])} /></label>
          )}
        </div>
        {file && <p className="text-[12px] text-green-400 mt-2 flex items-center gap-1"><Check className="h-4 w-4" /> ভিডিও রেডি — এবার গান বেছে লিপসিং করে পোস্ট করো</p>}
        <div className="mt-3 bg-zinc-900 rounded-2xl p-3">
          <p className="font-bold text-[13px] flex items-center gap-1"><Music2 className="h-4 w-4" /> 🎵 গান বেছে নাও — লিপসিং এর জন্য</p>
          <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
            {SONGS.map((s, i) => (<button key={s.name} onClick={() => { setSongIdx(i); stopMusic(); }} className={`shrink-0 px-3 py-2 rounded-full text-[12px] font-bold ${i === songIdx ? "bg-[#fe2c55] text-white" : "bg-zinc-800"}`}>{s.name}</button>))}
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => { if (musicPlaying) stopMusic(); else playMusic(); }} className="flex-1 bg-white text-black rounded-full py-2.5 font-bold text-[13px] flex items-center justify-center gap-1">{musicPlaying ? <><Square className="h-4 w-4" /> গান থামাও</> : <><Play className="h-4 w-4" /> ▶️ গান বাজিয়ে লিপসিং দেখো</>}</button>
            <span className="bg-zinc-800 rounded-full px-3 py-2.5 text-[12px] flex items-center">{musicPlaying ? "🎵 বাজছে..." : "🎵 " + song.name.slice(0, 18)}</span>
          </div>
          <p className="text-[11px] text-white/50 mt-1">গান বাজতে বাজতে ক্যামেরায় রেকর্ড করো বা গ্যালারির ভিডিওর সাথে গান শুনে লিপসিং করো।</p>
        </div>
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ক্যাপশন লিখো... যেমন: এই গানে লিপসিং 😂" className="w-full mt-3 bg-zinc-900 rounded-2xl px-4 py-3 text-sm outline-none" />
        <button onClick={doPost} disabled={uploading || !file} className={`w-full mt-3 rounded-full py-3.5 font-bold ${!file ? "bg-zinc-800 text-white/50" : "bg-[#fe2c55] text-white"}`}>{uploading ? "⏳ আপলোড হচ্ছে... অপেক্ষা করো" : file ? "📹 পোস্ট করো → সবার কাছে যাবে" : "আগে ভিডিও নাও"}</button>
        <button onClick={() => { if ("Notification" in window) Notification.requestPermission().then(() => toast.success("নোটিফিকেশন চেক করো")); pushNotify("Short Tok Test", "নোটিফিকেশন ঠিকঠাক কাজ করছে ✅"); }} className="w-full mt-2 bg-zinc-900 rounded-full py-3 font-bold text-sm">🔔 নোটিফিকেশন টেস্ট করো</button>
        <p className="text-[11px] text-white/50 text-center mt-2">ক্যামেরা না খুললে: Chrome দিয়ে খোলো → URL এর পাশে 🔒 → Camera Allow → Refresh</p>
      </div>
    </div>
  );
}