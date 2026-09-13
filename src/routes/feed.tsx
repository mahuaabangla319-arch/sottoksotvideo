import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "For You — SOT TOK" },
      { name: "description", content: "বাংলা শর্ট ভিডিও ফিড — রান্না, কমেডি, ড্যান্স আর ফ্যামিলি ভিডিও।" },
      { property: "og:title", content: "For You — SOT TOK" },
      { property: "og:description", content: "বাংলা শর্ট ভিডিও ফিড — রান্না, কমেডি, ড্যান্স আর ফ্যামিলি ভিডিও।" },
    ],
  }),
  component: FeedPage,
});

type FeedItem = {
  id: string;
  username: string;
  caption: string;
  url: string;
  sound: string;
  views: string;
  likes: string;
};

const demoVideos: FeedItem[] = [
  {
    id: "demo-1",
    username: "@bangla_kitchen",
    caption: "আজকের রেসিপি: ঘরোয়া ইলিশ ভুনা 🔥",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: "1.0M",
    likes: "4.0K",
  },
  {
    id: "demo-2",
    username: "@rannaghor",
    caption: "৫ মিনিটে চিকেন কারি 🍛",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: "820K",
    likes: "3.2K",
  },
  {
    id: "demo-3",
    username: "@sottok_food",
    caption: "গরম গরম পিঠা 😍",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: "610K",
    likes: "2.7K",
  },
];

async function resolveUrl(path: string) {
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("videos").createSignedUrl(path, 60 * 60 * 8);
  return data?.signedUrl ?? "";
}

function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: async (): Promise<FeedItem[]> => {
      const { data } = await supabase
        .from("videos")
        .select("id, caption, video_url, sound_name, views, likes, user_id")
        .order("created_at", { ascending: false })
        .limit(20);

      const ids = [...new Set((data ?? []).map((v) => v.user_id))];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, username").in("id", ids)
        : { data: [] };
      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));

      const rows = await Promise.all(
        (data ?? []).map(async (v) => ({
          id: v.id,
          username: "@" + (nameById.get(v.user_id) || "sottok"),
          caption: v.caption,
          url: await resolveUrl(v.video_url),
          sound: v.sound_name,
          views: String(v.views ?? 0),
          likes: String(v.likes ?? 0),
        })),
      );

      return [...rows.filter((r) => r.url), ...demoVideos];
    },
  });
}

function VideoCard({ item, muted, onToggleMute }: { item: FeedItem; muted: boolean; onToggleMute: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.6 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="snap-item relative h-screen w-full">
      <video
        ref={ref}
        src={item.url}
        loop
        muted={muted}
        playsInline
        onClick={onToggleMute}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />

      {muted && (
        <span className="absolute right-3 top-14 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">
          Tap for sound
        </span>
      )}

      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
        <div className="relative mb-1">
          <div className="h-12 w-12 rounded-full border-2 border-white bg-flame" />
          <span className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-red-600">
            <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </span>
        </div>
        <button onClick={() => setLiked((v) => !v)} className="flex flex-col items-center gap-1">
          <Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          <span className="text-[11px] text-white">{item.likes}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">0</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Share2 className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">0</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bookmark className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">Save</span>
        </button>
      </div>

      <div className="absolute bottom-24 left-4 right-24">
        <p className="text-[15px] font-semibold text-white">{item.username}</p>
        <p className="text-[12px] text-white/70">{item.views} views</p>
        <p className="mt-1 text-[13px] text-white">{item.caption}</p>
        <p className="mt-1 text-[12px] text-white/80">{item.sound}</p>
        <button className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] text-white backdrop-blur">
          <Music2 className="h-3.5 w-3.5" /> Use this sound
        </button>
      </div>
    </section>
  );
}

function FeedPage() {
  const { data, isLoading } = useFeed();
  const [muted, setMuted] = useState(true);
  const [tab, setTab] = useState<"following" | "foryou">("foryou");

  return (
    <div className="mx-auto w-full max-w-[420px] bg-black">
      <div className="fixed left-1/2 top-0 z-40 flex w-full max-w-[420px] -translate-x-1/2 justify-center gap-6 pt-4">
        <button
          onClick={() => setTab("following")}
          className={tab === "following" ? "text-[15px] font-bold text-white" : "text-[15px] text-white/60"}
        >
          Following
        </button>
        <button
          onClick={() => setTab("foryou")}
          className={tab === "foryou" ? "text-[15px] font-bold text-white" : "text-[15px] text-white/60"}
        >
          For You
        </button>
      </div>

      <div className="snap-feed no-scrollbar h-screen overflow-y-scroll">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center text-white/50">লোড হচ্ছে…</div>
        ) : (
          (data ?? []).map((item) => (
            <VideoCard key={item.id} item={item} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
