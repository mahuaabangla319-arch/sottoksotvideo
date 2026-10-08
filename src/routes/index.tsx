import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: HomePage });

const GIFT_EMOJIS = ["❤️","🌹","💋","💖","🔥","👑","💎","🦁","🚀","🎁","💰","⭐","🌟","💥","🎉","🎊","💐","🍫","🧸","💍","🏆","🥇","💸","⚡","🦄","🌈","🍭","🍓","💃","🕺","🎈","🎀","💌","🥰","😍","🤩","🥳","😘","💝","💘","💗","💓","💞","💕","❣️","🫶","👏","🙏","🤲","🤝","👌","✨","🌹"];

const ALL_128_GIFTS = Array.from({length: 128}, (_, i) => ({
  id: i+1,
  name: `Gift ${i+1}`,
  icon: GIFT_EMOJIS[i % GIFT_EMOJIS.length],
  price: i < 10? 10 : i < 50? 50 + i*2 : i < 100? 200 + i*5 : 1000 + i*20
}));

function HomePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [showGift, setShowGift] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showLudo, setShowLudo] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    supabase.from("videos").select("*, profiles(username, unique_id, coins)").order("created_at", {ascending:false}).limit(100).then(({data})=> { if(data) setVideos(data) });
    supabase.auth.getUser().then(async ({data})=>{
      if(data.user){
        const {data: p} = await supabase.from("profiles").select("coins").eq("id", data.user.id).single();
        if(p) setCoins(p.coins || 1000);
      }
    });
  }, []);

  const current = videos[idx];

  const handleLike = () => { setLiked(!liked); };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert("Link Copied!"); };
  const handleDownload = () => { if(current) { const a=document.createElement('a'); a.href=current.video_url; a.download='sottok.mp4'; a.click(); } };
  const handleGift = (g:any) => {
    if(coins < g.price){ setShowRecharge(true); return; }
    setCoins(c=>c-g.price);
    alert(`${g.icon} Gift Sent!`);
    setShowGift(false);
  };

  return (
    <div className="bg-black text-white h-screen w-screen overflow-hidden relative">
      {/* Top Tabs */}
      <div className="absolute top-0 w-full z-20 flex justify-center gap-6 py-3 font-bold text-sm bg-gradient-to-b from-black/80 to-transparent">
        <span className="opacity-50">Following</span>
        <span className="border-b-2 border-white">For You</span>
        <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] animate-pulse">🔥 TRENDING</span>
        <button onClick={()=>setShowLudo(true)} className="bg-purple-600 px-3 py-1 rounded-full text-xs">🎲 LUDO + Voice</button>
      </div>

      {/* Video Feed */}
      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll">
        {videos.map((v:any, i:number)=>(
          <div key={v.id} className="h-screen w-full snap-start relative bg-zinc-900 flex items-center justify-center">
            <video src={v.video_url} autoPlay={i===idx} muted loop playsInline className="h-full w-full object-cover" onClick={()=>setIdx(i)} />
            <div className="absolute bottom-20 left-3 max-w-[70%]">
              <p className="font-bold text-sm">@{v.profiles?.username} ID:{v.profiles?.unique_id}</p>
              <p className="text-xs opacity-80 mt-1">{v.caption || "SOT TOK Trending Video 🔥"}</p>
            </div>
            {/* Right Icons */}
            <div className="absolute right-3 bottom-28 flex flex-col gap-6 items-center">
              <button onClick={handleLike} className="flex flex-col items-center"><span className={`text-3xl ${liked?'text-red-500':''}`}>❤️</span><span className="text-xs">{liked? '1.2K': '1.1K'}</span></button>
              <button onClick={()=>{setShowComment(true); supabase.from("comments").select("*, profiles(username)").eq("video_id", v.id).then(({data})=>setComments(data||[]))}} className="flex flex-col items-center"><span className="text-3xl">💬</span><span className="text-xs">Comment</span></button>
              <button onClick={handleShare} className="flex flex-col items-center"><span className="text-3xl">↗️</span><span className="text-xs">Share</span></button>
              <button onClick={handleDownload} className="flex flex-col items-center"><span className="text-3xl">⬇️</span><span className="text-xs">Download</span></button>
              <button onClick={()=>setShowGift(true)} className="flex flex-col items-center"><span className="text-3xl">🎁</span><span className="text-xs">Gift</span></button>
            </div>
          </div>
        ))}
      </div>

      {/* Gift Drawer 128 Gifts */}
      {showGift && (
        <div className="fixed bottom-0 w-full bg-[#1a1a1a] rounded-t-[20px] p-3 h-[70vh] z-50 flex flex-col">
          <div className="flex justify-between items-center"><h3 className="font-bold">🎁 128 Gifts - Coins: {coins}</h3><button onClick={()=>setShowGift(false)} className="text-xl">❌</button></div>
          <div className="grid grid-cols-4 gap-2 mt-3 overflow-y-auto flex-1">
            {ALL_128_GIFTS.map(g=>(
              <button key={g.id} onClick={()=>handleGift(g)} className="bg-zinc-800 p-2 rounded-xl text-center">
                <div className="text-2xl">{g.icon}</div><div className="text-[9px]">{g.name}</div><div className="text-[10px] text-yellow-400">{g.price} 🪙</div>
              </button>
            ))}
          </div>
          <button onClick={()=>setShowRecharge(true)} className="w-full bg-yellow-500 text-black py-2 rounded-xl mt-2 font-bold">Recharge Coins 💰</button>
        </div>
      )}

      {/* Comments */}
      {showComment && (
        <div className="fixed bottom-0 w-full bg-[#1a1a1a] rounded-t-[20px] p-3 h-[60vh] z-50 flex flex-col">
          <div className="flex justify-between"><h3 className="font-bold">Comments - All Users</h3><button onClick={()=>setShowComment(false)}>❌</button></div>
          <div className="flex-1 overflow-y-auto mt-3 space-y-2">
            {comments.map((c:any)=>(<div key={c.id} className="text-sm"><b>@{c.profiles?.username}:</b> {c.content}</div>))}
            {comments.length===0 && <p className="opacity-50 text-sm">সব ইউজার এখানে কমেন্ট করতে পারবে...</p>}
          </div>
          <div className="flex gap-2 mt-2">