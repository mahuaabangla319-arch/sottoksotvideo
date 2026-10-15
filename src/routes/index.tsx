import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import splash from "@/assets/mahalaya-splash.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOT TOK — নিজের পরিচয় নিজেই তৈরি করো" },
      {
        name: "description",
        content: "SOT TOK — ভারতের নাম্বার ওয়ান শর্ট ভিডিও অ্যাপ। ভিডিও বানাও, শেয়ার করো, নিজের পরিচয় তৈরি করো।",
      },
      { property: "og:title", content: "SOT TOK — নিজের পরিচয় নিজেই তৈরি করো" },
      { property: "og:description", content: "ভারতের নাম্বার ওয়ান শর্ট ভিডিও অ্যাপ — রেকর্ড করো, শেয়ার করো, ট্রেন্ড করো।" },
    ],
  }),
  component: Splash,
});

const DURATION = 5000;

function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - start) / DURATION) * 100));
    }, 50);
    const timeout = window.setTimeout(() => navigate({ to: "/feed" }), DURATION + 50);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black">
      <img
        src={splash.url}
        alt="শুভ মহালয়া — SOT TOK শর্ট ভিডিও অ্যাপ"
        className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-60"
        aria-hidden
      />
      <img
        src={splash.url}
        alt="শুভ মহালয়া — SOT TOK শর্ট ভিডিও অ্যাপ"
        className="relative z-10 w-full max-w-[420px] object-contain"
      />
      <div className="absolute bottom-12 z-10 w-full max-w-[420px] px-10">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-gold transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
