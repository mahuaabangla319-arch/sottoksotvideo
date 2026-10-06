
  import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";

function GroupsPublicPage() {
  // 🔥 এখানেই GROUP PUBLIC LIVE - সবাই দেখবে, SQL ছাড়াই!
  const [groups] = useState([
    { id: 1, name: "🙏 Ganesh Thakur Official Group", members: 1250, desc: "SOT TOK OFFICIAL - PUBLIC LIVE" },
    { id: 2, name: "SOT TOK Family Group", members: 890, desc: "All Users Group" },
    { id: 3, name: "SOT TOK Video Lovers", members: 560, desc: "Video Share Group" },
  ]);
  const [joined, setJoined] = useState<string[]>(() => JSON.parse(localStorage.getItem("st_joined_groups")||"[]"));

  const join = (id:any, name:string) => {
    const newJ = [...joined, id.toString()];
    setJoined(newJ);
    localStorage.setItem("st_joined_groups", JSON.stringify(newJ));
    alert(`✅ ${name} এ JOIN হয়ে গেছো! Ganesh Thakur er Ashirbad! 🙏`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="bg-gradient-to-r from-orange-600 to-yellow-600 p-4 rounded-2xl mb-4 text-center border-2 border-yellow-400">
        <p className="text-4xl">🙏</p>
        <h1 className="text-xl font-bold">Ganesh Thakur Group - ACTIVE</h1>
        <p className="text-xs">JOIN করলেই গ্রুপে ঢুকবে - SQL ছাড়াই LIVE</p>
      </div>

      <div className="grid gap-3">
        {groups.map((g:any)=>(
          <div key={g.id} className="bg-zinc-900 p-4 rounded-2xl border border-orange-500/40 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-[15px]">{g.name}</h2>
              <p className="text-xs text-zinc-400">👥 {g.members} Members • {g.desc}</p>
              <p className="text-[10px] text-green-400">● PUBLIC LIVE - সবাই দেখছে</p>
            </div>
            <button
              onClick={()=>join(g.id, g.name)}
              className={`px-6 py-2 rounded-full font-bold ${joined.includes(g.id.toString())?'bg-green-600':'bg-blue-600 animate-pulse'}`}
            >
              {joined.includes(g.id.toString())?'Joined ✅':'JOIN'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button onClick={()=>window.location.href='/'} className="bg-zinc-800 px-6 py-2 rounded-full text-sm">⬅️ Home এ ফিরে যাও</button>
      </div>
    </div>
  )
}
export const Route = createFileRoute('/groups')({ component: GroupsPublicPage, })