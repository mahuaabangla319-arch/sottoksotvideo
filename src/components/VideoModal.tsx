import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Heart, Loader2, MessageCircle, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { CommentsSheet } from "@/components/CommentsSheet";
import { useAuth } from "@/lib/auth";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";
import { downloadVideo, signVideo } from "@/lib/social";

export type ModalVideo = {
  id: string;
  video_url: string;
  caption: string;
  likes: number;
  comments_count: number;
  views: number;
};

const MAX_RETRIES = 2;

export function VideoModal({ video, onClose }: { video: ModalVideo; onClose: () => void }) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const attempts = useRef(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(video.likes);
  const [comments, setComments] = useState(video.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const { data: url } = useQuery({
    queryKey: ["signed", video.video_url],
    queryFn: () => signVideo(video.video_url),
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    void countView(video.id);
    if (user) void fetchMyLikes([video.id], user.id).then((s) => setLiked(s.has(video.id)));
  }, [video.id, user]);

  // Release the player's memory when the modal closes.
  useEffect(() => {
    const el = videoRef.current;
    return () => {
      if (!el) return;
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, []);

  const retry = () => {
    attempts.current = 0;
    setFailed(false);
    setReady(false);
    videoRef.current?.load();
    void videoRef.current?.play().catch(() => {});
  };

  const onVideoError = () => {
    if (attempts.current < MAX_RETRIES) {
      attempts.current += 1;
      videoRef.current?.load();
    } else {
      setFailed(true);
    }
  };

  const toggleLike = async () => {
    if (!user) { toast.error("লাইক করতে লগইন করুন"); return; }
    const was = liked;
    setLiked(!was);
    setLikes((n) => n + (was ? -1 : 1));
    try {
      if (was) await unlikeVideo(video.id, user.id);
      else await likeVideo(video.id, user.id);
    } catch {
      setLiked(was);
      setLikes((n) => n + (was ? 1 : -1));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-[420px] items-center justify-center bg-black">
      {url && (
        <video
          ref={videoRef}
          src={url}
          autoPlay
          loop
          playsInline
          preload="auto"
          controls={false}
          onCanPlay={() => setReady(true)}
          onError={onVideoError}
          className="h-full w-full object-cover"
          onClick={(e) => { const v = e.currentTarget; if (v.paused) void v.play(); else v.pause(); }}
        />
      )}
      {url && !ready && !failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-[12px]">লোড হচ্ছে…</span>
        </div>
      )}
      {url && failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="text-[13px] text-white/80">ভিডিও লোড হয়নি</span>
          <button onClick={retry} className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-[12px] text-white backdrop-blur">
            <RefreshCw className="h-3.5 w-3.5" /> আবার চেষ্টা করুন
          </button>
        </div>
      )}
      <button onClick={onClose} aria-label="বন্ধ করুন" className="absolute left-3 top-4 rounded-full bg-black/50 p-2">
        <X className="h-6 w-6 text-white" />
      </button>
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5">
        <button onClick={() => void toggleLike()} className="flex flex-col items-center gap-1" aria-label="লাইক">
          <Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          <span className="text-[11px] text-white">{formatCompact(likes)}</span>
        </button>
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1" aria-label="কমেন্ট">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">{formatCompact(comments)}</span>
        </button>
        <button
          onClick={() => {
            if (!url) return;
            toast("ডাউনলোড শুরু হয়েছে…");
            void downloadVideo(url, `sottok-${video.id.slice(0, 8)}`);
          }}
          className="flex flex-col items-center gap-1"
          aria-label="ডাউনলোড"
        >
          <Download className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">ডাউনলোড</span>
        </button>
      </div>
      <div className="absolute bottom-8 left-4 right-20">
        <p className="text-[12px] text-white/70">{formatCompact(video.views)} views</p>
        <p className="text-[13px] text-white">{video.caption}</p>
      </div>
      {showComments && (
        <CommentsSheet videoId={video.id} open onClose={() => setShowComments(false)} onCountChange={(d) => setComments((c) => c + d)} />
      )}
    </div>
  );
}
