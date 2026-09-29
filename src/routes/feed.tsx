import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function FeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [coins, setCoins] = useState(100);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    // পুরোনো সব ভিডিও Supabase থেকে আনা
    supabase.from("videos").select("*").order("created_at", {ascending:false}).then(({data})=>{
      if(data && data.length>0) setVideos(data);
      else setVideos([{id:1, video_url:"https://www.w3schools.com/html/mov_bbb.mp4", username:"@Ananya", likes:364, caption:"Test"}]);
    });
  }, []);

  const v = videos[index];
  if(!v) return <div className="bg-black text-white h-screen flex items-center justify-center">Loading SOT TOK...</div>;

  const videoUrl = v.video_url || v.url;
  const username = v.username || v.user || "@user";

  const toggleFollow = () => {
    setFollowing(!following);
    // এখানে Supabase follows table এ insert হবে
  };

  const sendCoins = () => {
    if(coins<10) return alert("Coin শেষ!");
    setCoins(c=>c-10);
    alert(`10 Coins Sent to ${username} ⚡`);
  };

  return (
    <div className="bg-black text-white h-screen w-screen relative overflow-hidden">
      <div className="absolute top-0 w-full z-20 flex justify-center pt-3"><div className="bg-black/70 px-3 py-1 rounded-full text-xs border border-zinc-700">SOT TOK 🪙 {coins}</div></div>

      <video key={v.id} src={videoUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />

      <div className="absolute right-3 bottom-32 flex flex-col gap-5 z-20 items-center">
        <div className="relative">
          <img src="https://i.pravatar.cc/100" className="w-12 h-12 rounded-full border-2 border-white"/>
          <button onClick={toggleFollow} className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full text-xs font-bold ${following? 'bg-zinc-600' : 'bg-orange-500'}`}>{following? '✓' : '+'}</button>
        </div>
        <div className="text-center">❤️<br/><span className="text-xs">{v.likes||364}</span></div>
        <div className="text-center">💬<br/><span className="text-xs">27</span></div>
        <div>⬇️<br/><span className="text-[10px]">Save</span></div>
      </div>

      <div className="absolute bottom-20 left-3 right-20 z-20">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="font-bold">{username}</span>
          <button onClick={toggleFollow} className={`px-3 py-1 rounded text-xs font-bold border ${following? 'bg-white text-black' : 'bg-transparent border-white'}`}>{following? 'Following' : 'Follow'}</button>
          <button onClick={sendCoins} className="bg-orange-500 px-3 py-1 rounded text-xs font-bold">Send 10 ⚡</button>
          <button className="bg-zinc-800 px-3 py-1 rounded text-xs border">Message</button>
        </div>
        <p className="text-sm mt-2">{v.caption || v.description}</p>
      </div>

      <div className="absolute inset-0 flex flex-col"><div className="flex-1" onClick={()=>index>0&&setIndex(index-1)}></div><div className="flex-1" onClick={()=>index<videos.length-1&&setIndex(index+1)}></div></div>
    </div>
  );
}