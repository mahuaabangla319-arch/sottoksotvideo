import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin(){
  const [stats, setStats] = useState({ users: 0, videos: 0 });
  const [profile, setProfile] = useState<any>(null);

  useEffect(()=>{
    supabase.from("profiles").select("count").then(()=>{});
    supabase.from("videos").select("id", { count: "exact" }).then(({count})=>{
      setStats(s=>({...s, videos: count || 0}));
    });
    supabase.auth.getUser().then(async ({data})=>{
      if(data.user){
        const {data: p} = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        setProfile(p);
      }
    });
  },[]);

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <h1 className="text-[#ff2a6d] font-bold text-xl">SOT TOK Admin & Profile - Secure</h1>

      <div className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <p className="font-bold">👤 My Profile - Secure Saved</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-zinc-700 border-2 border-[#ff2a6d] overflow-hidden">
            {profile?.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover"/>}
          </div>
          <div>
            <p className="font-bold">@{profile?.unique_id || "sottok_user"}</p>
            <p className="text-xs opacity-60">ID: {profile?.id?.slice(0,8) || "secure"}</p>
            <p className="text-xs text-[#ff2a6d]">🪙 Coins: {profile?.coins || 1000} - Auto Saved</p>
          </div>
        </div>
        <p className="text-xs opacity-60 mt-3">
          All SOT TOK videos, coins, gifts auto saved to Supabase, secure, auto play on home
        </p>
      </div>

      <div className="mt-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h3 className="font-bold">📊 SOT TOK Stats - Auto Update Master</h3>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-black p-3 rounded-xl text-center">
            <p className="text-2xl">🎬</p>
            <p className="text-sm">{stats.videos} Videos</p>
            <p className="text-[10px] opacity-50">Auto Play on Home</p>
          </div>
          <div className="bg-black p-3 rounded-xl text-center">
            <p className="text-2xl">💎</p>
            <p className="text-sm">Secure</p>
            <p className="text-[10px] opacity-50">All Data Saved</p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <p>💰 Recharge History - SOT TOK Secure</p>
        <p className="text-xs opacity-60 mt-1">All coins auto added, secure transaction</p>
        <a href="/recharge" className="mt-3 block bg-[#ff2a6d] text-center py-2 rounded-full text-sm font-bold">
          Go to Recharge
        </a>
      </div>

      <a href="/" className="mt-6 block text-center bg-[#ff2a6d] py-3 rounded-full font-bold">
        Back to Home - Auto Play
      </a>

      <p className="text-[10px] opacity-30 text-center mt-4">SOT TOK - 100% Original, Secure, Auto Update</p>
    </div>
  );
}