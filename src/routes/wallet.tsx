import { useState, useEffect } from "react"

export default function WalletPage() {
  const [coins, setCoins] = useState(0)
  const [showPlans, setShowPlans] = useState(true)
  const [shortId] = useState(() => {
    let id = localStorage.getItem("shortTokId")
    if(!id){ id = `SOT-${Math.floor(100000+Math.random()*900000)}`; localStorage.setItem("shortTokId", id) }
    return id
  })

  useEffect(()=>{
    const saved = parseInt(localStorage.getItem("userCoins") || "0")
    setCoins(saved)
  },[])

  const plans = [
    { c: 50, p: 49, off: "" },
    { c: 100, p: 99, off: "" },
    { c: 250, p: 229, off: "8% OFF" },
    { c: 500, p: 449, off: "10% OFF" },
    { c: 1000, p: 799, off: "20% OFF", tag: "POPULAR" },
    { c: 2000, p: 1499, off: "25% OFF" },
    { c: 5000, p: 3499, off: "30% OFF" },
    { c: 10000, p: 5999, off: "40% OFF", tag: "BEST" },
  ]

  const doRecharge = (plan: any, method: string) => {
    // 0 Coin protection - gift will be blocked automatically
    if(plan.c <= 0) return
    const newCoins = coins + plan.c
    localStorage.setItem("userCoins", newCoins.toString())
    setCoins(newCoins)
    // Admin split - 20% commission
    const comm = plan.p * 0.2
    const a1 = parseFloat(localStorage.getItem("adminWallet1_balance")||"0") + comm*0.7
    const a2 = parseFloat(localStorage.getItem("adminWallet2_balance")||"0") + comm*0.3
    localStorage.setItem("adminWallet1_balance", a1.toString())
    localStorage.setItem("adminWallet2_balance", a2.toString())
    const tx = JSON.parse(localStorage.getItem("adminWallet_transactions")||"[]")
    tx.push({ user: shortId, coins: plan.c, price: plan.p, method, date: new Date().toLocaleString() })
    localStorage.setItem("adminWallet_transactions", JSON.stringify(tx))
    alert(`✅ ${plan.c} Coins Added via ${method}!`)
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* LEFT SIDE - RECHARGE AS YOU SAID */}
      <div className="w-[85px] md:w-[110px] bg-[#111] border-r border-[#222] p-2 flex flex-col gap-3 sticky top-0 h-screen">
        <button onClick={()=>setShowPlans(true)} className="bg-[#8B1DFF] p-3 rounded-xl flex flex-col items-center gap-1 font-bold shadow-lg">
          <span className="text-xl">⚡</span>
          <span className="text-[11px]">Recharge</span>
        </button>
        <button className="bg-[#1A1A1A] p-3 rounded-xl flex flex-col items-center gap-1">
          <span>📜</span><span className="text-[10px]">History</span>
        </button>
        <button className="bg-[#1A1A1A] p-3 rounded-xl flex flex-col items-center gap-1">
          <span>💸</span><span className="text-[10px]">Withdraw</span>
        </button>
        <div className="mt-auto text-[9px] text-gray-500 text-center">SOT TOK</div>
      </div>

      {/* RIGHT SIDE - COIN SYSTEM */}
      <div className="flex-1 p-4 max-w-4xl">
        <h1 className="text-xl font-bold">My Wallet</h1>
        <p className="text-gray-400 text-xs">ID: {shortId}</p>

        <div className="mt-5 bg-[#1A1A1A] border border-[#8B1DFF]/30 rounded-2xl p-6 text-center">
          <div className="text-5xl">🪙</div>
          <div className="text-4xl font-bold mt-2">{coins}</div>
          <div className="text-gray-400 text-sm">Coins Available</div>
          <div className="mt-2 text-lg font-bold text-[#8B1DFF]">₹{(coins*0.5).toFixed(2)} INR</div>
          <div className="text-[11px] text-gray-500">1 Coin = ₹0.50 • 0 Coin এ Gift কাটবে না</div>
          {coins===0 && <div className="mt-4 bg-red-900/30 border border-red-700 p-2 rounded-lg text-red-300 text-sm font-bold animate-pulse">⚠️ Coin নেই! বাঁদিকে Recharge করুন 👈<br/>0 Coin এ Gift প্রেস করলে টাকা কাটবে না!</div>}
        </div>

        {showPlans && (
          <div className="mt-6">
            <h2 className="font-bold mb-3">Recharge Plans - PhonePe GPay PayTM থেকে নিজেরাই করবে</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plans.map((pl,i)=>(
                <div key={i} className={`bg-[#1A1A1A] p-4 rounded-xl border ${pl.tag? 'border-[#8B1DFF]' : 'border-[#2A2A2A]'} relative`}>
                  {pl.tag && <span className="absolute -top-2 right-2 bg-[#8B1DFF] text-[10px] px-2 py-0.5 rounded-full">{pl.tag}</span>}
                  <div className="flex justify-between">
                    <span className="font-bold">{pl.c} Coins</span>
                    <span className="text-xs text-green-400">{pl.off}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-[#8B1DFF]">₹{pl.p}</span>
                    <div className="flex gap-1">
                      <button onClick={()=>doRecharge(pl,'PhonePe')} className="bg-[#5f259f] text-[11px] px-2 py-1 rounded">PhonePe</button>
                      <button onClick={()=>doRecharge(pl,'GPay')} className="bg-blue-600 text-[11px] px-2 py-1 rounded">GPay</button>
                      <button onClick={()=>doRecharge(pl,'PayTM')} className="bg-sky-500 text-[11px] px-2 py-1 rounded">PayTM</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#111] p-3 rounded-xl border border-[#222]">
              <p className="text-xs text-gray-400">UPI ID (Optional):</p>
              <input placeholder="yourname@oksbi" className="w-full mt-1 bg-black border border-[#333] p-2 rounded text-sm"/>
              <p className="text-[10px] text-gray-500 mt-2">টাকা Admin Wallet 1 (70%) & 2 (30%) তে জমা হবে, UPI দিয়ে Withdraw করতে পারবেন /admin থেকে</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}