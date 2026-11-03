import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark, Bell, Gift, Heart, LayoutDashboard, LayoutGrid, LifeBuoy, Mail, MessageCircle,
  Search, Settings as SettingsIcon, Share2, Shield, UserPlus, UserRound, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/systems")({
  head: () => ({
    meta: [
      { title: "সমস্ত সিস্টেম — SOT TOK" },
      { name: "description", content: "SOT TOK অ্যাপের সব সিস্টেম এক জায়গায় — প্রোফাইল, লাইক, ইনবক্স, ওয়ালেট ও আরও অনেক কিছু।" },
      { property: "og:title", content: "সমস্ত সিস্টেম — SOT TOK" },
      { property: "og:description", content: "SOT TOK অ্যাপের সব সিস্টেম এক জায়গায়।" },
    ],
  }),
  component: SystemsPage,
});

type Card = {
  label: string;
  Icon: typeof Heart;
  to?: "/profile" | "/explore" | "/activity" | "/chat" | "/settings";
  soon?: boolean;
};

const cards: Card[] = [
  { label: "প্রোফাইল ও অ্যাকাউন্ট", Icon: UserRound, to: "/profile" },
  { label: "ফলো ও আনফলো", Icon: UserPlus, to: "/explore" },
  { label: "লাইক", Icon: Heart, to: "/activity" },
  { label: "কমেন্ট", Icon: MessageCircle, to: "/activity" },
  { label: "শেয়ার", Icon: Share2, to: "/profile" },
  { label: "বুকমার্ক", Icon: Bookmark, soon: true },
  { label: "ইনবক্স", Icon: Mail, to: "/chat" },
  { label: "নোটিফিকেশন", Icon: Bell, to: "/activity" },
  { label: "ওয়ালেট ও কয়েন", Icon: Wallet, to: "/profile" },
  { label: "ক্রিয়েটর ড্যাশবোর্ড", Icon: LayoutDashboard, soon: true },
  { label: "আয় ও গিফট", Icon: Gift, to: "/feed" },
  { label: "অ্যাডমিন প্যানেল", Icon: Shield, soon: true },
  { label: "সার্চ ও ট্রেন্ডিং", Icon: Search, to: "/explore" },
  { label: "সেটিংস", Icon: SettingsIcon, to: "/settings" },
  { label: "সাপোর্ট ও হেল্প", Icon: LifeBuoy, to: "/settings" },
];

function SystemsPage() {
  const navigate = useNavigate();

  const open = (c: Card) => {
    if (c.to) navigate({ to: c.to });
    else toast("শীঘ্রই আসছে");
  };

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center gap-3 px-4 pt-5">
        <LayoutGrid className="h-6 w-6 text-brand" />
        <h1 className="text-[18px] font-semibold">সমস্ত সিস্টেম</h1>
      </header>
      <p className="px-4 pt-1 text-[12px] text-white/45">SOT TOK অ্যাপের সব সিস্টেম এক জায়গায়</p>

      <div className="mt-4 grid grid-cols-3 gap-2.5 px-3 pb-6">
        {cards.map((c) => {
          const content = (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <c.Icon className="h-5 w-5 text-white" />
              </span>
              <span className="text-center text-[11px] leading-tight text-white/85">{c.label}</span>
            </>
          );
          return c.to ? (
            <Link
              key={c.label}
              to={c.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-4 active:bg-white/10"
            >
              {content}
            </Link>
          ) : (
            <button
              key={c.label}
              onClick={() => open(c)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-4 active:bg-white/10"
            >
              {content}
            </button>
          );
        })}
      </div>

      <BottomNav />
    </PhoneShell>
  );
}
