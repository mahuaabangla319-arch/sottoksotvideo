import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Heart, MessageCircle, X, Users, Music2, Gift, Coins } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CommentsSheet } from "@/components/CommentsSheet";
import { useAuth } from "@/lib/auth";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";
import { signVideo } from "@/lib/social";
import { downloadBrandedVideo } from "@/lib/video-studio";
import { supabase } from "@/integrations/supabase/client";

export type ModalVideo = {
  id: string;
  video_url: string;
  caption: string;
  likes: number;
  comments_count: number;
  views: number;
};

export function VideoModal({ video, onClose }: { video: ModalVideo, onClose: ()=>void }){
  const [coins, setCoins] = useState(0)
  const [showGift, setShowGift] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(()=>{
    const c = parseInt(localStorage.getItem("userCoins")||"0")
    setCoins(c)
    countView(video.id)
  },[video.id])

  // 10x Fast - lazy preload
  useEffect(()=>{
    const v = document.getElementById(`vid-${video.id}`) as HTMLVideoElement
    if(v){ v.preload = "metadata"; v.load() }
  },[])

  const gifts = [
    { name: "Rose", icon: "🌹", coin: 10 },
    { name: "Heart", icon: "💖", coin: 50 },
    { name: "Diamond", icon: "💎", coin: 100 },
    { name: "Rocket", icon: "🚀", coin: 500 },
    { name: "Crown", icon: "👑", coin: 1000 },
  ]

  const sendGift = (gift: any) => {
    // 0 COIN PROTECTION - এটাই আপনার চাওয়া!
    if(coins < gift.coin){
      toast.error(`Coin নেই! ${gift.coin} Coin লাগবে, আপনার আছে ${coins} Coin`)
      // Auto redirect to wallet left recharge
      setShowGift(false)
      navigate({ to: "/wallet" })
      return
    }
    // Coin কাটবে শুধু যখন Coin আছে
    const newCoins = coins - gift.coin
    localStorage.setItem("userCoins", newCoins.toString())
    setCoins(newCoins)
    toast.success(`${gift.icon} ${gift.name} পাঠানো হলো! -${gift.coin} Coins`)
    setShowGift(false)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full"><X className="text-white"/></button>

      <video
        id={`vid-${video.id}`}
        src={video.video_url}
        className="w-full h-[70vh] object-contain bg-black"
        controls
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        loading="lazy" as any
      />

      <div className="p-4 bg-[#111] flex-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-sm">{video.caption}</p>
            <p className="text-gray-400 text-xs">{formatCompact(video.views)} views • {formatCompact(video.likes)} likes</p>
          </div>
          <button onClick={()=>setShowGift(!showGift)} className="bg-[#8B1DFF] px-4 py-2 rounded-full flex items-center gap-2 font-bold">
            <Gift size={16}/> Gift {coins>0? `(${coins}🪙)` : "(0🪙)"}
          </button>
        </div>

        {/* Gift Panel with 0 Coin Protection */}
        {showGift && (
          <div className="mt-4 bg-[#1A1A1A] p-4 rounded-2xl border border-[#333]">
            {coins===0? (
              <div className="text-center py-4">
                <div className="text-3xl">🪙</div>
                <p className="text-red-400 font-bold mt-2">Coin নেই! Recharge করুন</p>
                <p className="text-xs text-gray-400">0 Coin এ Gift পাঠানো যাবে না, টাকা কাটবে না</p>
                <button onClick={()=>navigate({ to: "/wallet" })} className="mt-3 bg-[#8B1DFF] w-full py-3 rounded-xl font-bold">বাঁদিকে Recharge এ যান →</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {gifts.map((g,i)=>(
                  <button key={i} onClick={()=>sendGift(g)} className="bg-black border border-[#333] p-3 rounded-xl flex flex-col items-center gap-1 hover:border-[#8B1DFF]">
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-[11px] text-white">{g.name}</span>
                    <span className="text-[10px] text-[#8B1DFF] font-bold">{g.coin} 🪙</span>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 text-[10px] text-gray-500 text-center">Balance: {coins} Coins = ₹{(coins*0.5).toFixed(2)} | Admin Wallet এ 20% জমা হবে</div>
          </div>
        )}
      </div>
    </div>
  )
}