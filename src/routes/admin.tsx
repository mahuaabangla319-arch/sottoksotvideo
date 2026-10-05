import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export const Route = createFileRoute('/admin')({ component: OwnerAdmin })

function OwnerAdmin() {
  const ALLOWED = ["85953415", "SOTF19D6786", "kolkataofficial", "sottokofficial"]
  const [isAdmin, setIsAdmin] = useState<boolean|null>(null)
  const [tab, setTab] = useState("Dashboard")
  const [msg, setMsg] = useState("Loading Owner Panel...")
  const [vidId, setVidId] = useState("")
  const [amount, setAmount] = useState("1000")
  const [sotId, setSotId] = useState("")
  const [groups, setGroups] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [liveReqs, setLiveReqs] = useState<any[]>([])
  const [gName, setGName] = useState("")
  const [gPrice, setGPrice] = useState("1500")
  const [upiId, setUpiId] = useState("kolkataofficial@phonepe")
  const [qrFile, setQrFile] = useState<any>(null)

  useEffect(()=>{ init() },[])
  const init = async () => {
    const { data:{user} } = await supabase.auth.getUser()
    if(!user){ setIsAdmin(false); return }
    const { data:p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const ok = ALLOWED.some(id => (p?.sot_id||"").toString().toLowerCase().includes(id.toLowerCase()) || (p?.username||"").toLowerCase()===id.toLowerCase())
    setIsAdmin(ok); setMsg(ok? `Welcome Owner @${p.username}` : "Access Denied")
    const { data:g } = await supabase.from('sot_groups').select('*').order('created_at',{ascending:false})
    const { data:pay } = await supabase.from('group_payments').select('*').eq('status','pending')
    const { data:live } = await supabase.from('live_requests').select('*').eq('status','pending')
    if(g) setGroups(g); if(pay) setPayments(pay); if(live) setLiveReqs(live)
  }
  const notify = (m:string)=> setMsg(m)

  if(isAdmin===null) return <div style={{minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Checking Owner...</div>
  if(!isAdmin) return <div style={{minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}><h1>🔒 ONLY 2 OWNERS</h1><p>kolkataofficial & sottokofficial</p></div>

  return (
    <div style={{minHeight:'100vh', background:'#000', color:'#fff', padding:12, fontFamily:'sans-serif'}}>
      <h1 style={{color:'#3b82f6', fontWeight:900, fontSize:18}}>SOT TOK - OWNER ADMIN (All System)</h1>
      <p style={{background:'#111', padding:10, borderRadius:8, marginTop:8, color:'#22c55e', fontSize:12}}>{msg}</p>

      <div style={{display:'flex', gap:5, flexWrap:'wrap', marginTop:12}}>
        {["Dashboard","Boost","Live","Groups","Payments","Scanner","Wallet","Verify","Camera","Banners","Noti","Catch"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'9px 10px', borderRadius:8, border:'none', background:tab===t?'#2563eb':'#222', color:'#fff', fontSize:11, fontWeight:'bold'}}>{t}</button>
        ))}
      </div>

      {tab==="Dashboard" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
        <h3>👑 2 মালিকের Dashboard</h3>
        <p style={{fontSize:11, color:'#888', marginTop:6}}>এখান থেকে তোমরা 2 জন সব কন্ট্রোল করবে - যা করবে সাথে সাথে LIVE হবে</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:12}}>
          <div style={{background:'#1a1a1a', padding:12, borderRadius:8, textAlign:'center'}}><h2>{groups.length}</h2><p style={{fontSize:10}}>Groups</p></div>
          <div style={{background:'#1a1a1a', padding:12, borderRadius:8, textAlign:'center'}}><h2>{payments.length+liveReqs.length}</h2><p style={{fontSize:10}}>Pending Pay</p></div>
          <div style={{background:'#1a1a1a', padding:12, borderRadius:8, textAlign:'center'}}><h2>2</h2><p style={{fontSize:10}}>Owners</p></div>
        </div>
        <p style={{fontSize:11, color:'#22c55e', marginTop:12}}>✅ View/Like +/- ✅ 10X Fast ✅ Live 100F+50k Views+₹1500 ✅ Group+Scanner ✅ Wallet ✅ Verify ✅ Camera ✅ Banner ✅ Noti</p>
      </div>}

      {tab==="Boost" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
        <h3>🚀 Like/View +/- & ⚡ 10X Fast</h3>
        <input value={vidId} onChange={e=>setVidId(e.target.value)} placeholder="Video ID" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount 1000" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/>
        <div style={{display:'flex', gap:6, marginTop:10}}>
          <button onClick={async()=>{ const {data}=await supabase.from('videos').select('*').eq('id', vidId).single(); await supabase.from('videos').update({views:(data.views||0)+parseInt(amount)}).eq('id', vidId); notify("✅ View+ LIVE")}} style={{flex:1, padding:10, background:'#22c55e', border:'none', borderRadius:8, color:'#fff'}}>View +</button>
          <button onClick={async()=>{ const {data}=await supabase.from('videos').select('*').eq('id', vidId).single(); await supabase.from('videos').update({views:(data.views||0)-parseInt(amount)}).eq('id', vidId); notify("✅ View- LIVE")}} style={{flex:1, padding:10, background:'#ef4444', border:'none', borderRadius:8, color:'#fff'}}>View -</button>
          <button onClick={async()=>{ const {data}=await supabase.from('videos').select('*').eq('id', vidId).single(); await supabase.from('videos').update({likes:(data.likes||0)+parseInt(amount)}).eq('id', vidId); notify("✅ Like+ LIVE")}} style={{flex:1, padding:10, background:'#ec4899', border:'none', borderRadius:8, color:'#fff'}}>Like +</button>
        </div>
        <div style={{display:'flex', gap:6, marginTop:8}}>
          <button onClick={async()=>{ await supabase.from('videos').update({playback_speed:10}).eq('id', vidId); notify("⚡ 10X FAST LIVE")}} style={{flex:1, padding:12, background:'#f59e0b', color:'#000', border:'none', borderRadius:8, fontWeight:900}}>⚡ 10X FAST</button>
          <button onClick={async()=>{ await supabase.from('videos').update({playback_speed:1}).eq('id', vidId); notify("1X Normal")}} style={{flex:1, padding:12, background:'#333', color:'#fff', border:'none', borderRadius:8}}>1X Normal</button>
        </div>
      </div>}

      {tab==="Live" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12, border:'1px solid #ef4444'}}>
        <h3 style={{color:'#ef4444'}}>🔴 Live - 100 Follower + 50k Views + ₹1500-1700</h3>
        {liveReqs.map((r:any)=><div key={r.id} style={{background:'#222', padding:10, borderRadius:8, marginTop:8, fontSize:12}}>
          <p>{r.user_sot_id} | F:{r.followers} | V:{r.total_views} | ₹{r.amount} | UTR:{r.utr_number}</p>
          <button onClick={async()=>{ if((r.followers||0)<100) return notify("❌ 100 Follower লাগবে"); if((r.total_views||0)<50000) return notify("❌ 50k Views লাগবে"); await supabase.from('profiles').update({can_go_live:true}).or(`sot_id.eq.${r.user_sot_id},username.eq.${r.user_sot_id}`); await supabase.from('live_requests').update({status:'approved'}).eq('id', r.id); notify(`✅ ${r.user_sot_id} Live ON`)}}
          style={{width:'100%', padding:8, marginTop:6, background:'#ef4444', border:'none', borderRadius:6, color:'#fff'}}>Approve Live</button>
        </div>)}
        {liveReqs.length===0 && <p style={{fontSize:12, color:'#666', marginTop:10}}>No Live Request</p>}
      </div>}

      {tab==="Groups" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>👥 Group Create</h3><input value={gName} onChange={e=>setGName(e.target.value)} placeholder="Group Name" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><input value={gPrice} onChange={e=>setGPrice(e.target.value)} placeholder="1500" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><button onClick={async()=>{ await supabase.from('sot_groups').insert({name:gName, price:parseInt(gPrice), is_active:true}); setGName(""); notify("✅ Group LIVE")}} style={{width:'100%', padding:10, marginTop:8, background:'#22c55e', color:'#000', border:'none', borderRadius:8, fontWeight:900}}>Create Group</button></div>}

      {tab==="Payments" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>💰 Group Payments</h3>{payments.map((p:any)=><div key={p.id} style={{background:'#222', padding:10, borderRadius:8, marginTop:8, fontSize:12}}><p>{p.user_sot_id} - ₹{p.amount}</p><button onClick={async()=>{ await supabase.from('group_members').insert({group_id:p.group_id, sot_id:p.user_sot_id, role:'leader', is_leader:true}); await supabase.from('group_payments').update({status:'approved'}).eq('id', p.id); notify("✅ Leader Active")}} style={{width:'100%', padding:8, marginTop:6, background:'#22c55e', border:'none', borderRadius:6}}>Approve Leader</button></div>)}</div>}

      {tab==="Scanner" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>📲 PhonePe/GPay Scanner</h3><input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="UPI ID" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><input type="file" onChange={e=>setQrFile(e.target.files?.[0])} style={{marginTop:8}}/><button onClick={async()=>{ const n=`qr-${Date.now()}.png`; await supabase.storage.from('app-assets').upload(n, qrFile); const {data}=supabase.storage.from('app-assets').getPublicUrl(n); await supabase.from('payment_settings').upsert({upi_id:upiId, qr_image_url:data.publicUrl}); notify("✅ Scanner LIVE")}} style={{width:'100%', padding:10, marginTop:8, background:'#3b82f6', border:'none', borderRadius:8, color:'#fff'}}>Save Scanner</button></div>}

      {tab==="Wallet" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><input value={sotId} onChange={e=>setSotId(e.target.value)} placeholder="SOT ID" style={{width:'100%', padding:10, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Coin Amount" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}/><div style={{display:'flex', gap:6, marginTop:8}}><button onClick={async()=>{ const {data}=await supabase.from('profiles').select('id').or(`s