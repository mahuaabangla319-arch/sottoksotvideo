import { useState, useRef } from "react";

const DEMO_VIDEOS = [
  { id: 1, url: "https://www.w3schools.com/html/mov_bbb.mp4", user: "@Ananya", name: "Ananya", likes: 364, comments: 27, shares: 5, caption: "My first SOT TOK video ❤️ #viral" },
  { id: 2, url: "https://www.w3schools.com/html/movie.mp4", user: "@Riya", name: "Riya Das", likes: 1024, comments: 89, shares: 12, caption: "Dance challenge 💃" },
];

export default function SOTTOK() {
  const [index, setIndex] = useState(0);
  const [coins, setCoins] = useState(100);
  const [quota, setQuota] = useState(50);
  const [showInbox, setShowInbox] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const v = DEMO_VIDEOS[index];

  // 1. COIN SEND LOGIC
  const sendCoins = () => {
    if (coins < 10) return alert("🪙 Coin শেষ! Recharge করো");
    if (quota <= 0) return alert("আজকের quota শেষ!");
    setCoins(c => c - 10);
    setQuota(q => q - 1);
    alert(`10 Coins Sent to ${v.user} ⚡`);
  };

  // 2. DOWNLOAD + WATERMARK + GALLERY SAVE
  const downloadVideo = async () => {
    try {
      const response = await fetch(v.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      // watermark name in file name
      a.download = `SOT_TOK_${v.user}_watermark.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert("✅ Download হলো! গ্যালারিতে চেক করো, SOT TOK watermark থাকবে");
    } catch {
      alert("Download failed, try again");
    }
  };

  // 3. PROFILE MESSAGE - ALL TO ALL
  const openMessage = () => {
    setShowInbox(true);
  };

  return (
    <div className="bg-black text-white h-[100vh] w-screen relative overflow-hidden font-sans select-none">

      {/* TOP BAR */}
      <div className="absolute top-0 w-full z-30 flex flex-col items-center pt-3 pb-2 bg-gradient-to-b from-black/90 to-transparent">
        <div className="text-[11px] bg-black/70 px-3 py-1 rounded-full border border-zinc-700">SOT TOK 🪙 {coins} | Quota {quota}/50</div>
        <div className="flex gap-6 mt-3 text-[15px]">
          <span className="text-zinc-400">Following</span>
          <span className="font-bold border-b-2 border-white pb-1">For You</span>
        </div>
      </div>

      {/* VIDEO */}
      <video
        ref={videoRef}
        key={v.id}
        src={v.url}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
        onClick={(e) => {
          const el = e.target as HTMLVideoElement;
          el.paused? el.play() : el.pause();
        }}
      />

      {/* WATERMARK OVER VIDEO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none z-10 rotate-[-20deg] text-6xl font-black tracking-widest">
        SOT TOK
      </div>

      {/* RIGHT SIDE ICONS */}
      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-6 z-20">
        {/* Profile + Follow + Message */}
        <div className="relative cursor-pointer" onClick={openMessage}>
          <img src={`https://i.pravatar.cc/100?u=${v.user}`} className="w-12 h-12 rounded-full border-2 border-white" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">+</div>
        </div>

        <button className="flex flex-col items-center"><span className="text-[28px]">❤️</span><span className="text-[12px] mt-1">{v.likes}</span></button>
        <button className="flex flex-col items-center"><span className="text-[26px]">💬</span><span className="text-[12px] mt-1">{v.comments}</span></button>
        <button className="flex flex-col items-center"><span className="text-[26px]">↗️</span><span className="text-[12px] mt-1">{v.shares}</span></button>
        <button onClick={downloadVideo} className="flex flex-col items-center"><span className="text-[24px]">⬇️</span><span className="text-[10px] mt-1">Save</