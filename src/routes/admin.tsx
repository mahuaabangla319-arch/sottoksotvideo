import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [tab, setTab] = useState("Boost Engine");
  const [vidId, setVidId] = useState(""); const [vLikes, setVLikes] = useState("100"); const [vViews, setVViews] = useState("100");
  const [sotId, setSotId] = useState(""); const [fCount, setFCount] = useState("1000");
  const [verifyId, setVerifyId] = useState(""); const [tick, setTick] = useState("blue");
  const [bannerUrl, setBannerUrl] = useState(""); const [songTitle, setSongTitle] = useState(""); const [songUrl, setSongUrl] = useState("");
  const [frameName, setFrameName] = useState("Diamond"); const [frameUrl, setFrameUrl] = useState("");
  const [users, setUsers] = useState<any[]>([]); const [videos, setVideos] = useState<any[]>([]);

  useEffect(()=>{ 
    supabase.from("profiles").select("*").limit(20).then(r=>r.data && setUsers(r.data));
    supabase.from("videos").select("*").limit(20).then(r=>r.data && setVideos(r.data));
  },[]);

  const boostVideo = async () => {
    if(!vidId) return alert("Video ID দাও দাদা");
    const {data} = await supabase.from("videos").select("likes,views").eq("id",vidId).single();
    await supabase.from("videos").update({likes:(data?.likes||0)+parseInt(vLikes), views:(data?.views||0)+parseInt(vViews)}).eq("id",vidId);
    alert(`✅ ${vidId} তে +${vLikes} Like +${vViews} View Done!`);
  };

  const boostUser = async () => {
    if(!sotId) return alert("SOT ID দাও");
    const {data} = await supabase.from("profiles").select("followers_count").eq("sot_id",sotId).single();
    if(!data) return alert("SOT ID পাওয়া যায়নি");
    await supabase.from("profiles").update({followers_count:(data.followers_count||0)+parseInt(fCount)}).eq("sot_id",sotId);
    alert(`✅ ${sotId} তে +${fCount} Follower Done!`);
  };

  const giveTick = async () => {
    await supabase.from("profiles").update({is_verified:true, verification_type:tick}).eq("sot_id",verifyId);
    alert(`✅ ${verifyId} কে ${tick} Tick দেওয়া হলো`);
  };

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0a', color:'white', display:'flex'}}>
      <aside style={{width:220, background:'#18181b', padding:16}}>
        <h1 style={{color:'#3b82f6', fontWeight:'bold', marginBottom:20}}>SOT TOK<br/>GOD MODE</h1>
        {["Boost Engine","Verification & Frames","Banners","Music Library","Dashboard"].map(m=>(
          <button key={m} onClick={()=>setTab(m)} style={{width:'100%', textAlign:'left', padding:'10px 12px', borderRadius:8, marginBottom:6, background: tab===m ? '#2563eb' : '#27272a', border:'none', color:'white'}}>{m}</button>
        ))}
      </aside>
      <main style={{flex:1, padding:24}}>
        <h2 style={{fontSize:24, fontWeight:'bold', marginBottom:20}}>{tab}</h2>

        {tab==="Boost Engine" && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div style={{background:'#18181b', padding:20, borderRadius:12}}>
              <h3>🚀 Video Like/View বাড়াও</h3>
              <input placeholder="Video ID" value={vidId} onChange={e=>setVidId(e.target.value)} style={{width:'100%', padding:10, margin:'8px 0', background:'#27272a', border:'1px solid #3f3f46', color:'white', borderRadius:8}}/>
              <div style={{display:'flex', gap:8}}><input placeholder="Like 100" value={vLikes} onChange={e=>setVLikes(e.target.value)} style={{flex:1, padding:10, background:'#27272a', color:'white', borderRadius:8}}/><input placeholder="View 100" value={vViews} onChange={e=>setVViews(e.target.value)} style={{flex:1, padding:10, background:'#27272a', color:'white', borderRadius:8}}/></div>
              <button onClick={boostVideo} style={{width:'100%', padding:12, marginTop:12, background:'#2563eb', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>POST - Like/View বাড়াও</button>
              <div style={{marginTop:12, fontSize:12, background:'black', padding:8, borderRadius:8}}>{videos.slice(0,3).map(v=><div key={v.id}>{v.id.slice(0,8)} - {v.likes} likes</div>)}</div>
            </div>
            <div style={{background:'#18181b', padding:20, borderRadius:12}}>
              <h3>👥 Follower বাড়াও</h3>
              <input placeholder="SOT ID" value={sotId} onChange={e=>setSotId(e.target.value)} style={{width:'100%', padding:10, margin:'8px 0', background:'#27272a', color:'white', borderRadius:8}}/>
              <input placeholder="Follower 5000" value={fCount} onChange={e=>setFCount(e.target.value)} style={{width:'100%', padding:10, background:'#27272a', color:'white', borderRadius:8}}/>
              <button onClick={boostUser} style={{width:'100%', padding:12, marginTop:12, background:'#16a34a', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>POST - Follower বাড়াও</button>
            </div>
          </div>
        )}

        {tab==="Verification & Frames" && (
          <div style={{background:'#18181b', padding:20, borderRadius:12, maxWidth:400}}>
            <h3>✅ Blue Tick + Frame</h3>
            <input placeholder="SOT ID" value={verifyId} onChange={e=>setVerifyId(e.target.value)} style={{width:'100%', padding:10, margin:'8px 0', background:'#27272a', color:'white', borderRadius:8}}/>
            <select value={tick} onChange={e=>setTick(e.target.value)} style={{width:'100%', padding:10, background:'#27272a', color:'white', borderRadius:8}}><option value="blue">Blue Tick</option><option value="gold">Gold Tick</option><option value="red">Red Tick</option></select>
            <button onClick={giveTick} style={{width:'100%', padding:12, marginTop:12, background:'#2563eb', color:'white', border:'none', borderRadius:8}}>Give Blue Tick</button>
          </div>
        )}

        {tab==="Banners" && (
          <div style={{background:'#18181b', padding:20, borderRadius:12, maxWidth:400}}>
            <h3>Banner Add</h3><input placeholder="Banner Image URL" value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} style={{width:'100%', padding:10, background:'#27272a', color:'white', borderRadius:8}}/><button onClick={async()=>{await supabase.from("admin_banners").insert({image_url:bannerUrl}); alert("Banner Added")}} style={{width:'100%', padding:12, marginTop:12, background:'#2563eb', color:'white', border:'none', borderRadius:8}}>POST Banner</button>
          </div>
        )}

        {tab==="Music Library" && (
          <div style={{background:'#18181b', padding:20, borderRadius:12, maxWidth:400}}>
            <h3>🎵 গান Add</h3><input placeholder="Title" value={songTitle} onChange={e=>setSongTitle(e.target.value)} style={{width:'100%', padding:10, margin:'8px 0', background:'#27272a', color:'white', borderRadius:8}}/><input placeholder="MP3 URL" value={songUrl} onChange={e=>setSongUrl(e.target.value)} style={{width:'100%', padding:10, background:'#27272a', color:'white', borderRadius:8}}/><button onClick={async()=>{await supabase.from("admin_songs").insert({title:songTitle, audio_url:songUrl}); alert("Song Added")}} style={{width:'100%', padding:12, marginTop:12, background:'#9333ea', color:'white', border:'none', borderRadius:8}}>POST Song</button>
          </div>
        )}
      </main>
    </div>
  );
}