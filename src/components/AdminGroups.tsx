import { useState, useEffect } from "react"

export default function Groups() {
  const [name, setName] = useState("")
  const [list, setList] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem("PUBLIC_LIVE_LIST") || "[]")
  })

  const makePublic = () => {
    if(!name) return alert("নাম লেখো দাদা")
    const newList = [{ id: Date.now(), name, by: "@sottokofficial", time: new Date().toLocaleString() }, ...list]
    localStorage.setItem("PUBLIC_LIVE_LIST", JSON.stringify(newList))
    setList(newList)
    setName("")
    alert("✅ PUBLIC LIVE হয়ে গেছে, এখন হোম পেজে সবাই দেখবে")
  }

  return (
    <div className="p-4">
      <div className="bg-green-900 p-3 rounded-xl text-white text-center mb-4">
        ✅ @sottokofficial - 22 Plans PUBLIC MODE - যা লিখবে সবাই দেখবে
      </div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Groups এর নাম লেখো - যেমন Ganesh Thaku" className="w-full p-4 rounded-xl bg-zinc-800 text-white" />
      <button onClick={makePublic} className="w-full mt-3 bg-orange-500 p-4 rounded-xl font-bold">🚀 Groups PUBLIC LIVE করো - সবাই দেখবে</button>
      <div className="mt-4 text-white">PUBLIC LIVE LIST - {list.length} টা:</div>
      {list.map(i=> <div key={i.id} className="bg-zinc-800 p-3 rounded mt-2 text-white">{i.name} - {i.by}</div>)}
    </div>
  )
}