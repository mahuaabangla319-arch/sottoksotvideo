import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fetchFollowingSet, setFollow } from "@/lib/social";
import { downloadBrandedVideo } from "@/lib/video-studio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Users, Sparkles, User, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { CommentsSheet } from "@/components/CommentsSheet";
import { useAuth } from "@/lib/auth";
import { Button } from '@/components/ui/button';
import { avatarSrc } from '@/lib/profile';
import { creatorTopics } from '@/lib/creator-topics';
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
  avatar?: string | null | undefined;
  verified?: boolean;
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

function useFeed(topic: string, following: boolean, userId?: string) {
  return useInfiniteQuery({
    queryKey: ["feed", topic, following, userId],
    initialPageParam: 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    getNextPageParam: (last: FeedItem[], pages) => (last.length < PAGE_SIZE ? undefined : pages.length),
    queryFn: async ({ pageParam }): Promise<FeedItem[]> => {
      const from = (pageParam as number) * PAGE_SIZE;
      let query = supabase
        .from("videos")
        .select("id, caption, video_url, sound_name, views, likes, comments_count, user_id")
        .eq("visibility", "public")
        .eq("is_deleted", false)
        .eq("admin_hidden", false);
      if(topic!=='general')query=query.eq('category',topic);
      if(following){
        if(!userId)return [];
        const {data: follows,error}=await supabase.from('follows').select('following_id').eq('follower_id',userId);
        if(error)throw error;
        const ids=(follows??[]).map(f=>f.following_id);if(!ids.length)return [];
        query=query.in('user_id',ids);
      }
      const { data, error } = await query.order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if(error)throw error;

      const rows = data ?? [];
      if (!rows.length) return [];

      const ids = [...new Set(rows.map((v) => v.user_id))];
      const [{ data: profiles, error: profileError }, urls] = await Promise.all([
        supabase.from("profiles").select("id, username, sottok_id, avatar_url, verified, followers_count").in("id", ids),
        signBatch(rows.map((v) => v.video_url)),
      ]);
      if (profileError) throw profileError;
      const avatarById = new Map(await Promise.all((profiles ?? []).map(async (p) => [p.id, await avatarSrc(p.avatar_url)] as const)));
      const verifiedById = new Map((profiles ?? []).map((p) => [p.id, p.verified || p.followers_count >= 10_000]));
      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));
      const sotById = new Map((profiles ?? []).map((p) => [p.id, p.sottok_id]));

      return rows
        .map((v) => ({
          id: v.id,
          userId: v.user_id,
          sotId: sotById.get(v.user_id),
          avatar: avatarById.get(v.user_id),
          verified: verifiedById.get(v.user_id) ?? false,
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
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [burst, setBurst] = useState(0);
  const superLike = () => {
    if(item.id.startsWith('demo-')){toast.error('ডেমো ভিডিওতে লাইক করা যাবে না');return;}
    if(!liked)onToggleLike();
    setBurst(n=>n+1);
  };

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
    <section className="snap-item relative h-dvh w-full">
      <video
        ref={ref}
        src={active ? item.url : undefined}
        data-src={item.url}
        loop
        muted={muted}
        playsInline
        preload="none"
        onClick={onToggleMute}
        onDoubleClick={superLike}
        className="h-full w-full bg-media object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-media/75 via-transparent to-media/40" />
      {burst>0&&<Heart key={burst} className="animate-super-heart pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 fill-pink text-pink" aria-hidden="true"/>}

      {muted && (
        <span className="absolute right-3 top-24 rounded-full bg-media/50 px-3 py-1 text-[11px] text-on-media">
          Tap for sound
        </span>
      )}

      <div className="absolute bottom-24 right-3 flex w-12 flex-col items-center gap-5 text-on-media [&_svg]:size-8">
        <Button variant="ghost" onClick={onToggleLike} className="h-auto w-12 flex-col gap-1 p-0 hover:bg-on-media/10" aria-label="লাইক">
          <Heart className={`size-8 ${liked ? "fill-brand text-brand" : "text-on-media"}`} />
          <span className="text-xs">{formatCompact(item.likes)}</span>
        </Button>
        <Button variant="ghost" onClick={onOpenComments} className="h-auto w-12 flex-col gap-1 p-0 hover:bg-on-media/10" aria-label="কমেন্ট">
          <MessageCircle className="size-8" /><span className="text-xs">{formatCompact(commentCount)}</span>
        </Button>
        <Button variant="ghost" onClick={share} className="h-auto w-12 flex-col gap-1 p-0 hover:bg-on-media/10" aria-label="শেয়ার">
          <Share2 className="size-8" /><span className="text-xs">Share</span>
        </Button>
        <Button variant="ghost" className="h-auto w-12 flex-col gap-1 p-0 hover:bg-on-media/10" aria-label="সেভ">
          <Bookmark className="size-8" /><span className="text-xs">Save</span>
        </Button>
      </div>

      <div className="absolute bottom-20 left-3 right-20 text-on-media">
        <div className="mb-3 flex items-center gap-3">
          {item.sotId ? (
            <Link to="/id/$sotId" params={{ sotId: item.sotId }} aria-label="প্রোফাইল দেখুন" className="block size-20 shrink-0 overflow-hidden rounded-full border-[3px] border-on-media bg-media">
              {item.avatar ? <img src={item.avatar} alt={`${item.username} প্রোফাইল ছবি`} className="h-full w-full object-cover" loading="lazy" /> : <User className="h-full w-full p-4 text-on-media/60" />}
            </Link>
          ) : <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-[3px] border-on-media bg-media"><User className="size-9 text-on-media/60" /></div>}
          <div className="min-w-0 space-y-2">
            {!isMe && item.userId && <Button onClick={onFollow} aria-label={followed ? "আনফলো" : "ফলো"} aria-pressed={followed} className="h-10 bg-follow px-3 text-base font-bold text-on-media hover:bg-follow/90">
              {followed ? <Check className="size-5" /> : <Plus className="size-5" />} {followed ? "Following" : "Follow"}
            </Button>}
            {item.sotId && <p className="break-words text-[11px] font-medium">SOT TOK • ID: {item.sotId}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {item.sotId ? <Link to="/id/$sotId" params={{ sotId: item.sotId }} className="min-w-0 break-all text-xl font-bold">{item.username}</Link> : <p className="min-w-0 break-all text-xl font-bold">{item.username}</p>}
          {item.verified && <BadgeCheck aria-label="ভেরিফাইড" className="size-5 shrink-0 fill-verified text-on-media" />}
        </div>
        <p className="mt-1 text-sm text-on-media/70">{formatCompact(item.views)} views</p>
        <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed">{item.caption}</p>
        <p className="mt-2 truncate text-xs text-on-media/80">{item.sound}</p>
        <Button variant="ghost" onClick={() => item.userId && navigate({ to: "/create", search: { sound: item.id } })} disabled={!item.userId} className="mt-2 h-8 rounded-full bg-on-media/15 px-3 text-xs text-on-media hover:bg-on-media/25">
          <Music2 className="size-3.5" /> Use this sound
        </Button>
        <div className="mt-1 flex gap-1">
          <Button variant="ghost" size="icon" onClick={superLike} aria-label="সুপার লাইক" title="সুপার লাইক" className="size-8 text-pink hover:bg-on-media/10"><Sparkles className="size-4" /></Button>
          {item.userId && <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/create", search: { duet: item.id } })} aria-label="ডুয়েট" title="ডুয়েট" className="size-8 hover:bg-on-media/10"><Users className="size-4" /></Button>}
          <Button variant="ghost" size="icon" disabled={downloading || !item.sotId} aria-label="ডাউনলোড" title={downloading ? "তৈরি হচ্ছে…" : "ডাউনলোড"} className="size-8 hover:bg-on-media/10" onClick={() => {
            setDownloading(true);
            void downloadBrandedVideo(item.url, item.sotId ?? "", `sottok-${item.sotId}`)
              .then(() => toast.success("SOT ID সহ ভিডিও ডাউনলোড হয়েছে"))
              .catch((error) => toast.error(error instanceof Error ? error.message : "ডাউনলোড করা যায়নি"))
              .finally(() => setDownloading(false));
          }}><Download className="size-4" /></Button>
        </div>
      </div>
    </section>
  );
}

function FeedPage() {
  const { user } = useAuth();
  const [topic,setTopic]=useState('general');
  const [muted, setMuted] = useState(true);
  const [tab, setTab] = useState<"following" | "foryou">("foryou");
  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(topic,tab==='following',user?.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({});
  const [commentDelta, setCommentDelta] = useState<Record<string, number>>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [followSet, setFollowSet] = useState<Set<string>>(new Set());
  const scrollerRef = useRef<HTMLDivElement>(null);

  const baseItems = useMemo(() => {
    const rows = (data?.pages ?? []).flat();
    return rows.length ? rows : topic==='general'&&tab==='foryou' ? demoVideos : [];
  }, [data,topic,tab]);
  useEffect(()=>{scrollerRef.current?.scrollTo({top:0});setActiveIndex(0);},[topic,tab]);

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
    let alive = true;
    setFollowSet(new Set());
    if (!user || !ids.length) return;
    void fetchFollowingSet(user.id, ids).then((value) => { if (alive) setFollowSet(value); });
    return () => { alive = false; };
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
    <div className="mx-auto w-full max-w-[420px] bg-media">
      <div className="fixed left-1/2 top-0 z-40 flex w-full max-w-[420px] -translate-x-1/2 flex-wrap justify-center gap-x-6 gap-y-2 bg-media/70 pt-3 pb-2 text-on-media">
        <Button variant="ghost"
          onClick={() => setTab("following")}
          className={tab === "following" ? "text-[15px] font-bold text-on-media" : "text-[15px] text-on-media/60"}
        >
          Following
        </Button>
        <Button variant="ghost"
          onClick={() => setTab("foryou")}
          className={tab === "foryou" ? "text-[15px] font-bold text-on-media" : "text-[15px] text-on-media/60"}
        >
          For You
        </Button>
        <label className="flex w-full items-center justify-center gap-2 text-xs">পছন্দের বিষয়<select aria-label="পছন্দের বিষয়" value={topic} onChange={e=>setTopic(e.target.value)} className="max-w-36 rounded-md border border-on-media/20 bg-media px-2 py-1 text-on-media">{creatorTopics.map(t=><option key={t.key} value={t.key}>{t.name}</option>)}</select></label>
      </div>

      <div ref={scrollerRef} onScroll={onScroll} className="snap-feed no-scrollbar h-dvh overflow-y-scroll">
        {error?<div role="alert" className="flex h-dvh items-center justify-center text-on-media">ফিড খোলা যায়নি; আবার চেষ্টা করুন</div>:isLoading ? (
          <div className="flex h-dvh items-center justify-center text-on-media/50">লোড হচ্ছে…</div>
        ) : !items.length ? <div className="flex h-dvh items-center justify-center px-8 text-center text-on-media/70">{tab==='following'&&!user?'ফলো করা ভিডিও দেখতে সাইন ইন করুন':'এই বিষয়ে এখনো কোনো ভিডিও নেই'}</div> : (
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

      <BottomNav />
    </div>
  );
}
