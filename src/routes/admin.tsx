import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export const Route = createFileRoute('/admin')({
  component: OwnerAdminFinal,
})

function OwnerAdminFinal() {
  const ALLOWED = ["85953415", "SOTF19D6786", "kolkataofficial", "sottokofficial"]
  const [isAdmin, setIsAdmin] = useState<boolean|null>(null)
  const [tab, setTab] = useState("Dashboard")
  const [msg, setMsg] = useState("Loading...")
  const [vidId, setVidId] = useState("")
  const [amount, setAmount] = useState("100")
  const [sotId, setSotId] = useState("")
  const [groups, setGroups] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [liveReqs, setLiveReqs] = useState<any[]>([])
  const [gName, setGName] = useState("")
  const [gPrice, setGPrice] = useState("1500")
  const [upiId, setUpiId] = useState("kolkataofficial@phonepe")
  const [qrFile, setQrFile] = useState<any>(null)
  const [wallet1, setWallet1] = useState(0)
  const [wallet2, setWallet2] = useState(0)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(()=>{ init() },[])
  const init = async () => {
    const { data:{user} } = await supabase.auth.getUser()
    if(!user){ setIsAdmin(false); return }
    const { data:p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    const ok = ALLOWED.some(id => (p?.sot_id||"").toString().toLowerCase().includes(id.toLowerCase()) || (p?.username||"").toLowerCase()===id.toLowerCase())
    setIsAdmin(ok); setMsg(ok? `Welcome @${p.username} - 2 Owner Active` : "Denied")
    loadAll()
  }
  const loadAll = async () => {
    const { data:g } = await supabase.from('sot_groups').select('*').order('created_at',{ascending:false}).limit(20)
    const { data:pay } = await supabase.from('group_payments').select('*').eq('status','pending').limit(20)
    const { data:live } = await supabase.from('live_requests').select('*').eq('status','pending').limit(20)
    const { data:w } = await supabase.from('admin_wallets').select('*')
    const { data:l } = await supabase.from('commission_logs').select('*').order('created_at',{ascending:false}).limit(20)
    if(g) setGroups(g); if(pay) setPayments(pay); if(live) setLiveReqs(live)
    if(w){ setWallet1(w.find((x:any)=>x.sot_id==="SOTF19D6786")?.balance||0); setWallet2(w.find((x:any)=>x.sot_id==="85953415")?.balance||0) }
    if(l) setLogs(l)
  }
  const notify = (m:string)=>{ setMsg(m); loadAll() }

  // COMMISSION LOGIC - 100 Taka = 15 Taka Google Cut = 85/2 = 42.50 Each
  const creditCommission = async (payAmount:number) => {
    const googleCut = payAmount * 0.15
    const remain = payAmount - googleCut
    const share = remain / 2
    const { data:w1 } = await supabase.from('admin_wallets').select('*').eq('sot_id','SOTF19D6786').maybeSingle()
    const { data:w2 } = await supabase.from('admin_wallets').select('*').eq('sot_id','85953415').maybeSingle()
    await supabase.from('admin_wallets').upsert({sot_id:'SOTF19D6786', username:'sottokofficial', balance:(w1?.balance||0)+share, total_earned:(w1?.total_earned||0)+share})
    await supabase.from('admin_wallets').upsert({sot_id:'85953415', username:'kolkataofficial', balance:(w2?.balance||0)+share, total_earned:(w2?.total_earned||0)+share})
    await supabase.from('commission_logs').insert({user_pays:payAmount, google_cut:googleCut, remaining:remain, admin1_amount:share, admin2_amount:share})
  }

  if(isAdmin===null) return <div style={{minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Checking Owner...</div>
  if(!isAdmin) return <div style={{minHeight:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}><h1>🔒 ONLY 2 OWNERS</h1></div>

  return (
    <div style={{minHeight:'100vh', background:'#000', color:'#fff', padding:12}}>
      <h2 style={{color:'#3b82f6', fontWeight:900}}>SOT TOK - OWNER + COMMISSION WALLET</h2>
      <p style={{background:'#111', padding:8, borderRadius:8, marginTop:8, color:'#22c55e', fontSize:12}}>{msg}</p>

      <div style={{display:'flex', gap:5, flexWrap:'wrap', marginTop:12}}>
        {["Dashboard","Commission","Boost","Live","Groups","Payments","Scanner","Wallet","Verify","Camera","Banners"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'9px 10px', borderRadius:8, border:'none', background:tab===t?'#2563eb':'#222', color:'#fff', fontSize:11, fontWeight:'bold'}}>{t}</button>
        ))}
      </div>

      {tab==="Dashboard" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}>
          <h3>👑 Owner Dashboard + Profile Wallet System</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12}}>
            <div style={{background:'#1a1a00', border:'1px solid #d4af37', padding:12, borderRadius:8, textAlign:'center'}}><p style={{fontSize:10, color:'#d4af37'}}>@sottokofficial</p><h2 style={{color:'#facc15'}}>{wallet1.toFixed(2)} ৳</h2><p style={{fontSize:9}}>ADMIN 1 • 50%</p></div>
            <div style={{background:'#1a1a00', border:'1px solid #d4af37', padding:12, borderRadius:8, textAlign:'center'}}><p style={{fontSize:10, color:'#d4af37'}}>@kolkataofficial</p><h2 style={{color:'#facc15'}}>{wallet2.toFixed(2)} ৳</h2><p style={{fontSize:9}}>ADMIN 2 • 50%</p></div>
          </div>
          <p style={{fontSize:11, color:'#888', marginTop:12}}>100৳ Pay → Google 15৳ → বাকি 85৳ → 42.50৳ + 42.50৳ তোমাদের 2 জনের Wallet এ</p>
        </div>
      )}

      {tab==="Commission" && (
        <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12, border:'1px solid #d4af37'}}>
          <h3 style={{color:'#d4af37'}}>🔒 Commission Wallet - Profile System এর সাথে যুক্ত</h3>
          <div style={{background:'#000', padding:12, borderRadius:8, marginTop:10, fontSize:12}}>
            <p>User Pays 100 Taka via UPI ↓</p>
            <p>Google Play Cuts 15% (15 Taka) ↓</p>
            <p>Remaining 85 Taka → 42.50 + 42.50</p>
          </div>
          {logs.map((l:any)=><div key={l.id} style={{background:'#1a1a1a', padding:8, borderRadius:6, marginTop:6, fontSize:11, display:'flex', justifyContent:'space-between'}}><span>User {l.user_pays}৳ → Fee {l.google_cut}৳</span><span style={{color:'#22c55e'}}>+{l.admin1_amount}৳ Each</span></div>)}
          <button onClick={()=>{ setAmount("100"); }} style={{width:'100%', padding:10, marginTop:10, background:'#facc15', color:'#000', border:'none', borderRadius:8, fontWeight:900}}>Test 100৳ Commission Credit</button>
        </div>
      )}

      {tab==="Boost" && <div style={{background:'#111', padding:16, borderRadius:12, marginTop:12}}><h3>🚀 Boost</h3><input value={vidId} onChange={e=>setVidId(e.target.value)} placeholder="Video ID" style={{width:'100%', padding:10, marginTop:8, background:'#222', color:'#fff', borderRadius:8, border:'1px solid #333'}}/></div>}
    </div>
  );
}
