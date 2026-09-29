import { useRef, useState } from "react";

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [followed, setFollowed] = useState(false);

  const handleDownload = async () => {
    if (!videoRef.current) return;
    const videoUrl = videoRef.current.src;
    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SOT-TOK-video.mp4";
      a.click();
    } catch {
      window.open(videoUrl, "_blank");
    }
  };

  return (
    <div className="bg-black text-white h-screen w-screen relative overflow-hidden font-sans">
      <div className="absolute top-2 w-full flex justify-center z-20">
        <div className="bg-black/60 px-4 py-1.5 rounded-full text-[11px] border border-zinc-700">SOT TOK 🪙 100 | ⚡ 50/50</div>
      </div>
      <video ref={videoRef} src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted playsInline className="h-full w-full object-cover" />
      <div className="absolute top-1/2 left-1 -rotate-90 opacity-20 text-[10px] tracking-widest">SOT TOK @Ananya</div>
      <div className="absolute right-3 bottom-28 flex flex-col gap-6 z-20 items-center">
        <div className="relative">
          <img src="https://i.pravatar.cc/100?img=5" className="w-12 h-12 rounded-full border-2 border-white" />
          <button onClick={() => setFollowed(!followed)} className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${followed? 'bg-zinc-600' : 'bg-orange-500'}`}>{followed? '✓' : '+'}</button>
        </div>
        <div className="text-center"><div className="text-[26px]">❤️</div><div className="text-[11px]">364</div></div>
        <div className="text-center"><div className="text-[22px]">💬</div><div className="text-[11px]">27</div></div>
        <button onClick={handleDownload} className="text-center"><div className="text-[20px]">⬇️</div><div className="text-[9px]">Save to Gallery</div></button>
      </div>
      <div className="absolute bottom-20 left-3 right-20 z-20">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-bold text-[15px]">@Ananya</span>
          <button onClick={() => setFollowed(!followed)} className={`px-3 py-1 rounded text-[11px] font-bold border ${followed? 'bg-white text-black' : 'border-white'}`}>{followed? 'Following' : 'Follow'}</button>
          <button className="bg-orange-500 px-3 py-1 rounded text-[11px] font-bold">Send 10 ⚡</button>
          <button className="bg-zinc-800 px-3 py-1 rounded text-[11px] border border-zinc-600">Message</button>
        </div>
        <p className="text-[13px] mt-2">My first SOT TOK ❤️ #viral</p>
      </div>
      <div className="absolute bottom-0 w-full bg-black flex justify-around py-3 border-t border-zinc-800 text-[20px]">
        <span>⌂</span><span>🔍</span><span className="bg-white text-black px-6 rounded-md">+</span><span>✉️</span><span>👤</span>
      </div>
    </div>
  );
}