import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";

function IndexPageNew(){
  const [groups, setGroups] = useState<any[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [notif, setNotif] = useState<any>(null);
  const [showNotif, setShowNotif] = useState(false);

  // PUBLIC GROUPS LOAD - Admin এর 22 Plans থেকে
  useEffect(()=>{
    const load = () => {
      const all = JSON.parse(localStorage.getItem("st_22_public")||"[]");
      const g = all.filter((x:any)=>x.tab==="Groups");
      if(g.length===0){
        // Default PUBLIC GROUP - সবাই দেখবে
        setGroups([
          {id:"1", name:"🙏 Ganesh Thakur Official Group", leader:"@sottokofficial", members:1250, tab:"Groups"},
          {id:"2", name:"SOT TOK Family Official", leader:"@sottokofficial", members:890, tab:"Groups"}
        ]);
      } else {
        setGroups(g);
      }
      setJoined(JSON.parse(localStorage.getItem("st_joined_groups")||"[]"));

      // NOTIFICATION - নতুন গ্রুপ আসলে
      const last = JSON.parse(localStorage.getItem("st_last_update")||"null");
      const lastSeen = localStorage.getItem("st_last_seen_notif");
      if(last && last.id?.toString()!== lastSeen){
        setNotif(last);
        setShowNotif(true);
        // Browser Notification
        if("Notification" in window && Notification.permission==="granted"){
          new Notification(`🔥 নতুন ${last.tab} আসছে!`, {body: `${last.name} - Leader @sottokofficial LIVE!`});
        }
        // Auto hide 8 sec পর
        setTimeout(()=>setShowNotif(false), 8000);
      }
    };
    load();
    if("Notification" in window && Notification.permission!=="granted"){
      Notification.requestPermission();
    }
    // Live check - Admin update করলেই show করবে
    const interval = setInterval(load, 3000);
    return ()=>clearInterval(interval);
  },[]);

  const handleJoin = (id:string, name:string) => {
    if(!joined.includes(id)){
      const newJ = [...joined, id];
      setJoined(newJ);
      localStorage.setItem("st_joined_groups", JSON.stringify(newJ));
      alert(`✅ ${name} এ JOIN হয়ে গেলে! এখন LIVE এ আসতে পারবে! 🙏 Leader @sottokofficial`);
    }
    window.location.href='/groups';
  };

  const closeNotif = () => {
    if(notif){
      localStorage.setItem("st_last_seen_notif", notif.id.toString());
    }
    setShowNotif(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* 🔔 NOTIFICATION - যেকোনো নতুন GROUP/PLAN আসলে সবাইকে জানাবে */}
      {showNotif && notif && (
        <div className="fixed top-2 left-2 right-2 z-50 bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl flex justify-between items-center shadow-2xl animate-bounce">
          <div className="flex-1">
            <p className="font-bold text-sm">🔔 নতুন {notif.tab} আসছে!</p>
            <p className="text-xs">{notif.name} - PUBLIC LIVE</p>
            <p className="text-[10px]">👑 Leader: @sottokofficial</p>
          </div>
          <button onClick={closeNotif} className="bg-black/30 px-3 py-1 rounded-full text-xs ml-2">X</button>
          <button onClick={()=>{closeNotif(); window.location.href='/groups'}} className="bg-white text-black px-3 py-1 rounded-full text-xs ml-2 font-bold">দেখো</button>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 m-3 rounded-2xl text-center">
        <h1 className="text-xl font-bold">🎵 SOT TOK VIDEO 🎵</h1>
        <p className="text-xs">22 Plans PUBLIC - Leader @sottokofficial</p>
      </div>

      {/* 🔥 GANESH + ALL PUBLIC GROUPS FROM ADMIN - LIVE JOIN */}
      <div className="mx-3">
        <h2 className="font-bold mb-2">👥 PUBLIC GROUPS - Admin থেকে LIVE ({groups.length})</h2>
        {groups.map((g:any)=>(
          <div key={g.id} className="bg-zinc-900 border-2 border-orange-500/50 rounded-2xl p-4 mb-3">
            <div className="text-center">
              <p className="text-3xl">{g.name.includes("Ganesh")?"🙏":"👥"}</p>
              <h2 className="font-bold text-[15px] mt-1">{g.name}</h2>
              <p className="text-xs text-yellow-400">👑 Leader: {g.leader||"@sottokofficial"}</p>
              <p className="text-xs text-zinc-400">👥 {g.members||1250} Members • PUBLIC LIVE • {g.tab}</p>
              <p className="text-[10px] text-green-400 mt-1">● LIVE - JOIN করে LIVE এ আসতে পারবে</p>
            </div>
            <button
              onClick={()=>handleJoin(g.id.toString(), g.name)}
              className={`w-full mt-3 py-3 rounded-full font-bold ${joined.includes(g.id.toString())?'bg-green-600':'bg-blue-600 animate-pulse'}`}
            >
              {joined.includes(g.id.toString())?'Joined ✅ - LIVE এ যাও':'JOIN GROUP - ACTIVE ✅'}
            </button>
          </div>
        ))}
      </div>

      {/* TRENDING */}
      <div className="mx-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <h2 className="font-bold">🔥 Trending Videos - PUBLIC</h2>
        <p className="text-xs text-zinc-500 mt-2">Video PUBLIC LIVE আসবে - @sottokofficial</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={()=>window.location.href='/groups'} className="bg-zinc-800 p-3 rounded-xl text-xs">👥 Groups দেখো</button>
          <button onClick={()=>window.location.href='/admin'} className="bg-zinc-800 p-3 rounded-xl text-xs">⚙️ Admin 22 Plans</button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center mt-6 text-[10px] text-zinc-600">
        <p>22 Plans PUBLIC SYSTEM • Leader @sottokofficial</p>
        <p>Admin এ GROUP বানালেই এখানে LIVE + Notification যাবে</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({ component: IndexPageNew, })