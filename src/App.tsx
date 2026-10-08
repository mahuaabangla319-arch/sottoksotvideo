import { useState, memo } from 'react'

// Fast Video Component - আলাদা করে রাখলাম যাতে বার বার Render না হয়
const FastVideo = memo(({ onGift }: any) => {
  return (
    <div style={{height:'78vh',display:'flex',alignItems:'flex-end',justifyContent:'space-between',padding:14, background:'#000'}}>
      <div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <img loading="lazy" src="https://i.pravatar.cc/80?img=3" width={44} height={44} style={{borderRadius:'50%'}}/>
          <span style={{background:'#a855f7',padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:900}}>✓ Following</span>
        </div>
        <p style={{fontSize:11,margin:'8px 0 0',color:'#aaa'}}>SOT TOK • ID: 96216703</p>
        <b style={{fontSize:13}}>@mahatohimanshu755</b>
        <p style={{fontSize:12,margin:'4px 0'}}>1 views</p>
        <div style={{background:'#1a1a1a',display:'inline-block',padding:'5px 10px',borderRadius:20,fontSize:11,marginTop:4}}>♫ Original sound</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:18,alignItems:'center'}}>
        <div style={{textAlign:'center'}}><div style={{fontSize:26}}>🤍</div><span style={{fontSize:11}}>0</span></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:24}}>💬</div><span style={{fontSize:11}}>0</span></div>
        <div onClick={onGift} style={{textAlign:'center',background:'#1a1a1a',padding:'6px 8px',borderRadius:12}}><div style={{fontSize:22}}>🎁</div><span style={{fontSize:10}}>Gift</span></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:22}}>↗️</div><span style={{fontSize:10}}>Share</span></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:22}}>🔖</div><span style={{fontSize:10}}>Save</span></div>
      </div>
    </div>
  )
})

export default function App(){
  const [coins,setCoins]=useState(1250)
  const [showGift,setShowGift]=useState(false)
  const [showLudo,setShowLudo]=useState(false)

  return(
    <div style={{background:'black',color:'white',minHeight:'100vh',maxWidth:420,margin:'0 auto', fontFamily:'system-ui'}}>
      
      {/* Header - Fixed */}
      <div style={{display:'flex',justifyContent:'center',gap:50,padding:12,position:'sticky',top:0,background:'black',zIndex:10, borderBottom:'1px solid #111'}}>
        <span style={{color:'#666',fontSize:15}}>Following</span>
        <b style={{fontSize:15,borderBottom:'2px solid white'}}>For You</b>
      </div>

      {/* Filter */}
      <div style={{display:'flex',justifyContent:'center',padding:'8px 0'}}>
        <div style={{background:'#111',borderRadius:20,padding:'5px 12px',fontSize:13,display:'flex',gap:10,border:'1px solid #222'}}>
          <span>পছন্দের বিষয়</span><span style={{background:'#222',padding:'3px 10px',borderRadius:20}}>সব ▼</span>
        </div>
      </div>

      {/* Video - Super Fast */}
      <FastVideo onGift={()=>setShowGift(true)} />

      {/* Wallet - ছোট করে দিলাম যাতে Fast লাগে */}
      <div style={{margin:10,background:'#121212',borderRadius:12,padding:10,display:'flex',justifyContent:'space-between',border:'1px solid #1e1e1e'}}>
        <span style={{fontSize:12}}>🪙 {coins} | 💎 340 | 💰 Rs 2500</span>
        <span onClick={()=>setShowGift(true)} style={{fontSize:12,color:'#a855f7',fontWeight:900}}>Wallet + Gift ▶</span>
      </div>

      {/* Gift - Click করলেই শুধু লোড হবে - তাই Fast */}
      {showGift && (
        <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'#121212',borderRadius:'20px 20px 0 0',zIndex:99,borderTop:'1px solid #333', animation:'slideUp 0.2s'}}>
          <div style={{padding:12,display:'flex',justifyContent:'space-between'}}>
            <b style={{fontSize:14}}>👜 Wallet & 🎁 গিফট পাঠান</b>
            <span onClick={()=>setShowGift(false)} style={{background:'#222',padding:'4px 12px',borderRadius:20,fontSize:12}}>✕ Close</span>
          </div>
          <div style={{padding:'0 12px 12px',display:'flex',justifyContent:'space-between',fontSize:12,color:'#aaa'}}>
            <span>Main: Rs 2500</span><span>Coins: {coins}</span><span>100 D = Rs 80</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'0 12px 12px'}}>
            {[
              {n:'Free',i:'✨',p:0},{n:'Rose',i:'🌹',p:10},{n:'Heart',i:'💖',p:50},{n:'Crown',i:'👑',p:100},
              {n:'Eleph',i:'🐘',p:500},{n:'Diam',i:'💎',p:1000},{n:'Car',i:'🚗',p:5000},{n:'Trophy',i:'🏆',p:10000},
            ].map(g=>(
              <div key={g.n} onClick={()=>{ if(coins>=g.p){ if(g.p>0) setCoins(c=>c-g.p); alert(g.i+' Sent!') } else alert('Coin নেই!') }} style={{background:'#1e1e1e',borderRadius:12,padding:10,textAlign:'center',border:'1px solid #222'}}>
                <div style={{fontSize:20}}>{g.i}</div>
                <div style={{fontSize:10}}>{g.n}</div>
                <div style={{fontSize:9,color:'#facc15'}}>{g.p}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ludo - Click করলেই শুধু লোড হবে */}
      {showLudo && (
        <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,height:'100%',background:'#0a0a14',zIndex:100,padding:12}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><b>🎲 LUDO FAST</b><span onClick={()=>setShowLudo(false)} style={{background:'#222',padding:'6px 12px',borderRadius:20}}>✕</span></div>
          <div style={{marginTop:20,background:'#1e1e1e',height:200,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}><b>🎲 Dice Roll - 4 জন Online</b></div>
          <button onClick={()=>setShowLudo(false)} style={{marginTop:12,width:'100%',background:'#facc15',color:'black',border:'none',padding:12,borderRadius:10,fontWeight:900}}>Close & Back to Video</button>
        </div>
      )}

      {/* Bottom - Instagram মতো Fast */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'black',display:'flex',justifyContent:'space-around',padding:'8px 0',borderTop:'1px solid #111'}}>
        <div style={{textAlign:'center',color:'#ff0050'}}><div style={{fontSize:20}}>🏠</div><span style={{fontSize:10}}>হোম</span></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:20}}>🧭</div><span style={{fontSize:10}}>এক্সপ্লোরার</span></div>
        <div onClick={()=>setShowLudo(true)} style={{background:'linear-gradient(45deg,#ff0050,#a855f7)',width:48,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🎲</div>
        <div style={{textAlign:'center'}}><div style={{fontSize:20}}>🔔</div><span style={{fontSize:10}}>ইনবক্স</span></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:20}}>👤</div><span style={{fontSize:10}}>প্রোফাইল</span></div>
      </div>
    </div>
  )
}