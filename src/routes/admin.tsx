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

  useEffect(()=>{ loadAll(); },[tab]);
  const loadAll = async () => {
    const [u,b,bo,p,l,g] = await Promise.all([
      supabase.from("app_updates").select("*").order("created_at",{ascending:false}).limit(20),
      supabase.from("banners").select("*").order("created_at",{ascending:false}),
      supabase.from("boosts").select("*").order("created_at",{ascending:false}),
      supabase.from("payments").select("*").order("created_at",{ascending:false}),
      supabase.from("live_streams").select("*").order("created_at",{ascending:false}),
      supabase.from("groups").select("*").order("created_at",{ascending:false}),
    ]);
    setData({updates:u.data||[], banners:b.data||[], boosts:bo.data||[], payments:p.data||[], lives:l.data||[], groups:g.data||[]});
  };

  const act = async (table:string, payload:any, msg:string) => {
    const {error} = await supabase.from(table).insert([payload]);
    if(error) alert(error.message); else { alert(`✅ ${msg} LIVE হয়ে গেছে! সবাই দেখবে!`); loadAll(); }
  };

  const tabs = ["Dashboard","Commission","Boost","Live","Groups","Payments","Scanner","Wallet","Verify","Camera","Banners"];
  const I = "w-full p-3 bg-zinc-800 rounded-xl mb-3 text-white border border-zinc-700";
  const B = "w-full bg-orange-500 p-3 rounded-xl font-bold";

  return (
    <div className="min-h-screen bg-black text-white p-3 pb-24">
      <h1 className="text-blue-400 font-bold text-[18px]">SOT TOK - OWNER + COMMISSION WALLET</h1>
      <div className="bg-zinc-900 text-green-400 p-2 rounded-xl my-3 text-sm">Welcome @sottokofficial - 2 Owner Active - ALL LIVE ✅</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-bold ${tab===t?'bg-blue-600':'bg-zinc-800'}`}>{t}</button>)}
      </div>
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        {tab==="Dashboard" && <>
          <h2 className="font-bold mb-3">📢 App Update - সবাই Home এ দেখবে</h2>
          <input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title - যেমন: নতুন ফিচার!"/>
          <textarea className={I} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Message..."/>
          <button className="w-full bg-green-600 p-3 rounded-xl font-bold" onClick={()=>act("app_updates",{title:form.title, message:form.message},"Update")}>Publish For All Users</button>
          <div className="mt-4">{data.updates.map((u:any)=><div key={u.id} className="bg-zinc-800 p-2 rounded mt-2">📢 <b>{u.title}</b>: {u.message}</div>)}</div>
        </>}
        {tab==="Boost" && <>
          <h2 className="font-bold mb-3">🚀 Boost - Video ID দিলে সবার আগে</h2>
          <input className={I} value={form.videoId} onChange={e=>setForm({...form,videoId:e.target.value})} placeholder="Video ID"/>
          <input className={I} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Amount 100"/>
          <button className={B} onClick={()=>act("boosts",{video_id:form.videoId, amount:Number(form.amount)},"Boost")}>Boost Now Live</button>
          <div className="mt-3">{data.boosts.map((b:any)=><div key={b.id} className="bg-zinc-800 p-2 rounded mt-1 text-sm">ID: {b.video_id} - ₹{b.amount}</div>)}</div>
        </>}
        {tab==="Banners" && <>
          <h2 className="font-bold mb-3">🖼️ Banners - Home এ Slider</h2>
          <input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Banner Title"/>
          <input className={I} value={form.bannerUrl} onChange={e=>setForm({...form,bannerUrl:e.target.value})} placeholder="Image URL https://..."/>
          <input className={I} value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="Link"/>
          <button className={B} onClick={()=>act("banners",{title:form.title, image_url:form.bannerUrl, link:form.link},"Banner")}>Banner Live করো</button>
          <div className="mt-3 flex flex-wrap gap-2">{data.banners.map((b:any)=><img key={b.id} src={b.image_url} className="h-16 w-24 object-cover rounded"/> )}</div>
        </>}
        {tab==="Commission" && <><h2 className="font-bold mb-3">💰 Commission %</h2><input className={I} value={form.commission} onChange={e=>setForm({...form,commission:e.target.value})} placeholder="20%"/><button className={B} onClick={()=>act("commissions",{user_id:"all", percent:Number(form.commission), amount:0},"Commission")}>Set Live</button></>}
        {tab==="Live" && <><h2 className="font-bold mb-3">🔴 Live Control</h2><input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Live Title"/><button className={B} onClick={()=>act("live_streams",{title:form.title, user_id:"@sottokofficial", is_live:true},"Live")}>Go Live</button>{data.lives.map((l:any)=><div key={l.id} className="bg-zinc-800 p-2 rounded mt-2">🔴 {l.title}</div>)}</>}
        {tab==="Groups" && <><h2 className="font-bold mb-3">👥 Groups</h2><input className={I} value={form.groupName} onChange={e=>setForm({...form,groupName:e.target.value})} placeholder="Group Name"/><button className={B} onClick={()=>act("groups",{name:form.groupName},"Group")}>Create Group Live</button>{data.groups.map((g:any)=><div key={g.id} className="bg-zinc-800 p-2 rounded mt-2">{g.name}</div>)}</>}
        {tab==="Payments" && <><h2 className="font-bold mb-3">💳 Payments</h2>{data.payments.map((p:any)=><div key={p.id} className="bg-zinc-800 p-3 rounded mt-2">₹{p.amount} - {p.upi_id} - {p.status} <button onClick={async()=>{await supabase.from("payments").update({status:"approved"}).eq("id",p.id); loadAll();}} className="bg-green-600 px-2 py-1 rounded ml-2">Approve</button></div>)}</>}
        {tab==="Scanner" && <><h2 className="font-bold mb-3">📷 Scanner UPI</h2><input className={I} value={form.upi} onChange={e=>setForm({...form,upi:e.target.value})} placeholder="তোমার UPI ID"/><button className={B} onClick={()=>act("payments",{user_id:"owner_upi", upi_id:form.upi, amount:0, status:"active"},"UPI")}>Save UPI Live</button></>}
        {tab==="Wallet" && <><h2 className="font-bold mb-3">👛 Wallet</h2><div className="bg-blue-900/30 p-3 rounded mb-3 border border-blue-700">Total Approved: ₹{data.payments.filter((p:any)=>p.status==='approved').reduce((s:any,a:any)=>s+Number(a.amount||0),0)}</div><input className={I} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Amount"/><button className={B} onClick={()=>act("owner_wallet",{balance:Number(form.amount)},"Wallet")}>Add Wallet</button></>}
        {tab==="Verify" && <><h2 className="font-bold mb-3">✅ Verify User</h2><input className={I} value={form.videoId} onChange={e=>setForm({...form,videoId:e.target.value})} placeholder="User ID"/><button className={B} onClick={()=>act("verifications",{user_id:form.videoId, status:"verified"},"Verify")}>Verify Live</button></>}
        {tab==="Camera" && <><h2 className="font-bold mb-3">📸 Camera Filter</h2><input className={I} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Filter Name - Beauty"/><button className={B} onClick={()=>act("app_updates",{title:"New Filter: "+form.title, message:"নতুন ক্যামেরা ফিল্টার!"},"Camera")}>Publish Filter</button></>}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})