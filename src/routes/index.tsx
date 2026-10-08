import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: HomePage,
});

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
];

function HomePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [showGift, setShowGift] = useState(false);
  const [showLudo, setShowLudo] = useState(false);
  const [balance, setBalance] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("videos").select("*, profiles(username, avatar_url, unique_id)").order("created_at", { ascending: false }).limit(30);
      if (data) setVideos(data);
    };
    load();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <div className="flex justify-center gap-6 py-2 font-bold bg-black sticky top-0 z-20">
        <span className="opacity-40">Following</span>
        <span className="border-b-2 border-white">For You</span>
        <button onClick={() => setShowLudo(true)} className="bg-purple-600 px-3 py-1 rounded-full text-xs">🎲 LUDO</button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto h-[92vh] snap-y snap-mandatory">
        {videos.map((v: any) => (
          <div key={v.id} className="relative h-[92vh] w-full snap-start bg-zinc-900">
            <video src={v.video_url} autoPlay muted loop playsInline className="h-full w-full object-cover" onClick={(e: any) => e.target.muted =!e.target.muted} />
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px]">SOT TOK @{v.profiles?.username} ID:{v.profiles?.unique_id}</div>
            <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
              <p className="font-bold text-sm">@{v.profiles?.username}</p>
            </div>
            <div className="absolute right-2 bottom-32 flex flex-col gap-5 text-center">
              <button onClick={() => setShowGift(true)}><span className="text-3xl">🎁</span><br/><span className="text-xs">Gift</span></button>
              <button><span className="text-2xl">❤️</span><br/><span className="text-xs">2</span></button>
              <button onClick={() => { const a = document.createElement('a'); a.href = v.video_url; a.download = `SOT_TOK_${v.profiles?.unique_id}.mp4`; a.click(); }}><span className="text-xl">⬇️</span><br/><span className="text-xs">Download</span></button>
            </div>
          </div>
        ))}
      </div>

      {showGift && (
        <div className="fixed bottom-0 left-0 w-full bg-[#121212] rounded-t-3xl p-4 h-[65vh] overflow-y-auto z-50 border-t border-zinc-700">
          <div className="flex justify-between"><h3 className="font-bold">🎁 300 Gifts - Free</h3><button onClick={() => setShowGift(false)}>❌</button></div>
          <div className="bg-zinc-800 rounded p-2 mt-2 text-sm">🪙 Balance: {balance} Coins</div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {ALL_GIFTS.map((g: any) => (
              <div key={g.id} className="bg-zinc-800 p-2 rounded text-center">