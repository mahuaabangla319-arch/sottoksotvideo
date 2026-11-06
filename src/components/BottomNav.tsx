import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Bell, User, Plus, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { getMyNotifs } from "@/lib/localNotify";

const items = [
  { to: "/feed", label: "হোম", Icon: Home },
  { to: "/explore", label: "এক্সপ্লোরার", Icon: Compass },
  { to: "/live", label: "লাইভ", Icon: Radio },
] as const;

const right = [
  { to: "/activity", label: "ইনবক্স", Icon: Bell },
  { to: "/profile", label: "প্রোফাইল", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dot, setDot] = useState(false);
  useEffect(() => {
    const check = () => setDot(getMyNotifs().some((n) => !n.read));
    check();
    window.addEventListener("sottok-notif", check);
    window.addEventListener("storage", check);
    return () => { window.removeEventListener("sottok-notif", check); window.removeEventListener("storage", check); };
  }, [pathname]);

  const cell = (to: string, label: string, Icon: typeof Home) => {
    const active = pathname === to || (to === "/live" && pathname.startsWith("/live"));
    return (
      <Link
        key={to}
        to={to}
        className={`flex flex-col items-center gap-0.5 w-14 py-1.5 rounded-xl ${active ? "text-pink-500" : "text-gray-400"}`}
      >
        <span className="relative">
          <Icon size={22} strokeWidth={active ? 2.5 : 2} />
          {to === "/activity" && dot && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black" />}
        </span>
        <span className={`text-[11px] font-bold ${active ? "text-pink-500" : "text-gray-400"}`}>{label}</span>
        {active && <span className="w-1 h-1 bg-pink-500 rounded-full" />}
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f14]/95 backdrop-blur border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex items-center justify-between px-2 pt-1">
        <div className="flex items-center">
          {items.map((it) => cell(it.to, it.label, it.Icon))}
        </div>

        {/* Center + Button */}
        <Link
          to="/create"
          className="w-12 h-12 -mt-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 border-4 border-[#0a0a0f]"
        >
          <Plus size={26} className="text-white" />
        </Link>

        <div className="flex items-center">
          {right.map((it) => cell(it.to, it.label, it.Icon))}
        </div>
      </div>
    </nav>
  );
}