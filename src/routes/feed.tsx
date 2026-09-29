export default function FeedPage() {
  const videos = [
    { id: 1, url: "https://www.w3schools.com/html/mov_bbb.mp4", user: "@Ananya", likes: 364, caption: "My first SOT TOK ❤️" },
    { id: 2, url: "https://www.w3schools.com/html/movie.mp4", user: "@Riya", likes: 1024, caption: "Dance challenge 💃" },
  ];

  return (
    <div className="bg-black text-white h-screen w-screen relative overflow-hidden">
      <div className="absolute top-3 w-full flex justify-center z-20">
        <div className="bg-black/70 px-3 py-1 rounded-full text-xs border border-zinc-700">SOT TOK 🪙 100 | 50/50</div>
      </div>
      <video src={videos[0].url} autoPlay loop muted playsInline className="h-full w-full object-cover" />

      <div className="absolute right-3 bottom-32 flex flex-col gap-5 z-20 items-center">
        <div className="relative">
          <img src="https://i.pravatar.cc/100" className="w-12 h-12 rounded-full border-2 border-white" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">+</div>
        </div>
        <div className="text-center"><span className="text-2xl">❤️</span><br/><span className="text-xs">364</span></div>
        <div className="text-center"><span className="text-2xl">💬</span><br/><span className="text-xs">27</span></div>
        <div className="text-center"><span className="text-xl">⬇️</span><br/><span className="text-[10px]">Save</span></div>
      </div>

      <div className="absolute bottom-20 left-3 right-20 z-20">
        <div className="flex gap-2 items-center">
          <span className="font-bold">@Ananya</span>
          <button className="border border-white px-3 py-1 rounded text-xs">Follow</button>
          <button className="bg-orange-500 px-3 py-1 rounded text-xs font-bold">Send 10 ⚡</button>
          <button className="bg-zinc-800 px-3 py-1 rounded text-xs border border-zinc-600">Message</button>
        </div>
        <p className="text-sm mt-2">My first SOT TOK ❤️ #viral</p>
      </div>

      <div className="absolute bottom-0 w-full bg-black flex justify-around py-3 border-t border-zinc-800 text-xl">
        <span>⌂</span><span>🔍</span><span className="bg-white text-black px-5 rounded">+</span><span>✉️</span><span>👤</span>
      </div>
    </div>
  );
}