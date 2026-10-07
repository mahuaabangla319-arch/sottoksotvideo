import { useState, useRef, useEffect } from 'react'

export default function App(){
  const [page,setPage]=useState('home')
  const [coins,setCoins]=useState(()=>Number(localStorage.getItem('MY_COINS')||100))
  const [giftList]=useState([
    {id:1,name:'❤️ Love',price:10,icon:'❤️'},
    {id:2,name:'🌹 Rose',price:50,icon:'🌹'},
    {id:3,name:'🎁 Gift Box',price:100,icon:'🎁'},
    {id:4,name:'💎 Diamond',price:500,icon:'💎'},
    {id:5,name:'👑 Crown',price:1000,icon:'👑'},
    {id:6,name:'🚀 Rocket',price:5000,icon:'🚀'},
  ])
  const [adminWallets,setAdminWallets]=useState<any>(()=>{
    return JSON.parse(localStorage.getItem('ALL_WALLETS')||'{"85953415":1250,"SOTF19D6786":2340}')
  })
  const videoRef=useRef<any>(null)
  const [beauty,setBeauty]=useState(50)
  const [filter,setFilter]=useState('none')

  // Camera Start - Beautiful Camera
  useEffect(()=>{
    if(page==='camera' && navigator.mediaDevices){
      navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}}).then(s=>{
        if(videoRef.current) videoRef.current.srcObject=s
      })
    }
  },[page])

  const sendGift=(gift:any)=>{
    if(coins < gift.price){
      if(confirm(`Coin শেষ দাদা! ${gift.price} coin লাগবে। Bank থেকে Auto Recharge করবে?`)){
        // Auto Recharge from Bank
        let amount = gift.price - coins
        let bankBalance = Number(localStorage.getItem('BANK_BAL')||5000)
        if(bankBalance >= amount){
          localStorage.setItem('BANK_BAL', String(bankBalance - amount))
          let newCoins = coins + amount + 100
          setCoins(newCoins)
          localStorage.setItem('MY_COINS', String(newCoins))

          // Admin এর কাছে টাকা Add হবে
          let newWallets = {...adminWallets}
          newWallets['85953415'] = (newWallets['85953415']||0) + amount*0.5
          newWallets['SOTF19D6786'] = (newWallets['SOTF19D6786']||0) + amount*0.5
          setAdminWallets(newWallets)
          localStorage.setItem('ALL_WALLETS', JSON.stringify(newWallets))

          alert(`✅ Auto Recharge হয়ে গেছে দাদা! Bank থেকে ₹${amount} কেটে ${gift.price} Coin Add হলো। Admin এর কাছে টাকা গেলো।`)
          setCoins(c=>c-gift.price)
        }else{
          alert('Bank এ টাকা নেই দাদা!')
        }
      }
      return
    }
    setCoins(c=>{
      let nc=c-gift.price
      localStorage.setItem('MY_COINS', String(nc))
      return nc
    })
    let newWallets = {...adminWallets}
    newWallets['85953415'] += gift.price*0.5
    newWallets['SOTF19D6786'] += gift.price*0.5
    setAdminWallets(newWallets)
    localStorage.setItem('ALL_WALLETS', JSON.stringify(newWallets))
    alert(`${gift.icon} ${gift.name} পাঠানো হলো দাদা! Admin এর কাছে ₹${gift.price*0.95} গেলো`)
  }

  return(
    <div style={{background:'black', color:'white', minHeight:'100vh'}}>
      {/* Top */}
      <div style={{display:'flex', justifyContent:'space-between', padding:12, position:'fixed', top:0, width:'100%', background:'black', zIndex:99, borderBottom:'1px solid #222'}}>
        <b onClick={()=>setPage('home')}>SOT TOK 🔥</b>
        <div style={{display:'flex', gap:8}}>
          <span style={{background:'#222', padding:'4px 10px', borderRadius:20}}>💰 {coins}</span>
          <button onClick={()=>setPage('camera')} style={{background:'#ff0050', padding:'4px 12px', borderRadius:20}}>📸 Camera</button>
          <button onClick={()=>setPage('admin')} style={{background:'#16a34a', padding:'4px 12px', borderRadius:20}}>Admin</button>
        </div>
      </div>

      {/* HOME - Video + Gift */}
      {page==='home' && <div style={{paddingTop:60, paddingBottom:70}}>
        <div style={{height:'70vh', background:'#111', position:'relative', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <p>🎬 Video Playing - @kolkataofficial</p>
          <div style={{position:'absolute', right:10, bottom:10, display:'flex', flexDirection:'column', gap:10}}>
            {giftList.slice(0,3).map(g=>(
              <button key={g.id} onClick={()=>sendGift(g)} style={{background:'#222', padding:8, borderRadius:10, border:'1px solid #ff0050'}}>
                <div>{g.icon}</div><div style={{fontSize:10}}>{g.price}c</div>
              </button>
            ))}
          </div>
        </div>

        {/* All Gifts - Price Lekha */}
        <div style={{padding:12}}>
          <h3 style={{fontWeight:900}}>🎁 Gift পাঠাও - দাম লেখা আছে দাদা</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:10}}>
            {giftList.map(g=>(
              <div key={g.id} onClick={()=>sendGift(g)} style={{background:'#1a1a1a', padding:12, borderRadius:16, textAlign:'center', border:'1px solid #333'}}>
                <div style={{fontSize:32}}>{g.icon}</div>
                <p style={{fontWeight:'bold', fontSize:12}}>{g.name}</p>
                <p style={{color:'#ff0050', fontWeight:900}}>{g.price} Coins</p>
                <p style={{fontSize:10, color:'#aaa'}}>≈ ₹{g.price*0.95}</p>
                <button style={{width:'100%', background:'#ff0050', color:'white', padding:6, borderRadius:10, marginTop:6, fontWeight:900}}>Send</button>
              </div>
            ))}
          </div>

          {/* Auto Recharge Box */}
          <div style={{background:'#1a1a1a', padding:12, borderRadius:16, marginTop:16, border:'1px solid #16a34a'}}>
            <p style={{fontWeight:900}}>🏦 Auto Recharge - Bank থেকে</p>
            <p style={{fontSize:12, color:'#aaa'}}>Coin শেষ হলে Auto Bank থেকে কাটবে দাদা</p>
            <p style={{marginTop:8}}>Bank Balance: ₹{localStorage.getItem('BANK_BAL')||5000}</p>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button onClick={()=>{localStorage.setItem('BANK_BAL','5000'); alert('Bank Add হলো দাদা'); location.reload()}} style={{flex:1, background:'#16a34a', padding:10, borderRadius:10, fontWeight:900}}>+ ₹5000 Add to Bank</button>
              <button onClick={()=>{let nc=coins+100; setCoins(nc); localStorage.setItem('MY_COINS',String(nc))}} style={{flex:1, background:'#333', padding:10, borderRadius:10}}>+100 Coin Free</button>
            </div>
            <p style={{fontSize:10, color:'#aaa', marginTop:8}}>UPI AutoPay ON - HDFC ****1234</p>
          </div>
        </div>
      </div>}

      {/* BEAUTIFUL CAMERA */}
      {page==='camera' && <div style={{paddingTop:60, height:'100vh', background:'black', position:'relative'}}>
        <video ref={videoRef} autoPlay playsInline muted style={{width:'100%', height:'80vh', objectFit:'cover', filter:`brightness(${100+beauty/2}%) ${filter}`}}></video>

        <div style={{position:'absolute', bottom:100, width:'100%', padding:12}}>
          <p style={{fontWeight:900, textAlign:'center'}}>✨ Beautiful Camera - সুন্দর হবে দাদা</p>
          <div style={{display:'flex', gap:8, marginTop:10, overflowX:'auto'}}>
            <button onClick={()=>setFilter('none')} style={{background:filter==='none'?'#ff0050':'#222', padding:'8px 12px', borderRadius:20, whiteSpace:'nowrap'}}>Original</button>
            <button onClick={()=>setFilter('contrast(1.2) saturate(1.5)')} style={{background:'#222', padding:'8px 12px', borderRadius:20}}>💖 Lovely</button>
            <button onClick={()=>setFilter('sepia(0.3)')} style={{background:'#222', padding:'8px 12px', borderRadius:20}}>🌸 Soft</button>
            <button onClick={()=>setFilter('brightness(1.2) blur(0.5px)')} style={{background:'#222', padding:'8px 12px', borderRadius:20}}>✨ Beauty</button>
            <button onClick={()=>setFilter('grayscale(1)')} style={{background:'#222', padding:'8px 12px', borderRadius:20}}>B&W</button>
          </div>
          <div style={{marginTop:12}}>
            <p style={{fontSize:12}}>Beauty Level: {beauty}%</p>
            <input type="range" min="0" max="100" value={beauty} onChange={(e)=>setBeauty(Number(e.target.value))} style={{width:'100%'}} />
          </div>
          <div style={{display:'flex', gap:10, marginTop:12}}>
            <button style={{flex:1, background:'#333', padding:14, borderRadius:30}}>🔄 Flip</button>
            <button style={{flex:1, background:'#ff0050', padding:14, borderRadius:30, fontWeight:900, fontSize:18}}>● REC</button>
            <button style={{flex:1, background:'#333', padding:14, borderRadius:30}}>⚡ Flash</button>
          </div>
        </div>
      </div>}

      {/* ADMIN BUSINESS PANEL */}
      {page==='admin' && <div style={{paddingTop:70, padding:12}}>
        <h2 style={{fontWeight:900, fontSize:22}}>💼 Admin Business Panel - টাকা তোলার রাস্তা</h2>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12}}>
          <div style={{background:'#1a1a1a', padding:16, borderRadius:16, border:'1px solid #16a34a'}}>
            <p style={{color:'#aaa'}}>Total Revenue</p>
            <p style={{fontSize:24, fontWeight:900, color:'#16a34a'}}>₹{Object.values(adminWallets).reduce((a:any,b:any)=>a+b,0)}</p>
          </div>
          <div style={{background:'#1a1a1a', padding:16, borderRadius:16}}>
            <p style={{color:'#aaa'}}>Today Gifts</p>
            <p style={{fontSize:24, fontWeight:900}}>₹{Math.floor(Object.values(adminWallets).reduce((a:any,b:any)=>a+b,0)*0.3)}</p>
          </div>
        </div>

        {/* Violation / User Accounts */}
        <div style={{background:'#1a1a1a', padding:12, borderRadius:16, marginTop:12}}>
          <p style={{fontWeight:900}}>👥 সব User এর Account - Violation Check</p>
          {Object.entries(adminWallets).map(([id, bal]:any)=>(
            <div key={id} style={{display:'flex', justifyContent:'space-between', background:'#222', padding:12, borderRadius:12, marginTop:8}}>
              <div>
                <p style={{fontWeight:'bold'}}>@{id}</p>
                <p style={{fontSize:12, color:bal>1000?'#16a34a':'#ffaa00'}}>{bal>1000?'✅ Good':'⚠️ Low Violation'}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontWeight:900}}>₹{bal}</p>
                <button onClick={()=>alert(id