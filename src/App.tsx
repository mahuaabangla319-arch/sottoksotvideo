import { useState, useRef } from 'react'

export default function App(){
  const [coins,setCoins]=useState(1250)
  const [diamonds,setDiamonds]=useState(340)
  const [mainWallet,setMainWallet]=useState(2500)
  const [admin1,setAdmin1]=useState(1250)
  const [admin2,setAdmin2]=useState(1250)
  const [showGift,setShowGift]=useState(false)
  const [showLudo,setShowLudo]=useState(false)
  const [isMic,setIsMic]=useState(false)
  const [isVideo,setIsVideo]=useState(false)
  const [myPos,setMyPos]=useState(0)
  const [chat,setChat]=useState([{u:'System',m:'সব অনলাইন ইউজার Auto Connect হলো!'}])
  const [msg,setMsg]=useState('')
  
  const onlineUsers=[
    {id:1,name:'@mahatohimanshu755',avatar:'https://i.pravatar.cc/100?img=3',online:true},
    {id:2,name:'@sottokofficial',avatar:'https://i.pravatar.cc/100?img=5',online:true},
    {id:3,name:'@kolkata_girl',avatar:'https://i.pravatar.cc/100?img=11',online:true},
    {id:4,name:'@gamer_boy',avatar:'https://i.pravatar.cc/100?img=12',online:true},
  ]

  const gifts=[
    {name:'Free',icon:'✨',price:0},{name:'Rose',icon:'🌹',price:10},
    {name:'Heart',icon:'💖',price:50},{name:'Crown',icon:'👑',price:100},
    {name:'Elephant',icon:'🐘',price:500},{name:'Diamond',icon:'💎',price:1000},
    {name:'Car',icon:'🚗',price:5000},{name:'Trophy',icon:'🏆',price:10000},
    {name:'Lion',icon:'🦁',price:2000},{name:'Rocket',icon:'🚀',price:3000},
  ]

  const sendGift=(g:any)=>{
    if(coins<g.price){alert('Coin নেই!');return}
    if(g.price>0){setCoins(coins-g.price);setDiamonds(diamonds+g.price*0.8);setAdmin1(admin1+g.price*0.1);setAdmin2(admin2+g.price*0.1)}
    setChat([...chat,{u:'Tumi',m:`${g.icon} ${g.name} পাঠালে`}])
    setShowGift(false)
  }

  const joinLudo=(fee:number)=>{
    if(mainWallet<fee){alert('Main Wallet e taka nei');return}
    setMainWallet(mainWallet-fee)
    setShowLudo(true)
    setChat([{u:'System',m:`₹${fee} Table e ${onlineUsers.length} জন Auto Connect হলো! Video Call শুরু!`}])
  }

  const roll=()=>{
    let d=Math.floor(Math.random()*6)+1
    let np=myPos+d
    if(np>=100){np=100; let win=100*0.9; setMainWallet(mainWallet+win); alert(`জিতে গেলে! ₹${win}`)}
    setMyPos(np)
    setChat(c=>[...c,{u:'Tumi',m:`🎲 ${d} - Pos ${np}/100`}])
  }

  return(
    <div style={{background:'black',color:'white',minHeight:'100vh',maxWidth:420,margin:'0 auto',position:'relative'}}>
      {/* For You */}
      <div style={{display:'flex',justifyContent:'center',gap:30,padding:12,position:'fixed',top:0,width:'100%',maxWidth:420,background:'black',zIndex:10}}>
        <span style={{color:'#666'}}>Following</span><b style={{borderBottom:'2px solid white'}}>For You</b>
      </div>
      
      <div style={{paddingTop:50,height:'65vh',display:'flex',justifyContent:'space-between',padding:16,alignItems:'flex-end',background:'linear-gradient(transparent,#111)'}}>
        <div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}><img src="https://i.pravatar.cc/100?img=3" style={{width:44,height:44,borderRadius:'50%',border:'2px solid #a855f7'}}/><span style={{background:'#a855f7',padding:'4px 12px',borderRadius:20,fontSize:12}}>+ Follow</span></div>
          <p style={{fontSize:11,marginTop:8}}>SOT TOK • ID: 96216703</p><b style={{fontSize:13}}>@mahatohimanshu755</b>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16,alignItems:'center'}}>
          <div>❤️<br/><span style={{fontSize:10}}>0</span></div>
          <div>💬<br/><span style={{fontSize:10}}>0</span></div>
          <div onClick={()=>setShowGift(true)} style={{background:'#a855f7',padding:'8px',borderRadius:'50%'}}>🎁<br/><span style={{fontSize:9}}>Gift</span></div>
          <div>🔗<br/><span style={{fontSize:9}}>Share</span></div>
        </div>
      </div>

      {/* LUDO ICON - নিচের দিকে */}
      <div style={{display:'flex',justifyContent:'center',gap:8,padding:'0 12px'}}>
        {[10,50,100].map(f=><button key={f} onClick={()=>joinLudo(f)} style={{flex:1,background:'#facc15',color:'black',border:'none',padding:10,borderRadius:12,fontWeight:900}}>🎲 LUDO ₹{f}</button>)}
      </div>

      {/* Gift Panel - Video te touch korle */}
      {showGift && (
        <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'#121212',borderRadius:'20px 20px 0 0',zIndex:50,borderTop:'1px solid #333'}}>
          {/* Wallet */}
          <div style={{margin:12,background:'#1e1e1e',borderRadius:16,padding:12}}>
            <b>👜 Wallet</b>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:13}}><span>👜 Main Wallet</span><b style={{color:'#facc15'}}>Rs {mainWallet}</b></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span>🪙 Coins</span><b>{coins}</b></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span>💎 Diamonds</span><b>{diamonds}</b></div>
            <div style={{display:'flex',gap:8,marginTop:8}}><button style={{flex:1,border:'1px solid #a855f7',background:'transparent',color:'#a855f7',padding:6,borderRadius:20,fontSize:11}}>Withdraw ↓</button><button style={{flex:1,background:'#a855f7',border:'none',color:'white',padding:6,borderRadius:20,fontSize:11}}>Recharge +⚡</button></div>
            <p style={{fontSize:9,textAlign:'center',color:'#aaa',marginTop:6}}>100 Diamonds = Rs 80</p>
          </div>
          {/* Gift Grid */}
          <div style={{padding:12}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><b>🎁 গিফট পাঠান</b><span onClick={()=>setShowGift(false)} style={{background:'#222',padding:'4px 10px',borderRadius:20}}>✕</span></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginTop:10}}>
              {gifts.map(g=><div key={g.name} onClick={()=>sendGift(g)} style={{background:'#1e1e1e',borderRadius:10,padding:8,textAlign:'center'}}><div style={{fontSize:20}}>{g.icon}</div><div style={{fontSize:9}}>{g.name}</div><div style={{fontSize:8,color:'#facc15'}}>{g.price}</div></div>)}
            </div>
          </div>
        </div>
      )}

      {/* LUDO ROOM - Video/Audio Call + Game */}
      {showLudo && (
        <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,height:'100%',background:'#0a0a14',zIndex:60,display:'flex',flexDirection:'column'}}>
          <div style={{padding:10,background:'#1a1a2e',display:'flex',justifyContent:'space-between'}}>
            <b>🎲 LUDO - Video Call Room ({onlineUsers.length} Online)</b>
            <button onClick={()=>setShowLudo(false)} style={{background:'#333',border:'none',color:'white',padding:'6px 12px',borderRadius:20}}>✕</button>
          </div>

          {/* Video Call Grid - 4 জন */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,padding:6}}>
            {onlineUsers.map(u=>(
              <div key={u.id} style={{background:'#1e1e1e',height:110,borderRadius:12,position:'relative',overflow:'hidden',border: u.name==='@mahatohimanshu755'?'2px solid #facc15':'1px solid #333'}}>
                <img src={u.avatar} style={{width:'100%',height:'100%',objectFit:'cover',opacity:isVideo?1:0.3}}/>
                <div style={{position:'absolute',bottom:4,left:4,background:'rgba(0,0,0,0.7)',padding:'2px 6px',borderRadius:10,fontSize:9}}>{u.name} {isMic?'🎤':''} {u.online?'🟢':''}</div>
                {!isVideo && <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:24}}>👤</div>}
              </div>
            ))}
          </div>

          <div style={{display:'flex',justifyContent:'center',gap:10,padding:8}}>
            <button onClick={()=>setIsMic(!isMic)} style={{background:isMic?'#16a34a':'#333',border:'none',color:'white',padding:'8px 16px',borderRadius:20,fontSize:12}}>{isMic?'🎤 Mic ON':'🔇 Mic OFF'}</button>
            <button onClick={()=>setIsVideo(!isVideo)} style={{background:isVideo?'#2563eb':'#333',border:'none',color:'white',padding:'8px 16px',borderRadius:20,fontSize:12}}>{isVideo?'📹 Video ON':'📷 Video OFF'}</button>
          </div>

          {/* Board */}
          <div style={{background:'#1e1e1e',margin:8,borderRadius:12,padding:12,textAlign:'center'}}>
            <div style={{height:100,background:'linear-gradient(45deg,#ff0050,#a855f7)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <div style={{position:'absolute',left:`${myPos}%`,transition:'0.5s',background:'white',width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>🐯</div>
              <b>{myPos}/100</b>
            </div>
            <button onClick={roll} style={{marginTop:10,background:'#facc15',color:'black',border:'none',padding:'10px 24px',borderRadius:20,fontWeight:900}}>🎲 ROLL</button>
          </div>

          {/* Chat */}
          <div style={{flex:1,background:'#121212',display:'flex',flexDirection:'column'}}>
            <div style={{flex:1,overflowY:'auto',padding:8}}>
              {chat.map((c,i)=><div key={i} style={{fontSize:12,marginBottom:4}}><b style={{color:'#a855f7'}}>{c.u}:</b> {c.m}</div>)}
            </div>
            <div style={{display:'flex',gap:6,padding:8}}>
              <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="বলো..." style={{flex:1,background:'#1e1e1e',border:'none',padding:8,borderRadius:20,color:'white'}}/>
              <button onClick={()=>{if(msg){setChat([...chat,{u:'Tumi',m:msg}]);setMsg('')}}} style={{background:'#a855f7',border:'none',color:'white',padding:'8px 14px',borderRadius:20}}>Send</button>
            </div>
          </div>
        </div>
      )}

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:420,background:'black',display:'flex',justifyContent:'space-around',padding:8,borderTop:'1px solid #222'}}>
        <span style={{color:'#ff0050'}}>🏠 হোম</span><span>🧭 এক্সপ্লোরার</span><span onClick={()=>setShowLudo(true)} style={{background:'#facc15',color:'black',padding:'6px 14px',borderRadius:10}}>🎲 Ludo</span><span>🔔 ইনবক্স</span><span>👤 প্রোফাইল</span>
      </div>
    </div>
  )
}