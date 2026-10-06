import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";

function GroupsPublicPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [joined, setJoined] = useState<string[]>([]);

  useEffect(()=>{
    // Admin থেকে যা LIVE করেছো
    const saved = JSON.parse(localStorage.getItem("st_groups") || "[]");
    const saved2 = JSON.parse(localStorage.getItem("st_public_groups") || "[]");
    const all = saved.length>0 ? saved : saved2;
    // যদি কিছুই না থাকে demo group দেখাও
    if(all.length===0){
      setGroups([{id:1, name:"SOT TOK OFFICIAL", members:1250, time:"Public Group"}]);
    } else {
      setGroups(all);
    }
    setJoined(JSON.parse(localStorage.getItem("st_joined_groups")||"[]"));
  },[]);

  const join = (id:any, name:string) => {
    const newJoined = [...joined, id.toString()];
    setJoined(newJoined);
    localStorage.setItem("st_joined_groups", JSON.stringify(newJoined));
    alert(`✅ ${name} গ্রুপে JOIN হয়ে গেছো!`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <h1 className="text-xl font-bold mb-1">👥 SOT TOK GROUPS - PUBLIC LIVE</h1>
      <p className="text-zinc-400 text-xs mb-4">Admin থেকে যা Public করবে এখানে সবাই দেখবে</p>

      <div className="grid gap-3">
        {groups.map((g:any)=>(
          <div key={g.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-[16px]">{g.name || g.title || "SOT TOK Group"}</h2>
              <p className="text-xs text-zinc-400">👥 {g.members||Math.floor(Math.random()*500+100)} Members • {g.time||"Public"}</p>
              <p className="text-[10px] text-green-400 mt-1">● PUBLIC LIVE</p>
            </div>
            <button 
              onClick={()=>join(g.id, g.name||"Group")}
              className={`px-5 py-2 rounded-full text-sm font-bold ${joined.includes(g.id.toString())?'bg-green-600':'bg-blue-600'}`}
            >
              {joined.includes(g.id.toString())?'Joined ✅':'Join'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-center">
        <p className="text-xs text-zinc-500">Admin -&gt; Groups -&gt; Create Group LIVE চাপলে এখানে আসবে</p>
      </div>
    </div>
  )
}
export const Route = createFileRoute('/groups')({ component: GroupsPublicPage, })