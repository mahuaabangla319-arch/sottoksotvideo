import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: DiwaliSplash,
});

function DiwaliSplash() {
  const navigate = useNavigate();
  const [showContest, setShowContest] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showContest) {
        navigate({ to: "/home" });
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate, showContest]);

  const hashtags = ["#HappyDiwali2026", "#DiwaliOffer", "#SOTTOKDIWALI"];

  return (
    <div className="min-h-screen w-full bg-[#1a1033] flex flex-col items-center justify-center p-4">
      <div 
        onClick={() => setShowContest(true)}
        className="w-full max-w-[360px] bg-gradient-to-br from-[#2d1b69] to-[#1a1033] border border-yellow-500/30 rounded-[24px] p-5 text-center cursor-pointer"
      >
        <h1 className="text-4xl font-black text-yellow-400">SOT TOK</h1>
        <p className="text-yellow-200 text-sm mt-1">Happy Diwali Special Offer 2026</p>
        <h2 className="text-white text-[18px] font-bold mt-4">
          দীপাবলি স্পেশাল কনটেস্ট -<br/>নিজের ক্যামেরায় ভিডিও বানাও
        </h2>
        <div className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-sm">
          SOT TOK OFFICIAL - ক্লিক করো
        </div>
      </div>

      {showContest && (
        <div className="w-full max-w-[360px] mt-4 bg-white rounded-[20px] p-4">
          <h3 className="font-bold">🔥 Hashtag দিয়ে ভিডিও বানাও</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {hashtags.map(tag => (
              <button
                key={tag}
                onClick={() => navigate({ to: "/create" })}
                className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold"
              >
                {tag}
              </button>
            ))}
          </div>
          <button onClick={() => navigate({ to: "/create" })} className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-bold">
            📹 ভিডিও বানাও
          </button>
          <button onClick={() => navigate({ to: "/home" })} className="w-full mt-2 bg-gray-100 text-black py-2 rounded-xl font-bold">
            Trending দেখো
          </button>
        </div>
      )}
    </div>
  );
}