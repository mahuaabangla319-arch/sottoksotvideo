import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Bell, ChevronRight, Copy, Download, EyeOff, FileText, Globe, HelpCircle,
  Info, KeyRound, LogOut, MessagesSquare, Share2, Shield, Trash2, User, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { shareProfile } from "@/lib/profile";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "সেটিংস — SOT TOK" },
      { name: "description", content: "অ্যাকাউন্ট, প্রাইভেসি, নোটিফিকেশন ও অ্যাপ সেটিংস।" },
      { property: "og:title", content: "সেটিংস — SOT TOK" },
      { property: "og:description", content: "অ্যাকাউন্ট, প্রাইভেসি, নোটিফিকেশন ও অ্যাপ সেটিংস।" },
    ],
  }),
  component: SettingsPage,
});

function Row({ icon, label, hint, onClick, right, danger }: { icon: ReactNode; label: string; hint?: string; onClick?: () => void; right?: ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <span className={danger ? "text-red-500" : "text-white/80"}>{icon}</span>
      <span className="flex-1">
        <span className={`block text-[14px] ${danger ? "text-red-500" : "text-white"}`}>{label}</span>
        {hint && <span className="block text-[11px] text-white/45">{hint}</span>}
      </span>
      {right ?? <ChevronRight className="h-4 w-4 text-white/30" />}
    </button>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand" : "bg-white/20"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <p className="px-4 pb-1 text-[12px] font-semibold uppercase text-white/40">{title}</p>
      <div className="mx-3 divide-y divide-white/5 rounded-2xl bg-white/5">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notif, setNotif] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  useEffect(() => {
    setNotif(localStorage.getItem("sottok-notif") !== "off");
    setAutoplay(localStorage.getItem("sottok-autoplay") !== "off");
    setDataSaver(localStorage.getItem("sottok-datasaver") === "on");
  }, []);

  const { data: profile, refetch } = useQuery({
    queryKey: ["settings-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("sottok_id, username, is_hidden, coins").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const toggleNotif = async () => {
    const next = !notif;
    setNotif(next);
    localStorage.setItem("sottok-notif", next ? "on" : "off");
    if (next && "Notification" in window && Notification.permission === "default") {
      if (window.top !== window.self) {
        toast("ফোনে নোটিফিকেশন পেতে অ্যাপটি নতুন ট্যাবে খুলুন");
        return;
      }
      const p = await Notification.requestPermission();
      toast(p === "granted" ? "ফোনে নোটিফিকেশন চালু হয়েছে" : "ব্রাউজার সেটিংসে নোটিফিকেশন অনুমতি দিন");
    } else toast.success(next ? "নোটিফিকেশন চালু" : "নোটিফিকেশন বন্ধ");
  };

  const toggleHidden = async () => {
    if (!user || !profile) return;
    const { error } = await supabase.from("profiles").update({ is_hidden: !profile.is_hidden }).eq("id", user.id);
    if (error) return toast.error("বদলানো যায়নি");
    toast.success(!profile.is_hidden ? "প্রোফাইল সার্চে লুকানো হয়েছে" : "প্রোফাইল সবার জন্য দৃশ্যমান");
    void refetch();
  };

  const flip = (key: string, val: boolean, set: (v: boolean) => void, onVal: string, offVal: string) => {
    set(!val);
    localStorage.setItem(key, !val ? onVal : offVal);
    toast.success("সেভ হয়েছে");
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/login` });
    toast[error ? "error" : "success"](error ? "পাঠানো যায়নি" : "পাসওয়ার্ড রিসেট লিঙ্ক ইমেইলে পাঠানো হয়েছে");
  };

  const clearCache = async () => {
    sessionStorage.clear();
    if ("caches" in window) for (const k of await caches.keys()) await caches.delete(k);
    toast.success("ক্যাশ পরিষ্কার হয়েছে");
  };

  return (
    <PhoneShell className="bg-black text-white">
      <header className="flex items-center gap-3 px-4 pt-5">
        <button onClick={() => navigate({ to: "/profile" })} aria-label="পিছনে">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[18px] font-semibold">সেটিংস</h1>
      </header>

      {user && (
        <Section title="অ্যাকাউন্ট">
          <Row icon={<User className="h-5 w-5" />} label={`@${profile?.username ?? ""}`} hint={user.email ?? ""} onClick={() => navigate({ to: "/profile" })} />
          <Row icon={<Copy className="h-5 w-5" />} label="SOT ID কপি করুন" hint={profile?.sottok_id} onClick={() => { void navigator.clipboard.writeText(profile?.sottok_id ?? ""); toast.success("ID কপি হয়েছে"); }} />
          <Row icon={<Share2 className="h-5 w-5" />} label="প্রোফাইল শেয়ার করুন" onClick={() => profile && void shareProfile(profile.sottok_id).then((r) => r === "copied" && toast.success("প্রোফাইল লিঙ্ক কপি হয়েছে"))} />
          <Row icon={<Wallet className="h-5 w-5" />} label="আমার ওয়ালেট" hint={`${profile?.coins ?? 0} কয়েন`} onClick={() => navigate({ to: "/profile" })} />
          <Row icon={<KeyRound className="h-5 w-5" />} label="পাসওয়ার্ড পরিবর্তন" onClick={() => void resetPassword()} />
        </Section>
      )}

      <Section title="প্রাইভেসি ও নিরাপত্তা">
        <Row icon={<EyeOff className="h-5 w-5" />} label="প্রোফাইল সার্চে লুকান" hint="অন্যরা আপনাকে সার্চে পাবে না" onClick={() => void toggleHidden()} right={<Toggle on={!!profile?.is_hidden} />} />
        <Row icon={<Shield className="h-5 w-5" />} label="প্রাইভেট ভিডিও" hint="প্রোফাইলের Private ট্যাবে পরিচালনা করুন" onClick={() => navigate({ to: "/profile" })} />
        <Row icon={<MessagesSquare className="h-5 w-5" />} label="চ্যাট" hint="সবার সাথে মেসেজ করুন" onClick={() => navigate({ to: "/chat" })} />
      </Section>

      <Section title="নোটিফিকেশন">
        <Row icon={<Bell className="h-5 w-5" />} label="পুশ নোটিফিকেশন" hint="লাইক, কমেন্ট, ফলো, মেসেজ" onClick={() => void toggleNotif()} right={<Toggle on={notif} />} />
      </Section>

      <Section title="ভিডিও ও ডেটা">
        <Row icon={<Download className="h-5 w-5" />} label="অটো-প্লে ভিডিও" onClick={() => flip("sottok-autoplay", autoplay, setAutoplay, "on", "off")} right={<Toggle on={autoplay} />} />
        <Row icon={<Globe className="h-5 w-5" />} label="ডেটা সেভার" hint="কম ডেটায় ভিডিও" onClick={() => flip("sottok-datasaver", dataSaver, setDataSaver, "on", "off")} right={<Toggle on={dataSaver} />} />
        <Row icon={<Trash2 className="h-5 w-5" />} label="ক্যাশ পরিষ্কার করুন" onClick={() => void clearCache()} />
        <Row icon={<Globe className="h-5 w-5" />} label="ভাষা" hint="বাংলা" right={<span className="text-[12px] text-white/50">বাংলা</span>} />
      </Section>

      <Section title="সাহায্য ও তথ্য">
        <Row icon={<HelpCircle className="h-5 w-5" />} label="সাহায্য কেন্দ্র" onClick={() => toast("শীঘ্রই আসছে")} />
        <Row icon={<FileText className="h-5 w-5" />} label="প্রাইভেসি পলিসি ও শর্তাবলী" onClick={() => toast("শীঘ্রই আসছে")} />
        <Row icon={<Info className="h-5 w-5" />} label="অ্যাপ সম্পর্কে" hint="SOT TOK v1.0 — ভারতের নাম্বার ওয়ান শর্ট ভিডিও অ্যাপ" right={<span />} />
      </Section>

      <div className="mx-3 mt-5 mb-6 rounded-2xl bg-white/5">
        {user ? (
          <Row danger icon={<LogOut className="h-5 w-5" />} label="লগ আউট" right={<span />} onClick={async () => { await signOut(); navigate({ to: "/login" }); }} />
        ) : (
          <Row icon={<User className="h-5 w-5" />} label="লগইন করুন" onClick={() => navigate({ to: "/login" })} />
        )}
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
