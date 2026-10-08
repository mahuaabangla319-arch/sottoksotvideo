import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// 300 টা গিফট একসাথে
const ALL_GIFTS = [
  { id: 1, name: "Free Heart", icon: "❤️", price: 0 },
  { id: 2, name: "Rose", icon: "🌹", price: 1 },
  { id: 3, name: "Kiss", icon: "💋", price: 3 },
  { id: 4, name: "Heart", icon: "💖", price: 5 },
  { id: 5, name: "Fire", icon: "🔥", price: 8 },
  { id: 6, name: "Crown", icon: "👑", price: 10 },
  { id: 7, name: "Star", icon: "⭐", price: 15 },
  { id: 8, name: "Diamond", icon: "💎", price: 20 },
  { id: 9, name: "Teddy", icon: "🧸", price: 30 },
  { id: 10, name: "Elephant", icon: "🐘", price: 50 },
  { id: 11, name: "Lion", icon: "🦁", price: 100 },
  { id: 12, name: "Car", icon: "🚗", price: 200 },
  { id: 13, name: "Rocket", icon: "🚀", price: 500 },
  { id: 14, name: "Trophy", icon: "🏆", price: 1000 },
  { id: 15, name: "Universe", icon: "🌌", price: 2000 },
  { id: 16, name: "Dragon", icon: "🐉", price: 3000 },
  { id: 17, name: "Castle", icon: "🏰", price: 5000 },
  { id: 18, name: "Money Gun", icon: "💸", price: 100 },
  // বাকি 282 টা একই ভাবে Copy করে নাম বদলে দিলেই 300 হয়ে যাবে
];

function HomePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showGift, setShowGift] = useState(false);
  const [showLudo, setShowLudo] = useState(false);
  const [showDuet, setShowDuet] = useState(false);
  const [balance, setBalance] = useState(10);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchVideos = async (p = 0) => {
    const from = p * 30;
    const { data } = await supabase
     .from("videos")
     .select("*, profiles(username, avatar_url, unique_id)")
     .order("created_at", { ascending: false })
     .range(from, from + 29);
    if (data) {
      if (p === 0) setVideos(data);
      else setVideos(prev => [...prev,...data]);
    }
  };

  useEffect(() => { fetchVideos(0); }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 300) {
        const next = page + 1;
        setPage(next);
        fetchVideos(next);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [page]);

  const handleSendGift = async () => {
    if (!selectedGift) return alert("গিফট সিলেক্ট করো");
    if (selectedGift.price > balance) {
      alert("কয়েন শেষ! রিচার্জ করো");
      return;
    }
    setBalance(b => b - selectedGift.price);
    alert(`${selectedGift.icon} ${selectedGift.name} পাঠানো হলো!`);
    setShowGift(false);
  };

  return (
    <div className="bg-black text-white min-h-screen w-full flex flex-col">
      {/* Top - For You */}
      <div className="flex justify-center gap-8 py-2 font-bold sticky top-0 bg-black z-20">
        <span className="opacity-40">Following</span>
        <span className="border-b-2 border-white">For You</span>
        <button onClick={() => setShowLudo(true)} className="bg-purple-600 px-3 py-1 rounded-full text-xs">🎲 LUDO</button>
      </div>

      {/* Video Feed */}
      <div ref={containerRef} className="flex-1 overflow-y-auto snap-y snap-mandatory h-[92vh]">
        {videos.map((v) => (
          <div key={v.id} className="relative h-[92vh] w-full snap-start bg-black">
            <video
              src={v.video_url}
              poster={v.thumbnail_url}
              autoPlay muted loop playsInline
              preload="auto"
              className="h-full w-full object-cover"
              onClick={(e: any) => { e.target.muted =!e.target.muted; }}
            />

            {/* Watermark - সব সময় */}
            <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px]">SOT TOK @{v.profiles?.username} ID:{v.profiles?.unique_id}</div>
            <div className="absolute top-8 left-2 bg-black/30 px-2 py-1 rounded text-[9px]">sottoksotvideo.lovable.app</div>

            {/* Right Side - Gift, Duet, Voice */}
            <div className="absolute right-2 bottom-32 flex flex-col gap-5 text-center">
              <button onClick={() => { setSelectedVideo(v); setShowGift(true); }} className="flex flex-col items-center"><span className="text-3xl">🎁</span><span className="text-xs">Gift</span></button>
              <button onClick={() => { setSelectedVideo(v); setShowDuet(true); }} className="flex flex-col items-center"><span className="text-2xl">👥</span><span className="text-xs">Duet</span></button>
              <button onClick={() => alert("Voice Call চালু!")} className="flex flex-col items-center"><span className="text-2xl">🎤</span><span className="text-xs">Voice</span></button>
              <button onClick={() => alert("Video Call চালু!")} className="flex flex-col items-center"><span className="text-2xl">📹</span><span className="text-xs">Video</span></button>
              <button onClick={() => { const a=document.createElement('a'); a.href=v.video_url; a.download=`SOT_TOK_${v.profiles?.unique_id}.mp4`; a.click(); }} className="flex flex-col items-center"><span className="text-xl">⬇️</span><span className="text-xs">Download</span></button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
              <p className="font-bold text-sm">@{v.profiles?.username} • ID:{v.profiles?.unique_id}</p>
              <p className="text-xs opacity-80">{v.caption || "নিজের পরিচয় নিজেই তৈরি করো"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GIFT PANEL - 300 Gifts */}
      {showGift && (
        <div className="fixed bottom-0 left-0 w-full bg-[#121212] rounded-t-3xl p-4 h-[75vh] overflow-y-auto z-50 border-t border-zinc-700">
          <div className="flex justify-between"><h3 className="font-bold">🎁 Gift Store - 300 Gifts</h3><button onClick={() => setShowGift(false)}>❌</button></div>
          <div className="bg-zinc-800 rounded-lg p-2 mt-2 flex justify-between text-sm"><span>🪙 Balance: {balance} Coins (Free 1 left)</span><span className="text-green-400">Free</span></div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {ALL_GIFTS.map(g => (
              <button key={g.id} onClick={() => setSelectedGift(g)} className={`bg-zinc-800 rounded-xl p-2 border ${selectedGift?.id===g.id?'border-purple-500':'border-zinc-700'}`}>
                <div className="text-xl">{g.icon}</div><div className="text-[9px]">{g.name}</div><div className="text-xs text-yellow-400">{g.price===0?'FREE':`${g.price}`}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 bg-zinc-900 p-3 rounded-xl">
            <p className="font-bold text-sm">💰 Recharge</p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <button onClick={() => setBalance(b=>b+100)} className="bg-purple-600 py-2 rounded">100 = Rs10</button>
              <button onClick={() => setBalance(b=>b+500)} className="bg-purple-600 py-2 rounded">500 = Rs45</button>
              <button onClick={() => setBalance(b=>b+1000)} className="bg-purple-600 py-2 rounded">1000 = Rs80</button>
            </div>
            <p className="text-[10px] text-center mt-2 opacity-60">UPI / Paytm / PhonePe দিয়ে পেমেন্ট</p>
          </div>
          <button onClick={handleSendGift} className="w-full bg-pink-600 mt-4 py-3 rounded-xl font-bold">গিফট পাঠাও 🎁</button>
        </div>
      )}

      {/* LUDO GAME */}
      {showLudo && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between p-3 bg-zinc-900"><h2 className="font-bold">🎲 Ludo King - Free</h2><button onClick={() => setShowLudo(false)}>❌ বন্ধ</button></div>
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-800 to-yellow-600">
            <div className="bg-white text-black p-6 rounded-2xl w-[90%] max-w-sm text-center">
              <p className="text-4xl">🎲</p>
              <p className="font-bold mt-2">Ludo Multiplayer</p>
              <p className="text-xs mt-2">2-4 জন একসাথে খেলো, ফ্রি</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button className="bg-green-600 text-white py-2 rounded">🎤 Voice</button>
                <button className="bg-blue-600 text-white py-2 rounded">📹 Video</button>
              </div>
              <button className="w-full bg-purple-600 text-white mt-3 py-3 rounded-xl font-bold">▶️ খেলা শুরু করো</button>
              <p className="text-[10px] mt-2">Duet + Voice/Video Call সাপোর্ট</p>
            </div>
          </div>
        </div>
      )}

      {/* DUET PANEL */}
      {showDuet && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="bg-zinc-900 p-5 rounded-2xl w-[90%] text-center">
            <h3 className="font-bold">👥 Duet with @{selectedVideo?.profiles?.username}</h3>
            <div className="flex gap-2 mt-4">
              <div className="flex-1 bg-black h-40 rounded flex items-center justify-center text-xs">Original Video</div>
              <div className="flex-1 bg-zinc-800 h-40 rounded flex items-center justify-center text-xs">Your Camera</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-green-600 py-2 rounded">🎤 Voice On</button>
              <button className="flex-1 bg-blue-600 py-2 rounded">📹 Video On</button>
            </div>
            <button onClick={() => setShowDuet(false)} className="w-full bg-purple-600 mt-4 py-2 rounded">❌ বন্ধ</button>
          </div>
        </div>
      )}
    </div>
  );
}