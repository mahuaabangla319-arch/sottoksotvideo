import { useState } from 'react'

export default function App(){
  const [coins,setCoins]=useState(1250)
  const [showGift,setShowGift]=useState(false)
  const [showLudo,setShowLudo]=useState(false)
  const [ludoMsg,setLudoMsg]=useState("5 কয়েন দিয়ে খেলো, জিতলে 100 কয়েন!")
  const [rolling,setRolling]=useState(false)

  const gifts=[
    {n:'Free',e:'✨',p:0},{n:'Rose',e:'🌹',p:10},{n:'Heart',e:'💖',p:50},{n:'Crown',e:'👑',p:100},{n:'Elephant',e:'🐘',p:500},
    {n:'Diamond',e:'💎',p:1000},{n:'Car',e:'🚗',p:5000},{n:'Trophy',e:'🏆',p:10000},{n:'Lion',e:'🦁',p:2000},{n:'Rocket',e:'🚀',p:3000},
  ]

  // Ludo খেলা - 5 কয়েন নিয়ে 100 কয়েন জেতা
  const playLudo = () => {
    if(coins < 5){
      alert("কয়েন নেই! 5 কয়েন লাগবে খেলতে")
      return
    }
    if(rolling) return
    setRolling(true)
    setLudoMsg("🎲 গুটি চালছে...")
    
    setTimeout(()=>{
      setCoins(c=>c-5) // প্রথমে 5 কয়েন কাটা
      const win = Math.random() > 0.5 // 50% জেতার চান্স
      
      if(win){
        setCoins(c=>c+100)
        setLudoMsg("🎉 জিতে গেছো! +100 কয়েন পেলে! এবার গিফট করতে পারো!")
        setTimeout(()=>alert("🏆 Congratulations! 100 Coins Win! এখন Gift করতে পারো!"),200)
      }else{
        setLudoMsg("😢 হেরে গেছো! আবার চেষ্টা করো - 5 কয়েন দিয়ে!")
      }
      setRolling(false)
    },1500)
  }

  return(
    <div style={{background:'black',color:'white',maxWidth:420,margin:'0 auto',minHeight:'100vh',fontFamily:'system-ui',paddingBottom:70,position:'relative'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'center',gap:80,padding:10}}>
        <span style={{color:'#666',fontSize:12}}>Following</span><b style={{fontSize:12,borderBottom:'2px solid white'}}>For You</b>
      </div>
      <div style={{display:'flex',justifyContent:'center'}}><div style={{border:'1px solid #333',borderRadius:20,padding:'4px 10px',fontSize:10}}>পছন্দের বিষয় <span style={{background:'#222',padding:'2px 8px',borderRadius:10}}>সব ▼</span></div></div>

      {/* Profile */}
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px'}}>
        <img src="https://i.pravatar.cc/80?img=12" style={{width:50,height:50,borderRadius:'50%'}}/>
        <div>
          <div style={{background:'#7c3aed',padding:'4px 12px',borderRadius:8,fontSize:10,fontWeight:800,display:'inline-block'}}>+ Follow</div>
          <div style={{fontSize:8,color:'#ddd'}}>SOT TOK • ID: 96216703</div>
          <div style={{fontSize:8,color:'#999'}}>@mahatohimanshu755</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',flexDirection:'column',gap:12,alignItems:'center'}}>
          <div style={{textAlign:'center'}}><div style={{fontSize:18}}>❤️</div><span style={{fontSize:9}}>2</span></div>
          <div onClick={()=>setShowGift(true)} style={{textAlign:'center',background:'#1a1a1a',padding:'4px 6px',borderRadius:10,cursor:'pointer'}}><div style={{fontSize:18}}>🎁</div><span style={{fontSize:9}}>1</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:16}}>↗️</div><span style={{fontSize:8}}>Share</span></div>
        </div>
      </div>

      <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',color:'#333',fontSize:10,border:'1px dashed #222',margin:'0 12px',borderRadius:10}}>[ Video Feed ]</div>

      {/* Gift + Ludo Sheet */}
      {showGift && (
        <div style={{position:'fixed',bottom:60,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'#121214',borderRadius:'16px 16px 0 0',zIndex:50,borderTop:'1px solid #333',maxHeight:'80vh',overflowY:'auto'}}>
          <div style={{display:'flex',justifyContent:'center',paddingTop:6}}><div style={{width:36,height:4,background:'#333',borderRadius:10}}></div></div>
          
          <div style={{background:'#1e1e24',margin:10,borderRadius:12,padding:8}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:11}}>👜 Wallet - {coins} Coins</b><span onClick={()=>setShowGift(false)} style={{fontSize:9,background:'#222',padding:'3px 8px',borderRadius:10}}>✕</span></div>
            <div style={{fontSize:9,color:'#aaa',marginTop:4}}>এই কয়েন দিয়েই গিফট করতে পারবে • 5 কয়েনে Ludo খেলে 100 জেতো!</div>
          </div>

          <div style={{padding:'0 10px'}}>
            <h4 style={{textAlign:'center',fontSize:11,margin:'4px 0'}}>🎁 গিফট পাঠান (কয়েন দিয়ে)</h4>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5}}>
              {gifts.map(g=>(
                <div key={g.n} onClick={()=>{ 
                  if(coins>=g.p){ if(g.p>0) setCoins(c=>c-g.p); alert(g.e+" Gift Sent!") }else alert("কয়েন কম! Ludo খেলে কয়েন জেতো!")
                }} style={{background:'#25252b',borderRadius:8,padding:'5px 2px',textAlign:'center',opacity: coins<g.p && g.p>0 ? 0.5:1}}>
                  <div style={{fontSize:14}}>{g.e}</div>
                  <div style={{fontSize:7}}>{g.n}</div>
                  <div style={{fontSize:7,color:'#facc15'}}>{g.p} 🪙</div>
                </div>
              ))}
            </div>

            {/* LUDO - 5 Coin = 100 Coin */}
            <div style={{marginTop:10,background:'#0f0f1a',border:'1px solid #facc15',borderRadius:12,padding:10}}>
              <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>
                <span>🎲</span><b style={{fontSize:11}}>LUDO CASH - 5 Coin Game</b><span style={{background:'#22c55e',fontSize:7,padding:'2px 5px',borderRadius:4}}>Live</span>
              </div>
              <p style={{textAlign:'center',fontSize:9,color:'#facc15',margin:'4px 0',fontWeight:800}}>{ludoMsg}</p>
              <div style={{display:'flex',gap:6,marginTop:6}}>
                <div style={{flex:1,background:'#1a1a1a',borderRadius:8,padding:6,textAlign:'center',fontSize:8}}>
                  <div>👤 তুমি</div><div style={{fontSize:12,marginTop:2}}>🎲 {rolling?"...": "?"}</div>
                </div>
                <div style={{flex:1,background:'#1a1a1a',borderRadius:8,padding:6,textAlign:'center',fontSize:8}}>
                  <div>🤖 Bot 1</div><div style={{fontSize:12,marginTop:2}}>🎲 ?</div>
                </div>
                <div style={{flex:1,background:'#1a1a1a',borderRadius:8,padding:6,textAlign:'center',fontSize:8}}>
                  <div>🤖 Bot 2</div><div style={{fontSize:12,marginTop:2}}>🎲 ?</div>
                </div>
                <div style={{flex:1,background:'#1a1a1a',borderRadius:8,padding:6,textAlign:'center',fontSize:8}}>
                  <div>🤖 Bot 3</div><div style={{fontSize:12,marginTop:2}}>🎲 ?</div>
                </div>
              </div>
              <button onClick={playLudo} disabled={rolling || coins<5} style={{width:'100%',marginTop:8,background: coins<5?'#333':'#facc15',color:'black',border:'none',padding:10,borderRadius:10,fontWeight:900,fontSize:11}}>
                {rolling ? "🎲 Rolling..." : coins<5 ? "❌ 5 Coin নেই" : "🎲 5 🪙 দিয়ে খেলো - জিতলে 100 🪙"}
              </button>
              <p style={{textAlign:'center',fontSize:7,color:'#888',marginTop:4}}>যে কেউ খেলতে পারবে • জেতা কয়েন দিয়ে Gift করো</p>
            </div>
          </div>
          <div style={{height:12}}></div>
        </div>
      )}

      {/* Bottom */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'black',display:'flex',justifyContent:'space-around',padding:'6px 0',borderTop:'1px solid #111'}}>
        <div style={{textAlign:'center',color:'#7c3aed'}}><div style={{fontSize:16}}>🏠</div><span style={{fontSize:8}}>Home</span></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:16}}>🧭</div><span style={{fontSize:8}}>Explorer</span></div>
        <div onClick={()=>setShowGift(true)} style={{background:'#7c3aed',width:40,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🎲</div>
        <div style={{textAlign:'center'}}><div style={{fontSize:16}}>🔔</div><span style={{fontSize:8}}>Inbox</span></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:16}}>👤</div><span style={{fontSize:8}}>Profile</span></div>
      </div>

      {/* Coin Counter Top */}
      <div style={{position:'fixed',top:50,right:10,background:'#facc15',color:'black',padding:'4px 10px',borderRadius:20,fontSize:10,fontWeight:900,zIndex:20}}>🪙 {coins}</div>
    </div>
  )
}