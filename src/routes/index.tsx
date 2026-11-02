import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOT TOK - Happy Diwali 2026 Special Offer" },
      {
        name: "description",
        content:
          "SOT TOK - দীপাবলি 2026 স্পেশাল কনটেস্ট! ভিডিও বানাও, শেয়ার করো, পুরস্কার জেতো।",
      },
      { property: "og:title", content: "SOT TOK - Happy Diwali 2026" },
      {
        property: "og:description",
        content:
          "দীপাবলি স্পেশাল কনটেস্ট - নিজের ক্যামেরায় ভিডিও বানাও - জিতে নাও বিশেষ পুরস্কার",
      },
    ],
  }),
  component: DiwaliSplash,
});

const DURATION = 4000;

function DiwaliSplash() {
  const navigate = useNavigate();
  const [showContest, setShowContest] = useState(false);

  // 4 সেকেন্ড পর Auto Home এ যাবে
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showContest) {
        navigate({ to: "/home" });
      }
    }, DURATION);
    return () => clearTimeout(timer);
  }, [navigate, showContest]);

  const hashtags = ["#HappyDiwali2026", "#DiwaliOffer", "#SOTTOKDIWALI", "#DeepawaliContest"];

  return (
    <div className="min-h-screen w-full bg-[#1a1033] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Lights Effect */}
      <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-yellow-500/20 to-transparent" />
      <div className="absolute top-4 left-0 right-0 text-center text-yellow-300 text-xs tracking-[0.3em]">✨ 🪔 ✨ 🪔 ✨</div>

      {/* Main Banner Card */}
      <div 
        onClick={() => setShowContest(true)}
        className="w-full max-w-[360px] bg-gradient-to-br from-[#2d1b69] to-[#1a1033] border border-yellow-500/30 rounded-[24px] p-5 text-center shadow-[0_0_40px_rgba(255,215,0,0.3)] cursor-pointer active:scale-95 transition-all"
      >
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">SOT TOK</h1>
        <p className="text-yellow-200 text-sm mt-1 tracking-widest">Happy Diwali Special Offer 2026</p>
        
        <div className="my-5">
          <h2 className="text-white text-[22px] font-bold leading-tight">
            দীপাবলি স্পেশাল কনটেস্ট -<br/>
            নিজের ক্যামেরায় ভিডিও বানাও<br/>
            <span className="text-yellow-400">- জিতে নাও বিশেষ পুরস্কার</span>
          </h2>
        </div>

        {/* Diya Animation */}
        <div className="flex justify-center gap-8 my-4 text-2xl">🪔 🪔 🪔</div>

        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black px-6 py-2.5 rounded-full text-sm">
          ✓ SOT TOK OFFICIAL
        </div>

        <p className="text-white/50 text-[11px] mt-3">ব্যানারে ক্লিক করে কনটেস্টে যোগ দাও 👇</p>
      </div>

      {/* Hashtag Section - Banner এ ক্লিক করলে আসবে */}
      {showContest && (
        <div className="w-full max-w-[360px] mt-4 bg-white rounded-[20px] p-4 animate-in fade-in">
          <h3 className="font-bold text-gray-900">🔥 Diwali Hashtag দিয়ে ভিডিও বানাও</h3>
          <p className="text-xs text-gray-500 mt-1">যেকোনো Hashtag এ ক্লিক করলেই ক্যামেরা খুলবে</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {hashtags.map(tag => (
              <button
                key={tag}
                onClick={() => navigate({ to: "/create", search: { hashtag: tag } } as any)}
                className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-orange-500 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => navigate({ to: "/create", search: { contest: "diwali2026" } } as any)} className="bg-gradient-to-r from-pink-600 to-orange-500 text-white py-3 rounded-xl font-bold">
              📹 ভিডিও বানাও
            </button>
            <button onClick={() => navigate({ to: "/home" })} className="bg-gray-100 text-black py-3 rounded-xl font-bold">
              Trending দেখো
            </button>
          </div>
        </div>
      )}

      {!showContest && (
        <p className="text-white/30 text-xs mt-6">4 সেকেন্ড পর Home এ যাচ্ছে...</p>
      )}
    </div>
  );
}