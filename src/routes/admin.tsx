 import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

function AdminPage() {
  const [tab, setTab] = useState("Dashboard");
  const [form, setForm] = useState<any>({title:"", message:"", videoId:"", amount:"100", bannerUrl:"", link:"", groupName:"", upi:"", commission:"20"});
  const [data, setData] = useState<any>({updates:[], banners:[], boosts:[], payments:[], lives:[], groups:[]});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(()=>{ loadAll(); },[tab]);

  const loadAll = async () => {
    try {
      const u = await supabase.from("app_updates").select("*").order("created_at",{ascending:false}).limit(20);
      const b = await supabase.from("banners").select("*").order("created_at",{ascending:false}).limit(20);
      const bo = await supabase.from("boosts").select("*").order("created_at",{ascending:false}).limit(20);
      const p = await supabase.from("payments").select("*").order("created_at",{ascending:false}).limit(20);
      const l = await supabase.from("live_streams").select("*").order("created_at",{ascending:false}).limit(20);
      const g = await supabase.from("groups").select("*").order("created_at",{ascending:false}).limit(20);

      // যদি table না থাকে, error দেখাবে না, খালি list দেখাবে
      if(u.error && u.error.message.includes("schema cache")) { setErrorMsg("SETUP বাকি আছে! নিচে SQL RUN করো"); }

      setData({
        updates: u.data||[],
        banners: b.data||[],
        boosts: bo.data||[],
        payments: p.data||[],
        lives: l.data||[],
        groups: g.data||[]
      });
    } catch (e:any) {
      setErrorMsg("Table পাওয়া যায়নি, SQL RUN করতে হবে");
    }
  };

  const act = async (table:string, payload:any, msg:string) => {
    try {
      const {error} = await supabase.from(table).insert([payload]);
      if(error) {
        alert("⚠️ Table নেই! Supabase এ SQL RUN করো\n\nError: "+error.message);
        setErrorMsg(`'${table}' table নেই! নিচের SQL টা Supabase এ RUN করো`);
      } else {
        alert(`✅ ${msg} LIVE হয়ে গেছে!`);
        loadAll();
      }
    } catch (e:any) {
      alert("Table নেই, আগে SQL RUN করো দাদা!");
    }
  };

  const tabs = ["Dashboard","Commission","Boost","Live","Groups","Payments","Scanner","Wallet","Verify","Camera","Banners"];
  const I = "w-full p-3 bg-zinc-800 rounded-xl mb-3 text-white border border-zinc-700";
  const B = "w-full bg-orange-500 p-3 rounded-xl font-bold";

  return (
    <div className="min-h-screen bg-black text-white p-3 pb-24">
      <h1 className="text-blue-400 font-bold text-[18px]">SOT TOK - OWNER + COMMISSION WALLET</h1>
      <div className="bg-zinc-900 text-green-400 p-2 rounded-xl my-3 text-sm">Welcome @sottokofficial - 2 Owner Active - ALL LIVE ✅</div>

      {errorMsg && <div className="bg-red-900/50 border border-red-600 p-3 rounded-xl mb-3 text-sm">
        ⚠️ {errorMsg}<br/>
        <b>সমাধান:</b> Supabase Dashboard -&gt; SQL Editor -&gt; নিচের SQL Paste -&gt; RUN
      </div>}

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-bold ${tab===t?'bg-blue-600':'bg-zinc-800'}`}>{t}</button>)}
      </div>

      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        {tab==="Dashboard" && <>
          <h2 className="font-bold mb-3">📢 App Update - সবাই Home এ দেখবে</h2>
          <input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title"/>
          <textarea className={I} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Message..."/>
          <button className="w-full bg-green-600 p-3 rounded-xl font-bold" onClick={()=>act("app_updates",{title:form.title, message:form.message},"Update")}>Publish For All Users</button>
          <div className="mt-4">{data.updates.map((u:any)=><div key={u.id} className="bg-zinc-800 p-2 rounded mt-2">📢 <b>{u.title}</b>: {u.message}</div>)}</div>
        </>}
        {tab==="Boost" && <><h2 className="font-bold mb-3">🚀 Boost Video</h2><input className={I} value={form.videoId} onChange={e=>setForm({...form,videoId:e.target.value})} placeholder="Video ID"/><input className={I} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="100"/><button className={B} onClick={()=>act("boosts",{video_id:form.videoId, amount:Number(form.amount)},"Boost")}>Boost Now Live</button></>}
        {tab==="Banners" && <><h2 className="font-bold mb-3">🖼️ Banners</h2><input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title"/><input className={I} value={form.bannerUrl} onChange={e=>setForm({...form,bannerUrl:e.target.value})} placeholder="Image URL https://..."/><button className={B} onClick={()=>act("banners",{title:form.title, image_url:form.bannerUrl, link:form.link},"Banner")}>Banner Live করো</button></>}
        {tab==="Commission" && <><h2 className="font-bold mb-3">💰 Commission</h2><input className={I} value={form.commission} onChange={e=>setForm({...form,commission:e.target.value})} placeholder="20"/><button className={B} onClick={()=>act("commissions",{user_id:"all", percent:Number(form.commission), amount:0},"Commission")}>Set Live</button></>}
        {tab==="Live" && <><h2 className="font-bold mb-3">🔴 Live Control</h2><input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Live Title"/><button className={B} onClick={()=>act("live_streams",{title:form.title, user_id:"@sottokofficial", is_live:true},"Live")}>Go Live</button></>}
        {tab==="Groups" && <><h2 className="font-bold mb-3">👥 Groups</h2><input className={I} value={form.groupName} onChange={e=>setForm({...form,groupName:e.target.value})} placeholder="Group Name"/><button className={B} onClick={()=>act("groups",{name:form.groupName},"Group")}>Create Group</button></>}
        {tab==="Payments" && <><h2 className="font-bold mb-3">💳 Payments</h2>{data.payments.map((p:any)=><div key={p.id} className="bg-zinc-800 p-3 rounded mt-2">₹{p.amount} - {p.status} <button onClick={async()=>{await supabase.from("payments").update({status:"approved"}).eq("id",p.id); loadAll();}} className="bg-green-600 px-2 rounded ml-2">Approve</button></div>)}</>}
        {tab==="Scanner" && <><h2 className="font-bold mb-3">📷 UPI Scanner</h2><input className={I} value={form.upi} onChange={e=>setForm({...form,upi:e.target.value})} placeholder="UPI ID"/><button className={B} onClick={()=>act("payments",{user_id:"owner_upi", upi_id:form.upi, amount:0, status:"active"},"UPI")}>Save UPI</button></>}
        {tab==="Wallet" && <><h2 className="font-bold mb-3">👛 Wallet</h2><input className={I} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Amount"/><button className={B} onClick={()=>act("owner_wallet",{balance:Number(form.amount)},"Wallet")}>Add Wallet</button></>}
        {tab==="Verify" && <><h2 className="font-bold mb-3">✅ Verify</h2><input className={I} value={form.videoId} onChange={e=>setForm({...form,videoId:e.target.value})} placeholder="User ID"/><button className={B} onClick={()=>act("verifications",{user_id:form.videoId, status:"verified"},"Verify")}>Verify Live</button></>}
        {tab==="Camera" && <><h2 className="font-bold mb-3">📸 Camera</h2><input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Filter Name"/><button className={B} onClick={()=>act("app_updates",{title:"Filter: "+form.title, message:"New!"},"Camera")}>Publish Filter</button></>}
      </div>

      <div className="mt-6 bg-zinc-900 p-3 rounded-xl border border-zinc-700">
        <p className="text-xs text-zinc-400">👇 এই SQL টা COPY করে Supabase SQL Editor এ RUN করো তাহলে Error চলে যাবে:</p>
        <p className="text-[10px] bg-black p-2 rounded mt-2 overflow-auto">create table if not exists live_streams (id uuid primary key default gen_random_uuid(), title text, user_id text, is_live boolean default true, created_at timestamp default now()); alter table live_streams enable row level security; create policy "open" on live_streams for all using (true) with check (true);</p>
      </div>
    </div>
  )
}
export const Route = createFileRoute('/admin')({ component: AdminPage, })