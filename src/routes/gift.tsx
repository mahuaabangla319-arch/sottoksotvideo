import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

function GiftCenter(){
  const [coins, setCoins] = useState(()=>{
    const v = localStorage.getItem('OT_COINS')
    return v? Number(v) : 50
  })
  const [wallet, setWallet] = useState(2500)
  const [admin1, setAdmin1] = useState(()=>{
    const v = localStorage.getItem('OT_ADMIN1')
    return v? Number(v) : 0
  })
  const [admin2, setAdmin2] = useState(()=>{
    const v = localStorage.getItem('OT_ADMIN2')
    return v? Number(v) : 0
  })
  const [showRecharge, setShowRecharge] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [amount, setAmount] = useState(100)
  const [list, setList] = useState<any[]>(()=>{
    const v = localStorage.getItem('OT_RECHARGE_LIST')
    return v? JSON.parse(v) : []
  })

  const gifts = [
    {name:'Free', price:0, icon:'✨'}, {name:'Rose', price:10, icon:'🌹'},
    {name:'Heart', price:50, icon:'💖'}, {name:'Crown', price:100, icon:'👑'},
    {name:'Teddy', price:200, icon:'🧸'}, {name:'Kiss', price:300, icon:'💋'},
    {name:'Elephant', price:500, icon:'🐘'}, {name:'Diamond', price:1000, icon:'💎'},
    {name:'Lion', price:2000, icon:'🦁'}, {name:'Rocket', price:3000, icon:'🚀'},
    {name:'Car', price:5000, icon:'🚗'}, {name:'Trophy', price:10000, icon:'🏆'},
  ]

  const sendGift = (g:any) => {
    if(coins < g.price){ setShowRecharge(true); return }
    const newCoins = coins - g.price
    setCoins(newCoins)
    localStorage.setItem('OT_COINS', String(newCoins))
    if(newCoins===0) setShowRecharge(true)
  }

  const payNow = (method:string) => {
    const upi = "sottokofficial@ybl"
    window.location.href = `upi://pay?pa=${upi}&pn=OT Admin&am=${amount}&cu=INR&tn=Recharge Rs ${amount}`
    setTimeout(()=>{
      const add = amount*10
      const split = amount/2
      const nc = coins+add
      const na1 = admin1+split
      const na2 = admin2+split
      setCoins(nc); setAdmin1(na1); setAdmin2(na2)
      localStorage.setItem('OT_COINS', String(nc))
      localStorage.setItem('OT_ADMIN1', String(na1))
      localStorage.setItem('OT_ADMIN2', String(na2))
      const entry = {user:'User', amount, coins:add, method, date:new Date().toLocaleString('bn-BD')}
      const nl = [entry,...list]
      setList(nl)
      localStorage.setItem('OT_RECHARGE_LIST', JSON.stringify(nl))
      setShowPay(false); setShowRecharge(false)
      alert(`${method} - Rs ${amount} সফল! ${add} Coins পেলে!`)
    },1500)
  }

  return(
    <div className="min-h-screen bg-black text-white pb-10">
      <div className="p-4 flex justify-between border-b border-zinc-900">
        <h1 className="font-bold">🎁 Gift Center</h1>
        <span className="bg-zinc-900 px-3 py-1 rounded-full text-xs">🟡 {coins} Coins</span>
      </div>
      <div className="grid grid-cols-4 gap-3 p-3">
        {gifts.map(g=>(
          <button key={g.name} onClick={()=>sendGift(g)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-3xl">{g.icon}</span>
            <span className="text-[11px] mt-1">{g.name}</span>
            <span className="text-[10px] bg-black px-2 rounded-full">{g.price===0?'Free':g.price}</span>
          </button>
        ))}
      </div>
      {showRecharge &&!showPay && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1c1c1e] rounded-t-[25px] p-5">
            <h3 className="font-bold">⚠️ কয়েন শেষ! রিচার্জ করো</h3>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[100,200,500].map(a=>(
                <button key={a} onClick={()=>setAmount(a)} className={`py-3 rounded-xl border ${amount===a?'bg-white text-black':'bg-zinc-900 border-zinc-700'}`}><b>Rs {a}</b><br/><span className="text-[10px]">{a*10} Coins</span></button>
              ))}
            </div>
            <button onClick={()=>setShowPay(true)} className="w-full mt-5 bg-[#8a4cff] py-3 rounded-full font-bold">Buy Rs {amount}</button>
          </div>
        </div>
      )}
      {showPay && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end">
          <div className="w-full bg-white text-black rounded-t-[25px] p-5">
            <h3 className="font-bold text-center">Pay Rs {amount}</h3>
            <button onClick={()=>payNow('PhonePe')} className="w-full mt-4 bg-[#5f259f] text-white py-4 rounded-xl font-bold">PhonePe - Pay</button>
            <button onClick={()=>payNow('Google Pay')} className="w-full mt-2 border py-4 rounded-xl font-bold">Google Pay - Pay</button>
            <button onClick={()=>payNow('Paytm')} className="w-full mt-2 border py-4 rounded-xl font-bold">Paytm - Pay</button>
            <div className="mt-3 bg-zinc-100 p-2 rounded-lg text-[11px]"><div className="flex justify-between"><span>Admin1</span><b>Rs {amount/2}</b></div><div className="flex justify-between"><span>Admin2</span><b>Rs {amount/2}</b></div></div>
          </div>
        </div>
      )}
      <div className="m-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs"><div>Admin1: Rs {admin1}</div><div>Admin2: Rs {admin2}</div></div>
    </div>
  )
}

export const Route = createFileRoute('/gift' as any)({ component: GiftCenter })