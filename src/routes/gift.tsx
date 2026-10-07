import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

function GiftCenter(){
  const [coins, setCoins] = useState(()=> Number(localStorage.getItem('OT_COINS')||'50'))
  const [wallet, setWallet] = useState(2500)
  const [admin1, setAdmin1] = useState(()=> Number(localStorage.getItem('OT_ADMIN1')||'0'))
  const [admin2, setAdmin2] = useState(()=> Number(localStorage.getItem('OT_ADMIN2')||'0'))
  const [showRecharge, setShowRecharge] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [amount, setAmount] = useState(100)
  const [list, setList] = useState<any[]>(()=> JSON.parse(localStorage.getItem('OT_RECHARGE_LIST')||'[]'))

  const gifts = [
    {name:'Free', price:0, icon:'✨'}, {name:'Rose', price:10, icon:'🌹'},
    {name:'Heart', price:50, icon:'💖'}, {name:'Crown', price:100, icon:'👑'},
    {name:'Teddy', price:200, icon:'🧸'}, {name:'Kiss', price:300, icon:'💋'},
    {name:'Elephant', price:500, icon:'🐘'}, {name:'Diamond', price:1000, icon:'💎'},
    {name:'Lion', price:2000, icon:'🦁'}, {name:'Rocket', price:3000, icon:'🚀'},
    {name:'Car', price:5000, icon:'🚗'}, {name:'Trophy', price:10000, icon:'🏆'},
  ]

  const sendGift = (g:any) => {
    if(coins < g.price){
      setShowRecharge(true)
      return
    }
    const newCoins = coins - g.price
    setCoins(newCoins)
    localStorage.setItem('OT_COINS', String(newCoins))
    if(newCoins===0) setShowRecharge(true)
  }

  const payNow = (method: string) => {
    // UPI ID - এখানে তোমাদের ২ জনের UPI বসাবে
    const adminUpi = "sottokofficial@ybl" // তোমার UPI
    const upiLink = `upi://pay?pa=${adminUpi}&pn=OT Admin&am=${amount}&cu=INR&tn=OT Coins Recharge Rs ${amount}`

    // PhonePe / GPay / Paytm খুলবে
    window.location.href = upiLink

    // টাকা ২ জনে ভাগ হয়ে অ্যাডমিনে ঢুকবে
    setTimeout(()=>{
      const coinsAdd = amount * 10
      const split = amount / 2
      const newCoins = coins + coinsAdd
      const newA1 = admin1 + split
      const newA2 = admin2 + split

      setCoins(newCoins)
      setAdmin1(newA1)
      setAdmin2(newA2)
      localStorage.setItem('OT_COINS', String(newCoins))
      localStorage.setItem('OT_ADMIN1', String(newA1))
      localStorage.setItem('OT_ADMIN2', String(newA2))

      const entry = { user: 'User', amount, coins: coinsAdd, method, date: new Date().toLocaleString('bn-BD'), a1: split, a2: split }
      const newList = [entry,...list]
      setList(newList)
      localStorage.setItem('OT_RECHARGE_LIST', JSON.stringify(newList))

      setShowPay(false)
      setShowRecharge(false)
      alert(`✅ ${method} দিয়ে Rs ${amount} পেমেন্ট সফল! ${coinsAdd} কয়েন পেলে!`)
    }, 1500)
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

      {/* STEP 1 - কয়েন শেষ হলে কত টাকা রিচার্জ PopUp */}
      {showRecharge &&!showPay && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1c1c1e] rounded-t-[25px] p-5 border-t border-zinc-700">
            <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3"></div>
            <h3 className="font-bold text-lg">⚠️ কয়েন শেষ!</h3>
            <p className="text-xs text-zinc-400">কত টাকা রিচার্জ করবে সিলেক্ট করো</p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[100,200,500].map(a=>(
                <button key={a} onClick={()=>setAmount(a)} className={`py-3 rounded-xl border ${amount===a?'bg-white text-black border-white':'bg-zinc-900 border-zinc-700'}`}>
                  <b>Rs {a}</b><br/><span className="text-[10px]">{a*10} Coins</span>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowPay(true)} className="w-full mt-5 bg-[#8a4cff] py-3 rounded-full font-bold">Buy Now - Rs {amount}</button>
            <button onClick={()=>setShowRecharge(false)} className="w-full mt-2 bg-zinc-800 py-2 rounded-full text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* STEP 2 - PhonePe / GooglePay / Paytm */}
      {showPay && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end">
          <div className="w-full bg-white text-black rounded-t-[25px] p-5">
            <h3 className="font-bold text-center">Pay Rs {amount} for {amount*10} Coins</h3>
            <p className="text-xs text-center text-zinc-500 mt-1">টাকা ২ জন অ্যাডমিনে ভাগ হয়ে ঢুকবে</p>

            <div className="mt-5 space-y-3">
              <button onClick={()=>payNow('PhonePe')} className="w-full flex items-center justify-between bg-[#5f259f] text-white px-4 py-4 rounded-xl">
                <div className="flex items-center gap-3"><span className="bg-white text-[#5f259f] w-8 h-8 rounded-full flex items-center justify-center font-bold">Pe</span><span className="font-bold">PhonePe</span></div>
                <span>›</span>
              </button>
              <button onClick={()=>payNow('Google Pay')} className="w-full flex items-center justify-between border border-zinc-200 px-4 py-4 rounded-xl">
                <div className="flex items-center gap-3"><span className="text-xl">G</span><span className="font-bold">Google Pay</span></div>
                <span>›</span>
              </button>
              <button onClick={()=>payNow('Paytm')} className="w-full flex items-center justify-between border border-zinc-200 px-4 py-4 rounded-xl">
                <div className="flex items-center gap-3"><span className="bg-[#00baf2] text-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold">Paytm</span><span className="font-bold">Paytm</span></div>
                <span>›</span>
              </button>
            </div>

            <div className="mt-4 bg-zinc-100 p-3 rounded-xl text-[11px]">
              <div className="flex justify-between"><span>Admin 1 পাবে</span><b>Rs {amount/2}</b></div>
              <div className="flex justify-between"><span>Admin 2 পাবে</span><b>Rs {amount/2}</b></div>
              <div className="flex justify-between mt-1 border-t pt-1"><span>তুমি পাবে</span><b>{amount*10} Coins</b></div>
            </div>

            <button onClick={()=>setShowPay(false)} className="w-full mt-4 text-xs text-zinc-500">Back</button>
          </div>
        </div>
      )}

      <div className="m-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h4 className="text-xs font-bold">📋 Admin Earnings - ২ জনের ভাগ</h4>
        <div className="flex justify-between text-xs mt-2"><span>Admin 1</span><b className="text-green-400">Rs {admin1}</b></div>
        <div className="flex justify-between text-xs"><span>Admin 2</span><b className="text-blue-400">Rs {admin2}</b></div>
        {list.slice(0,3).map((r,i)=>(
          <div key={i} className="text-[10px] mt-2 bg-black p-2 rounded-lg flex justify-between"><span>{r.method} - Rs {r.amount}</span><span>{r.date}</span></div>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/gift' as any)({
  component: GiftCenter
})