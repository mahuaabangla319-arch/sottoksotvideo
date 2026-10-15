
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
// --- SOTTOK AdSense Start ---
 if (typeof window !== 'undefined' && !document.querySelector('script[src*="adsbygoogle"]')) {
   const s = document.createElement('script');
   s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9819877494340184';
   s.async = true;
   s.crossOrigin = 'anonymous';
   document.head.appendChild(s);
 }
 // --- SOTTOK AdSense End ---const YELLOW = '#FFC700'
const GREEN = '#00D26A'
const GRAD = 'linear-gradient(90deg, #FFC700 0%, #FFD600 30%, #00D26A 100%)'

function Splash({onFinish}:{onFinish:()=>void}){
 useEffect(()=>{ const t=setTimeout(onFinish,3500); return ()=>clearTimeout(t)},[onFinish])
 return (
  <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
   <div className="w-20 h-20 rounded-[18px] flex items-center justify-center text-white text-3xl font-black" style={{background:GRAD}}>S</div>
   <h1 className="mt-3 text-3xl font-black" style={{background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>SOT TOK</h1>
   <p className="mt-1 text-xs font-bold" style={{background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>নিজের পরিচয় নিজে তৈরি করো</p>
  </div>
 )
}

function BottomNav(){
 const nav=useNavigate()
 const loc=useLocation()
 const isActive=(p:string)=>loc.pathname===p
 const Item=({p,l,ic}:{p:string,l:string,ic:string})=>(
  <button onClick={()=>nav(p)} className="flex flex-col items-center px-3 py-1">
   <span className="text-[20px]">{ic}</span>
   <span className="text-[9px] mt-0.5 font-bold" style={{color: isActive(p)? GREEN : '#999'}}>{l}</span>
  </button>
 )
 return (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-[60px] z-50">
   <Item p="/" l="Home" ic="🏠" />
   <Item p="/discover" l="Trends" ic="🛒" />
   <button onClick={()=>nav('/upload')} className="w-14 h-14 -mt-6 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white" style={{background:GRAD}}>+</button>
   <Item p="/inbox" l="Inbox" ic="💬" />
   <Item p="/me" l="Profile" ic="👤" />
  </div>
 )
}

function Home(){
 const [showGift,setShowGift]=useState(false)
 const [like,setLike]=useState(false)
 return (
  <div className="h-screen w-screen bg-black overflow-y-scroll snap-y snap-mandatory">
   <div className="fixed top-0 left-0 right-0 z-40 h-10 flex items-center justify-between px-4" style={{background:GRAD}}>
    <button className="text-white text-xs font-bold">Following</button>
    <h2 className="text-white text-base font-black">SOT TOK</h2>
    <button className="text-white text-xs font-bold border-b-2 border-white">For You</button>
   </div>

   <div className="h-screen snap-start relative bg-zinc-900 pt-10">
    <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600" className="w-full h-full object-cover opacity-80" />

    {/* SMALL ICONS - 36px Vigo Style */}
    <div className="absolute right-2 bottom-20 flex flex-col gap-3">
     <button onClick={()=>setLike(!like)} className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center" style={{background: like? GRAD : 'rgba(0,0,0,0.3)'}}><span className="text-[18px]">{like?'❤️':'🤍'}</span></div>
      <span className="text-white text-[10px] mt-1 font-bold">124K</span>
     </button>
     <button onClick={()=>alert('Comments')} className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"><span className="text-[16px]">💬</span></div>
      <span className="text-white text-[10px] mt-1">3.8k</span>
     </button>
     <button onClick={()=>alert('Saved')} className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"><span className="text-[16px]">🔖</span></div>
      <span className="text-white text-[10px] mt-1">Save</span>
     </button>
     <button onClick={()=>setShowGift(true)} className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:GRAD}}><span className="text-[16px]">🎁</span></div>
      <span className="text-white text-[10px] mt-1">642</span>
     </button>
     <button onClick={()=>alert('Flame 🔥 45k')} className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"><span className="text-[16px]">🔥</span></div>
      <span className="text-white text-[10px] mt-1">45K</span>
     </button>
     <button onClick={()=>alert('Share')} className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"><span className="text-[16px]">↗️</span></div>
      <span className="text-white text-[10px] mt-1">Share</span>
     </button>
    </div>

    <div className="absolute left-3 bottom-5 text-white max-w-[68%]">
     <p className="font-bold text-sm">@sot_tok_official</p>
     <p className="text-xs mt-1 leading-4">Good vibes only 🌞 #dance #sotok</p>
     <p className="text-[11px] mt-1 opacity-70">🎵 Original Sound - sunny vibes</p>
    </div>

    {showGift && (
     <div className="fixed inset-0 bg-black/60 z-[100] flex items-end" onClick={()=>setShowGift(false)}>
      <div className="w-full bg-white rounded-t-[24px] p-4" onClick={e=>e.stopPropagation()}>
       <div className="flex justify-between"><h2 className="font-black">Send Gift</h2><button onClick={()=>setShowGift(false)} className="w-7 h-7 bg-gray-100 rounded-full text-sm">✕</button></div>
       <div className="grid grid-cols-4 gap-3 mt-4">
        {[{n:'Rose',i:'🌹',c:10},{n:'Teddy',i:'🧸',c:50},{n:'Love',i:'❤️',c:100},{n:'Car',i:'🚗',c:500},{n:'Diamond',i:'💎',c:1000},{n:'Crown',i:'👑',c:5000}].map(g=>(
         <button key={g.n} onClick={()=>{alert(g.n+' Sent!'); setShowGift(false)}} className="bg-gray-50 rounded-xl p-2.5 flex flex-col items-center"><span className="text-xl">{g.i}</span><span className="text-[10px] font-bold mt-1">{g.n}</span><span className="text-[10px] px-2 py-0.5 rounded-full text-white mt-1" style={{background:GRAD}}>{g.c}</span></button>
        ))}
       </div>
      </div>
     </div>
    )}
   </div>
  </div>
 )
}

// PROFILE WITH FOLLOW / UNFOLLOW
function ProfilePage(){
 const [isFollow,setIsFollow]=useState(false)
 const [followers,setFollowers]=useState(12.5)
 return (
  <div className="min-h-screen bg-white pb-20">
   <div className="h-28 w-full" style={{background:GRAD}}></div>
   <div className="px-4 -mt-10">
    <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-2xl" style={{background:'white'}}>👤</div>
    <h1 className="mt-2 text-lg font-black">SOT TOK Official</h1>
    <p className="text-sm text-gray-500">@sot_tok_official</p>
    <p className="text-xs mt-2">নিজের পরিচয় নিজে তৈরি করো 💛💚 Creator | Dancer</p>

    <div className="flex gap-6 mt-4">
     <div className="flex flex-col items-center"><span className="font-black text-sm">24</span><span className="text-[11px] text-gray-500">Videos</span></div>
     <div className="flex flex-col items-center"><span className="font-black text-sm">{followers}K</span><span className="text-[11px] text-gray-500">Followers</span></div>
     <div className="flex flex-col items-center"><span className="font-black text-sm">180</span><span className="text-[11px] text-gray-500">Following</span></div>
     <div className="flex flex-col items-center"><span className="font-black text-sm">1.2M</span><span className="text-[11px] text-gray-500">Flames 🔥</span></div>
    </div>

    <div className="flex gap-2 mt-4">
     <button onClick={()=>{setIsFollow(!isFollow); setFollowers(isFollow?12.5:12.6)}} className="flex-1 py-2.5 rounded-full font-black text-sm text-white" style={{background: isFollow?'#eee':GRAD, color: isFollow?'#333':'white'}}>
      {isFollow?'✓ Following':'Follow'}
     </button>
     <button onClick={()=>{setIsFollow(false); setFollowers(12.5)}} className={`px-4 py-2.5 rounded-full border font-bold text-sm ${isFollow?'block':'hidden'}`}>Unfollow</button>
     <button className="px-5 py-2.5 rounded-full border font-bold text-sm bg-white">Message</button>
    </div>

    <div className="grid grid-cols-3 gap-1 mt-5">
     {[1,2,3,4,5,6].map(i=><div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg"></div>)}
    </div>
   </div>
  </div>
 )
}

function Page({t}:{t:string}){ return <div className="min-h-screen flex flex-col items-center justify-center pb-20"><h1 className="text-xl font-black">{t}</h1></div> }

export default function App(){
 const [splash,setSplash]=useState(true)
 return (
  <BrowserRouter>
   {splash && <Splash onFinish={()=>setSplash(false)}/>}
   {!splash && <BottomNav/>}
   {!splash && <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/discover" element={<Page t="Trends"/>}/>
    <Route path="/upload" element={<Page t="Upload"/>}/>
    <Route path="/inbox" element={<Page t="Inbox"/>}/>
    <Route path="/me" element={<ProfilePage/>}/>
    <Route path="/wallet" element={<Page t="Wallet"/>}/>
   </Routes>}
  </BrowserRouter>
 )
}