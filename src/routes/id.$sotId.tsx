import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Copy, Flame, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";
import { FireRingAvatar } from "@/components/FireRingAvatar";
import { useAuth } from "@/lib/auth";
import { avatarSrc, formatCount, isVerified, levelFromLikes, shareProfile } from "@/lib/profile";

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

        <button
          onClick={toggleFollow}
          className={`mt-4 w-full rounded-xl py-3 text-[14px] font-semibold ${
            following ? "bg-white/15 text-white" : "bg-red-600 text-white"
          }`}
        >
          {following ? "Following" : "Follow"}
        </button>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
