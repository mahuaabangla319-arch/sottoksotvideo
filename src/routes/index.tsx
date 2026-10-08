import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: SotTokApp });
const GIFTS = [{e:"❤️",c:10},{e:"🌹",c:20},{e:"💎",c:50},{e:"🎁",c:100},{e:"🚗",c:500},{e:"🏖️",c:1000},{e:"👑",c:2000},{e:"🦁",c:5000}];

export default function SotTokApp(){
  const [videos,setVideos]=useState<any[]>([]);
  const [active,setActive]=useState(0);
  const [coins,setCoins]=useState(1000);
  const [showGifts,setShowGifts]=useState(false);
  const [showComment,setShowComment]=useState<any>(null);
  const [showLive,setShowLive]=useState(false);
  const [showRecharge,setShowRecharge]=useState(false);
  const [commentText,setCommentText]=useState("");
  const [flyGift,setFlyGift]=useState<string|null>(null);
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const load=async()=>{
      const {data}=await supabase.from("videos").select("*, profiles(username,unique_id,avatar_url)").order("created_at",{ascending:false}).limit(100);
      if(data) setVideos(data);
    };
    load();
    const ch=supabase.channel("sot-tok-all").on("postgres_changes",{event:"*",schema:"public",table:"videos"},()=>load()).subscribe();
    return()=>{ supabase.removeChannel(ch); };
  },[]);

  const likeVideo=async(v:any)=>{
    setVideos(vs=> vs.map(x=> x.id===v.id? {...x, likes:(x.likes||0)+1}:x));
    await supabase.from("videos").update({likes:(v.likes||0)+1}).eq("id",v.id);
  };

  const sendGift=(g:any)=>{
    if(coins<g.c){ setShowRecharge(true); return; }
    setCoins(c=>c-g.c); setFlyGift(g.e); setTimeout(()=>setFlyGift(null),2500); setShowGifts(false);
  };

  const shareVideo=(v:any)=>{
    const url=`${window.location.origin}?v=${v.id}`;
    if(navigator.share){ navigator.share({title:"SOT TOK Video", text:v.caption, url}); }
    else{ window.open(`https://wa.me/?text=${encodeURIComponent("SOT TOK Video 🔥 "+url)}`,"_blank"); }
  };

  const downloadWithWatermark=async(v:any)=>{
    try{
      const videoEl=document.getElementById(`vid-${v.id}`) as HTMLVideoElement;
      const canvas=document.createElement("canvas");
      canvas.width=720; canvas.height=1280;
      const ctx=canvas.getContext("2d");
      if(ctx && videoEl){
        ctx.drawImage(videoEl,0,0,720,1280);
        ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,1220,720,60);
        ctx.fillStyle="#ff2a6d"; ctx.font="bold 20px Arial"; ctx.fillText(`SOT TOK @${v.profiles?.unique_id||"user"}`,20,1255);
        const link=document.createElement("a");
        link.download=`SOT-TOK-${v.id}.mp4`;
        link.href=v.video_url; link.target="_blank"; link.click();
        alert("Downloading with SOT TOK Watermark to Gallery!");
      }
    }catch{ window.open(v.video_url,"_blank"); }
  };

  return(
    <div ref={ref} onScroll={()=> setActive(Math.round(ref.current!.scrollTop/window.innerHeight))} className="w-full h-[100dvh] bg-black text-white overflow-y-scroll snap-y snap-mandatory">
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-3 bg-gradient-to-b from-black to-transparent">
        <b className="text-[#ff2a6d]">SOT TOK</b>
        <div className="flex gap-2"><span className="bg-zinc-800 px-3 py-1 rounded-full text-xs">🪙 {coins}</span><button onClick={()=>setShowRecharge(true)} className="bg-[#ff2a6d] px-3 py-1 rounded-full text-xs font-bold">Recharge</button></div>
      </div>

      {videos.map((v,i)=>(
        <div key={v.id} className="h-[100dvh] w-full snap-start relative bg-black">
          <video id={`vid-${v.id}`} src={v.video_url} className="h-full w-full object-cover" loop playsInline autoPlay={i===active} muted={i!==active} ref={el=>{ if(el){ i===active? el.play().catch(()=>{}): el.pause(); }}} onClick={e=>{ const vd=e.target as HTMLVideoElement; vd.paused? vd.play(): vd.pause(); }} />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-0 right-0 px-3 flex justify-between items-end">
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center"><span className="text-white/10 text-xs rotate-[-20deg] border border-white/20 px-2 py-1">SOT TOK @${v.profiles?.unique_id}</span></div>
          </div>
          {flyGift && i===active && <div className="absolute inset-0 flex items-center justify-center text-[120px] animate-bounce pointer-events-none z-20">{flyGift}</div>}

          <div className="absolute right-2 bottom-28 flex flex-col gap-5 items-center z-30">
            <a href={`/profile?id=${v.profiles?.unique_id}`} className="w-12 h-12 rounded-full border-2 border-[#ff2a6d] overflow-hidden bg-zinc-800"><img src={v.profiles?.avatar_url} className="w-full h-full object-cover" /></a>
            <button onClick={()=>likeVideo(v)} className="flex flex-col items-center"><span className="text-3xl">❤️</span><span className="text-[10px]">{v.likes||0}</span></button>
            <button onClick={()=>setShowComment(v)} className="flex flex-col items-center"><span className="text-3xl">💬</span><span className="text-[10px]">Comment</span></button>
            <button onClick={()=>setShowGifts(true)} className="flex flex-col items-center"><span className="text-3xl">🎁</span><span className="text-[10px]">Gift</span></button>
            <button onClick={()=>shareVideo(v)} className="flex flex-col items-center"><span className="text-2xl">↗️</span><span className="text-[10px]">Share</span></button>
            <button onClick={()=>downloadWithWatermark(v)}