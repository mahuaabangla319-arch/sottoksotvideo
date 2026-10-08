import { useState } from 'react'

export default function App(){
  const [coins,setCoins]=useState(1250)
  const [diamonds,setDiamonds]=useState(340)
  const [mainWallet,setMainWallet]=useState(2500)
  const [admin1,setAdmin1]=useState(1250)
  const [admin2,setAdmin2]=useState(1250)
  const [showRecharge,setShowRecharge]=useState(false)
  const [showWithdraw,setShowWithdraw]=useState(false)

  const gifts=[
    {id:1,name:'Free',icon:'✨',price:0},
    {id:2,name:'Rose',icon:'🌹',price:10},
    {id:3,name:'Heart',icon:'💖',price:50},
    {id:4,name:'Crown',icon:'👑',price:100},
    {id:5,name:'Elephant',icon:'🐘',price:500},
    {id:6,name:'Diamond',icon:'💎',price:1000},
    {id:7,name:'Car',icon:'🚗',price:5000},
    {id:8,name:'Super Trophy',icon:'🏆',price:10000},
    {id:9,name:'Lion',icon:'🦁',price:2000},
    {id:10,name:'Rocket',icon:'🚀',price:3000},
  ]

  const sendGift=(gift:any)=>{
    if(gift.price===0){
      alert('Free Gift Sent!')
      return
    }
    if(coins < gift.price){
      alert(`Coin sesh dada! ${gift.price} coin lagbe, tomar ache ${coins}. Recharge koro!`)
      setShowRecharge(true)
      return
    }
    // Coin কাটবে
    setCoins(coins - gift.price)
    // Diamonds এ Add হবে Creator এর (80% Creator, 20% Admin)
    let creatorDiamond = gift.price * 0.80
    let adminCut = gift.price * 0.20
    setDiamonds(diamonds + creatorDiamond)
    // 2 Admin এ ভাগ
    setAdmin1(admin1 + adminCut*0.5)
    setAdmin2(admin2 + adminCut*0.5)
    alert(`${gift.icon} ${gift.name} Sent! ${gift.price} Coin katlo. Creator pelo ${creatorDiamond} Diamond`)
  }

  const handleRecharge=(amount:number, coin:number)=>{
    // Google Play 15% কাটবে
    let googleCut = amount * 0.15
    let remaining = amount - googleCut
    let a1 = remaining * 0.5
    let a2 = remaining * 0.5
    setCoins(coins + coin)
    setMainWallet(mainWallet + amount) // Recharge এ Main Wallet এও Add
    setAdmin1(admin1 + a1)
    setAdmin2(admin2 + a2)
    setShowRecharge(false)
    alert(`Recharge Success! ${coin} Coin pelo. Google katlo ${googleCut} Taka, Admin1: ${a1} Taka, Admin2: ${a2} Taka`)
  }

  const handleWithdraw=()=>{
    if(diamonds < 100){
      alert('100 Diamond na hole withdraw hobe na dada!')
      return
    }
    let rs = (diamonds/100)*80
    setMainWallet(mainWallet + rs)
    setDiamonds(0)
    setShowWithdraw(false)
    alert(`${diamonds} Diamond = Rs ${rs} Main Wallet e gelo! UPI te withdraw korte parbe`)
  }

  return(
    <div style={{background:'black', color:'white', minHeight:'100vh', fontFamily:'system-ui', maxWidth:420, margin:'0 auto', position:'relative', paddingBottom:70}}>
      
      {/* Top - Following / For You */}
      <div style={{display:'flex', justifyContent:'center', gap:20, padding:12, position:'fixed', top:0, width:'100%', maxWidth:420, background:'black', zIndex:20}}>
        <span style={{color:'#666'}}>Following</span>
        <span style={{fontWeight:900}}>For You</span>
      </div>

      {/* Filter */}
      <div style={{paddingTop:45, display:'flex', justifyContent:'center'}}>
        <div style={{background:'#1a1a1a', borderRadius:20, padding:'6px 14px', fontSize:13, display:'flex', gap:10, alignItems:'center'}}>
          <span>পছন্দের বিষয়</span><span style={{background:'#222', padding:'4px 10px', borderRadius:20}}>সব ▼</span>
        </div>
      </div>

      <p style={{textAlign:'right', padding:'10px 16px 0', fontSize:11, color:'#aaa'}}>Tap for sound</p>

      {/* Profile + Video Area */}
      <div style={{padding:'10px 16px', display:'flex', justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <img src="https://i.pravatar.cc/100?img=11" style={{width:56, height:56, borderRadius:'50%', border:'2px solid white'}} />
          <div>
            <button style={{background:'#ff0050', border:'none', color:'white', padding:'6px 16px', borderRadius:20, fontWeight:900, fontSize:13}}>+ Follow</button>
            <p style={{margin:'6px 0 0', fontSize:13, fontWeight:900}}>SOT TOK • ID: 96216703</p>
            <p style={{margin:0, fontSize:11, color:'#aaa'}}>@mahatohimanshu755</p>
          </div>
        </div>
        {/* Right Side Icons */}
        <div style={{display:'flex', flexDirection:'column', gap:16, alignItems:'center', paddingTop:10}}>
          <div style={{textAlign:'center'}}><div style={{fontSize:28}}>❤️</div><span style={{fontSize:11}}>2</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:24}}>💬</div><span style={{fontSize:11}}>0</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:24}}>🎁</div><span style={{fontSize:11}}>1</span></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:22}}>🔗</div><span style={{fontSize:10}}>Share</span></div>
        </div>
      </div>

      {/* WALLET - তোমার Screenshot এর মতো */}
      <div style={{margin:'0 12px', background:'#1e1e1e', borderRadius:16, padding:12, border:'1px solid #333'}}>
        <p style={{fontWeight:900, margin:'0 0 10px', display:'flex', gap:6, alignItems:'center'}}>👜 Wallet</p>
        
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
          <span style={{display:'flex', gap:6, fontSize:13, color:'#ccc'}}>👜 Main Wallet</span>
          <b style={{fontSize:13}}>Rs {mainWallet}</b>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
          <span style={{display:'flex', gap:6, fontSize:13, color:'#ccc'}}>🪙 Coins</span>
          <b style={{fontSize:13}}>{coins}</b>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
          <span style={{display:'flex', gap:6, fontSize:13, color:'#ccc'}}>💎 Diamonds</span>
          <b style={{fontSize:13}}>{diamonds}</b>
        </div>

        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>setShowWithdraw(true)} style={{flex:1, background:'transparent', border:'1px solid #a855f7', color:'#a855f7', padding:8, borderRadius:20, fontSize:12, fontWeight:900}}>Withdraw Diamonds ↓</button>
          <button onClick={()=>setShowRecharge(true)} style={{flex:1, background:'#a855f7', border:'none', color:'white', padding:8, borderRadius:20, fontSize:12, fontWeight:900}}>Recharge +⚡</button>
        </div>

        <p style={{fontSize:11, color:'#aaa', textAlign:'center', margin:'8px 0 0'}}>Exchange Rate: 100 Diamonds = Rs 80 ⓘ</p>
      </div>

      {/* GIFT PANEL - গিফট পাঠান */}
      <div style={{marginTop:12, background:'#121212', borderRadius:20, padding:12, border:'1px solid #222'}}>
        <p style={{textAlign:'center', fontWeight:900, margin:'0 0 12px'}}>🎁 গিফট পাঠান</p>
        
        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8}}>
          {gifts.map(g=>(
            <div key={g.id} onClick={()=>sendGift(g)} style={{background:'#1e1e1e', borderRadius:12, padding:'10px 4px', textAlign:'center', border:'1px solid #333', cursor:'pointer'}}>
              <div style={{fontSize:22}}>{g.icon}</div>
              <p style={{fontSize:11, margin:'4px 0 0', fontWeight:600}}>{g.name}</p>
              <p style={{fontSize:10, margin:0, color:'#aaa'}}>{g.price}</p>
            </div>
          ))}
        </div>

        {/* Ludo Cash Game - তোমার নতুন আইডিয়া */}
        <div style={{marginTop:12, background:'#1a0a2e', borderRadius:12, padding:10, border:'1px solid #a855f7'}}>
          <p style={{margin:0, fontSize:12, fontWeight:900, color:'#facc15'}}>🎲 LUDO CASH GAME - টাকা দিয়ে খেলো, টাকা জেতো</p>
          <p style={{margin:'2px 0', fontSize:10, color:'#aaa'}}>Recharge করে খেলো, জিতলে Main Wallet এ টাকা পাবে - কয়েন না</p>
          <div style={{display:'flex', gap:6, marginTop:6}}>
            {[10,50,100].map(fee=>(
              <button key={fee} onClick={()=>{
                if(mainWallet<fee){alert('Taka nei! Recharge koro'); return}
                setMainWallet(mainWallet-fee)
                let win=fee*2*0.9
                if(Math.random()>0.5){setMainWallet(mainWallet-fee+win); alert(`Jitle! ${win} Taka pele`)}else{alert('Harle!')}
              }} style={{flex:1, background:'#a855f7', border:'none', color:'white', padding:6, borderRadius:8, fontSize:11, fontWeight:900}}>₹{fee}</button>
            ))}
          </div>
        </div>
      </div>

      {/* RECHARGE POPUP - UPI / GPay */}
      {showRecharge && <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.9)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div style={{background:'#1e1e1e', width:'100%', maxWidth:360, borderRadius:20, padding:16}}>
          <h3 style={{margin:0}}>Recharge - Coin Kino</h3>
          <p style={{fontSize:11, color:'#aaa'}}>Google 15% katbe, baki 85 Taka 2 admin e 50/50</p>
          
          {[
            {rs:50, coin:200},
            {rs:100, coin:600, tag:'DHAMAKA 9-12 Oct'},
            {rs:500, coin:3500},
            {rs:1000, coin:8000},
          ].map(p=>(
            <div key={p.rs} onClick={()=>handleRecharge(p.rs,p.coin)} style={{background:'#2a2a2a', borderRadius:12, padding:12, marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center', border: p.tag?'1px solid gold':''}}>
              <div>
                <b>₹{p.rs} = {p.coin} Coins</b>
                {p.tag && <span style={{background:'gold', color:'black', fontSize:9, padding:'2px 6px', borderRadius:10, marginLeft:6}}>{p.tag}</span>}
                <p style={{fontSize:10, margin:0, color:'#aaa'}}>Admin1: {(p.rs*0.85*0.5).toFixed(2)} | Admin2: {(p.rs*0.85*0.5).toFixed(2)}</p>
              </div>
              <button style={{background:'#ff0050', border:'none', color:'white', padding:'6px 12px', borderRadius:20, fontSize:12}}>Buy</button>
            </div>
          ))}

          <p style={{fontSize:11, textAlign:'center', marginTop:10}}>GPay / PhonePe / UPI দিয়ে Pay হবে</p>
          <div style={{display:'flex', gap:8}}>
            <a href="upi://pay?pa=sottok@oksbi&pn=SOT TOK&am=100&cu=INR" style={{flex:1, background:'#4285F4', color:'white', padding:10, borderRadius:10, textAlign:'center', textDecoration:'none', fontSize:13, fontWeight:900}}>G Pay</a>
            <a href="upi://pay?pa=sottok@oksbi&pn=SOT TOK&am=100&cu=INR" style={{flex:1, background:'#5f259f', color:'white', padding:10, borderRadius:10, textAlign:'center', textDecoration:'none', fontSize:13, fontWeight:900}}>PhonePe</a>
          </div>
          <button onClick={()=>setShowRecharge(false)} style={{width:'100%', marginTop:10, background:'#333', border:'none', color:'white', padding:10, borderRadius:10}}>Close</button>
        </div>
      </div>}

      {/* WITHDRAW POPUP */}
      {showWithdraw && <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.9)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div style={{background:'#1e1e1e', width:'100%', maxWidth:340, borderRadius:20, padding:16, textAlign:'center'}}>
          <h3 style={{margin:0}}>Withdraw Diamonds</h3>
          <p style={{fontSize:32, fontWeight:900, margin:'10px 0'}}>{diamonds} 💎 = Rs {(diamonds/100*80).toFixed(2)}</p>
          <p style={{fontSize:11, color:'#aaa'}}>100 Diamond = Rs 80 • Main Wallet e jabe</p>
          <input placeholder="Tomar UPI ID - 8595@oksbi" style={{width:'100%', padding:12, borderRadius:10, border:'none', background:'#2a2a2a', color:'white', marginTop:10}} />
          <button onClick={handleWithdraw} style={{width:'100%', background:'#a855f7', border:'none', color:'white', padding:12, borderRadius:10, fontWeight:900, marginTop:10}}>Withdraw to Main Wallet</button>
          <button onClick={()=>setShowWithdraw(false)} style={{width:'100%', background:'#333', border:'none', color:'white', padding:10, borderRadius:10, marginTop:8}}>Close</button>
        </div>
      </div>}

      {/* Bottom Nav */}
      <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:420, background:'black', borderTop:'1px solid #222', display:'flex', justifyContent:'space-around', padding:'8px 0'}}>
        <div style={{textAlign:'center', color:'#a855f7'}}><div>🏠</div><span style={{fontSize:10}}>Home</span></div>
        <div style={{textAlign:'center', color:'#666'}}><div>🧭</div><span style={{fontSize:10}}>Explorer</span></div>
        <div style={{background:'#a855f7', width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22}}>+</div>
        <div style={{textAlign:'center', color:'#666'}}><div>🔔</div><span style={{fontSize:10}}>Inbox</span></div>
        <div style={{textAlign:'center', color:'#666'}}><div>👤</div><span style={{fontSize:10}}>Profile</span></div>
      </div>
    </div>
  )
}