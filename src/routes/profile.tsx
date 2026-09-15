import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Flame, LogOut, MapPin, Play, Share2, BadgeCheck } from "lucide-react";
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

const demoThumbs = [
  { views: "1.2M", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60" },
  { views: "890K", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=60" },
  { views: "543K", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=60" },
  { views: "320K", img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=60" },
  { views: "768K", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=60" },
  { views: "215K", img: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=60" },
];

const tabs = ["Videos", "Liked", "Private"] as const;

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Videos");
  const [editing, setEditing] = useState(false);

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

  const { data: videos } = useQuery({
    queryKey: ["my-videos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, caption, views, thumbnail_url, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

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

  const grid =
    tab === "Videos" && videos && videos.length > 0
      ? videos.map((v) => ({ views: formatCount(v.views ?? 0), img: v.thumbnail_url ?? null }))
      : tab === "Videos"
        ? demoThumbs
        : [];

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center justify-between px-4 pt-4">
        <div className="w-9" />
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
          {grid.length > 0 ? (
            grid.map((v, i) => (
              <div
                key={i}
                className="relative aspect-[9/16] overflow-hidden rounded-[12px] bg-white/10"
              >
                {v.img && <img src={v.img} alt="ভিডিও থাম্বনেইল" className="h-full w-full object-cover" loading="lazy" />}
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[11px] font-medium text-white drop-shadow">
                  <Play className="h-3 w-3 fill-white" /> {v.views}
                </span>
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
      <BottomNav />
    </PhoneShell>
  );
}
