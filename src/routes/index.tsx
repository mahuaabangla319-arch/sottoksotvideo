import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: SotTokApp });

function SotTokApp() {
  const [videos, setVideos] = useState<any[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    supabase.from("videos").select("*, profiles(username, unique_id, avatar_url, coins)").order("created_at", {ascending: false}).limit(100).then(({data})=> { if(data) setVideos(data) });
  }, []);

  return (
    <div className="w-full h-[100dvh] bg-black text-white overflow-y-scroll snap-y snap-mandatory">
      {videos.map((v,i)=>(
        <div key={v.id} className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black">
          <video
            src={v.video_url}
            loop
            playsInline
            className="h-full w-full object-cover"
            autoPlay={i===active}
            ref={el=> {