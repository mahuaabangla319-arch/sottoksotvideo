import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react"

export const Route = createFileRoute('/admin')({
  component: AdminGodMode,
})

function AdminGodMode() {
  const [tab, setTab] = useState("Boost")
  const [vidId, setVidId] = useState("")
  const [boostLikes, setBoostLikes] = useState("1000")

  // Supabase থাকলে পরে কানেক্ট করবো, আগে পেজটা খুলুক
  const [status, setStatus] = useState("Checking...")

  useEffect(()=>{
    setStatus("God Mode Active ✅ - Route is working!")
  },[])

  return (
    <div style={{minHeight:'100vh', background:'#000', color:'#fff', padding:20, fontFamily:'sans-serif'}}>
      <div style={{maxWidth:1000, margin:'0 auto'}}>
        <h1 style={{fontSize:32, fontWeight:900, color:'#3b82f6'}}>SOT TOK - ADMIN GOD MODE</h1>
        <p style={{color:'#22c55e'}}>{status}</p>
        <p style={{color:'#888', marginBottom:20}}>sottoksotvideo.lovable.app/admin - No Password</p>

        <div style={{display:'flex', gap:10, marginBottom:20, flexWrap:'wrap'}}>
          {["Boost","Verification","Banners","Music","Users"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 20px', borderRadius:10, border:'none', background: tab===t ? '#2563eb':'#222', color:'#fff', cursor:'pointer'}}>{t}</button>
          ))}
        </div>

        {tab==="Boost" && (
          <div style={{background:'#111', padding:20, borderRadius:16, border:'1px solid #222'}}>
            <h2>🚀 Video Boost Engine</h2>
            <p style={{color:'#888', fontSize:13}}>Video ID দাও আর Like বাড়াও</p>
            <input value={vidId} onChange={e=>setVidId(e.target.value)} placeholder="Video ID - e.g. abc123" style={{width:'100%', padding:14, marginTop:12, background:'#222', border:'1px solid #333', color:'#fff', borderRadius:10}} />
            <input value={boostLikes} onChange={e=>setBoostLikes(e.target.value)} placeholder="Like amount" style={{width:'100%', padding:14, marginTop:10, background:'#222', border:'1px solid #333', color:'#fff', borderRadius:10}} />
            <button onClick={()=>alert(`Done! Video ${vidId} তে ${boostLikes} Like Add হলো (Supabase Connect করলে Live হবে)`)} style={{width:'100%', padding:14, marginTop:12, background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:'bold', fontSize:16}}>POST - BOOST NOW</button>
            <p style={{marginTop:15, fontSize:12, color:'#666'}}>এই পেজটা এখন খুলছে মানে Route ঠিক আছে। এবার আমি তোমাকে Full Supabase কোড দেবো।</p>
          </div>
        )}

        {tab==="Verification" && <div style={{background:'#111', padding:20, borderRadius:16}}>✅ Blue Tick, Gold Tick, Diamond Frame এখান থেকে দিতে পারবে</div>}
        {tab==="Banners" && <div style={{background:'#111', padding:20, borderRadius:16}}>🖼️ Banner Upload</div>}
        {tab==="Music" && <div style={{background:'#111', padding:20, borderRadius:16}}>🎵 Music Upload - Camera তে আসবে</div>}
        {tab==="Users" && <div style={{background:'#111', padding:20, borderRadius:16}}>👥 Users List</div>}
      </div>
    </div>
  )
}