import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import ganeshContest from "@/assets/ganesh-contest.jpg.asset.json";
import durgaInvite from "@/assets/durga-invite.jpg.asset.json";
import ringChallenge from "@/assets/ring-challenge.jpg.asset.json";
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
        .eq("is_hidden", false)
        .order("followers_count", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });
}

function ExplorePage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Trending");
  const [query, setQuery] = useState("");
  const { data: creators } = useTopCreators();

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


        <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto">
          {[
            { src: ganeshContest.url, alt: "গণেশ চতুর্থী স্পেশাল কনটেস্ট — নিজের ক্যামেরায় ভিডিও বানাও" },
            { src: durgaInvite.url, alt: "ওয়ার্ল্ড গ্রুপের পক্ষ থেকে শারদীয়ার সাদর আমন্ত্রণ" },
            { src: ringChallenge.url, alt: "SOT TOK কয়েন টু রিং চ্যালেঞ্জ" },
          ].map((b) => (
            <img
              key={b.src}
              src={b.src}
              alt={b.alt}
              className="w-[86%] shrink-0 snap-center rounded-[24px] object-cover"
              loading="lazy"
            />
          ))}
        </div>

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

        <p className="py-10 text-center text-[13px] text-neutral-400">
          এখনো কোনো ট্রেন্ডিং হ্যাশট্যাগ নেই।
        </p>

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
