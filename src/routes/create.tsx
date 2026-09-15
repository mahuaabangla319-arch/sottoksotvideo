import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  Video,
  Image as ImageIcon,
  Zap,
  ZapOff,
  SwitchCamera,
  Gauge,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth";
import { awardVideoCoins } from "@/lib/coins";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "নতুন ভিডিও — SOT TOK" },
      { name: "description", content: "ক্যামেরা দিয়ে ১৫ বা ৩০ সেকেন্ডের ভিডিও রেকর্ড করে SOT TOK-এ পোস্ট করুন।" },
      { property: "og:title", content: "নতুন ভিডিও — SOT TOK" },
      { property: "og:description", content: "ক্যামেরা দিয়ে ১৫ বা ৩০ সেকেন্ডের ভিডিও রেকর্ড করে পোস্ট করুন।" },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  const [mode, setMode] = useState<"record" | "gallery">("record");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [torch, setTorch] = useState(false);
  const [limit, setLimit] = useState<15 | 30>(15);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPermission("granted");
    } catch {
      setPermission("denied");
    }
  }, [facing, stopStream]);

  useEffect(() => {
    if (mode === "record" && !previewUrl) void startCamera();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [mode, facing, previewUrl, startCamera]);

  useEffect(() => stopStream, [stopStream]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const caps = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
    if (!caps?.torch) {
      toast.error("এই ক্যামেরায় ফ্ল্যাশ সাপোর্ট করে না।");
      return;
    }
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torch }],
      } as unknown as MediaTrackConstraints);

      setTorch((t) => !t);
    } catch {
      toast.error("ফ্ল্যাশ চালু করা যায়নি।");
    }
  };

  const stopRecording = useCallback(() => {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  const startRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
      if (!streamRef.current) return;
    }
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";
    const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
    recorderRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const out = new Blob(chunksRef.current, { type: mime });
      setBlob(out);
      setPreviewUrl(URL.createObjectURL(out));
      stopStream();
    };
    rec.start();
    setRecording(true);
    setElapsed(0);
    timerRef.current = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= limit) stopRecording();
        return next;
      });
    }, 1000);
  };

  const pickFromGallery = (file: File) => {
    setBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    stopStream();
  };

  const post = async () => {
    if (!blob) return;
    if (!user) {
      toast.error("পোস্ট করতে সাইন ইন করুন।");
      navigate({ to: "/login" });
      return;
    }
    setUploading(true);
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("videos")
      .upload(path, blob, { contentType: blob.type || "video/webm" });
    if (upErr) {
      setUploading(false);
      toast.error("আপলোড ব্যর্থ হয়েছে: " + upErr.message);
      return;
    }
    const { data: inserted, error } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        caption,
        video_url: path,
      })
      .select("id")
      .single();
    setUploading(false);
    if (error) {
      toast.error("পোস্ট করা যায়নি: " + error.message);
      return;
    }
    toast.success("ভিডিও পোস্ট হয়েছে!");
    if (inserted?.id) {
      const coins = await awardVideoCoins(inserted.id);
      if (coins > 0) toast.success(`🪙 ${coins} কয়েন পেয়েছেন! ওয়ালেটে জমা হয়েছে।`);
      else toast("আজকের ৫০ কয়েন পাওয়া শেষ — ২৪ ঘণ্টা পর আবার পাবেন।");
    }
    navigate({ to: "/feed" });
  };

  const reset = () => {
    setBlob(null);
    setPreviewUrl(null);
    setCaption("");
    setElapsed(0);
  };

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center justify-between px-4 pt-5">
        <button onClick={() => navigate({ to: "/feed" })} aria-label="পিছনে">
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-[17px] font-semibold">নতুন ভিডিও</h1>
        <MoreHorizontal className="h-6 w-6 text-white" />
      </header>

      {previewUrl ? (
        <div className="px-4 pt-5">
          <video src={previewUrl} controls className="aspect-[9/16] w-full rounded-[24px] bg-black object-cover" />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="ক্যাপশন লিখুন…"
            rows={3}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-white/35"
          />
          <div className="mt-3 flex gap-3">
            <button onClick={reset} className="flex-1 rounded-xl border border-white/15 py-3 text-[14px]">
              আবার রেকর্ড
            </button>
            <button
              onClick={post}
              disabled={uploading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[14px] font-semibold text-white disabled:opacity-70"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />} Post
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex gap-3 px-4">
            <button
              onClick={() => setMode("record")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] ${
                mode === "record" ? "bg-brand font-semibold text-white" : "bg-white/10 text-white/70"
              }`}
            >
              <Video className="h-4 w-4" /> Record
            </button>
            <label
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] ${
                mode === "gallery" ? "bg-brand font-semibold text-white" : "bg-white/10 text-white/70"
              }`}
            >
              <ImageIcon className="h-4 w-4" /> Gallery
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  setMode("gallery");
                  const f = e.target.files?.[0];
                  if (f) pickFromGallery(f);
                }}
              />
            </label>
          </div>

          <div className="relative mx-4 mt-4 aspect-[9/16] overflow-hidden rounded-[24px] bg-black">
            {permission === "denied" ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
                <p className="text-[14px] text-white/70">ক্যামেরা ব্যবহারের অনুমতি প্রয়োজন।</p>
                <button
                  onClick={() => void startCamera()}
                  className="rounded-xl bg-brand px-5 py-2.5 text-[14px] font-semibold text-white"
                >
                  Camera access needed
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
                style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
              />
            )}

            <div className="absolute right-3 top-3 flex flex-col gap-3">
              <button
                onClick={toggleTorch}
                aria-label="Flash"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45"
              >
                {torch ? <Zap className="h-5 w-5 text-gold" /> : <ZapOff className="h-5 w-5 text-white" />}
              </button>
              <button
                onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
                aria-label="Flip camera"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45"
              >
                <SwitchCamera className="h-5 w-5 text-white" />
              </button>
            </div>

            {recording && (
              <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-red-600 px-3 py-1 text-[12px] font-semibold text-white">
                {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
              </span>
            )}
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {([15, 30] as const).map((s) => (
              <button
                key={s}
                onClick={() => setLimit(s)}
                className={`rounded-full px-4 py-1.5 text-[12px] ${
                  limit === s ? "bg-brand font-semibold text-white" : "bg-white/10 text-white/70"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between px-10">
            <div className="h-11 w-11 overflow-hidden rounded-lg border border-white/20 bg-white/10">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=50"
                alt="সর্বশেষ গ্যালারি ছবি"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <button
              onClick={() => (recording ? stopRecording() : void startRecording())}
              aria-label={recording ? "রেকর্ড বন্ধ" : "রেকর্ড শুরু"}
              className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white"
            >
              <span
                className={`bg-brand transition-all ${
                  recording ? "h-7 w-7 rounded-md" : "h-[58px] w-[58px] rounded-full"
                }`}
              />
            </button>
            <button aria-label="Speed" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Gauge className="h-5 w-5 text-white" />
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </PhoneShell>
  );
}
