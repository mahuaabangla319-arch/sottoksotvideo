import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: SotTokApp });

const GIFTS = ["❤️","🌹","💎","🎁","🚗","🏖️","👑","🔥","⭐","💋","🎉","🍾","💍","🦁","🚀","💰","💐","🍫","🏆","💸"];

export default function SotTokApp() {
  const [videos, setVideos] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const [showGifts, setShowGifts] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [flyingGift, setFlyingGift] = useState<string|null>(null);
  const [likes, setLikes] = useState<{[key:string]:number}>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("videos").select("*, profiles(username, unique_id, avatar_url)").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      if (data) setVideos(data);
    });
  }, []);

  const handleScroll = () => {
    if(!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / window.innerHeight);
    setActive(idx);
  };

  const handleLike = (id: string) => {
    setLikes(prev => ({...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const sendGift = (g: string) => {
    setFlyingGift(g);
    setTimeout(()=> setFlyingGift(null), 2500);
    setShowGifts(false);
  };

  const downloadVideo = (url: string) => {
    const a = document.createElement("a");
    a.href = url; a.download = `SOT-TOK-${Date.now()}.mp4`; a.target="_blank";
    document.body.appendChild(a); a.click(); a.remove();
  };

  const shareVideo = async (url: string) => {
    if(navigator.share){ try{ await navigator.share({title:"SOT TOK Video", url}); }catch{} }
    else{ navigator.clipboard.writeText(url); alert("SOT TOK Link Copied!"); }
  };

  return (
    <div ref={containerRef} onScroll={handleScroll} className="w-full h-[100dvh] bg-black text-white overflow-y-scroll snap-y snap-mandatory">
      {videos.length===0 && <div className="h-screen flex items-center justify-center text-[#ff2a6d] font-bold">Loading SOT TOK...</div>}

      {videos.map((v,i)=>(
        <div key={v.id} className="h-[100dvh] w-full snap-start relative bg-black">
          <video
            src={v.video_url}
            className="h-full w-full object-cover"
            loop playsInline
            autoPlay={i===active}
            muted={i!==active}
            ref={el=>{ if(el){ if(i===active) el.play().catch(()=>{}); else el.pause(); }}}
            onClick={e=>{ const vid=e.target as HTMLVideoElement; vid.paused? vid.play(): vid.pause(); }}
          />
          {flyingGift && i===active && <div className="absolute inset-0 flex items-center justify-center text-[100px] animate-bounce pointer-events-none drop-shadow-[0_0_20px_#ff2a6d]">{flyingGift}</div>}

          {/* Right Vigo Style Buttons - SOT TOK Pink */}
          <div className="absolute right-2 bottom-28 flex flex-col gap-5 items-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#ff2a6d] overflow-hidden bg-zinc-800"><img src={v.profiles?.avatar_url||""} className="w-full h-full object-cover" /></div>
            <button onClick={()=> handleLike(v.id)} className="flex flex-col items-center active:scale-125 transition"><span className="text-3xl">❤️</span><span className="text-[11px]">{(v.likes||0)+(likes[v.id]||0)}</span></button>
            <button onClick={()=> setShowComment(true)} className="flex flex-col items-center"><span className="text-3xl">💬</span><span className="text-[11px]">Comment</span></button>
            <button onClick={()=> setShowGifts(true)} className="flex flex-col items-center"><span className="text-3xl">🎁</span><span className="text-[11px]">Gift</span></button>
            <button onClick={()=> shareVideo(v.video_url)} className="flex flex-col items-center"><span className="text-3xl">↗️</span