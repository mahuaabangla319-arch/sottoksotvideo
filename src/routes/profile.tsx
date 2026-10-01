import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { VideoModal, type ModalVideo } from "@/components/VideoModal";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy, Flame, Globe, Lock, LogOut, MapPin, Play, Share2, Trash2, BadgeCheck, Settings, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";
import { SotTokLogo } from "@/components/SotTokLogo";
import { FireRingAvatar } from "@/components/FireRingAvatar";
import { EditProfileSheet } from "@/components/EditProfileSheet";
import { WalletCard } from "@/components/WalletCard";
import { useAuth } from "@/lib/auth";
import {
  avatarSrc,
  formatCount,
  isVerified,
  levelFromLikes,
  loadOwnProfile,
  shareProfile,
} from "@/lib/profile";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "প্রোফাইল — SOT TOK" },
      { name: "description", content: "আপনার স্থায়ী SOT ID, ভিডিও, ফলোয়ার আর প্রোফাইল সেটিংস।" },
      { property: "og:title", content: "প্রোফাইল — SOT TOK" },
      { property: "og:description", content: "আপনার স্থায়ী SOT ID, ভিডিও, ফলোয়ার আর প্রোফাইল সেটিংস।" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const tabs = ["Videos", "Liked", "Private"] as const;

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Videos");
  const [editing, setEditing] = useState(false);
  const [openVideo, setOpenVideo] = useState<ModalVideo | null>(null);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem("sottok-all-users-toast")) return;
    sessionStorage.setItem("sottok-all-users-toast", "1");
    toast.success("সকল ইউজারের জন্য চালু করা হয়েছে");
  }, [user]);



  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: () => loadOwnProfile(user!.id, user!.user_metadata ?? {}),
  });

  const { data: avatar } = useQuery({
    queryKey: ["avatar", profile?.avatar_url],
    enabled: !!profile,
    queryFn: () => avatarSrc(profile?.avatar_url ?? null),
  });

  const { data: videos, refetch: refetchVideos } = useQuery({
    queryKey: ["my-videos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, caption, views, likes, comments_count, video_url, thumbnail_url, created_at, visibility, is_deleted")
        .eq("user_id", user!.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const toggleVisibility = async (id: string, current: string) => {
    const next = current === "private" ? "public" : "private";
    const { error } = await supabase.from("videos").update({ visibility: next }).eq("id", id);
    if (error) {
      toast.error("বদলানো যায়নি, আবার চেষ্টা করুন");
      return;
    }
    toast.success(next === "private" ? "ভিডিও প্রাইভেট করা হয়েছে" : "ভিডিও পাবলিক করা হয়েছে");
    void refetchVideos();
  };

  const deleteVideo = async (id: string) => {
    const { error } = await supabase.from("videos").update({ is_deleted: true }).eq("id", id);
    if (error) {
      toast.error("ডিলিট করা যায়নি, আবার চেষ্টা করুন");
      return;
    }
    toast.success("ভিডিও ডিলিট হয়েছে");
    void refetchVideos();
  };

  const sotId = profile?.sottok_id ?? "--------";
  const followers = profile?.followers_count ?? 15200;
  const following = profile?.following_count ?? 120;
  const likes = profile?.likes_count ?? 89000;
  const verified = profile ? profile.verified || isVerified(followers) : false;
  const level = levelFromLikes(likes);

  const copyId = () => {
    void navigator.clipboard.writeText(sotId);
    toast.success("ID কপি হয়েছে");
  };

  const share = async () => {
    const result = await shareProfile(sotId);
    if (result === "copied") toast.success("প্রোফাইল লিঙ্ক কপি হয়েছে");
  };

  const myVideos = videos ?? [];
  const tabVideos =
    tab === "Videos"
      ? myVideos.filter((v) => v.visibility !== "private")
      : tab === "Private"
        ? myVideos.filter((v) => v.visibility === "private")
        : [];


  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center justify-between px-4 pt-4">
        <Link to="/settings" aria-label="সেটিংস" className="flex h-9 w-9 items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </Link>
        <div className="flex items-center gap-2">
          <SotTokLogo size={34} />
          <span className="font-display text-[16px] font-bold tracking-[2px] text-white">SOT TOK</span>
        </div>
        <div className="flex items-center">
          <Link to="/chat" aria-label="চ্যাট" className="flex h-9 w-9 items-center justify-center">
            <MessagesSquare className="h-5 w-5 text-white" />
          </Link>
          <button onClick={share} aria-label="প্রোফাইল শেয়ার" className="flex h-9 w-9 items-center justify-center">
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-col items-center px-5">
        <FireRingAvatar src={avatar ?? null} size={120} />

        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-[24px] font-bold text-white">@{profile?.username || "sottok_star"}</h1>
          {verified && <BadgeCheck className="h-5 w-5 fill-brand text-white" />}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-[13px] text-[#888]">SOT ID: {sotId}</span>
          <button onClick={copyId} aria-label="SOT ID কপি করুন" className="rounded-md p-1">
            <Copy className="h-3.5 w-3.5 text-[#888]" />
          </button>
        </div>

        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-gold/50 px-2.5 py-0.5 text-[11px] text-gold">
          <Flame className="h-3 w-3" /> Level {level}
        </span>

        <p className="mt-3 max-w-[300px] text-center text-[13px] leading-relaxed text-white/75">
          {profile?.bio || "স্বপ্ন দেখি, কনটেন্ট বানাই | ড্যান্স • ফান • লাইফস্টাইল | ভারত থেকে 🌟"}
        </p>

        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">
          <MapPin className="h-3 w-3" /> {profile?.location || "ভারত"} থেকে 🇮🇳
        </span>


        <div className="mt-5 flex w-full items-center rounded-2xl border border-white/10 bg-white/5 py-3">
          {[
            { n: formatCount(following), l: "Following" },
            { n: formatCount(followers), l: "Followers" },
            { n: formatCount(likes), l: "Likes" },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`flex flex-1 flex-col items-center ${i < 2 ? "border-r border-white/10" : ""}`}
            >
              <span className="text-[17px] font-bold text-white">{s.n}</span>
              <span className="text-[11px] text-white/50">{s.l}</span>
            </div>
          ))}
        </div>

        <WalletCard userId={user?.id ?? null} coins={profile?.coins ?? 0} />

        <div className="mt-4 flex w-full gap-2">
          <button
            onClick={() => (user ? setEditing(true) : navigate({ to: "/login" }))}
            className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-semibold text-white"
          >
            Edit Profile
          </button>
          <button
            onClick={share}
            className="rounded-xl border border-white/15 px-4 py-3 text-[13px] font-medium text-white"
          >
            Share Profile
          </button>
        </div>

        {user ? (
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            className="mt-3 inline-flex items-center gap-2 text-[12px] text-white/50"
          >
            <LogOut className="h-3.5 w-3.5" /> লগ আউট
          </button>
        ) : (
          <button
            onClick={() => navigate({ to: "/login" })}
            className="mt-3 text-[12px] text-gold underline-offset-2"
          >
            সাইন ইন করুন
          </button>
        )}

        <div className="mt-6 flex w-full">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-2 text-[14px] ${
                tab === t ? "border-b-2 border-white font-semibold text-white" : "text-white/45"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-3 grid w-full grid-cols-3 gap-2 pb-6">
          {tabVideos.length > 0 ? (
            tabVideos.map((v) => (
              <div
                key={v.id}
                className="relative aspect-[9/16] overflow-hidden rounded-[12px] bg-white/10"
              >
                <button onClick={() => setOpenVideo(v)} aria-label="ভিডিও চালান" className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-7 w-7 fill-white/70 text-white/70" />
                </button>
                {v.thumbnail_url && (
                  <img src={v.thumbnail_url} alt="ভিডিও থাম্বনেইল" className="h-full w-full object-cover" loading="lazy" />
                )}
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[11px] font-medium text-white drop-shadow">
                  <Play className="h-3 w-3 fill-white" /> {formatCount(v.views ?? 0)}
                </span>
                <div className="absolute right-1 top-1 flex flex-col gap-1">
                  <button
                    onClick={() => void toggleVisibility(v.id, v.visibility ?? "public")}
                    aria-label={v.visibility === "private" ? "পাবলিক করুন" : "প্রাইভেট করুন"}
                    className="rounded-full bg-black/60 p-1.5"
                  >
                    {v.visibility === "private" ? (
                      <Lock className="h-3.5 w-3.5 text-gold" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => void deleteVideo(v.id)}
                    aria-label="ভিডিও ডিলিট করুন"
                    className="rounded-full bg-black/60 p-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 py-8 text-center text-[13px] text-white/40">
              এখানে এখনো কিছু নেই।
            </p>
          )}
        </div>

      </div>

      {profile && (
        <EditProfileSheet
          open={editing}
          onOpenChange={setEditing}
          profile={profile}
          avatarUrl={avatar ?? null}
          onSaved={() => void refetch()}
        />
      )}
      {openVideo && <VideoModal video={openVideo} onClose={() => setOpenVideo(null)} />}
      <BottomNav />
    </PhoneShell>
  );
}
