import { createFileRoute, Link } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Download, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { CommentsSheet } from "@/components/CommentsSheet";
import { GiftSheet } from "@/components/GiftSheet";
import { useAuth } from "@/lib/auth";
import {
  countView,
  fetchMyLikes,
  formatCompact,
  likeVideo,
  unlikeVideo,
} from "@/lib/engagement";

const DESC = "ভারতের শর্ট ভিডিও ফিড — ড্যান্স, কমেডি, রান্না আর ফ্যামিলি ভিডিও।";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "For You — SOT TOK" },
      { name: "description", content: DESC },
      { property: "og:title", content: "For You — SOT TOK" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

type FeedItem = {
  id: string;
  userId?: string | undefined;
  sotId?: string | undefined;
  username: string;
  caption: string;
  url: string;
  sound: string;
  views: number;
  likes: number;
  comments: number;
};

const PAGE_SIZE = 6;

const demoVideos: FeedItem[] = [
  {
    id: "demo-1",
    username: "@india_kitchen",
    caption: "আজকের রেসিপি: ঘরোয়া পনির বাটার মশলা 🔥",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: 1_000_000,
    likes: 4000,
    comments: 0,
  },
  {
    id: "demo-2",
    username: "@rannaghor",
    caption: "৫ মিনিটে চিকেন কারি 🍛",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: 820_000,
    likes: 3200,
    comments: 0,
  },
  {
    id: "demo-3",
    username: "@sottok_food",
    caption: "গরম গরম পিঠা 😍",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    sound: "Original sound - SOT TOK Artist",
    views: 610_000,
    likes: 2700,
    comments: 0,
  },
];

/** One batched signing call for the whole page instead of one request per video. */
async function signBatch(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const storagePaths = paths.filter((p) => !p.startsWith("http"));
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  if (storagePaths.length) {
    const { data } = await supabase.storage.from("videos").createSignedUrls(storagePaths, 60 * 60 * 8);
    (data ?? []).forEach((d) => {
      if (d.path && d.signedUrl) map.set(d.path, d.signedUrl);
    });
  }
  return map;
}

function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    initialPageParam: 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    getNextPageParam: (last: FeedItem[], pages) => (last.length < PAGE_SIZE ? undefined : pages.length),
    queryFn: async ({ pageParam }): Promise<FeedItem[]> => {
      const from = (pageParam as number) * PAGE_SIZE;
      const { data } = await supabase
        .from("videos")
        .select("id, caption, video_url, sound_name, views, likes, comments_count, user_id")
        .eq("visibility", "public")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);


      const rows = data ?? [];
      if (!rows.length) return [];

      const ids = [...new Set(rows.map((v) => v.user_id))];
      const [{ data: profiles }, urls] = await Promise.all([
        supabase.from("profiles").select("id, username, sottok_id").in("id", ids),
        signBatch(rows.map((v) => v.video_url)),
      ]);
      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));
      const sotById = new Map((profiles ?? []).map((p) => [p.id, p.sottok_id]));

      return rows
        .map((v) => ({
          id: v.id,
          userId: v.user_id,
          sotId: sotById.get(v.user_id),
          username: "@" + (nameById.get(v.user_id) || "sottok"),
          caption: v.caption,
          url: urls.get(v.video_url) ?? "",
          sound: v.sound_name,
          views: v.views ?? 0,
          likes: v.likes ?? 0,
          comments: v.comments_count ?? 0,
        }))
        .filter((r) => r.url);
    },
  });
}

function VideoCard({
  item,
  muted,
  onToggleMute,
  active,
  liked,
  onToggleLike,
  commentCount,
  onOpenComments,
  followed,
  onFollow,
  isMe,
}: {
  followed: boolean;
  onFollow: () => void;
  isMe: boolean;
  item: FeedItem;
  muted: boolean;
  onToggleMute: () => void;
  active: boolean;
  liked: boolean;
  onToggleLike: () => void;
  commentCount: number;
  onOpenComments: () => void;
  onOpenGift: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      void el.play().catch(() => {});
      void countView(item.id);
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [active, item.id]);

  async function share() {
    const url = `${window.location.origin}/feed`;
    try {
      if (navigator.share) await navigator.share({ title: "SOT TOK", text: item.caption, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("লিঙ্ক কপি হয়েছে");
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <section className="snap-item relative h-screen w-full">
      <video
        ref={ref}
        src={active ? item.url : undefined}
        data-src={item.url}
        loop
        muted={muted}
        playsInline
        preload="none"
        onClick={onToggleMute}
        className="h-full w-full bg-black object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />

      {muted && (
        <span className="absolute right-3 top-14 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">
          Tap for sound
        </span>
      )}

      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1" aria-label="লাইক">
          <Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          <span className="text-[11px] text-white">{formatCompact(item.likes)}</span>
        </button>
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1" aria-label="কমেন্ট">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">{formatCompact(commentCount)}</span>
        </button>
        <button onClick={share} className="flex flex-col items-center gap-1" aria-label="শেয়ার">
          <Share2 className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">Share</span>
        </button>
        <button
          onClick={() => {
            toast("ডাউনলোড শুরু হয়েছে…");
            void downloadVideo(item.url, `sottok-${item.id.slice(0, 8)}`);
          }}
          className="flex flex-col items-center gap-1"
          aria-label="ডাউনলোড"
        >
          <Download className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">ডাউনলোড</span>
        </button>
        <button className="flex flex-col items-center gap-1" aria-label="সেভ">
          <Bookmark className="h-8 w-8 text-white" />
          <span className="text-[11px] text-white">Save</span>
        </button>
      </div>

      <div className="absolute bottom-24 left-4 right-24">
        <div className="mb-2 flex items-center gap-2.5">
          {item.sotId ? (
            <Link to="/id/$sotId" params={{ sotId: item.sotId }} aria-label="প্রোফাইল দেখুন" className="block h-10 w-10 shrink-0 rounded-full border-2 border-white bg-flame" />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-full border-2 border-white bg-flame" />
          )}
          <div className="min-w-0">
            {item.sotId ? (
              <Link to="/id/$sotId" params={{ sotId: item.sotId }} className="block truncate text-[15px] font-semibold text-white">{item.username}</Link>
            ) : (
              <p className="truncate text-[15px] font-semibold text-white">{item.username}</p>
            )}
            <p className="text-[11px] text-white/60">Follower · Following</p>
          </div>
          {!isMe && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={onFollow}
                className={`rounded-full px-3.5 py-1 text-[12px] font-semibold text-white ${followed ? "bg-white/20" : "bg-red-600"}`}
              >
                {followed ? "Following" : "Follow"}
              </button>
              {item.userId && (
                <button
                  onClick={onOpenGift}
                  className="flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1 text-[12px] font-semibold text-white"
                  aria-label="গিফট পাঠান"
                >
                  <Gift className="h-3.5 w-3.5 text-gold" /> Gift
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-[12px] text-white/70">{formatCompact(item.views)} views</p>
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
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const [muted, setMuted] = useState(true);
  const [tab, setTab] = useState<"following" | "foryou">("foryou");
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({});
  const [commentDelta, setCommentDelta] = useState<Record<string, number>>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [openGift, setOpenGift] = useState<string | null>(null);
  const [followSet, setFollowSet] = useState<Set<string>>(new Set());
  const scrollerRef = useRef<HTMLDivElement>(null);

  const baseItems = useMemo(() => {
    const rows = (data?.pages ?? []).flat();
    return rows.length ? rows : demoVideos;
  }, [data]);

  const items = useMemo(
    () =>
      baseItems.map((i) => ({
        ...i,
        likes: Math.max(0, i.likes + (likeDelta[i.id] ?? 0)),
      })),
    [baseItems, likeDelta],
  );

  useEffect(() => {
    const ids = baseItems.map((i) => i.id).filter((id) => !id.startsWith("demo-"));
    if (!user || !ids.length) return;
    let alive = true;
    void fetchMyLikes(ids, user.id).then((s) => alive && setLikedIds(s));
    return () => {
      alive = false;
    };
  }, [baseItems, user]);

  useEffect(() => {
    const ids = [...new Set(baseItems.map((i) => i.userId).filter((x): x is string => !!x))];
    if (!user || !ids.length) return;
    void fetchFollowingSet(user.id, ids).then(setFollowSet);
  }, [baseItems, user]);

  async function toggleFollow(other?: string) {
    if (!other) { toast.error("ডেমো ভিডিও"); return; }
    if (!user) { toast.error("ফলো করতে লগইন করুন"); return; }
    const was = followSet.has(other);
    setFollowSet((s) => { const n = new Set(s); if (was) n.delete(other); else n.add(other); return n; });
    try {
      await setFollow(user.id, other, !was);
      toast.success(was ? "আনফলো করা হয়েছে" : "ফলো করা হয়েছে");
    } catch {
      setFollowSet((s) => { const n = new Set(s); if (was) n.add(other); else n.delete(other); return n; });
      toast.error("আবার চেষ্টা করুন");
    }
  }

  async function toggleLike(id: string) {
    if (!user) {
      toast.error("লাইক করতে লগইন করুন");
      return;
    }
    if (id.startsWith("demo-")) {
      toast.error("ডেমো ভিডিওতে লাইক করা যাবে না");
      return;
    }
    const wasLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(id);
      else next.add(id);
      return next;
    });
    setLikeDelta((d) => ({ ...d, [id]: (d[id] ?? 0) + (wasLiked ? -1 : 1) }));
    try {
      if (wasLiked) await unlikeVideo(id, user.id);
      else await likeVideo(id, user.id);
    } catch {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(id);
        else next.delete(id);
        return next;
      });
      setLikeDelta((d) => ({ ...d, [id]: (d[id] ?? 0) + (wasLiked ? 1 : -1) }));
      toast.error("আবার চেষ্টা করুন");
    }
  }

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex((prev) => (prev === index ? prev : index));
    if (hasNextPage && !isFetchingNextPage && index >= items.length - 2) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, items.length]);

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

      <div ref={scrollerRef} onScroll={onScroll} className="snap-feed no-scrollbar h-screen overflow-y-scroll">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center text-white/50">লোড হচ্ছে…</div>
        ) : (
          items.map((item, i) => (
            <VideoCard
              key={item.id}
              item={item}
              active={i === activeIndex}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              liked={likedIds.has(item.id)}
              onToggleLike={() => void toggleLike(item.id)}
              commentCount={Math.max(0, item.comments + (commentDelta[item.id] ?? 0))}
              onOpenComments={() => setOpenComments(item.id)}
              onOpenGift={() => setOpenGift(item.id)}
              followed={!!item.userId && followSet.has(item.userId)}
              onFollow={() => void toggleFollow(item.userId)}
              isMe={!!user && item.userId === user.id}
            />
          ))
        )}
      </div>

      {openComments && (
        <CommentsSheet
          videoId={openComments}
          open
          onClose={() => setOpenComments(null)}
          onCountChange={(delta) =>
            setCommentDelta((d) => ({ ...d, [openComments]: (d[openComments] ?? 0) + delta }))
          }
        />
      )}

      {openGift && (
        <GiftSheet
          videoId={openGift}
          open
          onClose={() => setOpenGift(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
