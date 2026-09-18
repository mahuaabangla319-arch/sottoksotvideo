import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Copy,
  Flame,
  Lock,
  LogOut,
  Play,
  Settings,
  Share2,
  BadgeCheck,
  Pencil,
  Globe,
  Users,
  Coins,
  Zap,
  Wallet,
  Gift,
  Gamepad2,
  MessageCircle,
  Crown,
  Medal,
  ChevronRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";
import { SotTokLogo } from "@/components/SotTokLogo";
import { FireRingAvatar } from "@/components/FireRingAvatar";
import { EditProfileSheet } from "@/components/EditProfileSheet";
import { AccountSettingsSheet } from "@/components/AccountSettingsSheet";
import { VideoSettingsSheet, type ProfileVideo } from "@/components/VideoSettingsSheet";
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
      { name: "description", content: "আপনার স্থায়ী SOT ID, ক্লাব রুম, ওয়ালেট, গেমস আর প্রোফাইল সেটিংস।" },
      { property: "og:title", content: "প্রোফাইল — SOT TOK" },
      { property: "og:description", content: "আপনার স্থায়ী SOT ID, ক্লাব রুম, ওয়ালেট, গেমস আর প্রোফাইল সেটিংস।" },
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ProfileVideo | null>(null);

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
        .select("id, caption, views, thumbnail_url, video_url, created_at, visibility, is_deleted")
        .eq("user_id", user!.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const sotId = profile?.sottok_id ?? "--------";
  const followers = profile?.followers_count ?? 0;
  const following = profile?.following_count ?? 0;
  const likes = profile?.likes_count ?? 0;
  const coins = profile?.coins ?? 0;
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

  const soon = () => toast("শীঘ্রই আসছে!");

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
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="সেটিং"
          className="flex h-9 w-9 items-center justify-center"
        >
          <Settings className="h-5 w-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <SotTokLogo size={34} />
          <span className="font-display text-[16px] font-bold tracking-[2px] text-white">SOT TOK</span>
        </div>
        <button onClick={share} aria-label="প্রোফাইল শেয়ার" className="flex h-9 w-9 items-center justify-center">
          <Share2 className="h-5 w-5 text-white" />
        </button>
      </header>

      <div className="mt-4 flex flex-col items-center px-5">
        <FireRingAvatar src={avatar ?? null} size={120} />

        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-white">@{profile?.username || "sottok_star"}</h1>
          {verified && <BadgeCheck className="h-5 w-5 fill-brand text-white" />}
          <button
            onClick={() => (user ? setEditing(true) : navigate({ to: "/login" }))}
            className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/80"
          >
            <Pencil className="h-3 w-3" /> Edit Profile
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[13px] tracking-wide text-white/60">SOT ID: {sotId}</span>
          <button onClick={copyId} aria-label="SOT ID কপি করুন" className="rounded-md p-1">
            <Copy className="h-3.5 w-3.5 text-white/60" />
          </button>
        </div>

        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-gold/50 px-3 py-1 text-[11px] text-gold">
          <Flame className="h-3 w-3" /> Level {level}
        </span>

        {/* Club Room */}
        <section className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[14px] font-bold text-white">
              <Globe className="h-4 w-4 text-gold" /> Club Room - WORLD GROUP
            </span>
            <span className="text-[10px] text-white/45">SOT ID: {sotId}</span>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <FireRingAvatar src={avatar ?? null} size={34} />
              <span className="text-[13px] text-white/85">Members {Math.max(followers, 1)}/100</span>
            </div>
            <button
              onClick={soon}
              className="inline-flex items-center gap-1 rounded-full bg-gold px-4 py-1.5 text-[12px] font-bold text-black"
            >
              <Plus className="h-3.5 w-3.5" /> Join
            </button>
          </div>
          <div className="mt-3 flex items-center">
            {[
              { icon: Users, n: formatCount(Math.max(followers, 0)), l: "Members", c: "text-brand" },
              { icon: Coins, n: formatCount(coins), l: "Coins", c: "text-gold" },
              { icon: Zap, n: "24h", l: "Active", c: "text-purple-400" },
            ].map((s, i) => (
              <div key={s.l} className={`flex flex-1 flex-col items-center ${i < 2 ? "border-r border-white/10" : ""}`}>
                <s.icon className={`h-4 w-4 ${s.c}`} />
                <span className="mt-1 text-[15px] font-bold text-white">{s.n}</span>
                <span className="text-[10px] text-white/45">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Gift & Wallet */}
        <section className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="inline-flex items-center gap-2 text-[14px] font-bold text-white">
            <Wallet className="h-4 w-4 text-gold" /> Gift &amp; Wallet / গিফট ও ওয়ালেট
          </span>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-white">
              <Coins className="h-4 w-4 text-gold" /> {coins} coins
            </span>
            <div className="flex gap-2">
              <button
                onClick={soon}
                className="inline-flex items-center gap-1 rounded-full border border-gold/50 px-3 py-1.5 text-[11px] text-gold"
              >
                <Gift className="h-3.5 w-3.5" /> Redeem - কয়েন ভাঙাও
              </button>
              <button
                onClick={soon}
                className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold text-black"
              >
                <Coins className="h-3.5 w-3.5" /> Recharge - রিচার্জ
              </button>
            </div>
          </div>
        </section>

        {/* Mini Games Hub */}
        <button
          onClick={soon}
          className="mt-3 flex w-full items-center justify-between rounded-2xl border border-brand/30 bg-brand/15 p-4 text-left"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-[14px] font-bold text-white">
              <Gamepad2 className="h-4 w-4 text-purple-400" /> Mini Games Hub
            </span>
            <p className="mt-1 text-[12px] text-white/60">
              🎮 Tap to play 3 games → Snake • Quiz • Spin Wheel
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/50" />
        </button>

        {/* Chat with Users */}
        <section className="mt-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[14px] font-bold text-white">
              <MessageCircle className="h-4 w-4 text-brand" /> Chat with Users
            </span>
            <p className="mt-1 text-[11px] text-white/55">
              {formatCount(followers)} fans • Join group chat to connect
            </p>
          </div>
          <button
            onClick={soon}
            className="rounded-full bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-white"
          >
            Open Chat
          </button>
        </section>

        {/* Weekly Top Creator */}
        <section className="mt-3 w-full rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/15 to-transparent p-4">
          <span className="inline-flex items-center gap-2 text-[14px] font-bold text-gold">
            <Crown className="h-4 w-4" /> Weekly Top Creator
          </span>
          <div className="mt-2.5 flex items-start gap-2.5 rounded-xl bg-black/40 p-3">
            <Medal className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-[12px] font-semibold text-white">
                Rank #1 this week • +{formatCount(coins)} coins earned
              </p>
              <p className="mt-0.5 text-[11px] text-white/55">Keep posting to stay on top!</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-4 flex w-full items-center rounded-2xl border border-white/10 bg-white/5 py-3">
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
              <button
                key={v.id}
                onClick={() =>
                  setActiveVideo({
                    id: v.id,
                    caption: v.caption,
                    video_url: v.video_url,
                    visibility: v.visibility,
                  })
                }
                aria-label="ভিডিও চালান ও সেটিং খুলুন"
                className="relative aspect-[9/16] overflow-hidden rounded-[12px] bg-white/10"
              >
                {v.thumbnail_url && (
                  <img src={v.thumbnail_url} alt="ভিডিও থাম্বনেইল" className="h-full w-full object-cover" loading="lazy" />
                )}
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[11px] font-medium text-white drop-shadow">
                  <Play className="h-3 w-3 fill-white" /> {formatCount(v.views ?? 0)}
                </span>
                {v.visibility === "private" && (
                  <span className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5">
                    <Lock className="h-3.5 w-3.5 text-gold" />
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="col-span-3 py-8 text-center text-[13px] text-white/40">
              এখানে এখনো কিছু নেই।
            </p>
          )}
        </div>

        <p className="pb-6 text-center text-[10px] text-white/35">
          SOT TOK • Entertainment | Collaboration | Growth
        </p>
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
      <AccountSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userId={user?.id ?? null}
        hidden={profile?.is_hidden ?? false}
        onChanged={() => void refetch()}
        onSignOut={() => {
          void signOut().then(() => navigate({ to: "/login" }));
        }}
      />
      <VideoSettingsSheet
        video={activeVideo}
        username={profile?.username || "sottok"}
        onClose={() => setActiveVideo(null)}
        onChanged={() => void refetchVideos()}
      />
      <BottomNav />
    </PhoneShell>
  );
}
