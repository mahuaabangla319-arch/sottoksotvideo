import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Heart, MessageCircle, X, Users, Music2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CommentsSheet } from "@/components/CommentsSheet";
import { useAuth } from "@/lib/auth";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";
import { signVideo } from "@/lib/social";
import { downloadBrandedVideo } from "@/lib/video-studio";
import { supabase } from "@/integrations/supabase/client";

export type ModalVideo = {
  id: string;
  video_url: string;
  caption: string;
  likes: number;
  comments_count: number;
  views: number;
};

export function VideoModal({ video, onClose }: { video: ModalVideo; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(video.likes);
  const [comments, setComments] = useState(video.comments_count);
  const [showComments, setShowComments] = useState(false);

  const { data: url } = useQuery({
    queryKey: ["signed", video.video_url],
    queryFn: () => signVideo(video.video_url),
  });
  const { data: creatorId } = useQuery({
    queryKey: ["video-creator-id", video.id],
    queryFn: async () => {
      const { data: row } = await supabase.from("videos").select("user_id").eq("id", video.id).maybeSingle();
      if (!row) return null;
      const { data: profile } = await supabase.from("profiles").select("sottok_id").eq("id", row.user_id).maybeSingle();
      return profile?.sottok_id ?? null;
    },
  });

  useEffect(() => {
    void countView(video.id);
    if (user) void fetchMyLikes([video.id], user.id).then((s) => setLiked(s.has(video.id)));
  }, [video.id, user]);

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
      {url && <video src={url} autoPlay loop playsInline controls={false} className="h-full w-full object-cover" onClick={(e) => { const v = e.currentTarget; if (v.paused) void v.play(); else v.pause(); }} />}
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
            if (!url || !creatorId) return;
            setDownloading(true);
            void downloadBrandedVideo(url, creatorId, `sottok-${creatorId}`)
              .then(() => toast.success("SOT ID সহ ভিডিও ডাউনলোড হয়েছে"))
              .catch((error) => toast.error(error instanceof Error ? error.message : "ডাউনলোড করা যায়নি"))
              .finally(() => setDownloading(false));
          }}
          className="flex flex-col items-center gap-1"
          aria-label="ডাউনলোড"
        >
          <Download className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">{downloading ? "তৈরি হচ্ছে…" : "ডাউনলোড"}</span>
        </button>
        <button onClick={() => navigate({ to: "/create", search: { duet: video.id } })} className="flex flex-col items-center gap-1" aria-label="ডুয়েট"><Users className="h-7 w-7 text-white" /><span className="text-[11px] text-white">ডুয়েট</span></button>
        <button onClick={() => navigate({ to: "/create", search: { sound: video.id } })} className="flex flex-col items-center gap-1" aria-label="এই গান ব্যবহার করুন"><Music2 className="h-7 w-7 text-white" /><span className="text-[11px] text-white">গান</span></button>
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
