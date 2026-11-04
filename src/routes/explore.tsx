import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Search } from "lucide-react";
import kaliDiwali from "@/assets/kali-diwali.jpg";
import { formatCompact } from "@/lib/engagement";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — SOT TOK" },
      { name: "description", content: "ট্রেন্ডিং চ্যালেঞ্জ, ফুড, কমেডি আর নতুন ক্রিয়েটর খুঁজে নিন।" },
      { property: "og:title", content: "Explore — SOT TOK" },
      { property: "og:description", content: "ট্রেন্ডিং চ্যালেঞ্জ, ফুড, কমেডি আর নতুন ক্রিয়েটর খুঁজে নিন।" },
    ],
  }),
  component: ExplorePage,
});

const tabs = ["Trending", "Comedy", "Food", "Dance|Sing", "Family", "Beauty"];

const fallbackUsers = [
  { name: "রান্নাঘর", handle: "@rannaghor", sot: "", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60" },
  { name: "India Kitchen", handle: "@india_kitchen", sot: "", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=60" },
  { name: "Street Food India", handle: "@streetfoodindia", sot: "", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=60" },
  { name: "মায়ের হাতের", handle: "@mayer_hater", sot: "", img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=60" },
];

function useTopCreators() {
  return useQuery({
    queryKey: ["top-creators"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("sottok_id, username, full_name, avatar_url, followers_count")
        .order("followers_count", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });
}

function useViralVideos() {
  return useQuery({
    queryKey: ["viral-videos"],
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, video_url, views")
        .eq("visibility", "public")
        .eq("is_deleted", false)
        .order("views", { ascending: false })
        .limit(9);
      const rows = data ?? [];
      const paths = rows.map((r) => r.video_url).filter((p) => p && !p.startsWith("http"));
      const map = new Map<string, string>();
      if (paths.length) {
        const { data: signed } = await supabase.storage.from("videos").createSignedUrls(paths, 60 * 60 * 8);
        (signed ?? []).forEach((s) => s.path && s.signedUrl && map.set(s.path, s.signedUrl));
      }
      return rows.map((r) => ({
        id: r.id,
        views: r.views ?? 0,
        src: r.video_url?.startsWith("http") ? r.video_url : map.get(r.video_url) ?? "",
      }));
    },
  });
}

function ExplorePage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Trending");
  const [query, setQuery] = useState("");
  const { data: creators } = useTopCreators();
  const { data: viral } = useViralVideos();

  const submitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().replace(/^@/, "");
    if (!q) return;
    if (/^[0-9]{8}$/.test(q)) {
      navigate({ to: "/id/$sotId", params: { sotId: q } });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("sottok_id")
      .ilike("username", `%${q}%`)
      .limit(1)
      .maybeSingle();
    if (data?.sottok_id) navigate({ to: "/id/$sotId", params: { sotId: data.sottok_id } });
    else toast.error("কোনো ইউজার পাওয়া যায়নি");
  };

  const cards =
    creators && creators.length
      ? creators.map((c) => ({
          name: c.full_name || c.username,
          handle: "@" + c.username,
          sot: c.sottok_id,
          img: c.avatar_url && c.avatar_url.startsWith("http") ? c.avatar_url : fallbackUsers[0]!.img,
        }))
      : fallbackUsers;


  return (
    <PhoneShell className="bg-white">
      <div className="px-4 pt-5">
        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5"
        >
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SOT ID বা নাম দিয়ে খুঁজুন"
            className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </form>


        <button
          onClick={() => navigate({ to: "/create" })}
          aria-label="কালীপূজা ও দেওয়ালি কনটেস্ট — ভিডিও করুন"
          className="relative mt-4 block w-full overflow-hidden rounded-[24px] text-left"
        >
          <img src={kaliDiwali} alt="মা কালী — দেওয়ালি স্পেশাল কনটেস্ট" width={1280} height={768} className="w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10">
            <span className="inline-block rounded-full bg-yellow px-2.5 py-0.5 text-[11px] font-bold text-black">🪔 দেওয়ালি অফার</span>
            <p className="mt-1 text-[17px] font-extrabold text-white">কালীপূজা স্পেশাল কনটেস্ট</p>
            <p className="text-[12px] text-white/85">ভিডিও বানাও, বেশি ভিউ পাও, জিতে নাও পুরস্কার</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["#KaliPuja", "#Diwali2026", "#দীপাবলি", "#SOTTOK"].map((h) => (
                <span key={h} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">{h}</span>
              ))}
            </div>
          </div>
        </button>

        <div className="no-scrollbar mt-4 flex gap-5 overflow-x-auto border-b border-neutral-200">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`whitespace-nowrap pb-2 text-[14px] ${
                active === t ? "border-b-2 border-pink font-bold text-neutral-900" : "text-neutral-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <h3 className="mt-4 text-[15px] font-semibold text-neutral-900">🔥 ভাইরাল ভিডিও</h3>
        {viral && viral.length ? (
          <div className="mb-5 mt-3 grid grid-cols-3 gap-1.5">
            {viral.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate({ to: "/feed" })}
                className="relative aspect-[9/16] overflow-hidden rounded-xl bg-neutral-900"
              >
                {v.src && <video src={v.src + "#t=0.5"} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
                <span className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[11px] font-semibold text-white drop-shadow">
                  <Play className="h-3 w-3 fill-current" /> {formatCompact(v.views)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-[13px] text-neutral-400">এখনো কোনো ভাইরাল ভিডিও নেই।</p>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-neutral-900">Recommended Users</h3>
          <button className="text-[12px] font-medium text-pink">Show all</button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {cards.map((u) => (
            <div key={u.handle} className="overflow-hidden rounded-2xl border border-neutral-200">
              <img src={u.img} alt={`${u.name} video cover`} className="h-28 w-full object-cover" loading="lazy" />
              <div className="p-3">
                <p className="text-[13px] font-semibold text-neutral-900">{u.name}</p>
                <p className="text-[11px] text-neutral-500">{u.handle}</p>
                <button
                  onClick={() => u.sot && navigate({ to: "/id/$sotId", params: { sotId: u.sot } })}
                  className="mt-2 w-full rounded-lg bg-pink py-1.5 text-[12px] font-semibold text-white"
                >
                  Follow
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
