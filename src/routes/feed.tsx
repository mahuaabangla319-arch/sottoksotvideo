import { useState } from 'react'

const gifts = [
  {name:'Rose', coins:1, emoji:'🌹'},
  {name:'TikTok Star', coins:5, emoji:'⭐'},
  {name:'Heart', coins:10, emoji:'❤️'},
  {name:'Diamond', coins:50, emoji:'💎'},
  {name:'Crown', coins:100, emoji:'👑'},
  {name:'Rocket', coins:200, emoji:'🚀'},
  {name:'Love Car', coins:500, emoji:'🚗'},
  {name:'Lion', coins:1000, emoji:'🦁'},
]

export default function Feed(){
  const [liked,setLiked]=useState(false)
  const [showGift,setShowGift]=useState(false)
  const [coins,setCoins]=useState(100)

  return(
    <div style={{background:'#000',color:'#fff',minHeight:'100vh'}}>
      <div style={{height:500,background:'linear-gradient(180deg,#ff9a00,#ff0050,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:80}}>🎬</div>
      <div style={{padding:12,display:'flex',gap:15,fontSize:22}}>
        <span onClick={()=>setLiked(!liked)}>{liked?'❤️':'🤍'} 125</span>
        <span>💬</span>
        <span onClick={()=>setShowGift(!showGift)}>🎁 Gift</span>
      </div>
      <p style={{padding:'0 12px'}}><b>@sottokbangla</b> নতুন ভিডিও 🔥 #SOTTOK</p>

      {showGift && (
        <div style={{background:'#111',padding:15,margin:10,borderRadius:15}}>
          <h3>🎁 গিফট পাঠাও - Coins: {coins}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginTop:10}}>
            {gifts.map(g=>(
              <button key={g.name} onClick={()=>{if(coins>=g.coins){setCoins(coins-g.coins); alert(g.name+' পাঠানো হয়ে গেছে! '+g.emoji)}} else alert('কয়েন নেই!')}} style={{background:'#222',color:'#fff',border:'none',borderRadius:10,padding:10}}>
                <div style={{fontSize:28}}>{g.emoji}</div>
                <div style={{fontSize:11}}>{g.name}</div>
                <div style={{fontSize:11,color:'#ffcc00'}}>{g.coins} coins</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CAMERA SYSTEM */}
      <div style={{background:'#111',padding:15,margin:10,borderRadius:15}}>
        <h3>📸 ক্যামেরা - 720P</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
          {['Speed','Beauty','Filters','Timer','Effects','Video','Photo','Live'].map(t=>(
            <span key={t} style={{background:'#222',padding:'8px 12px',borderRadius:20,fontSize:13}}>{t}</span>
          ))}
        </div>
        <p style={{marginTop:10,fontSize:13,color:'#aaa'}}>সূর্যাস্ত ব্যাকগ্রাউন্ড + 720P সিলেক্টর চালু আছে</p>
      </div>

      {/* 15 SYSTEM CARDS */}
      <div style={{padding:15}}>
        <h3>সিস্টেম কার্ড</h3>
        {['Trending','New','Live','Music','Dance','Comedy','News','Sports','Food','Travel','Gaming','Education','Love','Viral','Top'].map((c,i)=>(
          <div key={c} style={{background:'#222',padding:12,marginTop:8,borderRadius:10}}>#{i+1} {c} - SOT TOK</div>
        ))}
      </div>
    </div>
  )
}