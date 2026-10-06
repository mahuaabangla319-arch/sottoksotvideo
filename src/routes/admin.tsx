import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";

function Admin22Public(){
  const TABS = ["Dashboard","Commission","Boost","Live","Groups","Payments","Scanner","Wallet","Verify","Camera","Banners","Users","Videos","Reports","Coins","Gifts","Leaderboard","Notifications","Ads","Referral","Withdraw","Settings"];
  const [active, setActive] = useState("Groups");
  const [title, setTitle] = useState("");
  const [list, setList] = useState<any[]>(()=>JSON.parse(localStorage.getItem("st_22_public")||"[]"));

  const savePublic = () => {
    if(!title) return alert("নাম লেখো দাদা!");
    const newItem = {id: Date.now(), tab: active, name: title, leader: "@sottokofficial", public: true, time: new Date().toLocaleString()};
    const newList = [...list, newItem];
    setList(newList);
    localStorage.setItem("st_22_public", JSON.stringify(newList));
    localStorage.setItem("st_public_groups", JSON.stringify(newList.filter((x:any)=>x.tab==="Groups")));
    localStorage.setItem("st_last_update", JSON.stringify(newItem));
    localStorage.setItem("st_ganesh_active", "true");
    setTitle("");
    alert(`✅ ${active} - ${newItem.name} PUBLIC LIVE! এখন sottoksotvideo.lovable.app এ সবাই দেখবে! Leader @sottokofficial`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-2 pb-24">
      <div className="bg-green-900 border border-green-500 p-2 rounded-xl text-center text-xs">✅ @sottokofficial - 22 Plans PUBLIC MODE - যা লিখবে সবাই দেখবে ✅</div>
      <div className="flex flex-wrap gap-1.5 my-3">
        {TABS.map(t=><button key={t} onClick={()=>setActive(t)} className={`px-3 py-1 rounded-full text-[11px] ${active===t?'bg-blue-600':'bg-zinc-800'}`}>{t}</button>)}
      </div>
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-700">
        <h2 className="font-bold">✏️ {active} - Edit করে PUBLIC করো</h2>
        <p className="text-[10px] text-zinc-400">এখানে যা লিখবে ওটাই সব ইউজারের কাছে PUBLIC দেখাবে - Leader @sottokofficial</p>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={`${active} এর নাম লেখো - যেমন Ganesh Thakur Group`} className="w-full bg-black border border-zinc-700 p-3 rounded-xl my-3 text-white" />
        <button onClick={savePublic} className="w-full bg-orange-500 py-3 rounded-xl font-bold text-white">🚀 {active} PUBLIC LIVE করো - সবাই দেখবে</button>
        <div className="mt-4">
          <p className="text-xs font-bold mb-2">PUBLIC LIVE LIST - {list.filter((x:any)=>x.tab===active).length} টা:</p>
          {list.filter((x:any)=>x.tab===active).map((g:any)=><div key={g.id} className="bg-black p-2 rounded-xl mb-2 flex justify-between text-sm"><span>{g.name}</span><span className="text-green-400 text-xs">PUBLIC LIVE • {g.leader}</span></div>)}
        </div>
      </div>
    </div>
  )
}
export const Route = createFileRoute('/admin')({ component: Admin22Public, })