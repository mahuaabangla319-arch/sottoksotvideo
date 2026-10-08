import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Bell, User } from "lucide-react";

const items = [
  { to: "/feed", label: "হোম", Icon: Home },
  { to: "/explore", label: "এক্সপ্লোরার", Icon: Compass },
] as const;

const right = [
  { to: "/activity", label: "ইনবক্স", Icon: Bell },
  { to: "/profile", label: "প্রোফাইল", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const cell = (to: string, label: string, Icon: typeof Home) => {
    const active = pathname === to;
    return (
      <Link
        key={to}
        to={to}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
      >
        <Icon
          className={
            active
              ? to === "/activity"
                ? "h-6 w-6 text-gold"
                : "h-6 w-6 text-brand"
              : "h-6 w-6 text-on-media"
          }
        />
        <span
          className={
            active
              ? to === "/activity"
                ? "text-[10px] text-gold"
                : "text-[10px] text-brand"
              : "text-[10px] text-on-media/70"
          }
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[420px] items-center border-t border-on-media/10 bg-media px-2 pb-[env(safe-area-inset-bottom)]">
      {items.map((i) => cell(i.to, i.label, i.Icon))}
      
      {/* সেন্টারের বাটন (লুডো / নতুন ভিডিও) */}
      <Link
        to="/create"
        aria-label="লুডো ও ভিডিও"
        className="mx-1 flex h-10 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 shadow-lg shadow-amber-500/20 active:scale-95"
      >
        <span className="text-2xl leading-none">🎲</span>
      </Link>

      {right.map((i) => cell(i.to, i.label, i.Icon))}
    </nav>
  );
}
