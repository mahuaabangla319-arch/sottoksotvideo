
  import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
function GroupsPublic(){
  const [groups, setGroups] = useState<any[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  useEffect(()=>{
    const all = JSON.parse(localStorage.getItem("st_22_public")||"[]");
    const g = all.filter((x:any)=>x.tab==="Groups");
    if(g.length===0){
      setGroups([{id:1, name:"🙏 Ganesh Thakur Official Group", leader:"@sottokofficial", members:1250}, {id:2, name:"SOT TOK Family", leader:"@sottokofficial", members:890}]);
    } else setGroups(g);
    setJoined(JSON.parse(localStorage.getItem("st_joined_groups")||"[]"));
  },[]);
  const join = (id:any, name:string)=>{
    const j = [...joined, id.toString()];
    setJoined(j);
    localStorage.setItem("st_joined_groups", JSON.stringify(j));
    alert(`✅ ${name} JOINED! Leader @sottokofficial`);
  };
  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <h1 className="font-bold text-xl">👥 PUBLIC GROUPS - 22 Plans LIVE</h1>
      <p className="text-xs text-yellow-400">Leader: @sottokofficial - সবাই দেখছে</p>
      <div className="mt-4 space-y-3">
        {groups.map((g:any)=><div key={g.id} className="bg-zinc-900 border border-orange-500/30 p-4 rounded-2xl flex justify-between items-center"><div><h2 className="font-bold">{g.name}</h2><p className="text-xs text-zinc-400">👑 {g.leader||"@sottokofficial"} • 👥 {g.members||1250} Members • PUBLIC</p></div><button onClick={()=>join(g.id,g.name)} className={`px-6 py-2 rounded-full font-bold ${joined.includes(g.id.toString())?'bg-green-600':'bg-blue-600'}`}>{joined.includes(g.id.toString())?'Joined ✅':'JOIN'}</button></div>)}
      </div>
    </div>
  )
}
export const Route = createFileRoute('/groups')({ component: GroupsPublic, })