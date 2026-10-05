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
  const [notiTitle, setNotiTitle] = useState("")
  const [notiMsg, setNotiMsg] = useState("")
  const [verifyId, setVerifyId] = useState("")
  const [verifyDays, setVerifyDays] = useState("7")
  const [catchTitle, setCatchTitle] = useState("আপনি Verify ID পেয়েছেন!")
  const [catchMsg, setCatchMsg] = useState("7 দিনের জন্য Blue Tick")
  
  // Live + Group System - NEW
  const [groups, setGroups] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [liveReqs, setLiveReqs] = useState<any[]>([])
  const [gName, setGName] = useState("")
  const [gPrice, setGPrice] = useState("1500")
  const [upiId, setUpiId] = useState("kolkataofficial@phonepe")
  const [qrFile, setQrFile] = useState<any>(null)

  useEffect(()=>{ check(); loadAll() },[])
  const check = async () => {
    const { data:{user} } = await supabase.auth.getUser()
    if(!user){ setIsAdmin(false); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const ok = ALLOWED.some(id=> (p?.sot_id||"").toLowerCase().includes(id.toLowerCase()) || (p?.username||"").toLowerCase()===id.toLowerCase())
    setIsAdmin(ok)
  }
  const loadAll = async () => {
    const { data:g } = await supabase.from('sot_groups').select('*').order('created_at',{ascending:false})
    const { data:pay } = await supabase.from('group_payments').select('*').eq('status','pending')
    const { data:live } = await supabase.from('live_requests').select('*').eq('status','pending')
    if(g) setGroups(g); if(pay) setPayments(pay); if(live) setLiveReqs(live)
  }
  const notify = (m:string)=>{ setMsg(m); setTimeout(()=>{ setMsg(""); loadAll() },3000) }

  if(isAdmin===null) return <div style={{background:'#000', color:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Checking...</div>
  if(isAdmin===false) return <div style={{background:'#000', color:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}><h1>🔒 ACCESS DENIED</h1><p>Only @kolkataofficial & @sottokofficial</p></div>

  const doBoost = async (type:string, isMinus=false) => {
    if(!vidId) return notify("Video ID দাও")
    try {
      const { data } = await supabase.from('videos').select('*').eq('id', vidId).single()
      const val = isMinus? -parseInt(amount) : parseInt(amount)
      let upd:any = {}
      if(type==='views') upd = {views: (data.views||0)+val}
      if(type==='likes') upd = {likes: (data.likes||0)+val}
      if(type==='speed10x') upd = {playback_speed: 10}
      if(type==='speed1x') upd = {playback_speed: 1}
      await supabase.from('videos').update(upd).eq('id', vidId)
      notify(`✅ ${type} LIVE - সবাই দেখবে`)
    } catch(e:any){ notify("❌ "+e.message) }
  }
  const sendNoti = async () => { await supabase.from('notifications').insert({title: notiTitle, message: notiMsg, target:'all'}); notify("✅ Notification LIVE") }
  const giveVerify = async () => { const until = new Date(); until.setDate(until.getDate()+parseInt(verifyDays)); await supabase.from('profiles').update({is_verified:true, verified_until: until.toISOString()}).or(`sot_id.eq.${verifyId},username.eq.${verifyId}`); notify(`✅ ${verifyId} কে ${verifyDays} দিন Verify`) }
  const updateCoin = async (isMinus=false) => { const { data } = await supabase.from('profiles').select('id').or(`sot_id.eq.${verifyId},username.eq.${verifyId}`).maybeSingle(); if(!data) return notify("User নেই"); const { data: coin } = await supabase.from('user_coins').select('*').eq('user_id', data.id).maybeSingle(); const newCoin = (coin?.coins||0)+(isMinus? -parseInt(amount):parseInt(amount)); await supabase.from('user_coins').upsert({user_id: data.id, coins: newCoin}); notify(`✅ Coin এখন ${newCoin}`) }
  const createCatchCard = async () => { await supabase.from('catch_cards').insert({title: catchTitle, message: catchMsg, is_active: true}); notify("✅ Catch Card LIVE") }

  return (
    <div style={{minHeight:'100vh', background:'#000', color:'#fff', padding:14, fontFamily:'sans-serif'}}>
      <h1 style={{color:'#3b82f6', fontWeight:900}}>SOT TOK - ULTIMATE ADMIN (2 ONLY)</h1>
      <p style={{background:'#111', padding:8, borderRadius:8, marginTop:8, color:'#22c55e', fontSize:12}}>{msg||"Ready - তোমরা 2 জন যা করবে সবাই দেখবে"}</p>

      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:15}}>
        {["Boost","Groups","Live","Payments","Scanner","Banner","Noti","Verify","Camera","Wallet","Branding","CatchCard"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 12px', borderRadius:8, border:'none', background: tab===t?'#2563eb':'#222', color:'#fff', fontSize:12, fontWeight:'bold'}}>{t}</button>
        ))}
      </div>

      {tab==="Boost" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>Like / View + 10X Fast</h3>
          <input value={vidId} onChange={e=>setVidId(e.target.value)} placeholder="Video ID" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount 1000" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <div style={{display:'flex', gap:8, marginTop:10}}>
            <button onClick={()=>doBoost('views')} style={{flex:1, padding:10, background:'#22c55e', color:'#fff', border:'none', borderRadius:8}}>View +</button>
            <button onClick={()=>doBoost('views', true)} style={{flex:1, padding:10, background:'#ef4444', color:'#fff', border:'none', borderRadius:8}}>View -</button>
            <button onClick={()=>doBoost('likes')} style={{flex:1, padding:10, background:'#ec4899', color:'#fff', border:'none', borderRadius:8}}>Like +</button>
            <button onClick={()=>doBoost('speed10x')} style={{flex:1, padding:10, background:'#f59e0b', color:'#000', border:'none', borderRadius:8, fontWeight:900}}>10X Fast</button>
          </div>
        </div>
      )}

      {/* LIVE OPTION - 100 Follower + 50k Views + 1500 */}
      {tab==="Live" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12, border:'1px solid #ef4444'}}>
          <h3 style={{color:'#ef4444'}}>🔴 LIVE Control - 100 Follower + 50k Views + ₹1500-1700</h3>
          <p style={{fontSize:11, color:'#888', marginTop:6}}>শর্ত পূরণ হলেই Live On হবে, না হলে Approve হবে না</p>
          {liveReqs.length===0 && <p style={{fontSize:12, color:'#666', marginTop:10}}>কোনো Live Request নেই</p>}
          {liveReqs.map((r:any)=>(
            <div key={r.id} style={{background:'#222', padding:12, borderRadius:10, marginTop:10, fontSize:12}}>
              <p><b>{r.user_sot_id}</b> | Followers: {r.followers||0} | Views: {r.total_views||0} | ₹{r.amount} | UTR: {r.utr_number}</p>
              <button onClick={async()=>{
                if((r.followers||0)<100) return notify(`❌ ${r.user_sot_id} এর Follower ${r.followers} আছে, 100 লাগবে`);
                if((r.total_views||0)<50000) return notify(`❌ Views ${r.total_views} আছে, 50k লাগবে`);
                await supabase.from('profiles').update({can_go_live:true}).eq('sot_id', r.user_sot_id);
                await supabase.from('live_requests').update({status:'approved'}).eq('id', r.id);
                notify(`✅ ${r.user_sot_id} এখন Live করতে পারবে!`)
              }} style={{width:'100%', padding:10, marginTop:8, background:'#ef4444', color:'#fff', border:'none', borderRadius:8, fontWeight:'bold'}}>✅ Check & Approve Live</button>
            </div>
          ))}
        </div>
      )}

      {/* GROUP SYSTEM */}
      {tab==="Groups" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>👥 Group System - তুমি বানাবে, ওরা Leader হবে</h3>
          <input value={gName} onChange={e=>setGName(e.target.value)} placeholder="Group Name - e.g. Kolkata Stars" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <input value={gPrice} onChange={e=>setGPrice(e.target.value)} placeholder="Price 1500-1700" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <button onClick={async()=>{ if(!gName) return notify("Name দাও"); await supabase.from('sot_groups').insert({name:gName, price:parseInt(gPrice), is_active:true}); setGName(""); notify("✅ Group LIVE - সবাই দেখবে")}} style={{width:'100%', padding:12, marginTop:10, background:'#22c55e', color:'#000', border:'none', borderRadius:8, fontWeight:900}}>Create Group LIVE</button>
          <div style={{marginTop:12}}>{groups.map((g:any)=><div key={g.id} style={{background:'#1a1a1a', padding:10, borderRadius:8, marginTop:6, display:'flex', justifyContent:'space-between', fontSize:12}}><span>{g.name}</span><span>₹{g.price}</span></div>)}</div>
        </div>
      )}

      {tab==="Payments" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>💰 Group Payments - Approve করলেই Leader</h3>
          {payments.map((p:any)=><div key={p.id} style={{background:'#222', padding:12, borderRadius:10, marginTop:10, fontSize:12}}><p>{p.user_sot_id} - ₹{p.amount} - UTR: {p.utr_number}</p><button onClick={async()=>{ await supabase.from('group_members').insert({group_id:p.group_id, sot_id:p.user_sot_id, role:'leader', is_leader:true}); await supabase.from('group_payments').update({status:'approved'}).eq('id', p.id); notify(`✅ ${p.user_sot_id} Leader Active`)}} style={{width:'100%', padding:10, marginTop:8, background:'#22c55e', color:'#000', border:'none', borderRadius:8, fontWeight:'bold'}}>Approve & Make Leader</button></div>)}
        </div>
      )}

      {tab==="Scanner" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>📲 PhonePe / GPay Scanner</h3>
          <input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="UPI ID" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
          <input type="file" accept="image/*" onChange={e=>setQrFile(e.target.files?.[0])} style={{marginTop:10, color:'#fff'}}/>
          <button onClick={async()=>{ if(!qrFile) return notify("QR দাও"); const n=`qr-${Date.now()}.png`; await supabase.storage.from('app-assets').upload(n, qrFile); const {data}=supabase.storage.from('app-assets').getPublicUrl(n); await supabase.from('payment_settings').upsert({upi_id:upiId, qr_image_url:data.publicUrl}); notify("✅ Scanner LIVE - Next চাপলেই আসবে")}} style={{width:'100%', padding:12, marginTop:10, background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, fontWeight:900}}>Save Scanner LIVE</button>
        </div>
      )}

      {tab==="Noti" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>Notification</h3><input value={notiTitle} onChange={e=>setNotiTitle(e.target.value)} placeholder="Title" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><textarea value={notiMsg} onChange={e=>setNotiMsg(e.target.value)} placeholder="Message" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><button onClick={sendNoti} style={{width:'100%', padding:12, marginTop:10, background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:'bold'}}>Send All LIVE</button></div>}
      {tab==="Verify" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>Verify 7 Days Auto Expire</h3><input value={verifyId} onChange={e=>setVerifyId(e.target.value)} placeholder="SOT ID" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><input value={verifyDays} onChange={e=>setVerifyDays(e.target.value)} placeholder="7" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><button onClick={giveVerify} style={{width:'100%', padding:12, marginTop:10, background:'#f59e0b', color:'#000', border:'none', borderRadius:8, fontWeight:'bold'}}>Verify দাও</button></div>}
      {tab==="Wallet" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>Coin Wallet</h3><input value={verifyId} onChange={e=>setVerifyId(e.target.value)} placeholder="SOT ID" style={{width:'100%', padding:10, marginTop:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Coin" style={{width:'100%', padding:10, marginTop:8, background