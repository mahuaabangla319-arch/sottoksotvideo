import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Copy, Flame, MapPin, MessageCircle, Play, Share2 } from "lucide-react";
import { useState } from "react";
import { VideoModal, type ModalVideo } from "@/components/VideoModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";
import { FireRingAvatar } from "@/components/FireRingAvatar";
import { useAuth } from "@/lib/auth";
import { avatarSrc, formatCount, isVerified, levelFromLikes, shareProfile } from "@/lib/profile";
import { getLocalPosts, type LocalPost } from "@/lib/localNotify";
import { useEffect } from "react";

export const Route = createFileRoute("/id/$sotId")({
  head: () => ({
    meta: [
      { title: "SOT TOK প্রোফাইল" },
      { name: "description", content: "SOT ID দিয়ে ক্রিয়েটরের প্রোফাইল দেখুন এবং ফলো করুন।" },
      { property: "og:title", content: "SOT TOK প্রোফাইল" },
      { property: "og:description", content: "SOT ID দিয়ে ক্রিয়েটরের প্রোফাইল দেখুন এবং ফলো করুন।" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { sotId } = useParams({ from: "/id/$sotId" });
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-by-sot", sotId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("sottok_id", sotId)
        .maybeSingle();
      return data;
    },
  });

  const { data: avatar } = useQuery({
    queryKey: ["avatar", profile?.avatar_url],
    enabled: !!profile,
    queryFn: () => avatarSrc(profile?.avatar_url ?? null),
  });

  const { data: following, refetch } = useQuery({
    queryKey: ["is-following", user?.id, profile?.id],
    enabled: !!user && !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user!.id)
        .eq("following_id", profile!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const [open, setOpen] = useState<ModalVideo | null>(null);
  const { data: videos } = useQuery({
    queryKey: ["user-videos", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, video_url, caption, likes, comments_count, views, thumbnail_url")
        .eq("user_id", profile!.id)
        .eq("visibility", "public")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(60);
      return data ?? [];
    },
  });

  const [localVids, setLocalVids] = useState<LocalPost[]>([]);
  const [playLocal, setPlayLocal] = useState<string | null>(null);
  useEffect(() => {
    if (!profile) return;
    setLocalVids(getLocalPosts().filter((p) => p.ownerSotId === profile.sottok_id || p.ownerId === profile.id));
  }, [profile]);

  const toggleFollow = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!profile) return;
    if (user.id === profile.id) {
      toast.error("নিজেকে ফলো করা যায় না।");
      return;
    }
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
    }
    await refetch();
    toast.success(following ? "আনফলো করা হয়েছে" : "ফলো করা হয়েছে");
  };

  if (isLoading) {
    return (
      <PhoneShell className="bg-black text-white">
        <p className="pt-24 text-center text-[13px] text-white/50">লোড হচ্ছে…</p>
        <BottomNav />
      </PhoneShell>
    );
  }

  if (!profile) {
    return (
      <PhoneShell className="bg-black text-white">
        <p className="pt-24 text-center text-[14px] text-white/60">
          এই SOT ID এর কোনো প্রোফাইল পাওয়া যায়নি।
        </p>
        <BottomNav />
      </PhoneShell>
    );
  }

  const followers = profile.followers_count ?? 0;
  const verified = profile.verified || isVerified(followers);

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center justify-between px-4 pt-4">
        <button onClick={() => navigate({ to: "/explore" })} aria-label="পিছনে" className="h-9 w-9">
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <span className="font-display text-[16px] font-bold tracking-[2px]">SOT TOK</span>
        <button
          aria-label="শেয়ার"
          onClick={() => {
            void shareProfile(profile.sottok_id).then((r) => {
              if (r === "copied") toast.success("প্রোফাইল লিঙ্ক কপি হয়েছে");
            });
          }}
          className="flex h-9 w-9 items-center justify-center"
        >
          <Share2 className="h-5 w-5 text-white" />
        </button>
      </header>

      <div className="mt-4 flex flex-col items-center px-5">
        <FireRingAvatar src={avatar ?? null} size={120} />
        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-[24px] font-bold">@{profile.username || "sottok"}</h1>
          {verified && <BadgeCheck className="h-5 w-5 fill-brand text-white" />}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[13px] text-[#888]">SOT ID: {profile.sottok_id}</span>
          <button
            onClick={() => {
              void navigator.clipboard.writeText(profile.sottok_id);
              toast.success("ID কপি হয়েছে");
            }}
            aria-label="SOT ID কপি করুন"
            className="rounded-md p-1"
          >
            <Copy className="h-3.5 w-3.5 text-[#888]" />
          </button>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-gold/50 px-2.5 py-0.5 text-[11px] text-gold">
          <Flame className="h-3 w-3" /> Level {levelFromLikes(profile.likes_count ?? 0)}
        </span>
        {profile.bio && (
          <p className="mt-3 max-w-[300px] text-center text-[13px] text-white/75">{profile.bio}</p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">
          <MapPin className="h-3 w-3" /> {profile.location || "ভারত"} থেকে 🇮🇳
        </span>

        <div className="mt-5 flex w-full items-center rounded-2xl border border-white/10 bg-white/5 py-3">
          {[
            { n: formatCount(profile.following_count ?? 0), l: "Following" },
            { n: formatCount(followers), l: "Followers" },
            { n: formatCount(profile.likes_count ?? 0), l: "Likes" },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`flex flex-1 flex-col items-center ${i < 2 ? "border-r border-white/10" : ""}`}
            >
              <span className="text-[17px] font-bold">{s.n}</span>
              <span className="text-[11px] text-white/50">{s.l}</span>
            </div>
          ))}
        </div>

        {user?.id !== profile.id && (
          <div className="mt-4 flex w-full gap-2">
            <button
              onClick={toggleFollow}
              className={`flex-1 rounded-xl py-3 text-[14px] font-semibold ${
                following ? "bg-white/15 text-white" : "bg-red-600 text-white"
              }`}
            >
              {following ? "Following · আনফলো" : "Follow"}
            </button>
            <button
              onClick={() => (user ? navigate({ to: "/chat/$userId", params: { userId: profile.id } }) : navigate({ to: "/login" }))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-3 text-[13px] font-medium text-white"
            >
              <MessageCircle className="h-4 w-4" /> মেসেজ
            </button>
          </div>
        )}

        <h2 className="mt-6 w-full border-b border-white/10 pb-2 text-center text-[14px] font-semibold">Videos</h2>
        <div className="mt-3 grid w-full grid-cols-3 gap-2 pb-6">
          {localVids.map((v) => (
            <button key={v.id} onClick={() => setPlayLocal(v.videoUrl)} className="relative aspect-[9/16] overflow-hidden rounded-[12px] bg-white/10 ring-1 ring-orange-500/60">
              <video src={v.videoUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              <Play className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 fill-white/80 text-white/80" />
              <span className="absolute left-1.5 top-1.5 rounded bg-orange-500 px-1.5 text-[10px] font-bold text-black">নতুন</span>
            </button>
          ))}
          {(videos ?? []).length || localVids.length ? (
            videos!.map((v) => (
              <button key={v.id} onClick={() => setOpen(v)} className="relative aspect-[9/16] overflow-hidden rounded-[12px] bg-white/10">
                {v.thumbnail_url && <img src={v.thumbnail_url} alt="ভিডিও থাম্বনেইল" className="h-full w-full object-cover" loading="lazy" />}
                <Play className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 fill-white/80 text-white/80" />
                <span className="absolute bottom-1.5 left-1.5 text-[11px] font-medium text-white drop-shadow">▶ {formatCount(v.views ?? 0)}</span>
              </button>
            ))
          ) : (
            <p className="col-span-3 py-8 text-center text-[13px] text-white/40">এখনো কোনো ভিডিও নেই।</p>
          )}
        </div>
      </div>
      {playLocal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black" onClick={() => setPlayLocal(null)}>
          <video src={playLocal} autoPlay controls playsInline loop className="max-h-full w-full max-w-md" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
      {open && <VideoModal video={open} onClose={() => setOpen(null)} />}
      <BottomNav />
    </PhoneShell>
  );
}
