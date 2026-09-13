import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — SOT TOK" },
      { name: "description", content: "আপনার লাইক, কমেন্ট আর ফলোয়ার অ্যাক্টিভিটি এক জায়গায়।" },
      { property: "og:title", content: "Activity — SOT TOK" },
      { property: "og:description", content: "আপনার লাইক, কমেন্ট আর ফলোয়ার অ্যাক্টিভিটি এক জায়গায়।" },
    ],
  }),
  component: ActivityPage,
});

const tabs = ["All", "Likes", "Comments", "Followers"] as const;

function ActivityPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<(typeof tabs)[number]>("All");

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center gap-3 px-4 pt-5">
        <button onClick={() => navigate({ to: "/feed" })} aria-label="পিছনে">
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-[18px] font-semibold text-white">Activity</h1>
      </header>

      <div className="mt-5 flex gap-6 border-b border-white/10 px-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`pb-2 text-[14px] ${
              active === t ? "border-b-2 border-pink font-semibold text-white" : "text-white/45"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex h-[60vh] items-center justify-center px-6">
        <p className="text-center text-[14px] text-white/45">এখনো কোনো অ্যাক্টিভিটি নেই।</p>
      </div>

      <BottomNav />
    </PhoneShell>
  );
}
