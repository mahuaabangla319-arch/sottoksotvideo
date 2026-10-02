import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, User } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/engagement";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "চ্যাট — SOT TOK" },
      { name: "description", content: "SOT TOK-এর সব ইউজারের সাথে সরাসরি চ্যাট করুন।" },
      { property: "og:title", content: "চ্যাট — SOT TOK" },
      { property: "og:description", content: "SOT TOK-এর সব ইউজারের সাথে সরাসরি চ্যাট করুন।" },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatList,
});

function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: convos } = useQuery({
    queryKey: ["chat-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("sender_id, recipient_id, content, read, created_at")
        .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
        .order("created_at", { ascending: false })
        .limit(300);
      const seen = new Map<string, { other: string; content: string; created_at: string; unread: number }>();
      for (const m of data ?? []) {
        const other = m.sender_id === user!.id ? m.recipient_id : m.sender_id;
        const unread = m.recipient_id === user!.id && !m.read ? 1 : 0;
        const e = seen.get(other);
        if (e) e.unread += unread;
        else seen.set(other, { other, content: m.content, created_at: m.created_at, unread });
      }
      const ids = [...seen.keys()];
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, username, full_name").in("id", ids)
        : { data: [] };
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      return [...seen.values()].map((c) => ({ ...c, profile: byId.get(c.other) }));
    },
  });

  const { data: results } = useQuery({
    queryKey: ["chat-search", q],
    enabled: q.trim().length >= 2,
    queryFn: async () => {
      const term = q.trim().replace(/[%,()]/g, "");
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, sottok_id")
        .or(`username.ilike.%${term}%,sottok_id.eq.${term},full_name.ilike.%${term}%`)
        .eq("is_hidden", false)
        .limit(20);
      return (data ?? []).filter((p) => p.id !== user?.id);
    },
  });

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center gap-3 px-4 pt-5">
        <button onClick={() => navigate({ to: "/activity" })} aria-label="পিছনে">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[18px] font-semibold">চ্যাট</h1>
      </header>

      {!user ? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
          <p className="text-[14px] text-white/50">চ্যাট করতে লগইন করুন।</p>
          <Link to="/login" className="rounded-xl bg-brand px-5 py-2 text-[13px] font-semibold">লগইন</Link>
        </div>
      ) : (
        <>
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5">
            <Search className="h-4 w-4 text-white/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="নাম বা SOT ID দিয়ে ইউজার খুঁজুন"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/40"
            />
          </div>

          <ul className="mt-3">
            {(q.trim().length >= 2 ? (results ?? []).map((p) => ({ other: p.id, profile: p, content: `SOT ID: ${p.sottok_id}`, created_at: "", unread: 0 })) : convos ?? []).map((c) => (
              <li key={c.other}>
                <Link to="/chat/$userId" params={{ userId: c.other }} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-flame">
                    <User className="h-6 w-6 text-white" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold">@{c.profile?.username || "sottok"}</span>
                    <span className="block truncate text-[12px] text-white/55">{c.content}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    {c.created_at && <span className="text-[10px] text-white/40">{timeAgo(c.created_at)}</span>}
                    {c.unread > 0 && <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-bold">{c.unread}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {q.trim().length < 2 && !convos?.length && (
            <p className="mt-16 text-center text-[13px] text-white/45">এখনো কোনো চ্যাট নেই — উপরে খুঁজে কাউকে মেসেজ করুন।</p>
          )}
        </>
      )}
      <BottomNav />
    </PhoneShell>
  );
}
