import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [showGift, setShowGift] = useState(false)
  const [myCoins, setMyCoins] = useState(1250)

  // Demo video data
  const video = { id: 1, userPic: "https://i.pravatar.cc/100", userId: "user1", likes: 125, comments: 12 }

  const followUser = (id:any) => alert("Followed "+id)
  const likeVideo = (id:any) => alert("Liked!")
  const sendGift = (g:any) => {
    if(myCoins >= g.coins) {
      setMyCoins(myCoins - g.coins)
      setShowGift(false)
      alert(g.name+" পাঠানো হলো!")
    } else {
      alert("Coins শেষ! Recharge করুন")
    }
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* VIDEO */}
      <video className="w-full h-full object-cover" src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted playsInline />

      {/* RIGHT SIDE - SMALL VIGO ORIGINAL - SOT TOK */}
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-3 z-20">
        <div className="relative mb-1">
          <img src={video.userPic} className="w-9 h-9 rounded-full border-[1.5px] border-[#facc15] object-cover" />
          <button onClick={()=>followUser(video.userId)} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">+</button>
        </div>

        <button onClick={()=>likeVideo(video.id)} className="flex flex-col items-center">
          <div className="w-8 h-8 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-[16px]">❤️</div>
          <span className="text-[10px] text-white mt-0.5">{video.likes}</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="w-8 h-8 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-[14px]">💬</div>
          <span className="text-[10px] text-white mt-0.5">{video.comments}</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="w-8 h-8 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-[14px]">↗</div>
          <span className="text-[9px] text-white">Share</span>
        </button>

        <button onClick={()=>setShowGift(true)} className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px]" style={{background:"linear-gradient(135deg,#ff7a00,#facc15)"}}>🎁</div>
          <span className="text-[9px] text-[#facc15] mt-0.5">Gift</span>
        </button>
      </div>

      {/* GIFT SHEET */}
      {showGift && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-[20px] p-4 border-t border-[#facc15]/20">
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-bold">Gift পাঠান <span className="text-[#facc15] text-sm">Coins: {myCoins}</span></p>
              <button onClick={()=>setShowGift(false)} className="text-white">✕</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                {name:"Rose", icon:"🌹", coins:10},
                {name:"Heart", icon:"💖", coins:50},
                {name:"Diamond", icon:"💎", coins:100},
                {name:"Crown", icon:"👑", coins:500},
              ].map(g=>(
                <button key={g.name} onClick={()=>sendGift(g)} className="bg-white/10 rounded-xl p-2 flex flex-col items-center border border-[#facc15]/20">
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-[10px] text-white mt-1">{g.name}</span>
                  <span className="text-[9px] text-[#facc15]">{g.coins}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>window.location.href="/wallet"} className="w-full mt-4 py-3 rounded-full text-black font-bold" style={{background:"linear-gradient(90deg,#ff7a00,#facc15)"}}>
              Recharge করুন
            </button>
          </div>
        </div>
      )}
    </div>
  )
}