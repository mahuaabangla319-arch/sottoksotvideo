export default function CameraSystem() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[620px] rounded-[24px] overflow-hidden relative bg-black">
      <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=700&fit=crop" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      <div className="relative z-10 flex justify-between items-center p-4 text-white">
        <button>✕</button><button>⚡</button><div>720P ▼</div><button>🔄</button>
      </div>
      <div className="absolute right-4 top-20 flex flex-col gap-6 text-white text-center z-10">
        <div>⏱<br/><span className="text-[11px]">Speed</span></div>
        <div>✨<br/><span className="text-[11px]">Beauty</span></div>
        <div>◎<br/><span className="text-[11px]">Filters</span></div>
        <div>⏲<br/><span className="text-[11px]">Timer</span></div>
      </div>
      <div className="absolute bottom-0 w-full z-10 p-4 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white text-center">☺<br/><span className="text-xs">Effects</span></div>
          <div className="w-[75px] h-[75px] bg-[#e91e63] rounded-full border-4 border-white"></div>
          <div className="text-white text-center">🖼<br/><span className="text-xs">Upload</span></div>
        </div>
        <div className="flex justify-center gap-8 text-white/60 text-sm"><span className="text-yellow-400">Video</span><span>Photo</span><span>Live</span></div>
      </div>
      <div className="absolute bottom-0 w-full text-center bg-black text-white font-black">SOT TOK | Create • Share</div>
    </div>
  );
}