import { useState, useRef } from 'react'

export default function App(){
  const [coins,setCoins]=useState(1250)
  const [showPanel,setShowPanel]=useState(false) // ভিডিওতে টাচ করলে খুলবে
  const [showLudoLive,setShowLudoLive]=useState(false)
  const [msg,setMsg]=useState("5 🪙 দিয়ে খেলো, জিতলে 100 🪙!")
  const videoRef = useRef<HTMLVideoElement>(null)

  const gifts=[
    {n:'Free',e:'✨',p:0},{n:'Rose',e:'🌹',p:10},{n:'Heart',e:'💖',p:50},{n:'Crown',e:'👑',p:100},{n:'Elephant',e:'🐘',p:500},
    {n:'Diamond',e:'💎',p:1000},{n:'Car',e:'🚗',p:5000},{n:'Trophy',e:'🏆',p:10000},{n:'Lion',e:'🦁',p:2000},{n:'Rocket',e:'🚀',p:3000},
  ]

  // ভিডিও বক্সে টাচ করলে প্যানেল খুলবে
  const onVideoTap = () => {
    setShowPanel(!showPanel)
    if(videoRef.current){
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
    }
  }

  const playLudo = () => {
    if(coins<5){ alert("5 কয়েন লাগবে দাদা!"); return }
    setCoins(c=>c-5)
    const win = Math.random()>0.4
    if(win){ 
      setCoins(c=>c+100)
      setMsg("🎉 জিতেছো! +100 কয়েন! লাইভ ভিডিও কলে সবাইকে দেখাও!")
      alert("🏆 WIN! 100 Coins পেলে! এই কয়েন দিয়ে Gift করো!")
    } else {
      setMsg("😢 হেরেছো, আবার খেলো! সব ইউজার লাইভ আছে")
    }
  }

  return(
    <div style={{background:'black',color:'white',maxWidth:420,margin:'0 auto',minHeight:'100vh',position:'relative',fontFamily:'system-ui',overflow:'hidden'}}>
      
      {/* VIDEO BOX - এখানে হাত দিলেই অপশন আসবে */}
      <div onClick={onVideoTap} style={{position:'relative',width:'100%',height:'68vh',background:'#000',cursor:'pointer'}}>
        <video ref={videoRef} autoPlay loop muted playsInline 
          style={{width:'100%',height:'100%',objectFit:'cover'}}
          src="https://videos.pexels.com/video-files/18069234/18069234-uhd_1440_1440_24fps.mp4"
          poster="https://i.pravatar.cc/400?img=12"
        />
        {/* Top Bar */}
        <div style={{position:'absolute',top:0,left:0,right:0,padding:'10px 12px',background:'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)',display:'flex',justifyContent:'center',gap:60}}>
          <span style={{color:'#999',fontSize:13}}>Following</span><b style={{fontSize:13,borderBottom:'2px solid white'}}>For You</b>
        </div>
        <div style={{position:'absolute',top:36,left:'50%',transform:'translateX(-50%)',border:'1px solid #333',borderRadius:20,padding:'4px 10px',fontSize:11,background:'rgba(0,0,0,0.5)'}}>পছন্দের বিষয় <span style={{background:'#222',padding:'2px 8px',borderRadius:10,marginLeft:6}}>সব ▼</span></div>
        <div style={{position:'absolute',top:70,right:12,fontSize:10,color:'#fff',background:'rgba(0,0,0,0.5)',padding:'2px 8px',borderRadius:10}}>Tap for sound</div>
        
        {/* Tap Hint */}
        {!showPanel && <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(0,0,0,0.6)',padding:'8px 14px',borderRadius:20,fontSize:11,border:'1px solid #333'}}>👆 ভিডিওতে টাচ করো - Gift + Ludo খুলবে</div>}

        {/* Right Icons - প্রথম ছবির মতো */}
        <div style={{position:'absolute',right:10,bottom:20,display:'flex',flexDirection:'column',gap:16,alignItems:'center'}}>
          <div style={{textAlign:'center'}}><div style={{fontSize:22,color:'#ff2e63'}}>❤️</div><span style={{fontSize:10}}>2</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:20}}>💬</div><span style={{fontSize:10}}>0</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:20}}>🎁</div><span style={{fontSize:10}}>1</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:16}}>↗️</div><span style={{fontSize:9}}>Share</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:16}}>🔖</div><span style={{fontSize:9}}>Save</span></div>
        </div>

        {/* Left Bottom - Profile */}
        <div style={{position:'absolute',left:12,bottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <img src="https://i.pravatar.cc/80?img=12" style={{width:46,height:46,borderRadius:'50%',border:'2px solid white'}}/>
            <div style={{background:'#7c3aed',padding:'5px 14px',borderRadius:8,fontSize:10,fontWeight:800}}>✓ Following</div>
          </div>
          <div style={{fontSize:8,marginTop:4}}>SOT TOK • ID: 96216703</div>
          <div style={{fontSize:12,fontWeight:700}}>@mahatohimanshu755</div>
          <div style={{fontSize:10,color:'#bbb'}}>7 views • Original sound</div>
        </div>
      </div>

      {/* BOTTOM SHEET - ভিডিওতে টাচ করলেই আসবে */}
      {showPanel && (
        <div style={{position:'fixed',bottom:52,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'#121214',borderRadius:'18px 18px 0 0',zIndex:30,maxHeight:'65vh',overflowY:'auto',borderTop:'1px solid #333',animation:'slideUp 0.3s'}}>
          <div style={{display:'flex',justifyContent:'center',padding:8}}><div style={{width:36,height:4,background:'#444',borderRadius:10}}></div></div>
          
          {/* Wallet - ছোট */}
          <div style={{background:'#1e1e24',margin:'0 10px',borderRadius:12,padding:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><b style={{fontSize:11}}>👜 Wallet</b><span style={{fontSize:10,marginLeft:8}}>🪙 {coins} Coins | Rs 2500 | 💎 340</span></div>
            <span onClick={()=>setShowPanel(false)} style={{background:'#222',padding:'4px 10px',borderRadius:12,fontSize:10}}>✕</span>
          </div>

          {/* Gift Grid */}
          <div style={{padding:'8px 10px'}}>
            <h4 style={{textAlign:'center',fontSize:11,margin:'6px 0'}}>🎁 গিফট পাঠান</h4>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5}}>
              {gifts.map(g=>(
                <div key={g.n} onClick={()=>{ if(g.p===0 || coins>=g.p){ if(g.p>0) setCoins(c=>c-g.p); }else alert("কয়েন কম! Ludo খেলো") }} style={{background:'#25252b',borderRadius:8,padding:'5px 2px',textAlign:'center'}}>
                  <div style={{fontSize:14}}>{g.e}</div><div style={{fontSize:7}}>{g.n}</div><div style={{fontSize:7,color:'#facc15'}}>{g.p}🪙</div>
                </div>
              ))}
            </div>

            {/* LUDO - Gift এর নিচে - LIVE Multiplayer Video Call */}
            <div style={{marginTop:10,background:'linear-gradient(135deg,#0f0f1a,#1a1a2e)',border:'1.5px solid #facc15',borderRadius:14,padding:10}}>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:6}}>
                <span>🎲</span><b style={{fontSize:11}}>LUDO LIVE - সব ইউজার একসাথে</b><span style={{background:'#ff2e63',fontSize:7,padding:'2px 6px',borderRadius:4,animation:'pulse 1s infinite'}}>● LIVE</span>
              </div>
              <p style={{textAlign:'center',fontSize:9,color:'#facc15',margin:'4px 0',fontWeight:700}}>{msg}</p>
              
              {/* 4 জন User Live Video Call Box */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:6}}>
                {[
                  {name:'তুমি',coins:coins},
                  {name:'Rahul',coins:840},
                  {name:'Priya',coins:1200},
                  {name:'Aman',coins:650},
                ].map((u,i)=>(
                  <div key={i} style={{background:'#000',borderRadius:10,padding:6,border:i===0?'1px solid #facc15':'1px solid #222',position:'relative'}}>
                    <div style={{width:'100%',height:50,background:'#1a1a1a',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{i===0?'📹 তুমি':'📹'}</div>
                    <div style={{fontSize:8,marginTop:3,display:'flex',justifyContent:'space-between'}}><span>{u.name}</span><span>🪙 {u.coins}</span></div>
                    <div style={{position:'absolute',top:8,right:8,background:'#22c55e',width:6,height:6,borderRadius:'50%'}}></div>
                    <div style={{position:'absolute',bottom:22,left:8,fontSize:6,background:'rgba(0,0,0,0.7)',padding:'1px 4px',borderRadius:4}}>🎤 ON</div>
                  </div>
                ))}
              </div>

              <button onClick={playLudo} style={{width:'100%',marginTop:8,background:'#facc15',color:'black',border:'none',padding:10,borderRadius:10,fontWeight:900,fontSize:11}}>
                🎲 5 🪙 দিয়ে খেলো - জিতলে 100 🪙 - ভিডিও কলে কথা বলো
              </button>
              <div style={{display:'flex',gap:6,marginTop:6}}>
                <button onClick={()=>setShowLudoLive(true)} style={{flex:1,background:'#222',color:'white',border:'1px solid #333',padding:7,borderRadius:8,fontSize:9}}>📹 Video ON</button>
                <button style={{flex:1,background:'#222',color:'white',border:'1px solid #333',padding:7,borderRadius:8,fontSize:9}}>🎤 Mic ON</button>
                <button style={{flex:1,background:'#7c3aed',color:'white',border:'none',padding:7,borderRadius:8,fontSize:9}}>💬 Chat</button>
              </div>
              <p style={{textAlign:'center',fontSize:7,color:'#888',marginTop:4}}>সবাই নিজের কয়েন দিয়ে খেলবে • জেতা কয়েন দিয়ে Gift • Live Video + Voice</p>
            </div>
          </div>
        </div>
      )}

      {/* Full Ludo Live Room */}
      {showLudoLive && (
        <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,height:'100%',background:'#0a0a14',zIndex:50,padding:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><b style={{fontSize:12}}>🎲 LUDO LIVE ROOM - 4 Players Video Call</b><span onClick={()=>setShowLudoLive(false)} style={{background:'#222',padding:'6px 12px',borderRadius:16,fontSize:11}}>✕</span></div>
          <div style={{marginTop:10,background:'#1a1a1a',borderRadius:12,padding:8}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{background:'black',height:140,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><span style={{fontSize:30}}>📹</span><span style={{fontSize:10,marginTop:4}}>তুমি - 🪙 {coins}</span><span style={{fontSize:8,background:'#22c55e',padding:'2px 6px',borderRadius:10,marginTop:4}}>● LIVE</span></div>
              <div style={{background:'black',height:140,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><span style={{fontSize:30}}>📹</span><span style={{fontSize:10}}>Rahul</span></div>
              <div style={{background:'black',height:140,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><span style={{fontSize:30}}>📹</span><span style={{fontSize:10}}>Priya</span></div>
              <div style={{background:'black',height:140,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><span style={{fontSize:30}}>📹</span><span style={{fontSize:10}}>Aman</span></div>
            </div>
            <div style={{marginTop:10,background:'#111',height:100,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',border:'2px dashed #facc15'}}>🎲 LUDO BOARD - 4 Goti</div>
            <button onClick={playLudo} style={{width:'100%',marginTop:10,background:'#facc15',padding:12,borderRadius:12,border:'none',fontWeight:900}}>🎲 Roll - 5 Coin = Win 100 Coin</button>
          </div>
        </div>
      )}

      {/* Bottom Nav - বাংলা */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'black',display:'flex',justifyContent:'space-around',padding:'6px 0',borderTop:'1px solid #111'}}>
        <div style={{textAlign:'center',color:'#ff2e63'}}><div style={{fontSize:18}}>🏠</div><span style={{fontSize:9}}>হোম</span></div>
        <div style={{textAlign:'center',color:'#888'}}><div style={{fontSize:18}}>🧭</div><span style={{fontSize:9}}>এক্সপ্লোরার</span></div>
        <div style={{background:'linear-gradient(to right,#ec4899,#a855f7)',width:46,height:30,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>+</div>
        <div style={{textAlign:'center',color:'#888'}}><div style={{fontSize:18}}>🔔</div><span style={{fontSize:9}}>ইনবক্স</span></div>
        <div style={{textAlign:'center',color:'#888'}}><div style={{fontSize:18}}>👤</div><span style={{fontSize:9}}>প্রোফাইল</span></div>
      </div>

      <style>{`@keyframes slideUp{from{transform:translate(-50%,100%)}to{transform:translate(-50%,0)}} @keyframes pulse{0%{opacity:1}50%{opacity:0.5}100%{opacity:1}}`}</style>
    </div>
  )
}