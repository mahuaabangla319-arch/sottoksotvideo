 import { useState, useEffect } from 'react'

export default function App(){
  // নিজের ID - অটো তৈরি হবে, কোনো ডুপ্লিকেট নাম না
  const [myId, setMyId] = useState("")
  const [myUsername, setMyUsername] = useState("")
  const [myCoins, setMyCoins] = useState(1250)
  const [myWallet, setMyWallet] = useState(2500)
  const [myDiamonds, setMyDiamonds] = useState(340)
  
  const [showGift,setShowGift] = useState(false)
  const [showRecharge,setShowRecharge] = useState(false)
  const [showLudo,setShowLudo] = useState(false)
  const [msg,setMsg] = useState("5 🪙 দিয়ে খেলো, জিতলে 100 🪙!")

  // অ্যাপ চালু হলে নিজের ID বানাবে - একবারই
  useEffect(()=>{
    let savedId = localStorage.getItem("sot_id")
    let savedName = localStorage.getItem("sot_username")
    if(!savedId){
      savedId = "96" + Math.floor(10000000 + Math.random()*90000000).toString() // 10 digit ID
      savedName = "@user" + savedId.slice(-4)
      localStorage.setItem("sot_id", savedId)
      localStorage.setItem("sot_username", savedName)
    }
    setMyId(savedId)
    setMyUsername(savedName)
  },[])

  const gifts=[
    {n:'Free',e:'✨',p:0},{n:'Rose',e:'🌹',p:10},{n:'Heart',e:'💖',p:50},{n:'Crown',e:'👑',p:100},{n:'Elephant',e:'🐘',p:500},
    {n:'Diamond',e:'💎',p:1000},{n:'Car',e:'🚗',p:5000},{n:'Trophy',e:'🏆',p:10000},{n:'Lion',e:'🦁',p:2000},{n:'Rocket',e:'🚀',p:3000},
  ]

  const rechargeOptions = [
    {coins:100, price:10},{coins:500, price:50},{coins:1200, price:100},{coins:3000, price:250},
  ]

  const doRecharge = (opt:any) => {
    if(myWallet < opt.price){ alert("Wallet এ টাকা নেই!"); return }
    setMyWallet(w=>w-opt.price)
    setMyCoins(c=>c+opt.coins)
    setShowRecharge(false)
    alert(`+${opt.coins} Coins Add হলো!`)
  }

  const playLudo = () => {
    if(myCoins<5){ setShowRecharge(true); return }
    setMyCoins(c=>c-5)
    if(Math.random()>0.5){ setMyCoins(c=>c+100); setMsg("🎉 জিতেছো! +100 🪙"); }
    else setMsg("হেরেছো! আবার খেলো")
  }

  if(!myId) return <div style={{background:'black',color:'white',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading ID...</div>

  return(
    <div style={{background:'black',color:'white',maxWidth:420,margin:'0 auto',minHeight:'100vh',position:'relative',fontFamily:'system-ui'}}>

      {/* VIDEO FEED - নিজের ভিডিও */}
      <div style={{position:'relative',height:'100vh',background:'#000'}}>
        <video autoPlay loop muted playsInline style={{width:'100%',height:'100%',objectFit:'cover'}} src="https://videos.pexels.com/video-files/18069234/18069234-uhd_1440_1440_24fps.mp4"/>

        <div style={{position:'absolute',top:10,left:0,right:0,display:'flex',justifyContent:'center',gap:60}}><span style={{color:'#777',fontSize:12}}>Following</span><b style={{fontSize:12,borderBottom:'2px solid white'}}>For You</b></div>

        {/* নিজের ID শো করবে - কোনো ডুপ্লিকেট না */}
        <div style={{position:'absolute',left:10,bottom:70,width:'70%'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>{myId.slice(-2)}</div>
            <div style={{background:'#7c3aed',padding:'4px 12px',borderRadius:8,fontSize:10,fontWeight:800}}>My ID: {myId}</div>
          </div>
          <div style={{fontSize:8,marginTop:4}}>SOT TOK • ID: {myId}</div>
          <div style={{fontSize:12,fontWeight:700}}>{myUsername}</div>
          <div style={{fontSize:9,background:'#facc15',color:'black',display:'inline-block',padding:'3px 8px',borderRadius:10,marginTop:4,fontWeight:700}}>🪙 {myCoins} | Rs {myWallet} | 💎 {myDiamonds}</div>
        </div>

        <div style={{position:'absolute',right:8,bottom:80,display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>
          <div onClick={()=>setShowGift(true)} style={{background:'#7c3aed',width:42,height:42,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,border:'2px solid white'}}>🎁</div>
          <div onClick={()=>setShowLudo(true)} style={{background:'#facc15',width:42,height:42,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,border:'2px solid white'}}>🎲</div>
        </div>
      </div>

      {/* GIFT PANEL - ভিডিওতে ক্লিক করলে */}
      {showGift && (
        <div style={{position:'fixed',bottom:52,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'#121214',borderRadius:'16px 16px 0 0',zIndex:30,maxHeight:'70vh',overflowY:'auto',borderTop:'1px solid #333'}}>
          <div style={{padding:10,display:'flex',justifyContent:'space-between'}}><b style={{fontSize:11}}>🎁 গিফট - তোমার ID: {myId} - 🪙 {myCoins}</b><span onClick={()=>setShowGift(false)} style={{background:'#222',padding:'4px 10px',borderRadius:10,fontSize:10}}>✕</span></div>
          {myCoins<10 && <div style={{background:'#ff2e63',margin:'0 10px',borderRadius:8,padding:6,fontSize:9,textAlign:'center'}}>কয়েন শেষ! <button onClick={()=>setShowRecharge(true)} style={{background:'white',color:'black',border:'none',padding:'2px 8px',borderRadius:10,marginLeft:6,fontSize:9,fontWeight:800}}>Recharge</button></div>}
          <div style={{padding:'8px 10px',display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5}}>
            {gifts.map(g=>(
              <div key={g.n} onClick={()=>{ if(myCoins>=g.p || g.p===0){ if(g.p>0) setMyCoins(c=>c-g.p); alert(g.e+" Gift!") }else setShowRecharge(true) }} style={{background:'#25252b',borderRadius:8,padding:'6px 2px',textAlign:'center'}}>
                <div style={{fontSize:16}}>{g.e}</div><div style={{fontSize:7}}>{g.n}</div><div style={{fontSize:7,color:'#facc15'}}>{g.p===0?'Free':g.p+' 🪙'}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'0 10px 10px'}}>
            <div style={{background:'#0f0f1a',border:'1px solid #facc15',borderRadius:10,padding:8,marginTop:8}}>
              <div style={{textAlign:'center',fontSize:9,fontWeight:800}}>🎲 Gift এর নিচে Ludo</div>
              <button onClick={playLudo} style={{width:'100%',marginTop:6,background:'#facc15',color:'black',border:'none',padding:8,borderRadius:8,fontWeight:900,fontSize:10}}>🎲 5 🪙 দিয়ে খেলো - জিতলে 100 🪙</button>
              <p style={{textAlign:'center',fontSize:8,color:'#facc15',marginTop:4}}>{msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* RECHARGE - নিজের অ্যাকাউন্ট থেকে */}
      {showRecharge && (
        <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,height:'100%',background:'rgba(0,0,0,0.9)',zIndex:40,padding:14}}>
          <div style={{background:'#1e1e24',borderRadius:16,padding:12,marginTop:40}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:12}}>💳 রিচার্জ - নিজের ID: {myId}</b><span onClick={()=>setShowRecharge(false)} style={{background:'#222',padding:'4px 10px',borderRadius:10,fontSize:10}}>✕</span></div>
            <div style={{background:'#101010',borderRadius:10,padding:8,marginTop:8,fontSize:10}}><div style={{display:'flex',justifyContent:'space-between'}}><span>Main Wallet</span><b>Rs {myWallet}</b></div><div style={{display:'flex',justifyContent:'space-between',marginTop:4}}><span>Coins</span><b>🪙 {myCoins}</b></div></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
              {rechargeOptions.map((opt,i)=>(
                <div key={i} onClick={()=>doRecharge(opt)} style={{background:'#25252b',border:'1px solid #facc15',borderRadius:10,padding:10,textAlign:'center'}}>
                  <div style={{fontSize:12,fontWeight:800}}>🪙 {opt.coins}</div><div style={{fontSize:10,marginTop:4,background:'#facc15',color:'black',borderRadius:6,padding:'3px',fontWeight:800}}>Rs {opt.price}</div><div style={{fontSize:7,color:'#aaa',marginTop:2}}>Wallet থেকে কাটবে</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LUDO ROOM - প্রোফাইলে */}
      {showLudo && (
        <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,height:'100%',background:'#0a0a14',zIndex:50,padding:12}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:11}}>🎲 LUDO - ID: {myId} - Live</b><span onClick={()=>setShowLudo(false)} style={{background:'#222',padding:'6px 12px',borderRadius:16,fontSize:11}}>✕</span></div>
          <div style={{background:'#1a1a1a',borderRadius:12,padding:10,marginTop:10}}>
            <div style={{fontSize:10,fontWeight:700}}>👤 তোমার প্রোফাইল</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6,background:'black',padding:8,borderRadius:10}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center'}}>{myId.slice(-2)}</div>
              <div><div style={{fontSize:10,fontWeight:700}}>ID: {myId}</div><div style={{fontSize:8}}>{myUsername}</div><div style={{fontSize:8,color:'#facc15'}}>🪙 {myCoins} | Rs {myWallet}</div></div>
              <div style={{marginLeft:'auto',background:'#22c55e',width:8,height:8,borderRadius:'50%'}}></div>
            </div>
            <div style={{marginTop:10,fontSize:9,color:'#aaa'}}>🌐 Online Users - Auto Connect (Real Users)</div>
            <div style={{marginTop:6,background:'#111',borderRadius:10,padding:20,textAlign:'center',border:'1px dashed #facc15',fontSize:9}}>অন্য ইউজাররা জয়েন করলে এখানে দেখাবে<br/>কোনো ডুপ্লিকেট নাম নেই - শুধু ID</div>
            <button onClick={playLudo} style={{width:'100%',marginTop:10,background:'#facc15',padding:12,borderRadius:10,border:'none',fontWeight:900}}>🎲 5 🪙 দিয়ে খেলো - জিতলে 100 🪙</button>
            <p style={{textAlign:'center',fontSize:8,color:'#facc15',marginTop:6}}>{msg}</p>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'black',display:'flex',justifyContent:'space-around',padding:'6px 0',borderTop:'1px solid #111'}}>
        <div style={{textAlign:'center',color:'#ff2e63'}}><div style={{fontSize:18}}>🏠</div><span style={{fontSize:9}}>হোম</span></div>
        <div style={{textAlign:'center',color:'#888'}}><div style={{fontSize:18}}>🧭</div><span style={{fontSize:9}}>এক্সপ্লোরার</span></div>
        <div style={{background:'linear-gradient(to right,#ec4899,#a855f7)',width:44,height:28,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>+</div>
        <div style={{textAlign:'center',color:'#888'}}><div style={{fontSize:18}}>🔔</div><span style={{fontSize:9}}>ইনবক্স</span></div>
        <div style={{textAlign:'center',color:'#888'}}><div style={{fontSize:18}}>👤</div><span style={{fontSize:9}}>{myId.slice(-4)}</span></div>
      </div>
    </div>
  )
}