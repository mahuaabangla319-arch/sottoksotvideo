import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessagesSquare, Mic, Plus, Search, Users, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { coverSrc, gradientFor, loadProfiles, type MiniProfile, type Room, type RoomKind } from "@/lib/rooms";

type Search = { kind?: RoomKind };

export const Route = createFileRoute("/rooms/")({
  validateSearch: (s: Record<string, unknown>): Search => ({ kind: s['kind'] === "audio" ? "audio" : "group" }),
  head: () => ({
    meta: [
      { title: "রুম — SOT TOK গ্রুপ চ্যাট ও অডিও রুম" },
      { name: "description", content: "SOT TOK গ্রুপ চ্যাট রুম ও ৮-সিটের অডিও রুমে যোগ দিন, নতুন রুম তৈরি করুন।" },
      { property: "og:title", content: "SOT TOK রুম" },
      { property: "og:description", content: "গ্রুপ চ্যাট ও লাইভ অডিও আড্ডা — SOT TOK" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoomsHub,
});

function RoomsHub() {
  const { kind = "group" } = Route.useSearch();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<(Room & { cover?: string | null })[]>([]);
  const [owners, setOwners] = useState<Record<string, MiniProfile>>({});
  const [q, setQ] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("kind", kind)
        .eq("is_active", true)
        .order("member_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      const list = await Promise.all((data ?? []).map(async (r) => ({ ...r, cover: await coverSrc(r.cover_url) })));
      const o = await loadProfiles(list.map((r) => r.owner_id));
      if (alive) {
        setRooms(list);
        setOwners(o);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [kind]);

  const joinByCode = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    void 0;
    const { data } = await supabase.from("rooms").select("id").eq("code", c).maybeSingle();
    if (!data) { toast.error("এই রুম আইডি পাওয়া যায়নি"); return; }
    navigate({ to: "/rooms/$roomId", params: { roomId: data.id } });
  };

  const shown = rooms.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.code.includes(q.toUpperCase()));

  return (
    <PhoneShell className="bg-background text-foreground">
      <header className="px-4 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-black tracking-tight">
            SOT TOK <span className="text-brand">রুম</span>
          </h1>
          <Link
            to="/rooms/create"
            search={{ kind }}
            className="flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-white"
          >
            <Plus className="h-4 w-4" /> রুম তৈরি
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
          {(["group", "audio"] as const).map((k) => (
            <Link
              key={k}
              to="/rooms"
              search={{ kind: k }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-semibold ${
                kind === k ? "bg-brand text-white" : "text-white/60"
              }`}
            >
              {k === "group" ? <MessagesSquare className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {k === "group" ? "গ্রুপ চ্যাট" : "অডিও রুম"}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="রুম খুঁজুন"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white/5 px-4 py-2.5">
            <KeyRound className="h-4 w-4 text-white/40" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinByCode()}
              placeholder="রুম আইডি (ST123456)"
              className="flex-1 bg-transparent text-[14px] uppercase outline-none"
            />
          </div>
          <button onClick={joinByCode} className="rounded-full bg-white/10 px-4 text-[13px] font-semibold">
            জয়েন
          </button>
        </div>
      </header>

      <h2 className="px-4 pt-5 text-[14px] font-semibold text-white/70">রুম ডিসকভার করুন</h2>
      <div className="grid grid-cols-2 gap-3 px-4 pb-6 pt-3">
        {loading && <p className="col-span-2 py-10 text-center text-white/40">লোড হচ্ছে…</p>}
        {!loading && shown.length === 0 && (
          <p className="col-span-2 py-10 text-center text-white/40">এখনো কোনো রুম নেই — প্রথম রুমটি আপনি তৈরি করুন!</p>
        )}
        {shown.map((r) => (
          <Link
            key={r.id}
            to="/rooms/$roomId"
            params={{ roomId: r.id }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradientFor(r.id)}`}>
              {r.cover && <img src={r.cover} alt="" className="h-full w-full object-cover" />}
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
                {r.kind === "audio" ? <Mic className="h-3 w-3" /> : <MessagesSquare className="h-3 w-3" />}
                {r.kind === "audio" ? "অডিও" : "গ্রুপ"}
              </span>
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white">
                <Users className="h-3 w-3" /> {r.member_count}
              </span>
            </div>
            <div className="p-2.5">
              <p className="truncate text-[13px] font-semibold">{r.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/50">
                @{owners[r.owner_id]?.username ?? "…"} · {r.code}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
