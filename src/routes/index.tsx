import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";

function ForYouAllUsers(){
  const [wallet, setWallet] = useState({main: 2500, coins:1250, diamonds:340});
  const [showRecharge, setShowRecharge] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [amount, setAmount] = useState(10);
  const [method, setMethod] = useState("");
  const [pin, setPin] = useState("");

  useEffect(()=>{
    const saved = localStorage.getItem("st_user_wallet");
    if(saved){ setWallet(JSON.parse(saved)); }
  },[]);

  // ===== PUBLIC LIVE GROUPS - দুটো একসাথেই =====
  const [publicGroups, setPublicGroups] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("PUBLIC_LIVE_LIST") || "[]")
    } catch { return [] }
  });
  const [newGroupName, setNewGroupName] = useState("");

  const addPublicGroup = () => {
    if(!newGroupName.trim()){
      alert("নাম লেখো দাদা");
      return;
    }
    const newItem = { id: Date.now(), name: newGroupName, by: "@sottokofficial", time: new Date().toLocaleString() };
    const newList = [newItem, ...publicGroups];
    localStorage.setItem("PUBLIC_LIVE_LIST", JSON.stringify(newList));
    setPublicGroups(newList);
    setNewGroupName("");
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="flex justify-center gap-12 py-4">
        <span className="text-zinc-500">For You</span>
      </div>

      {/* ADMIN FORM + PUBLIC LIST - একসাথেই */}
      <div className="px-3">
        <div className="bg-green-900/40 border border-green-500 p-3 rounded-xl">
          <p className="text-green-400 text-xs font-bold mb-2">✅ @sottokofficial - 22 Plans PUBLIC MODE</p>
          <div className="flex gap-2">
            <input 
              value={newGroupName} 
              onChange={e=>setNewGroupName(e.target.value)} 
              placeholder="Groups নাম - যেমন Ganesh Thaku"
              className="flex-1 p-3 rounded-xl bg-black text-white border border-zinc-700 outline-none"
            />
            <button onClick={addPublicGroup} className="bg-orange-500 px-4 rounded-xl font-bold text-black">
              LIVE
            </button>
          </div>
          <button onClick={addPublicGroup} className="w-full mt-2 bg-orange-500 p-3 rounded-xl font-bold text-black">
            🚀 Groups PUBLIC LIVE করো - সবাই দেখবে
          </button>
        </div>

        <div className="mt-3">
          {publicGroups.length > 0 && <p className="text-white font-bold mb-2">🔥 PUBLIC LIVE Plans - {publicGroups.length} টা</p>}
          {publicGroups.map((g:any)=>(
            <div key={g.id} className="bg-zinc-900 border border-green-600 p-3 rounded-xl mb-2 text-white flex justify-between">
              <div>
                <div className="font-bold">🔥 {g.name}</div>
                <div className="text-xs text-green-400">{g.by} - LIVE</div>
              </div>
              <button onClick={()=>{
                const filtered = publicGroups.filter((x:any)=> x.id !== g.id);
                localStorage.setItem("PUBLIC_LIVE_LIST", JSON.stringify(filtered));
                setPublicGroups(filtered);
              }} className="text-xs bg-red-900 px-2 py-1 rounded">Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 text-zinc-500 text-center mt-6">
        নিচে তোমার ভিডিও ফিড থাকবে...
      </div>
    </div>
  )
}

export const Route = createFileRoute('/' as any)({
  component: ForYouAllUsers,
})