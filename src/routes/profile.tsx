import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";
import { SotTokLogo } from "@/components/SotTokLogo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "প্রোফাইল — SOT TOK" },
      { name: "description", content: "আপনার SOT TOK আইডি, ভিডিও আর অ্যাকাউন্ট সেটিংস।" },
      { property: "og:title", content: "প্রোফাইল — SOT TOK" },
      { property: "og:description", content: "আপনার SOT TOK আইডি, ভিডিও আর অ্যাকাউন্ট সেটিংস।" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ["my-videos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, caption, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <PhoneShell className="bg-black text-white">
      <div className="flex flex-col items-center px-6 pt-8">
        <SotTokLogo size={84} />
        <h1 className="mt-3 text-[18px] font-semibold">{profile?.full_name || "অতিথি ব্যবহারকারী"}</h1>
        <p className="text-[13px] text-white/60">@{profile?.username || "guest"}</p>
        {profile?.sottok_id && (
          <p className="mt-1 text-[12px] text-gold">SOT TOK ID: {profile.sottok_id}</p>
        )}
        {user?.email && <p className="mt-1 text-[12px] text-white/40">{user.email}</p>}

        {user ? (
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-[13px] text-white"
          >
            <LogOut className="h-4 w-4" /> লগ আউট
          </button>
        ) : (
          <button
            onClick={() => navigate({ to: "/login" })}
            className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-[14px] font-semibold text-white"
          >
            সাইন ইন করুন
          </button>
        )}

        <div className="mt-8 w-full">
          <h2 className="mb-3 text-[14px] font-semibold text-white/80">আমার ভিডিও</h2>
          {videos && videos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="flex aspect-[9/16] items-end rounded-lg bg-white/10 p-2 text-[10px] text-white/70"
                >
                  {v.caption || "ভিডিও"}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[13px] text-white/40">এখনো কোনো ভিডিও নেই।</p>
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
