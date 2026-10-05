import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export const Route = createFileRoute('/admin')({
  component: UltimateAdmin,
})

function UltimateAdmin() {
  const ALLOWED = ["85953415", "SOTF19D6786", "kolkataofficial", "sottokofficial"]
  const [isAdmin, setIsAdmin] = useState<boolean|null>(null)
  const [tab, setTab] = useState("Boost")
  const [vidId, setVidId] = useState("")
  const [amount, setAmount] = useState("1000")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const [notiTitle, setNotiTitle] = useState("")
  const [notiMsg, setNotiMsg] = useState("")
  const [verifyId, setVerifyId] = useState("")
  const [verifyDays, setVerifyDays] = useState("7")
  const [catchTitle, setCatchTitle] = useState("আপনি Verify ID পেয়েছেন!")
  const [catchMsg, setCatchMsg] = useState("7 দিনের জন্য Blue Tick")

  useEffect(()=>{ check() },[])
  const check = async () => {
    const { data:{user} } = await supabase.auth.getUser()
    if(!user){ setIsAdmin(false); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const ok = ALLOWED.some(id=> (p?.sot_id||"").toLowerCase().includes(id.toLowerCase()) || (p?.username||"").toLowerCase()===id.toLowerCase())
    setIsAdmin(ok)
  }

  const notify = (m:string)=>{ setMsg(m); setTimeout(()=>setMsg(""),4000) }

  if(isAdmin===null) return <div style={{background:'#000', color:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Checking...</div>
  if(isAdmin===false) return <div style={{background:'#000', color:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}><h1>🔒 ACCESS DENIED</h1><p>Only @kolkataofficial & @sottokofficial</p></div>

  // 1. Boost + / -
  const doBoost = async (type:string, isMinus=false) => {
    if(!vidId) return notify("Video ID দাও")
    setLoading(true)
    try {
      const { data } = await supabase.from('videos').select('*').eq('id', vidId).single()
      const val = isMinus? -parseInt(amount) : parseInt(amount)
      const upd = type==='views'? {views: (data.views||0)+val, views_count:(data.views_count||0)+val} : {likes:(data.likes||0)+val, likes_count:(data.likes_count||0)+val}
      await supabase.from('videos').update(upd).eq('id', vidId)
      notify(`✅ ${isMinus?'কমালাম':'বাড়ালাম'} ${amount} ${type} - LIVE`)
    } catch(e:any){ notify("❌ "+e.message) }
    setLoading(false)
  }

  // 2. Banner already done

  // 3. Notification
  const sendNoti = async () => {
    await supabase.from('notifications').insert({title: notiTitle, message: notiMsg, target:'all'})
    notify("✅ Notification সবাইকে পাঠালাম - LIVE")
  }

  // 5. Verify with 7 days expiry
  const giveVerify = async () => {
    const until = new Date(); until.setDate(until.getDate()+parseInt(verifyDays))
    await supabase.from('profiles').update({is_verified:true, verification_type:'blue', verified_until: until.toISOString()}).or(`sot_id.eq.${verifyId},username.eq.${verifyId}`)
    notify(`✅ ${verifyId} কে ${verifyDays} দিনের Verify দিলাম - ${verifyDays} দিন পর Auto উঠে যাবে`)
  }

  // 7. Coin Wallet
  const updateCoin = async (isMinus=false) => {
    const val = isMinus? -parseInt(amount) : parseInt(amount)
    const { data } = await supabase.from('profiles').select('id').or(`sot_id.eq.${verifyId},username.eq.${verifyId}`).single()
    if(!data) return notify("User পাওয়া যায়নি")
    const { data: coin } = await supabase.from('user_coins').select('*').eq('user_id', data.id).single()
    const newCoin = (coin?.coins||0)+val
    await supabase.from('user_coins').upsert({user_id: data.id, coins: newCoin})
    notify(`✅ Coin ${isMinus?'কমালাম':'বাড়ালাম'} - এখন ${newCoin} Coin`)
  }

  // 9. Catch Card
  const createCatchCard = async () => {
    await supabase.from('catch_cards').insert({title: catchTitle, message: catchMsg, reward_type:'verify', reward_value:'7_days', duration_days: 7, is_active: true})
    notify("✅ Catch Card বানালাম - ভিডিও চলতে চলতে সবার কাছে আসবে")
  }

  return (
    <div style={{minHeight:'100vh', background:'#000', color:'#fff', padding:14, fontFamily:'sans-serif'}}>
      <h1 style={{color:'#3b82f6', fontWeight:900}}>SOT TOK - ULTIMATE ADMIN (2 ONLY)</h1>
      <p style={{background:'#111', padding:8, borderRadius:8, marginTop:8, color:'#22c55e', fontSize:12}}>{msg||"Ready - তোমরা 2 জন যা করবে সবাই দেখবে"}</p>

      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:15}}>
        {["Boost","Banner","Noti","Live","Verify","Camera","Wallet","Branding","CatchCard"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 12px', borderRadius:8, border:'none', background: tab===t?'#2563eb':'#222', color:'#fff', fontSize:12, fontWeight:'bold'}}>{t}</button>
        ))}
      </div>

      {tab==="Boost" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>1. Like / View বাড়াও / কমাও</h3>
          <input value={vidId} onChange={e=>setVidId(e.target.value)} placeholder="Video ID" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <div style={{display:'flex', gap:8, marginTop:10}}>
            <button onClick={()=>doBoost('views')} style={{flex:1, padding:10, background:'#22c55e', color:'#fff', border:'none', borderRadius:8}}>View +</button>
            <button onClick={()=>doBoost('views', true)} style={{flex:1, padding:10, background:'#ef4444', color:'#fff', border:'none', borderRadius:8}}>View -</button>
            <button onClick={()=>doBoost('likes')} style={{flex:1, padding:10, background:'#ec4899', color:'#fff', border:'none', borderRadius:8}}>Like +</button>
            <button onClick={()=>doBoost('likes', true)} style={{flex:1, padding:10, background:'#ef4444', color:'#fff', border:'none', borderRadius:8}}>Like -</button>
          </div>
        </div>
      )}

      {tab==="Noti" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>3. Notification সবাইকে</h3>
          <input value={notiTitle} onChange={e=>setNotiTitle(e.target.value)} placeholder="Title - e.g. New Update!" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <textarea value={notiMsg} onChange={e=>setNotiMsg(e.target.value)} placeholder="Message" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <button onClick={sendNoti} style={{width:'100%', padding:12, marginTop:10, background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:'bold'}}>Send To All Users LIVE</button>
        </div>
      )}

      {tab==="Verify" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>5. Verify ID - 7 দিন পর Auto Expire</h3>
          <input value={verifyId} onChange={e=>setVerifyId(e.target.value)} placeholder="SOT ID / Username" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <input value={verifyDays} onChange={e=>setVerifyDays(e.target.value)} placeholder="কত দিন? 7" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <button onClick={giveVerify} style={{width:'100%', padding:12, marginTop:10, background:'#f59e0b', color:'#000', border:'none', borderRadius:8, fontWeight:'bold'}}>{verifyDays} দিনের Verify দাও</button>
          <p style={{fontSize:11, color:'#888', marginTop:6}}>7 দিন পর Automatic Tick উঠে যাবে, Count হবে।</p>
        </div>
      )}

      {tab==="Wallet" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>7. Coin Wallet Control</h3>
          <input value={verifyId} onChange={e=>setVerifyId(e.target.value)} placeholder="User SOT ID" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Coin Amount" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <div style={{display:'flex', gap:8, marginTop:10}}>
            <button onClick={()=>updateCoin()} style={{flex:1, padding:10, background:'#22c55e', color:'#fff', border:'none', borderRadius:8}}>Coin +</button>
            <button onClick={()=>updateCoin(true)} style={{flex:1, padding:10, background:'#ef4444', color:'#fff', border:'none', borderRadius:8}}>Coin -</button>
            <button onClick={()=>updateCoin()} style={{flex:1, padding:10, background:'#3b82f6', color:'#fff', border:'none', borderRadius:8}}>Divert</button>
          </div>
        </div>
      )}

      {tab==="Branding" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>Profile Ring + Follow Button Color</h3>
          <p style={{fontSize:11, color:'#888'}}>Ring Color, Follow Button Color এখান থেকে Change করলে সবার Profile এ LIVE Change হবে</p>
          <input type="color" defaultValue="#2563eb" onChange={async(e)=>{ await supabase.from('app_branding').update({follow_btn_color: e.target.value}).neq('id','00000000-0000-0000-0000-000000000000'); notify("Follow Button Color LIVE")}} style={{marginTop:10, width:'100%', height:40}}/>
        </div>
      )}

      {tab==="CatchCard" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12, border:'1px solid #22c55e'}}>
          <h3 style={{color:'#22c55e'}}>🎁 Catch Card / Coupon - ভিডিওতে আসবে</h3>
          <input value={catchTitle} onChange={e=>setCatchTitle(e.target.value)} placeholder="Title - আপনি Verify পেয়েছেন!" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <input value={catchMsg} onChange={e=>setCatchMsg(e.target.value)} placeholder="Message" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <button onClick={createCatchCard} style={{width:'100%', padding:12, marginTop:10, background:'#22c55e', color:'#000', border:'none', borderRadius:8, fontWeight:'900'}}>Create Catch Card LIVE</button>
          <p style={{fontSize:11, color:'#888', marginTop:6}}>ভিডিও চলতে চলতে Random ভাবে সবার কাছে এই Card টা Popup হবে, 7 দিন পর Auto Expire।</p>
        </div>
      )}

      {tab==="Camera" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>Camera Clean + Features</h3><p style={{fontSize:12, color:'#888'}}>Camera Beauty 100%, Filter, Timer - এখান থেকে Control করলে সবার Camera তে LIVE আসবে</p></div>}
      {tab==="Live" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>Live Control - কে Live করতে পারবে তুমি ঠিক করবে</h3></div>}
      {tab==="Banner" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>Banner</h3><input type="file" onChange={async(e:any)=>{ const f=e.target.files[0]; const n=`banner-${Date.now()}.jpg`; await supabase.storage.from('banners').upload(n,f); const {data}=supabase.storage.from('banners').getPublicUrl(n); await supabase.from('banners').insert({image_url:data.publicUrl}); notify("✅ Banner LIVE")}} /></div>}
    </div>
  )
}