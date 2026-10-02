import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, MessageCircle, MessagesSquare, UserPlus, Mail } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/engagement";
import { notifText } from "@/lib/social";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — SOT TOK" },
      { name: "description", content: "আপনার লাইক, কমেন্ট, ফলোয়ার আর মেসেজের নোটিফিকেশন এক জায়গায়।" },
      { property: "og:title", content: "Activity — SOT TOK" },
      { property: "og:description", content: "আপনার লাইক, কমেন্ট, ফলোয়ার আর মেসেজের নোটিফিকেশন এক জায়গায়।" },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivityPage,
});

const tabs = [
  { k: "All", t: null },
  { k: "Likes", t: "like" },
  { k: "Comments", t: "comment" },
  { k: "Followers", t: "follow" },
] as const;

const icons = { like: Heart, comment: MessageCircle, follow: UserPlus, message: Mail } as const;

function ActivityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState<(typeof tabs)[number]["k"]>("All");

  const { data: items } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, actor_id, type, body, read, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      const rows = data ?? [];
      const ids = [...new Set(rows.map((r) => r.actor_id))];
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, username, sottok_id").in("id", ids)
        : { data: [] };
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({ ...r, actor: byId.get(r.actor_id) }));
    },
  });

  useEffect(() => {
    if (!user || !items?.some((i) => !i.read)) return;
    void supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(() => qc.invalidateQueries({ queryKey: ["unread", user.id] }));
  }, [items, user, qc]);

  const filter = tabs.find((t) => t.k === active)!.t;
  const list = (items ?? []).filter((i) => !filter || i.type === filter);

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center justify-between px-4 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/feed" })} aria-label="পিছনে">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-[18px] font-semibold text-white">Activity</h1>
        </div>
        <Link to="/chat" aria-label="চ্যাট" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px]">
          <MessagesSquare className="h-4 w-4" /> চ্যাট
        </Link>
      </header>

      <div className="mt-5 flex gap-6 border-b border-white/10 px-4">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setActive(t.k)}
            className={`pb-2 text-[14px] ${active === t.k ? "border-b-2 border-pink font-semibold text-white" : "text-white/45"}`}
          >
            {t.k}
          </button>
        ))}
      </div>

      {!user ? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6">
          <p className="text-center text-[14px] text-white/45">নোটিফিকেশন দেখতে লগইন করুন।</p>
          <Link to="/login" className="rounded-xl bg-brand px-5 py-2 text-[13px] font-semibold">লগইন</Link>
        </div>
      ) : list.length === 0 ? (
        <div className="flex h-[60vh] items-center justify-center px-6">
          <p className="text-center text-[14px] text-white/45">এখনো কোনো অ্যাক্টিভিটি নেই।</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {list.map((n) => {
            const Icon = icons[n.type as keyof typeof icons] ?? Heart;
            const go = () => {
              if (n.type === "message") navigate({ to: "/chat/$userId", params: { userId: n.actor_id } });
              else if (n.actor?.sottok_id) navigate({ to: "/id/$sotId", params: { sotId: n.actor.sottok_id } });
            };
            return (
              <li key={n.id}>
                <button onClick={go} className={`flex w-full items-start gap-3 px-4 py-3 text-left ${n.read ? "" : "bg-white/5"}`}>
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flame">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <span className="flex-1">
                    <span className="text-[13px]">
                      <b>@{n.actor?.username || "sottok"}</b> {notifText[n.type] ?? ""}
                    </span>
                    {n.body && <span className="mt-0.5 block text-[12px] text-white/60 line-clamp-2">{n.body}</span>}
                    <span className="mt-0.5 block text-[11px] text-white/40">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <BottomNav />
    </PhoneShell>
  );
}
