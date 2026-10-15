import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SotTokLogo } from "@/components/SotTokLogo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "সাইন ইন — SOT TOK" },
      { name: "description", content: "Gmail দিয়ে সাইন ইন করুন অথবা নতুন SOT TOK আইডি তৈরি করুন।" },
      { property: "og:title", content: "সাইন ইন — SOT TOK" },
      { property: "og:description", content: "Gmail দিয়ে সাইন ইন করুন অথবা নতুন SOT TOK আইডি তৈরি করুন।" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gmailId, setGmailId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/feed" });
  }, [user, navigate]);

  const signInGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/feed" });
  };

  const createId = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = gmailId.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (!fullName.trim()) {
      toast.error("পুরো নাম লিখুন।");
      return;
    }
    if (id.length < 3) {
      toast.error("অন্তত ৩ অক্ষরের আইডি লিখুন।");
      return;
    }
    if (password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }


    setCreating(true);
    const email = `${id}@sottok.com`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName.trim(), username: id },
      },
    });
    setCreating(false);
    if (error) {
      toast.error(
        error.message.includes("already")
          ? "এই আইডি আগে থেকেই আছে। অন্য আইডি চেষ্টা করুন।"
          : error.message,
      );
      return;
    }
    toast.success(`আইডি তৈরি হয়েছে: ${email}`);
    navigate({ to: "/feed" });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] bg-black px-6 pb-10 pt-5 text-white">
      <button
        onClick={() => navigate({ to: "/" })}
        aria-label="পিছনে"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-full"
      >
        <ArrowLeft className="h-6 w-6 text-white" />
      </button>

      <div className="flex flex-col items-center">
        <SotTokLogo size={92} />
        <h1 className="mt-4 font-display text-[30px] font-bold text-brand" style={{ letterSpacing: "2px" }}>
          SOT TOK
        </h1>
        <p className="mt-1 text-sm text-gold">নিজের পরিচয় নিজেই তৈরি করো</p>
      </div>

      <p className="mt-6 text-center text-[13px] leading-relaxed text-white/70">
        Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে এবং আপনার নাম
        সিস্টেমে সুরক্ষিত থাকবে।
      </p>

      <div className="mt-4 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/60 px-3 py-1 text-[11px] text-green-400">
          <ShieldCheck className="h-3.5 w-3.5" /> 100% Safe &amp; Private
        </span>
      </div>

      <button
        onClick={signInGoogle}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white disabled:opacity-70"
      >
        {googleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-brand">
            G
          </span>
        )}
        Gmail দিয়ে চালিয়ে যান
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/15" />
        <span className="text-[11px] text-white/40">অথবা</span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <form onSubmit={createId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-3 text-[14px] font-semibold text-white">নতুন Gmail খুলতে চাই</p>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="পুরো নাম"
          className="mb-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-brand"
        />
        <input
          value={gmailId}
          onChange={(e) => setGmailId(e.target.value)}
          placeholder="sottok123"
          autoCapitalize="none"
          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-brand"
        />
        <p className="mb-3 mt-1.5 text-[11px] text-white/45">
          নতুন gmail আইডি লিখুন — আপনার ঠিকানা হবে{" "}
          <span className="text-gold">{(gmailId || "sottok123").toLowerCase()}@sottok.com</span>
        </p>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
          className="mb-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-brand"
        />
        <button
          type="submit"
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-[15px] font-bold text-black disabled:opacity-70"
        >
          {creating && <Loader2 className="h-4 w-4 animate-spin" />}
          নতুন আইডি তৈরি করুন
        </button>
      </form>

      <p className="mt-8 text-center text-[11px] text-white/40">
        <Link to="/login" className="underline-offset-2 hover:underline">
          Privacy Policy
        </Link>{" "}
        •{" "}
        <Link to="/login" className="underline-offset-2 hover:underline">
          Terms of Service
        </Link>
      </p>
    </div>
  );
}
