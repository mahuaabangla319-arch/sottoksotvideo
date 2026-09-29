export default function HomePage() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black mb-2">SOT TOK</h1>
      <p className="text-zinc-400 mb-8">India's Short Video App</p>
      
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <div className="flex gap-3 items-center mb-4">
          <img src="https://i.pravatar.cc/100" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold text-sm">@Ananya</p>
            <p className="text-xs text-zinc-400">My first SOT TOK video</p>
          </div>
          <button className="ml-auto bg-white text-black text-xs px-3 py-1 rounded-full font-bold">Follow</button>
        </div>
        
        <div className="bg-zinc-800 h-64 rounded-xl flex items-center justify-center mb-3">
          <span className="text-5xl">▶️</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <span>❤️ 364</span>
            <span>💬 27</span>
            <span>↗️ 5</span>
          </div>
          <button className="bg-orange-500 px-4 py-1.5 rounded-full text-xs font-bold">Send 10</button>
        </div>
      </div>

      <a href="/feed" className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold">Open Feed</a>
    </div>
  );
}