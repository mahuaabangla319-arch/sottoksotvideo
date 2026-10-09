import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/wallet')({
  component: WalletPage,
})

function WalletPage() {
  const [myCoins, setMyCoins] = useState(1250)
  const recharge = (c:number) => {
    setMyCoins(myCoins + c)
    alert(c+" Coins Recharge হলো!")
  }
  return (
    <div className="p-4 bg-black min-h-screen">
      <h1 className="text-white text-xl font-bold mb-4">Wallet</h1>
      <div className="rounded-2xl p-4 text-black" style={{background:"linear-gradient(90deg,#ff7a00,#facc15)"}}>
        <p className="text-sm opacity-80">My Coins</p>
        <p className="text-3xl font-bold">{myCoins} 🪙</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[50,100,200,500,1000,5000].map(c=>(
          <button key={c} onClick={()=>recharge(c)} className="bg-white/10 border border-[#facc15]/30 rounded-xl p-3 text-white text-left">
            <p className="font-bold">{c} Coins</p>
            <p className="text-xs text-[#facc15]">₹{c/2}</p>
          </button>
        ))}
      </div>
    </div>
  )
}