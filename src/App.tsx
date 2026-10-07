import { useState, useRef, useEffect } from 'react'

export default function App(){
  const [page,setPage]=useState('home')
  const [coins,setCoins]=useState(()=>{
    try{ return Number(localStorage.getItem('MY_COINS')||'100') } catch { return 100 }
  })
  const [giftList]=useState([
    {id:1,name:'Love',price:10,icon:'L'},
    {id:2,name:'Rose',price:50,icon:'R'},
    {id:3,name:'Gift Box',price:100,icon:'G'},
    {id:4,name:'Diamond',price:500,icon:'D'},
    {id:5,name:'Crown',price:1000,icon:'C'},
    {id:6,name:'Rocket',price:5000,icon:'Rkt'},
  ])
  const [adminWallets,setAdminWallets]=useState<any>(()=>{
    try{
      return JSON.parse(localStorage.getItem('ALL_WALLETS')||'{"85953415":1250,"SOTF19D6786":2340}')
    }catch{
      return {"85953415":1250,"SOTF19D6786":2340}
    }
  })
  const videoRef=useRef<any>(null)
  const [beauty,setBeauty]=useState(50)
  const [filter,setFilter]=useState('none')

  useEffect(()=>{
    if(page==='camera' && navigator.mediaDevices){
      navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}}).then(s=>{
        if(videoRef.current) videoRef.current.srcObject=s
      }).catch(()=>{})
    }
  },[page])

  const sendGift=(gift:any)=>{
    if(coins < gift.price){
      if(confirm('Coin sesh dada! Bank theke Auto Recharge korbe?')){
        let amount = gift.price - coins + 100
        let bankBalance = Number(localStorage.getItem('BANK_BAL')||'5000')
        if(bankBalance >= amount){
          localStorage.setItem('BANK_BAL', String(bankBalance - amount))
          let newCoins = coins + amount
          setCoins(newCoins)
          localStorage.setItem('MY_COINS', String(newCoins))
          let newWallets = {...adminWallets}
          newWallets['85953415'] = (newWallets['85953415']||0) + gift.price*0.5
          newWallets['SOTF19D6786'] = (newWallets['SOTF19D6786']||0) + gift.price*0.5
          setAdminWallets(newWallets)
          localStorage.setItem('ALL_WALLETS', JSON.stringify(newWallets))
          alert('Auto Recharge holo dada!')
          setCoins(c=>{let nc=c-gift.price; localStorage.setItem('MY_COINS',String(nc)); return nc})
        }else{ alert('Bank e taka nei dada!') }
      }
      return
    }
    setCoins(c=>{
      let nc=c-gift.price
      localStorage.setItem('MY_COINS', String(nc))
      return nc
    })
    let newWallets = {...adminWallets}
    newWallets['85953415'] = (newWallets['85953415']||0) + gift.price*0.5
    newWallets['SOTF19D6786'] = (newWallets['SOTF19D6786']||0) + gift.price*0.5
    setAdminWallets(newWallets)
    localStorage.setItem('ALL_WALLETS', JSON.stringify(newWallets))
    alert(gift.name + ' pathano holo dada!')
  }

  return(
    <div style={{background:'black', color:'white', minHeight:'100vh', paddingBottom:60}}>
      <div style={{display:'flex', justifyContent:'space-between', padding:12, position:'fixed', top:0, width:'100%', background:'black', zIndex:99, borderBottom:'1px solid #222'}}>
        <b onClick={()=>setPage('home')}>SOT TOK</b>
        <div style={{display:'flex', gap:8}}>
          <span style={{background:'#222', padding:'4px 10px', borderRadius:20}}>Coin {coins}</span>
          <button onClick={()=>setPage('camera')} style={{background:'#ff0050', padding:'4px 12px', borderRadius:20, color:'white'}}>Camera</button>
          <button onClick={()=>setPage('admin')} style={{background:'#16a34a', padding:'4px 12px', borderRadius:20, color:'white'}}>Admin</button>
        </div>
      </div>

      {page==='home' && <div style={{paddingTop:60}}>
        <div style={{height:'60vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <p>Video Playing - @kolkataofficial</p>
        </div>
        <div style={{padding:12}}>
          <h3 style={{fontWeight:900}}>Gift Pathao - Dam Lekha Ache Dada</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:10}}>
            {giftList.map((g:any)=>(
              <div key={g.id} onClick={()=>sendGift(g)} style={{background:'#1a1a1a', padding:12, borderRadius:16, textAlign:'center', border:'1px solid #333'}}>
                <div style={{fontSize:24, fontWeight:900}}>{g.icon}</div>
                <p style={{fontWeight:'bold', fontSize:12}}>{g.name}</p>
                <p style={{color:'#ff0050