import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [vidId, setVidId] = useState("");
  const [amount, setAmount] = useState("1000");
  const [boostType, setBoostType] = useState<"likes" | "views">("likes");
  const [userId, setUserId] = useState("");
  const [vType, setVType] = useState("blue");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  };

  // ১. ভিউ ও লাইক বুস্ট
  const handleBoost = async () => {
    if (!vidId) return showMsg("❌ Video ID দাও");
    setLoading(true);
    try {
      const { data: video, error: fetchErr } = await supabase
        .from("videos")
        .select("id, likes, views")
        .eq("id", vidId)
        .single();

      if (fetchErr || !video) {
        showMsg("❌ Video পাওয়া যায়নি");
        setLoading(false);
        return;
      }

      const parsedAmount = parseInt(amount) || 0;
      const updateObj =
        boostType === "likes"
          ? { likes: (video.likes || 0) + parsedAmount }
          : { views: (video.views || 0) + parsedAmount };

      const { error } = await supabase
        .from("videos")
        .update(updateObj)
        .eq("id", vidId);

      if (error) throw error;
      showMsg(`✅ Success! ${vidId} তে ${parsedAmount} ${boostType} যোগ হলো`);
    } catch (e: any) {
      showMsg("❌ Error: " + e.message);
    }
    setLoading(false);
  };

  // ২. ভেরিফিকেশন ও ব্যাজ
  const handleVerify = async () => {
    if (!userId) return showMsg("❌ User SOT ID বা ID দাও");
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          verified: true,
          crown_badge: vType === "gold",
        })
        .or(`id.eq.${userId},sottok_id.eq.${userId}`);

      if (error) throw error;
      showMsg(`✅ ${userId} কে ভেরিফাইড টিক দেওয়া হলো`);
    } catch (e: any) {
      showMsg("❌ " + e.message);
    }
    setLoading(false);
  };

  // ৩. লোগো পরিবর্তন
  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("app-assets")
        .upload(`logo-${Date.now()}.png`, file);

      if (error) throw error;

      const { error: settingsError } = await supabase
        .from("app_settings")
        .update({ logo_url: data.path })
        .eq("id", 1);

      if (settingsError) throw settingsError;
      showMsg("✅ Logo পরিবর্তন সফল হয়েছে!");
    } catch (e: any) {
      showMsg("❌ " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black p-4 font-sans text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-black text-blue-500">
          SOT TOK — অ্যাডমিন কন্ট্রোল প্যানেল
        </h1>

        {msg && (
          <div className="rounded-lg bg-zinc-800 p-3 text-sm font-semibold text-green-400">
            {msg}
          </div>
        )}

        {/* সেকশন ১: লাইক ও ভিউ বুস্ট */}
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-lg font-bold text-amber-400">🚀 ভিডিও লাইক / ভিউ বুস্ট</h2>
          <input
            type="text"
            placeholder="ভিডিওর UUID ID"
            value={vidId}
            onChange={(e) => setVidId(e.target.value)}
            className="w-full rounded bg-zinc-800 p-2 text-white placeholder-zinc-500 outline-none"
          />
          <div className="flex gap-2">
            <select
              value={boostType}
              onChange={(e) => setBoostType(e.target.value as "likes" | "views")}
              className="rounded bg-zinc-800 p-2 text-white outline-none"
            >
              <option value="likes">লাইক (Likes)</option>
              <option value="views">ভিউ (Views)</option>
            </select>
            <input
              type="number"
              placeholder="পরিমাণ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded bg-zinc-800 p-2 text-white placeholder-zinc-500 outline-none"
            />
          </div>
          <button
            onClick={handleBoost}
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-bold hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "কাজ চলছে..." : "বুস্ট যোগ করো"}
          </button>
        </div>

        {/* সেকশন ২: ভেরিফিকেশন */}
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-lg font-bold text-sky-400">✓ ব্লু / গোল্ড ভেরিফিকেশন</h2>
          <input
            type="text"
            placeholder="ইউজারের ID বা SOT ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded bg-zinc-800 p-2 text-white placeholder-zinc-500 outline-none"
          />
          <select
            value={vType}
            onChange={(e) => setVType(e.target.value)}
            className="w-full rounded bg-zinc-800 p-2 text-white outline-none"
          >
            <option value="blue">ব্লু টিক (সাধারণ ভেরিফাইড)</option>
            <option value="gold">গোল্ড টিক + ক্রাউন ব্যাজ</option>
          </select>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full rounded bg-sky-600 py-2 font-bold hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? "কাজ চলছে..." : "ভেরিফাই করো"}
          </button>
        </div>

        {/* সেকশন ৩: লোগো পরিবর্তন */}
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-lg font-bold text-purple-400">🖼️ অ্যাপ লোগো আপডেট</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogo}
            disabled={loading}
            className="w-full text-sm text-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
