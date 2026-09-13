import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SotTokLogo } from "@/components/SotTokLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOT TOK — নিজের পরিচয় নিজেই তৈরি করো" },
      {
        name: "description",
        content: "SOT TOK — বাংলা শর্ট ভিডিও অ্যাপ। ভিডিও বানাও, শেয়ার করো, নিজের পরিচয় তৈরি করো।",
      },
      { property: "og:title", content: "SOT TOK — নিজের পরিচয় নিজেই তৈরি করো" },
      { property: "og:description", content: "বাংলা শর্ট ভিডিও অ্যাপ — রেকর্ড করো, শেয়ার করো, ট্রেন্ড করো।" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 2000) * 100);
      setProgress(pct);
    }, 40);
    const timeout = window.setTimeout(() => navigate({ to: "/login" }), 2050);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="bg-splash flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center px-8">
        <SotTokLogo size={120} />
        <h1
          className="mt-8 font-display text-[36px] font-bold text-white"
          style={{ letterSpacing: "2px" }}
        >
          SOT TOK
        </h1>
        <p className="mt-3 text-center text-[15px] text-gold">নিজের পরিচয় নিজেই তৈরি করো</p>
      </div>
      <div className="mb-16 w-full max-w-[420px] px-10">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
