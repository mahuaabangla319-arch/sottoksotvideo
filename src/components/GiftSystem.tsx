// SOT TOK - Gift System - Clean Version (No People)
import { useState } from "react";

export default function GiftSystem() {
  const [selected, setSelected] = useState("Rose");
  const gifts = [
    { name: "Rose", coin: "1 Coin", icon: "🌹" },
    { name: "TikTok Star", coin: "5 Coins", icon: "⭐" },
    { name: "Heart", coin: "10 Coins", icon: "💖" },
    { name: "Diamond", coin: "50 Coins", icon: "💎" },
    { name: "Crown", coin: "100 Coins", icon: "👑" },
    { name: "Rocket", coin: "200 Coins", icon: "🚀" },
    { name: "Love Car", coin: "500 Coins", icon: "🚗" },
    { name: "Universe", coin: "1000 Coins", icon: "🌌" },
  ];
  return (
    <div className="w-full max-w-[400px] mx-auto bg-black rounded-[24px] border-2 border-pink-500/50 overflow-hidden">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 p-3">
        <h2 className="text-white font-black text-xl">🎁 Gift System</h2>
        <p className="text-white text-sm">লাইভে ও ভিডিওতে গিফট পাঠান আর ক্রিয়েটরকে সাপোর্ট করুন</p>
      </div>
      <div className="relative h-[380px] bg-zinc-900 flex flex-col items-center justify-center">
        <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded-full text-white text-xs">SOT TOK ✓ 12.5K likes</div>
        <div className="absolute top-3 right-3 text-white text-xs">👁 1.2K</div>
        <div className="text-7xl animate-pulse">🌹</div>
        <div className="absolute bottom-16 left-3 bg-black/70 px-3 py-1.5 rounded-full text-white text-xs">Rahul Kumar sent Rose 🌹 x1</div>
      </div>
      <div className="grid grid-cols-4 gap-2 p-3 bg-[#111]">
        {gifts.map(g => (
          <button key={g.name} onClick={() => setSelected(g.name)} className={`p-2 rounded-xl text-center ${selected === g.name ? 'bg-pink-600' : 'bg-zinc-800'}`}>
            <div className="text-2xl">{g.icon}</div>
            <div className="text-white text-[10px]">{g.name}</div>
            <div className="text-zinc-400 text-[9px]">{g.coin}</div>
          </button>
        ))}
      </div>
      <div className="p-3 bg-black flex justify-between items-center">
        <div className="text-white text-sm">🪙 250 Coins +</div>
        <button className="bg-pink-500 text-white px-8 py-2 rounded-full font-bold">🎁 Send</button>
      </div>
    </div>
  );
}