import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: VigoSotTok });

const GIFTS = ["❤️","🌹","💋","💖","🔥","👑","💎","🦁","🚀","🎁","💰","⭐","🎉","💐","🧸","💍","🏆","💸","⚡","🦄","🌈","💃","🎈","💌"];

function VigoSotTok() {
  const [videos, setVideos] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const [showGift, setShowGift] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [giftAnim, setGiftAnim] = useState<string | null>(null);
  const [coins, setCoins] = useState(2500);

  useEffect(() => {
    supabase.from("videos").select("*, profiles(username, unique_id, avatar_url)").order("created_at",{ascending:false}).limit(100).then(({data})=>{ if(data) setVideos(data) });
  }, []);

  const sendGift = (icon: string) => {
    setGiftAnim(icon);
    setCoins(c=>c-50);
    setTimeout(()=>setGiftAnim(null), 2000);
    setShowGift(false);
  };

  return (
    <div className="bg-black text-white h-screen w-screen overflow-hidden relative font-sans">
      {/* Vigo Top */}
      <div className="absolute top-0 w-full z-20 flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex gap-5 font-bold text-[15px]"><span className="opacity-60">Following</span><span className="border-b-2 border-white">For You</span></div>
        <div className="flex gap-3"><span className="text-xs bg-red-600 px-2 py-1 rounded-full">🔥 Trending</span><button className="text-xs bg-zinc-800 px-3 py-1 rounded-full">📡 Group Live</button></div>
      </div>

      {/* Feed */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory">
        {videos.map((v,i)=>(
          <div key={v.id} className="h-screen w-full snap-start relative bg-zinc-900">
            <video src={v.video_url} autoPlay={i===active} loop muted playsInline className="h-full w-full object-cover" onClick={()=>setActive(i)} />

            {/* Left Info Vigo style */}
            <div className="absolute bottom-20 left-3 right-20">
              <p className="font-bold">@{v.profiles?.username} <span className="opacity-60 text-xs">ID:{v.profiles?.unique_id}</span></p>
              <p className="text-sm mt-1 opacity-90">{v.caption || "SOT TOK 🔥 #trending"}</p>
              <p className="text-xs mt-2 opacity-60">🎵 Original Sound - SOT TOK</p>
            </div>

            {/* Right Vigo Buttons */}
            <div className="absolute right-2 bottom-24 flex flex-col gap-6 items-center">
              <button onClick={()=>setShowProfile(true)} className="relative"><img src={v.profiles?.avatar_url || "https://i.pravatar.cc/100"} className="w-12 h-12 rounded-full border-2 border-white" /><span className="absolute -bottom-2 left-3 bg-pink-600 text-[12px] w-6 h-6 rounded-full flex items-center justify-center">+</span></button>
              <button><span className="text-[32px]">❤️</span><br/><span className="text-xs font-bold">12.5K</span></button>
              <button><span className="text-[28px]">💬</span><br/><span className="text-xs">892</span></button>
              <button><span className="text-[28px]">↗️</span><br/><span className="text-xs">Share</span></button>
              <button onClick={()=>setShowGift(true)} className="animate-bounce"><span className="text-[30px]">🎁</span><br/><span className="text-xs text-yellow-400">Gift</span></button>
            </div>

            {/* Gift Flying Animation */}
            {giftAnim && i===active && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] animate-[ping_1.5s]">{giftAnim}</div>}
          </div>
        ))}
      </div>

      {/* Vigo Bottom Nav */}
      <div className="absolute bottom-0 w-full h-[60px] bg-black/90 flex justify-around items-center border-t border-zinc-800 z-20">
        <span className="text-pink-500 font-bold">🏠 Home</span><span className="opacity-60">🔍 Discover</span><span className="bg-pink-600 w-12 h-8 rounded-lg flex items-center justify-center text-xl">+</span><span className="opacity-60">💬 Message</span><span className="opacity-60">👤 Profile</span>
      </div>

      {/* Gift Drawer Vigo Style 128 Gifts */}
      {showGift && (
        <div className="fixed bottom-0 w-full bg-[#121212] rounded-t-[18px] z-50 h-[68vh] flex flex-col p-3">
          <div className="flex justify-between"><h3 className="font-bold">Gift Center - Coins: {coins} 🪙</h3><button onClick={()=>setShowGift(false)}>✕</button></div>
          <div className="grid grid-cols-4 gap-2 mt-3 overflow-y-auto flex-1">
            {Array.from({length:128}).map((_,i)=>{
              const icon = GIFTS[i % GIFTS.length];
              return <button key={i} onClick={()=>sendGift(icon)} className="bg-zinc-800 rounded-xl p-2 text-center"><div className="text-2xl">{icon}</div><div className="text-[8px] opacity-60">Gift {i+1}</div><div className="text-[10px] text-yellow-400">{10+i*2} 💰</div></button>
            })}
          </div>
          <button onClick={()=>{setCoins(c=>c+1000)}} className="w-full bg-yellow-500 text-black py-3 rounded-xl mt-2 font-bold">Recharge Coins</button>
        </div>
      )}

      {/* Profile Drawer */}
      {showProfile && (
        <div className="fixed inset-0 bg-black z-[60] p-4"><button onClick={()=>setShowProfile(false)} className="bg-zinc-800 px-4 py-2 rounded-full">← Back</button><div className="mt-10 text-center"><div className="w-24 h-24 bg-pink-600 rounded-full mx-auto"></div><h2 className="mt-3 font-bold text-xl">SOT TOK User</h2><p className="opacity-60 text-sm">ID: 123456</p><div className="flex justify-center gap-8 mt-6"><div><b>1.2K</b><br/><span className="text-xs opacity-60">Followers</span></div><div><b>89</b><br/><span className="text-xs opacity-60">Following</span></div><div><b>12K</b><br/><span className="text-xs opacity-60">Likes</span></div></div></div></div>
      )}
    </div>
  );
}