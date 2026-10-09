 import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'

const YELLOW = '#FFC700'
const GREEN = '#00D26A'
const GRAD = 'linear-gradient(90deg, #FFC700 0%, #FFD600 30%, #00D26A 100%)'

// SPLASH 5s - Yellow Green
function Splash({onFinish}:{onFinish:()=>void}){
 useEffect(()=>{ const t=setTimeout(onFinish,4000); return ()=>clearTimeout(t)},[onFinish])
 return (
  <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
   <div className="w-24 h-24 rounded-[22px] flex items-center justify-center text-white text-4xl font-black" style={{background:GRAD}}>S</div>
   <h1 className="mt-4 text-4xl font-black" style={{background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>SOT TOK</h1>
   <p className="mt-1 text-[13px] font-bold tracking-wide" style={{background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>নিজের পরিচয় নিজে তৈরি করো</p>
   <div className="mt-12 w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className="h-full animate-pulse" style={{width:'100%', background:GRAD}}></div>
   </div>
  </div>
 )
}

function BottomNav(){
 const nav=useNavigate()
 const loc=useLocation()
 const isActive=(p:string)=>loc.pathname===p
 const Item=({p,l,ic}:{p:string,l:string,ic:string})=>(
  <button onClick={()=>nav(p)} className="flex flex-col items-center px-3 py-1">
   <span className="text-[22px]" style={{filter: isActive(p)? `drop-shadow(0 0 6px ${YELLOW})` : ''}}>{ic}</span>
   <span className="text-[10px] mt-1 font-bold" style={{color: isActive(p)? GREEN : '#999'}}>{l}</span>
  </button>
 )
 return (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-[68px] z-50 rounded-t-[20px]">
   <Item p="/" l="Home" ic="🏠" />
   <Item p="/discover" l="Trends" ic="🛒" />
   <button onClick={()=>nav('/upload')} className="w-[62px] h-[62px] -mt-8 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-[0_8px_20px_rgba(0,0,0,0.2)] border-4 border-white" style={{background:GRAD}}>+</button>
   <Item p="/inbox" l="Inbox" ic="💬" />
   <Item p="/me" l="Profile" ic="👤" />
  </div>
 )
}

function Home(){
 const [showGift,setShowGift]=useState(false)
 const [like,setLike]=useState(false)
 const [likeCount,setLikeCount]=useState(124300)
 return (
  <div className="h-screen w-screen bg-black overflow-y-scroll snap-y snap-mandatory">
   {/* TOP BAR - Vigo Yellow Green */}
   <div className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-between px-4" style={{background:GRAD}}>
    <button onClick={()=>alert('Following')} className="text-white text-sm font-bold opacity-80">Following</button>
    <h2 className="text-white text-xl font-black tracking-wider">SOT TOK</h2>
    <button className="text-white text-sm font-bold border-b-2 border-white">For You</button>
   </div>

   <div className="h-screen snap-start relative bg-zinc-900 pt-12">
    <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600" className="w-full h-full object-cover opacity-80" />
    {/* Right buttons - Yellow Green */}
    <div className="absolute right-2 bottom-24 flex flex-col gap-4">
     <button onClick={()=>{setLike(!like); setLikeCount(like?likeCount-1:likeCount+1)}} className="flex flex-col items-center">
      <div className="w-[52px] h-[52px] rounded-2xl bg-black/40 backdrop-blur flex items-center justify-center" style={{background: like? GRAD : 'rgba(0,0,0,0.4)'}}><span className="text-2xl">{like?'💛':'🤍'}</span></div>
      <span className="text-white text-xs mt-1 font-bold">{(likeCount/1000).toFixed(1)}K</span>
     </button>
     <button onClick={()=>alert('Comment')} className="flex flex-col items-center"><div className="w-[52px] h-[52px] rounded-2xl bg-black/40 flex items-center justify-center"><span className="text-2xl">💬</span></div><span className="text-white text-xs mt-1">3,892</span></button>
     <button onClick={()=>alert('Share')} className="flex flex-col items-center"><div className="w-[52px] h-[52px] rounded-2xl bg-black/40 flex items-center justify-center"><span className="text-2xl">↗️</span></div><span className="text-white text-xs mt-1">1.1K</span></button>
     <button onClick={()=>setShowGift(true)} className="flex flex-col items-center"><div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center" style={{background:GRAD}}><span className="text-2xl">🎁</span></div><span className="text-white text-xs mt-1">642</span></button>
     <button onClick={()=>alert('Flame Added! 🔥')} className="flex flex-col items-center"><div className="w-[52px] h-[52px] rounded-2xl bg-black/40 flex items-center justify-center"><span className="text-2xl">🔥</span></div><span className="text-white text-xs mt-1">45.2K</span></button>
    </div>
    <div className="absolute left-3 bottom-6 text-white max-w-[70%]">
     <p className="font-bold text-[15px]">@sot_tok_official</p>
     <p className="text-[13px] mt-1 leading-4">Good vibes only 🌞 dancing through the day! #dance #vigo #sotok</p>
     <p className="text-[12px] mt-2 opacity-80">🎵 Original Sound - sunny vibes</p>
    </div>

    {showGift && (
     <div className="fixed inset-0 bg-black/60 z-[100] flex items-end" onClick={()=>setShowGift(false)}>
      <div className="w-full bg-white rounded-t-[28px] p-5" onClick={e=>e.stopPropagation()}>
       <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3"></div>
       <div className="flex justify-between items-center"><h2 className="font-black text-lg">Send Gift 🎁</h2><button onClick={()=>setShowGift(false)} className="w-8 h-8 bg-gray-100 rounded-full">✕</button></div>
       <div className="grid grid-cols-4 gap-3 mt-5">
        {[{n:'Rose',i:'🌹',c:10},{n:'Teddy',i:'🧸',c:50},{n:'Love',i:'❤️',c:100},{n:'Car',i:'🚗',c:500},{n:'Diamond',i:'💎',c:1000},{n:'Crown',i:'👑',c:5000}].map(g=>(
         <button key={g.n} onClick={()=>{alert(g.n+' Sent!'); setShowGift(false)}} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex flex-col items-center hover:scale-95"><span className="text-[28px]">{g.i}</span><span className="text-xs font-bold mt-1">{g.n}</span><span className="text-[11px] px-2 py-0.5 rounded-full text-white mt-1" style={{background:GRAD}}>{g.c} 🪙</span></button>
        ))}
       </div>
       <button onClick={()=>window.location.href='/wallet'} className="w-full mt-5 py-3 rounded-full font-black text-white" style={{background:GRAD}}>Recharge Coins</button>
      </div>
     </div>
    )}
   </div>
  </div>
 )
}
function Page({t}:{t:string}){ return <div className="min-h-screen flex flex-col items-center justify-center pb-20 bg-white"><div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl" style={{background:GRAD}}>+</div><h1 className="mt-4 text-xl font-black">{t}</h1><p className="text-sm text-gray-400 mt-1">Vigo Style - Yellow Green Theme</p></div> }

export default function App(){
 const [splash,setSplash]=useState(true)
 return (
  <BrowserRouter>
   {splash && <Splash onFinish={()=>setSplash(false)}/>}
   {!splash && <BottomNav/>}
   {!splash && <Routes><Route path="/" element={<Home/>}/><Route path="/discover" element={<Page t="Trends"/>}/><Route path="/upload" element={<Page t="Upload Video"/>}/><Route path="/inbox" element={<Page t="Inbox"/>}/><Route path="/me" element={<Page t="My Profile"/>}/><Route path="/wallet" element={<Page t="Wallet - Recharge"/>}/></Routes>}
  </BrowserRouter>
 )
}