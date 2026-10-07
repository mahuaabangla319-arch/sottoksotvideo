import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

function GiftCenter(){
  const [coins,setCoins]=useState(50)
  const [admin1,setAdmin1]=useState(0)
  const [admin2,setAdmin2]=useState(0)
  const [show,setShow]=useState(false)
  const [pay,setPay]=useState(false)
  const [amount,setAmount]=useState(100)

  const gifts=[
    {n:'Free',p:0},{n:'Rose',p:10},{n:'Heart',p:50},{n:'Crown',p:100},
    {n:'Teddy',p:200},{n:'Kiss',p:300},{n:'Elephant',p:500},
    {n:'Diamond',p:1000},{n:'Lion',p:2000},{n:'Rocket',p:3000},
    {n:'Car',p:5000},{n:'Trophy',p:10000},
  ]

  const send=(g:any)=>{
    if(coins<g.p){setShow(true);return}
    const nc=coins-g.p
    setCoins(nc)
    if(nc===0)setShow(true)
  }

  const doPay=(m:string)=>{
    window.location.href=`upi://pay?pa=sottokofficial@ybl&pn=OT&am=${amount}&cu=INR`
    setTimeout(()=>{
      setCoins(c=>c+amount*10)
      setAdmin1(a=>a+amount/2)
      setAdmin2(a=>a+amount/2)
      setPay(false);setShow(false)
      alert(m+" Success! "+amount*10+" Coins")
    },1000)
  }

  return(
    <div className="min-h-screen bg-black text-white p-3">
      <div className="flex justify-between"><b>Gift Center</b><span className="bg-zinc-900 px-3 py-1 rounded-full text-xs">{coins} Coins</span></div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {gifts.map(g=><button key={g.n} onClick={()=>send(g)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><div className="text-[10px]">{g.n}</div><div className="text-[9px]">{g.p}</div></button>)}
      </div>
      {show&&!pay&&<div className="fixed inset-0 bg-black/80 flex items-end"><div className="w-full bg-zinc-900 rounded-t-[20px] p-5"><b>Coin Sesh! Recharge</b><div className="grid grid-cols-3 gap-2 mt-3">{[100,200,500].map(a=><button key={a} onClick={()=>setAmount(a)} className={`py-3 rounded-xl border ${amount===a?'bg-white text-black':'bg-black'}`}>Rs {a}</button>)}</div><button onClick={()=>setPay(true)} className="w-full mt-4 bg-purple-600 py-3 rounded-full font-bold">Buy Rs {amount}</button></div></div>}
      {pay&&<div className="fixed inset-0 bg-black/80 flex items-end"><div className="w-full bg-white text-black rounded-t-[20px] p-5"><b className="flex justify-center">Pay Rs {amount}</b><button onClick={()=>doPay('PhonePe')} className="w-full mt-3 bg-purple-900 text-white py-4 rounded-xl">PhonePe</button><button onClick={()=>doPay('Google Pay')} className="w-full mt-2 border py-4 rounded-xl">Google Pay</button><button onClick={()=>doPay('Paytm')} className="w-full mt-2 border py-4 rounded-xl">Paytm</button></div></div>}
      <div className="mt-4 text-xs bg-zinc-900 p-3 rounded-xl"><div>Admin1: Rs {admin1}</div><div>Admin2: Rs {admin2}</div></div>
    </div>
  )
}
export const Route=createFileRoute('/gift' as any)({component:GiftCenter})