
      import { createFileRoute } from "@tanstack/react-router";
import { memo, useState } from "react";
import { Heart, MessageCircle, Share2, Sparkles, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/feed")({
  component: SuperFastFeed,
});

const DUMMY_VIDEOS = [
  {
    id: "v1",
    username: "@priya_dance",
    caption: "সেরা ড্যান্স রিল 🔥 #bengali #dance",
    avatar: "https://i.pravatar.cc/80?img=49",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    likes: "42.5K",
    comments: "850",
  },
  {
    id: "v2",
    username: "@kolkata_vibe",
    caption: "কলকাতা স্পেশাল স্ট্রিট ফুড 🍛 #food #kolkata",
    avatar: "https://i.pravatar.cc/80?img=32",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    likes: "35.2K",
    comments: "620",
  },
  {
    id: "v3",
    username: "@sottok_music",
    caption: "নতুন বাংলা ট্রেন্ডিং গান 🎵 #sottok #music",
    avatar: "https://i.pravatar.cc/80?img=68",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: "28.1K",
    comments: "410",
  },
];

const GIFTS = [
  { name: "Rose", icon: "🌹", coins: 10 },
  { name: "Chocolate", icon: "🍫", coins: 20 },
  { name: "Heart", icon: "💖", coins: 50 },
  { name: "Crown", icon: "👑", coins: 100 },
  { name: "Diamond", icon: "💎", coins: 200 },
  { name: "Car", icon: "🚗", coins: 500 },
  { name: "Palace", icon: "🏰", coins: 1000 },
  { name: "Rocket", icon: "🚀", coins: 2000 },
];

const FastVideoCard = memo(function FastVideoCard({
  item,
  onOpenGift,
}: {
  item: (typeof DUMMY_VIDEOS)[0];
  onOpenGift: () => void;
}) {
  return (
    <section className="relative h-dvh w-full snap-start bg-black">
      <video
        src={item.url}
        loop
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
      />

      {/* ডান অ্যাকশন বার */}
      <aside className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
        <button className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-black/40 p-2.5 backdrop-blur-md">
            <Heart className="h-7 w-7 text-white fill-white/10" />
          </div>
          <span className="text-xs font-semibold">{item.likes}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-black/40 p-2.5 backdrop-blur-md">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-semibold">{item.comments}</span>
        </button>

        {/* 🎁 গিফট বাটন */}
        <button onClick={onOpenGift} className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-amber-500/30 p-2.5 backdrop-blur-md border border-amber-400">
            <span className="text-2xl leading-none">🎁</span>
          </div>
          <span className="text-xs font-semibold text-amber-300">গিফট</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-black/40 p-2.5 backdrop-blur-md">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-semibold">শেয়ার</span>
        </button>
      </aside>

      {/* নিচে ক্রিয়েটর ইনফো */}
      <footer className="absolute bottom-16 left-3 right-16 z-20 text-white">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={item.avatar}
            alt=""
            className="h-10 w-10 rounded-full border-2 border-fuchsia-500 object-cover"
          />
          <span className="font-bold text-sm drop-shadow">{item.username}</span>
        </div>
        <p className="text-xs text-white/90 line-clamp-2 drop-shadow">{item.caption}</p>
      </footer>
    </section>
  );
});

export function SuperFastFeed() {
  // শুধুমাত্র ২টি স্টেট
  const [activeIdx, setActiveIdx] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);

  return (
    <main className="mx-auto h-dvh w-full max-w-[420px] bg-black overflow-hidden relative">
      {/* কোনো লোডিং স্পিনার নেই — সরাসরি ইনস্ট্যান্ট স্ক্রলিং */}
      <div
        className="h-dvh overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        onScroll={(e) => {
          const idx = Math.round(e.currentTarget.scrollTop / window.innerHeight);
          if (idx !== activeIdx) setActiveIdx(idx);
        }}
      >
        {DUMMY_VIDEOS.map((v) => (
          <FastVideoCard key={v.id} item={v} onOpenGift={() => setGiftOpen(true)} />
        ))}
      </div>

      {/* 🎁 ওয়ালেট ও ৮টি গিফট বটম শীট */}
      {giftOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-[420px] rounded-t-2xl bg-zinc-950 p-4 border-t border-white/10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-white text-base">ক্রিয়েটরকে উপহার দিন 🎁</h3>
                <p className="text-xs text-zinc-400">
                  মেইন: <span className="text-emerald-400 font-bold">₹2,500</span> | কয়েন:{" "}
                  <span className="text-amber-400 font-bold">1,250 🪙</span>
                </p>
              </div>
              <button
                onClick={() => setGiftOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ৮টি গিফট গ্রিড */}
            <div className="grid grid-cols-4 gap-2.5 py-4">
              {GIFTS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => alert(`${g.name} গিফট পাঠানো হয়েছে!`)}
                  className="flex flex-col items-center rounded-xl bg-white/5 p-2.5 border border-white/5 hover:border-amber-400/50 active:scale-95 transition"
                >
                  <span className="text-3xl mb-1">{g.icon}</span>
                  <span className="text-[11px] text-white font-medium">{g.name}</span>
                  <span className="text-[10px] text-amber-400 font-bold">{g.coins} কয়েন</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
