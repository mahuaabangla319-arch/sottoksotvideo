import { useEffect, useState } from "react";
import { Download, Flag, Globe, Loader2, Lock, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { downloadWatermarked, videoSrc } from "@/lib/download";

export type ProfileVideo = {
  id: string;
  caption: string | null;
  video_url?: string | null;
  visibility: string | null;
};

type Props = {
  video: ProfileVideo | null;
  username: string;
  onClose: () => void;
  onChanged: () => void;
};

const reasons = ["অশ্লীল কনটেন্ট", "হিংসা বা বিদ্বেষ", "স্প্যাম", "কপি করা ভিডিও", "অন্য কিছু"];

/** Plays the user's own video and holds all its settings: ডাউনলোড, প্রাইভেট, ডিলিট, রিপোর্ট। */
export function VideoSettingsSheet({ video, username, onClose, onChanged }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [reporting, setReporting] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSrc(null);
    setProgress(null);
    setReporting(false);
    if (!video?.video_url) return;
    let alive = true;
    void videoSrc(video.video_url).then((u) => alive && setSrc(u));
    return () => {
      alive = false;
    };
  }, [video]);

  if (!video) return null;

  const isPrivate = video.visibility === "private";

  const download = async () => {
    if (!video.video_url) {
      toast.error("এই ভিডিওটি ডাউনলোড করা যাবে না।");
      return;
    }
    setProgress(0);
    try {
      const kind = await downloadWatermarked(video.video_url, username, setProgress);
      toast.success(
        kind === "watermarked"
          ? "ডাউনলোড হয়েছে — ওয়াটারমার্কসহ গ্যালারিতে সেভ হবে।"
          : "ডাউনলোড হয়েছে — গ্যালারিতে সেভ হবে।",
      );
    } catch {
      toast.error("ডাউনলোড করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setProgress(null);
    }
  };

  const toggleVisibility = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("videos")
      .update({ visibility: isPrivate ? "public" : "private" })
      .eq("id", video.id);
    setBusy(false);
    if (error) {
      toast.error("বদলানো যায়নি, আবার চেষ্টা করুন।");
      return;
    }
    toast.success(isPrivate ? "ভিডিও পাবলিক করা হয়েছে" : "ভিডিও প্রাইভেট করা হয়েছে");
    onChanged();
    onClose();
  };

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("videos").update({ is_deleted: true }).eq("id", video.id);
    setBusy(false);
    if (error) {
      toast.error("ডিলিট করা যায়নি, আবার চেষ্টা করুন।");
      return;
    }
    toast.success("ভিডিও ডিলিট হয়েছে");
    onChanged();
    onClose();
  };

  const report = async (reason: string) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("রিপোর্ট করতে সাইন ইন করুন।");
      return;
    }
    const { error } = await supabase
      .from("video_reports")
      .insert({ video_id: video.id, reporter_id: auth.user.id, reason });
    if (error) {
      toast.error("রিপোর্ট পাঠানো যায়নি।");
      return;
    }
    toast.success("রিপোর্ট পাঠানো হয়েছে, ধন্যবাদ।");
    setReporting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-t-[24px] border border-white/10 bg-neutral-950 p-4 text-white"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">ভিডিও সেটিং</h2>
          <button onClick={onClose} aria-label="বন্ধ করুন">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="overflow-hidden rounded-[18px] bg-black">
          {src ? (
            <video src={src} controls playsInline className="aspect-[9/16] w-full object-contain" />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
          )}
        </div>

        {video.caption ? <p className="mt-3 text-[13px] text-white/70">{video.caption}</p> : null}

        {reporting ? (
          <div className="mt-4 space-y-2">
            <p className="text-[13px] text-white/70">রিপোর্টের কারণ বেছে নিন</p>
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => void report(r)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-left text-[14px]"
              >
                <span className="px-3">{r}</span>
              </button>
            ))}
            <button onClick={() => setReporting(false)} className="w-full py-2 text-[13px] text-white/50">
              বাতিল
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2 pb-2">
            <button
              onClick={() => void download()}
              disabled={progress !== null}
              className="flex w-full items-center gap-3 rounded-xl bg-brand px-4 py-3 text-[14px] font-semibold disabled:opacity-70"
            >
              {progress !== null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {progress !== null ? `ডাউনলোড হচ্ছে… ${Math.round(progress)}%` : "ডাউনলোড (ওয়াটারমার্কসহ)"}
            </button>

            <button
              onClick={() => void toggleVisibility()}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] disabled:opacity-60"
            >
              {isPrivate ? <Globe className="h-4 w-4 text-white" /> : <Lock className="h-4 w-4 text-gold" />}
              {isPrivate ? "পাবলিক করুন" : "প্রাইভেট করুন"}
            </button>

            <button
              onClick={() => setReporting(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px]"
            >
              <Flag className="h-4 w-4 text-gold" /> রিপোর্ট করুন
            </button>

            <button
              onClick={() => void remove()}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[14px] text-red-400 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> ভিডিও ডিলিট করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
