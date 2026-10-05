import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export const Route = createFileRoute('/admin')({
  component: UltimateAdminPro,
})

function UltimateAdminPro() {
  const ALLOWED = ["85953415", "SOTF19D6786", "kolkataofficial", "sottokofficial"]
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState("Boost")
  const [msg, setMsg] = useState("Loading...")
  const [loading, setLoading] = useState(false)

  const [vidId, setVidId] = useState("")
  const [amount, setAmount] = useState("1000")
  const [userIdInput, setUserIdInput] = useState("")
  const [groups, setGroups] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [liveReqs, setLiveReqs] = useState<any[]>([])
  const [gName, setGName] = useState("")
  const [gPrice, setGPrice] = useState("1500")
  const [upiId, setUpiId] = useState("kolkataofficial@phonepe")
  const [qrFile, setQrFile] = useState<any>(null)
  const [notiTitle, setNotiTitle] = useState("")
  const [notiMsg, setNotiMsg] = useState("")
  const [verifyDays, setVerifyDays] = useState("7")

  useEffect(() => { checkAdmin(); loadData() }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsAdmin(false); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const ok = ALLOWED.some(id => (p?.sot_id || "").toString().toLowerCase().includes(id.toLowerCase()) || (p?.username || "").toLowerCase() === id.toLowerCase())
    setIsAdmin(ok)
    setMsg(ok? `✅ Boss @${p.username} - Full Control` : "Access Denied")
  }

  const loadData = async () => {
    const { data: g } = await supabase.from('sot_groups').select('*').order('created_at', { ascending: false })
    const { data: pay } = await supabase.from('group_payments').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    const { data: live } = await supabase.from('live_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    if (g) setGroups(g)
    if (pay) setPayments(pay)
    if (live) setLiveReqs(live)
  }

  const notify = (m: string) => { setMsg(m); setTimeout(() => loadData(), 1000) }

  if (isAdmin === null) return <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Checking...</div>
  if (!isAdmin) return <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><h1>🔒 ACCESS DENIED</h1><p>Only @kolkataofficial & @sottokofficial</p></div>

  // 1. BOOST + VIDEO 10X FAST
  const doBoost = async (type: string, isMinus = false) => {
    if (!vidId) return notify("❌ Video ID দাও")
    setLoading(true)
    try {
      const { data } = await supabase.from('videos').select('*').eq('id', vidId).single()
      const val = isMinus? -parseInt(amount) : parseInt(amount)
      let upd: any = {}
      if (type === 'views') upd = { views: (data.views || 0) + val, views_count: (data.views_count || 0) + val }
      if (type === 'likes') upd = { likes: (data.likes || 0) + val, likes_count: (data.likes_count || 0) + val }
      if (type === 'speed10x') upd = { playback_speed: 10 }
      if (type === 'speed1x') upd = { playback_speed: 1 }
      await supabase.from('videos').update(upd).eq('id', vidId)
      notify(`✅ LIVE! ${type} Done - সবাই দেখবে`)
    } catch (e: any) { notify("❌ " + e.message) }
    setLoading(false)
  }

  // 2. GROUP + PAYMENT + SCANNER
  const createGroup = async () => { if (!gName) return notify("Name দাও"); await supabase.from('sot_groups').insert({ name: gName, price: parseInt(gPrice), is_active: true }); setGName(""); notify("✅ Group LIVE") }
  const approvePayment = async (pay: any) => { await supabase.from('group_members').insert({ group_id: pay.group_id, user_id: pay.user_id, sot_id: pay.user_sot_id, role: 'leader', is_leader: true }); await supabase.from('group_payments').update({ status: 'approved' }).eq('id', pay.id); notify(`✅ ${pay.user_sot_id} Leader Active`) }
  const saveQR = async () => { if (!qrFile) return notify("QR দাও"); const name = `qr-${Date.now()}.png`; await supabase.storage.from('app-assets').upload(name, qrFile); const { data } = supabase.storage.from('app-assets').getPublicUrl(name); await supabase.from('payment_settings').upsert({ upi_id: upiId, qr_image_url: data.publicUrl }); notify("✅ Scanner LIVE") }

  // 3. LIVE ENABLE WITH CHECK - 100 Followers + 50k Views + 1500-1700 Pay
  const approveLive = async (req: any) => {
    // Check eligibility
    const { data: profile } = await supabase.from('profiles').select('followers_count, total_views').or(`sot_id.eq.${req.user_sot_id},username.eq.${req.user_sot_id}`).maybeSingle()
    const followers = profile?.followers_count || req.followers || 0
    const views = profile?.total_views || req.total_views || 0

    if (followers < 100) return notify(`❌ Fail - Follower ${followers} আছে, 100 লাগবে`)
    if (views < 50000) return notify(`❌ Fail - Views ${views} আছে, 50000 লাগবে`)

    await supabase.from('profiles').update({ can_go_live: true }).or(`sot_id.eq.${req.user_sot_id},username.eq.${req.user_sot_id}`)
    await supabase.from('live_requests').update({ status: 'approved' }).eq('id', req.id)
    notify(`✅ LIVE ON! ${req.user_sot_id} এখন Live করতে পারবে - 100 Follower & 50k Views OK`)
  }

  const giveVerify = async () => { const until = new Date(); until.setDate(until.getDate() + parseInt(verifyDays)); await supabase.from('profiles').update({ is_verified: true, verified_until: until.toISOString() }).or(`sot_id.eq.${userIdInput},username.eq.${userIdInput}`); notify(`✅ ${userIdInput} কে ${verifyDays} দিন Verify`) }
  const updateCoin = async (isMinus = false) => { const { data } = await supabase.from('profiles').select('id').or(`sot_id.eq.${userIdInput},username.eq.${userIdInput}`).maybeSingle(); if (!data) return notify("User নেই"); const { data: coin } = await supabase.from('user_coins').select('*').eq('user_id', data.id).maybeSingle(); const newCoin = (coin?.coins || 0) + (isMinus? -parseInt(amount) : parseInt(amount)); await supabase.from('user_coins').upsert({ user_id: data.id, coins: newCoin }); notify(`✅ Coin এখন ${newCoin}`) }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 12 }}>
      <h1 style={{ color: '#3b82f6', fontWeight: 900, fontSize: 18 }}>SOT TOK - FINAL PRO ADMIN (2 ONLY)</h1>
      <p style={{ background: '#111', padding: 8, borderRadius: 8, marginTop: 8, color: '#22c55e', fontSize: 11 }}>{msg}</p>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
        {["Boost", "Groups", "Live", "Payments", "Scanner", "Verify", "Wallet", "Camera", "Banners", "Noti"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 10px', borderRadius: 8, border: 'none', background: tab === t? '#2563eb' : '#222', color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{t}</button>
        ))}
      </div>

      {tab === "Boost" && (
        <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}>
          <h3>🚀 Boost + 10x Fast - আস্তে চলা ভিডিও ফাস্ট করো</h3>
          <input value={vidId} onChange={e => setVidId(e.target.value)} placeholder="Video ID" style={{ width: '100%', padding: 10, marginTop: 10, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount - 1000" style={{ width: '100%', padding: 10, marginTop: 8, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <button onClick={() => doBoost('views')} style={{ flex: 1, padding: 10, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8 }}>View +</button>
            <button onClick={() => doBoost('views', true)} style={{ flex: 1, padding: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8 }}>View -</button>
            <button onClick={() => doBoost('likes')} style={{ flex: 1, padding: 10, background: '#ec4899', color: '#fff', border: 'none', borderRadius: 8 }}>Like +</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={() => doBoost('speed10x')} style={{ flex: 1, padding: 12, background: '#f59e0b', color: '#000', border: 'none', borderRadius: 8, fontWeight: 900 }}>⚡ 10X FAST করো</button>
            <button onClick={() => doBoost('speed1x')} style={{ flex: 1, padding: 12, background: '#333', color: '#fff', border: 'none', borderRadius: 8 }}>1X Normal করো</button>
          </div>
          <p style={{ fontSize: 10, color: '#888', marginTop: 8 }}>তোমরা 10X বাটন চাপলেই ওই ভিডিও 10 গুণ ফাস্ট চলবে সবার কাছে</p>
        </div>
      )}

      {tab === "Live" && (
        <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12, border: '1px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444' }}>🔴 LIVE Control - 1500-1700 টাকা + 100 Follower + 50k Views</h3>
          <p style={{ fontSize: 11, color: '#888' }}>শর্ত: 100 Followers + 50000 Views + ₹1500-1700 Payment = Live On</p>
          {liveReqs.length === 0 && <p style={{ fontSize: 12, color: '#666', marginTop: 10 }}>কোনো Live Request নেই</p>}
          {liveReqs.map((r: any) => (
            <div key={r.id} style={{ background: '#222', padding: 12, borderRadius: 10, marginTop: 10, fontSize: 12 }}>
              <p>SOT: {r.user_sot_id} | Follower: {r.followers} | Views: {r.total_views} | ₹{r.amount} | UTR: {r.utr_number}</p>
              <button onClick={() => approveLive(r)} style={{ width: '100%', padding: 10, marginTop: 8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>✅ Check & Approve Live</button>
            </div>
          ))}
          <div style={{ background: '#0a0a0a', padding: 10, borderRadius: 8, marginTop: 12 }}>
            <p style={{ fontSize: 11, color: '#22c55e' }}>Flow: User -> Live Button -> Payment ₹1500 -> UTR দেবে -> তুমি Approve চাপলেই যদি 100 Follower & 50k Views থাকে তবেই Live On হবে</p>
          </div>
        </div>
      )}

      {tab === "Groups" && (
        <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}>
          <h3>👥 Group তৈরি</h3>
          <input value={gName} onChange={e => setGName(e.target.value)} placeholder="Group Name" style={{ width: '100%', padding: 10, marginTop: 8, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <input value={gPrice} onChange={e => setGPrice(e.target.value)} placeholder="1500" style={{ width: '100%', padding: 10, marginTop: 8, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <button onClick={createGroup} style={{ width: '100%', padding: 10, marginTop: 8, background: '#22c55e', color: '#000', border: 'none', borderRadius: 8, fontWeight: 900 }}>Create Group</button>
        </div>
      )}

      {tab === "Payments" && (
        <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}>
          <h3>💰 Group Payments</h3>
          {payments.map((p: any) => (
            <div key={p.id} style={{ background: '#222', padding: 10, borderRadius: 8, marginTop: 8, fontSize: 12 }}>
              <p>{p.user_sot_id} - ₹{p.amount} - {p.utr_number}</p>
              <button onClick={() => approvePayment(p)} style={{ width: '100%', padding: 8, marginTop: 6, background: '#22c55e', border: 'none', borderRadius: 6 }}>Approve & Make Leader</button>
            </div>
          ))}
        </div>
      )}

      {tab === "Scanner" && (
        <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}>
          <h3>📲 PhonePe / GPay Scanner</h3>
          <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="UPI ID" style={{ width: '100%', padding: 10, marginTop: 8, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <input type="file" onChange={e => setQrFile(e.target.files?.[0])} style={{ marginTop: 8 }} />
          <button onClick={saveQR} style={{ width: '100%', padding: 10, marginTop: 8, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8 }}>Save Scanner</button>
        </div>
      )}

      {tab === "Verify" && (
        <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}>
          <input value={userIdInput} onChange={e => setUserIdInput(e.target.value)} placeholder="SOT ID" style={{ width: '100%', padding: 10, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <button onClick={giveVerify} style={{ width: '100%', padding: 10, marginTop: 8, background: '#f59e0b', border: 'none', borderRadius: 8 }}>Verify {verifyDays} দিন</button>
        </div>
      )}

      {tab === "Wallet" && (
        <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}>
          <input value={userIdInput} onChange={e => setUserIdInput(e.target.value)} placeholder="SOT ID" style={{ width: '100%', padding: 10, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Coin" style={{ width: '100%', padding: 10, marginTop: 8, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}><button onClick={() => updateCoin()} style={{ flex: 1, padding: 10, background: '#22c55e', border: 'none', borderRadius: 8 }}>+ Coin</button><button onClick={() => updateCoin(true)} style={{ flex: 1, padding: 10, background: '#ef4444', border: 'none', borderRadius: 8 }}>- Coin</button></div>
        </div>
      )}

      {tab === "Camera" && <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}><h3>Camera</h3><input type="file" multiple onChange={async (e: any) => { for (let f of e.target.files) { const n = `filter-${Date.now()}-${f.name}`; await supabase.storage.from('filters').upload(n, f) } notify("Filter LIVE") }} /></div>}
      {tab === "Banners" && <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}><h3>Banner</h3><input type="file" onChange={async (e: any) => { const f = e.target.files[0]; const n = `banner-${Date.now()}.jpg`; await supabase.storage.from('banners').upload(n, f); const { data } = supabase.storage.from('banners').getPublicUrl(n); await supabase.from('banners').insert({ image_url: data.publicUrl }); notify("Banner LIVE") }} /></div>}
      {tab === "Noti" && <div style={{ background: '#111', padding: 14, borderRadius: 12, marginTop: 12 }}><input value={notiTitle} onChange={e => setNotiTitle(e.target.value)} placeholder="Title" style={{ width: '100%', padding: 10, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} /><textarea value={notiMsg} onChange={e => setNotiMsg(e.target.value)} placeholder="Message" style={{ width: '100%', padding: 10, marginTop: 8, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8 }} /><button onClick={async () => { await supabase.from('notifications').insert({ title: notiTitle, message: notiMsg }); notify("Noti LIVE") }} style={{ width: '100%', padding: 10, marginTop: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8 }}>Send All</button></div>}
    </div>
  )
}