// SOT TOK - Gift System - Clean Version (No People)
import { useState } from "react";

export default function GiftSystem() {
  const [selected, setSelected] = useState("Rose");
  const gifts = [
    { name: "Rose", coin: "1 Coin", icon: "🌹", color: "from-pink-500 to-red-500" },
    { name: "TikTok Star", coin: "5 Coins", icon: "⭐", color: "from-yellow-400 to-orange-500" },
    { name: "Heart", coin: "10 Coins", icon: "💖", color: "from-pink-400 to-pink-600" },
    { name: "Diamond", coin: "50 Coins", icon: "💎", color: "from-blue-400 to-purple-500" },
    { name: "Crown", coin: "100 Coins", icon: "👑", color: "from-yellow-300 to-yellow-600" },
    { name: "Rocket", coin: "200 Coins", icon: "🚀", color: "from-blue-500 to-cyan-500" },
    { name: "Love Car", coin: "500 Coins", icon: "🚗", color: "from-red-400 to-pink-500" },
    { name: "Universe", coin: "1000 Coins", icon: "🌌", color: "from-purple-500 to-indigo-600" },
  ];

  return (
    <div className="w-full max-w-[400px] mx-auto bg-black rounded-[24px] border-2 border-pink-500/50 overflow-hidden shadow-2xl shadow-pink-500/20">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 p-3">
        <h2 className="text-white font-black text-xl flex items-center gap-2">🎁 Gift System</h2>
        <p className="text-white text-sm leading-tight">লাইভে ও ভিডিওতে গিফট পাঠান<br/>আর ক্রিয়েটরকে সাপোর্ট করুন</p>
      </div>

      <div className="relative h-[380px] bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2 py-1 rounded-full">
          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-[8px] text-white">SOT TOK</div>
          <div className="text-white text-xs">SOT TOK <span className="text-blue-400">✓</span><br/><span className="text-[10px] text-zinc-400">12.5K likes</span></div>
        </div>
        <div className="absolute top-3 right-3 text-white text-xs">👁 1.2K ✕</div>
        <button className="absolute top-12 left-3 bg-pink-500 text-white text-xs px-3 py-1 rounded-full">+ Follow</button>

        <div className="text-7xl animate-pulse drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]">🌹</div>
        <div className="absolute animate-bounce top-20 right-16 text-2xl">🎁</div>
        <div className="absolute animate-bounce delay-100 top-32 left-10 text-xl">🎁</div>
        <div className="absolute animate-bounce delay-200 bottom-24 right-10 text-2xl">🎁</div>
        <div className="absolute animate-bounce bottom-32 left-12 text-xl">🎁</div>

        <div className="absolute bottom-16 left-3 bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-5 h-5 bg-cyan-500 rounded-full"></div>
          <span className="text-white text-xs">Rahul Kumar<br/>sent Rose 🌹 x1</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-[#111]">
        {gifts.map(g => (
          <button key={g.name} onClick={() => setSelected(g.name)} className={`p-2 rounded-xl text-center transition-all ${selected === g.name ? 'bg-pink-600 scale-105' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
            <div className="text-2xl">{g.icon}</div>
            <div className="text-white text-[10px] font-bold leading-tight">{g.name}</div>
            <div className="text-zinc-400 text-[9px]">{g.coin}</div>
          </button>
        ))}
      </div>

      <div className="p-3 bg-black flex justify-between items-center border-t border-zinc-800">
        <div className="flex items-center gap-2 text-white text-sm"><span>🪙</span> 250 Coins <span className="ml-2">+</span></div>
        <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-2 rounded-full font-bold">🎁 Send</button>
      </div>
    </div>
  );
}