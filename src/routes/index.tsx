import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: LoginAgerMoto,
})

const ALL_SONGS = [
  { name: "তুমি আমার", singer: "আরিজিৎ সিং", cat: "বাংলা" },
  { name: "কাঁচা বাদাম", singer: "ভুবন বাদ্যকর", cat: "বাংলা" },
  { name: "বোঝে না সে বোঝে না", singer: "আরিজিৎ", cat: "বাংলা" },
  { name: "Tum Se Hi", singer: "Mohit Chauhan", cat: "হিন্দি" },
  { name: "Chaiyya Chaiyya", singer: "Sukhwinder", cat: "হিন্দি" },
  { name: "Kesariya", singer: "Arijit Singh", cat: "হিন্দি" },
  { name: "Shape Of You", singer: "Ed Sheeran", cat: "ইংলিশ" },
  { name: "Believer", singer: "Imagine Dragons", cat: "ইংলিশ" },
]

const RECOMMENDED = [
  { name: "Kolkata Official", handle: "@kolkataofficial", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "Bankura official", handle: "@sottokofficial", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "WORLD GROUP", handle: "@worldgroupofficial", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "হিমাংশু মাহাতো", handle: "@mahatohimanshu755", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "Akeash Sardar", handle: "@sardarakeash61", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "Alamgir Hossain", handle: "@alamgirhossain964939", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
]

const VIRAL = [
  { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", views: 98 },
  { img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", views: 72 },
  { img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400", views: 65 },
  { img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", views: 63 },
  { img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", views: 53 },
  { img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", views: 48 },
]

const LIVES = [
  { title: "Music LiveHouse 🎤", handle: "@priya_12 • Singing", viewers: 1245, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" },
  { title: "Asansol Adda 🔥", handle: "@rahul_asansol • Adda", viewers: 850, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
  { title: "Dance Queen 💃", handle: "@sneha_sing • Dance", viewers: 2100, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" },
]

const ACTIVITIES = [
  { user: "@kolkataofficial", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "22 দিন আগে", icon: "♡" },
  { user: "@mahatohimanshu755", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "25 দিন আগে", icon: "♡" },
  { user: "@mahatohimanshu755", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "29 দিন আগে", icon: "♡" },
  { user: "@sardarakeash61", text: "আপনাকে ফলো করেছে", time: "30 দিন আগে", icon: "👤+" },
  { user: "@kolkataofficial", text: "আপনার ভিডিওতে গিফট পাঠিয়েছে heart", time: "30 দিন আগে", icon: "♡" },
  { user: "@mahatohimanshu755", text: "আপনাকে ফলো করেছে", time: "31 দিন আগে", icon: "👤+" },
  { user: "@kolkataofficial", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "32 দিন আগে", icon: "♡" },
  { user: "@officesottok", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "32 দিন আগে", icon: "♡" },
]

type VideoItem = { id: number; user: string; email: string; caption: string; song: string; likes: number; time: string; videoUrl: string }

function LoginAgerMoto() {
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('sot_tok_user') || 'null') } catch { return null } })
  const [videos, setVideos] = useState<VideoItem[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_all_videos') || '[]') } catch { return [] } })
  const [tab, setTab] = useState<'home'|'explore'|'live'|'inbox'|'profile'>('home')
  const [showCamera, setShowCamera] = useState(false)
  const [showMusic, setShowMusic] = useState(false)
  const [selectedSong, setSelectedSong] = useState("তুমি আমার")
  const [searchSong, setSearchSong] = useState("")
  const [caption, setCaption] = useState("")
  const [myVideoUrl, setMyVideoUrl] = useState("")
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [recording, setRecording] = useState(false)
  const [followed, setFollowed] = useState<string[]>([])
  const [beauty, setBeauty] = useState(50)
  const [filterName, setFilterName] = useState("Normal")
  const [speed, setSpeed] = useState("1x")
  const [zoom, setZoom] = useState(1)
  const [mode, setMode] = useState<'Video'|'Photo'|'Live'>('Video')
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<any>(null)
  const chunksRef = useRef<any[]>([])
  const streamRef = useRef<any>(null)

  useEffect(() => {
    try {
      const list: any[] = []
      ;['sot_tok_users', 'vigo_users', 'sot_tok_user', 'google_user'].forEach(k => {
        const v = localStorage.getItem(k)
        if (v) { try { const p = JSON.parse(v); if (Array.isArray(p)) list.push(...p); else if (p.email) list.push(p) } catch {} }
      })
      setOldUsers(list.filter((u, i, a) => a.findIndex(x => x.email === u.email) === i && u.email))
    } catch {}
  }, [])
  useEffect(() => { localStorage.setItem('sottok_all_videos', JSON.stringify(videos)) }, [videos])

  const openProfile = (gmailInput: string, nameInput?: string) => {
    let g = gmailInput.trim().toLowerCase()
    if (!g) { alert('ভাই, Gmail টা লেখো'); return }
    if (!g.includes('@')) g += '@gmail.com'
    const finalName = nameInput || g.split('@')[0]
    const user = { name: finalName, email: g, id: g, loginType: 'gmail' }
    localStorage.setItem('vigo_user_name', finalName)
    localStorage.setItem('vigo_user_id', g)
    localStorage.setItem('vigo_user_email', g)
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    localStorage.setItem('google_user', JSON.stringify(user))
    const old = JSON.parse(localStorage.getItem('sot_tok_users') || '[]')
    if (!old.find((x: any) => x.email === g)) localStorage.setItem('sot_tok_users', JSON.stringify([...old, user]))
    setCurrentUser(user); setTab('home')
  }
  const logout = () => { setCurrentUser(null); localStorage.removeItem('sot_tok_user'); localStorage.removeItem('google_user') }

  const startCamera = async () => {
    setShowCamera(true); setMyVideoUrl("")
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = s
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s }, 300)
      const rec = new MediaRecorder(s)
      chunksRef.current = []
      rec.ondataavailable = (e:any) => { if(e.data.size>0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const reader = new FileReader()
        reader.onload = () => { setMyVideoUrl(reader.result as string); alert('রেকর্ড হয়ে গেছে! ✅ এখন আপলোড চাপো') }
        reader.readAsDataURL(blob)
      }
      recorderRef.current = rec
    } catch { alert('ক্যামেরার জন্য Allow চাপো') }
  }
  const toggleRecord = () => {
    if(!recording){ try{ recorderRef.current?.start(); setRecording(true) }catch{ alert('আগে ক্যামেরা চালু হতে দাও') } }
    else { try{ recorderRef.current?.stop(); setRecording(false); streamRef.current?.getTracks().forEach((t:any)=>t.stop()) }catch{} }
  }
  const onPickVideoFile = (e:any) => {
    const f = e.target.files?.[0]; if(!f) return
    const r = new FileReader(); r.onload=()=>{ setMyVideoUrl(r.result as string); setShowCamera(true); alert('গ্যালারি থেকে ভিডিও নেওয়া হয়ে গেছে ✅') }; r.readAsDataURL(f)
  }
  const uploadVideo = () => {
    if(!currentUser) return
    if(!myVideoUrl){ alert('আগে ভিডিও রেকর্ড করো বা গ্যালারি থেকে নাও!'); return }
    const v: VideoItem = { id: Date.now(), user: currentUser.name, email: currentUser.email, caption: caption || "আমার নতুন ভিডিও 🔥", song: selectedSong, likes: 0, time: "এখনই", videoUrl: myVideoUrl }
    const all = [v, ...videos]
    setVideos(all); localStorage.setItem('sottok_all_videos', JSON.stringify(all))
    setShowCamera(false); setCaption(""); setMyVideoUrl(""); setTab('home')
    alert('পোস্ট হয়ে গেছে! ✅ এখন হোমপেজে সবাই দেখতে পাবে')
  }
  const makeVideoWithSong = (songName:string) => { setSelectedSong(songName); setShowMusic(false); startCamera() }

  const trending = ALL_SONGS.map(s => ({ ...s, count: videos.filter(v=>v.song===s.name).length })).sort((a,b)=>b.count-a.count)

  // ===== পুরনো লগইন - হুবহু যেমন ছিল =====
  if (!currentUser) {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 20 }}>▶️</div>
        <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0', letterSpacing: 2 }}>SOT TOK</h1>
        <p style={{ color: '#ffcc00', fontSize: 18, margin: '6px 0 16px' }}>নিজের পরিচয় নিজেই তৈরি করো</p>
        <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14, lineHeight: 1.6 }}>Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে এবং আপনার নাম সিস্টেমে সুরক্ষিত থাকবে।</p>
        <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0 16px' }}>🛡️ 100% Safe & Private</div>
        {oldUsers.length > 0 && (
          <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginBottom: 14 }}>
            <b style={{ fontSize: 16 }}>👇 তোমার প্রোফাইলগুলো</b>
            <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0 0' }}>একটায় চাপ দিলেই সঙ্গে সঙ্গে খুলে যাবে</p>
            {oldUsers.map((u: any, i: number) => (
              <button key={i} onClick={() => openProfile(u.email, u.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <span style={{ background: '#4285F4', color: '#fff', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }}>G</span>
                <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{u.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{u.email}</span></span><span>→</span>
              </button>
            ))}
          </div>
        )}
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
          <b style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ background: '#fff', color: '#4285F4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>Gmail দিয়ে চালিয়ে যান</b>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 14, boxSizing: 'border-box', fontSize: 15 }} />
          <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box', fontSize: 15 }} />
          <button onClick={() => openProfile(gmail, name)} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12, fontSize: 17 }}>✅ এই Gmail দিয়ে ঢুকে যাও</button>
          <p style={{ fontSize: 12, color: '#888', textAlign: 'center', margin: '8px 0 0' }}>Gmail দিলেই সঙ্গে সঙ্গে তোমার প্রোফাইল খুলে যাবে</p>
        </div>
        <button onClick={() => openProfile('guest@sottok.com', 'Guest User')} style={{ width: '100%', background: 'transparent', color: '#aaa', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 12 }}>👀 গেস্ট হিসেবে দেখে নাও</button>
      </div>
    )
  }

  // ===== লগইনের পর - ৭টা ছবির ডিজাইন =====
  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      {/* টপ বার - ছবি ১ মতন */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222', background: '#000' }}>
        <span style={{ fontSize: 24, fontWeight: 'bold', lineHeight: 1.1 }}>🔥 SOT<br /><span style={{ color: '#ff2d55' }}>TOK</span></span>
        <div style={{ display: 'flex', gap: 8 }}><span style={{ background: '#111', border: '1px solid #333', padding: '8px 14px', borderRadius: 20, display: 'flex', gap: 6, alignItems: 'center' }}>👤 SOT TOK User</span><button onClick={logout} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 14px', borderRadius: 20 }}>লগআউট</button></div>
      </div>

      {tab === 'home' && (
        <div>
          {/* ট্রেন্ডিং গান - ছবি ১ */}
          <div style={{ padding: '14px 16px 0' }}>
            <b style={{ fontSize: 20 }}>🔥 ট্রেন্ডিং গান</b>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginTop: 12, paddingBottom: 6 }}>
              {trending.map((s,i) => (
                <button key={s.name} onClick={() => makeVideoWithSong(s.name)} style={{ whiteSpace: 'nowrap', background: i===0 ? '#ff2d55' : '#111', color: '#fff', border: '1px solid #333', padding: '12px 16px', borderRadius: 20, fontSize: 15 }}>{i===0 ? '🔥 ' : ''}🎵 {s.name} • {s.count} ভিডিও</button>
              ))}
            </div>
          </div>

          {/* SOT TOK User বক্স - ছবি ১ */}
          <div style={{ padding: 14 }}>
            <div style={{ background: '#111', borderRadius: 20, padding: 16 }}>
              <b style={{ fontSize: 18 }}>👋 SOT TOK User</b> <span style={{ fontSize: 13, color: '#aaa' }}>{currentUser.email}</span>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button onClick={startCamera} style={{ flex: 1, padding: 14, borderRadius: 14, background: '#000', color: '#fff', border: '1px solid #333', fontWeight: 'bold', fontSize: 15 }}>📸 ক্যামেরা + গান<br />দিয়ে বানাও</button>
                <button onClick={() => setShowMusic(true)} style={{ flex: 1, padding: 14, borderRadius: 14, background: '#2563eb', color: '#fff', border: 0, fontWeight: 'bold', fontSize: 16 }}>🎵 গান বাছো</button>
              </div>
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: 14, borderRadius: 14, background: '#fff', color: '#000', border: 0, marginTop: 10, fontWeight: 'bold', fontSize: 16 }}>📁 গ্যালারি থেকে ভিডিও নাও</button>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onPickVideoFile} />
              <p style={{ textAlign: 'center', margin: '12px 0 0' }}>🎵 এখন বাজছে: <b style={{ color: '#ffcc00' }}>{selectedSong}</b></p>
            </div>
          </div>

          {/* নতুন ভিডিও - পোস্ট করলেই হোমে */}
          {videos.length === 0 && <div style={{ textAlign: 'center', padding: '20px 20px', color: '#aaa', fontSize: 18, lineHeight: 1.8 }}>এখনো কোনো ভিডিও নেই।<br />উপরে 📸 চেপে প্রথম ভিডিও বানাও 🔥</div>}
          {videos.map(v => (
            <div key={v.id} style={{ borderTop: '1px solid #222', padding: 14 }}>
              <b>{v.user}</b><div style={{ fontSize: 12, color: '#aaa' }}>{v.email} • {v.time}</div>
              <p>{v.caption}</p>
              <div onClick={() => setPlayingId(playingId === v.id ? null : v.id)} style={{ background: '#111', minHeight: 260, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                {v.videoUrl && playingId === v.id ? <video src={v.videoUrl} controls autoPlay loop style={{ width: '100%', height: 260, objectFit: 'cover' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 50 }}>{playingId === v.id ? '⏸️' : '▶️'}</div><div style={{ fontSize: 12, color: '#aaa' }}>চাপ দিলেই ভিডিও চলবে</div></div>}
              </div>
              <div onClick={() => makeVideoWithSong(v.song)} style={{ background: '#111', padding: 12, borderRadius: 10, marginTop: 8, cursor: 'pointer', border: '1px solid #222' }}>🎵 {v.song} <span style={{ color: '#4d7cff', float: 'right' }}>এই গান দিয়ে ভিডিও বানাও →</span><div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>এই গানে এখন {videos.filter(x=>x.song===v.song).length} টা ভিডিও • চাপ দিলে তুমিও বানাতে পারবে</div></div>
              <div style={{ display: 'flex', gap: 18, marginTop: 10 }}><span onClick={() => setVideos(videos.map(x => x.id === v.id ? { ...x, likes: x.likes + 1 } : x))}>❤️ {v.likes}</span><span>💬 কমেন্ট</span><span>↗️ শেয়ার</span></div>
            </div>
          ))}

          {/* ভাইরাল ভিডিও - ছবি ৩ */}
          <div style={{ padding: 14, background: '#fff', color: '#000', marginTop: 10 }}>
            <b style={{ fontSize: 20 }}>🔥 ভাইরাল ভিডিও</b>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
              {VIRAL.map((it,i) => (
                <div key={i} onClick={() => makeVideoWithSong(trending[0]?.name || "তুমি আমার")} style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', cursor: 'pointer', background: '#000' }}><img src={it.img} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} alt="" /><span style={{ position: 'absolute', bottom: 6, left: 6, color: '#fff', fontWeight: 'bold', fontSize: 13 }}>▶ {it.views}</span></div>
              ))}
            </div>
          </div>

          {/* Recommended Users - ছবি ৪ */}
          <div style={{ padding: 14, background: '#fff', color: '#000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b style={{ fontSize: 18 }}>Recommended Users</b><span style={{ color: '#ff2d55' }}>Show all</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              {RECOMMENDED.map((u,i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, overflow: 'hidden' }}>
                  <img src={u.img} style={{ width: '100%', height: 110, objectFit: 'cover' }} alt="" />
                  <div style={{ padding: 10 }}><b style={{ fontSize: 14 }}>{u.name}</b><div style={{ fontSize: 12, color: '#888' }}>{u.handle}</div>
                  <button onClick={() => setFollowed(followed.includes(u.handle) ? followed.filter(x=>x!==u.handle) : [...followed, u.handle])} style={{ width: '100%', background: followed.includes(u.handle) ? '#111' : '#ff2d55', color: '#fff', border: 0, padding: 9, borderRadius: 10, marginTop: 8, fontWeight: 'bold' }}>{followed.includes(u.handle) ? '✓ Following' : 'Follow'}</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'explore' && (
        <div style={{ padding: 14, background: '#fff', color: '#000', minHeight: '60vh' }}>
          <b style={{ fontSize: 20 }}>🔥 ভাইরাল ভিডিও</b>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
            {VIRAL.map((it,i) => (<div key={i} style={{ borderRadius: 14, overflow: 'hidden', position: 'relative' }}><img src={it.img} style={{ width: '100%', height: 130, objectFit: 'cover' }} alt="" /><span style={{ position: 'absolute', bottom: 6, left: 6, color: '#fff', fontWeight: 'bold' }}>▶ {it.views}</span></div>))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}><b style={{ fontSize: 18 }}>Recommended Users</b><span style={{ color: '#ff2d55' }}>Show all</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            {RECOMMENDED.map((u,i) => (
              <div key={i} style={{ border: '1px solid #eee', borderRadius: 16, overflow: 'hidden' }}><img src={u.img} style={{ width: '100%', height: 110, objectFit: 'cover' }} alt="" /><div style={{ padding: 10 }}><b>{u.name}</b><div style={{ fontSize: 12, color: '#888' }}>{u.handle}</div><button onClick={() => setFollowed(followed.includes(u.handle) ? followed.filter(x=>x!==u.handle) : [...followed, u.handle])} style={{ width: '100%', background: '#ff2d55', color: '#fff', border: 0, padding: 9, borderRadius: 10, marginTop: 8, fontWeight: 'bold' }}>{followed.includes(u.handle) ? '✓ Following' : 'Follow'}</button></div></div>
            ))}
          </div>
        </div>
      )}

      {tab === 'live' && (
        <div style={{ padding: 16 }}>
          <b style={{ fontSize: 22 }}>🔴 SOTTOK LIVE</b><p style={{ color: '#888', margin: '4px 0 14px' }}>Ekhon Live Cholche - Join Koro</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {LIVES.map((l,i) => (
              <div key={i} onClick={startCamera} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}><img src={l.img} style={{ width: '100%', height: 200, objectFit: 'cover' }} alt="" /><span style={{ position: 'absolute', top: 8, left: 8, background: '#ff2d55', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 'bold' }}>🔴 LIVE</span><span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 20, fontSize: 12 }}>👁 {l.viewers}</span><div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}><b>{l.title}</b><div style={{ fontSize: 12, color: '#ffcc00' }}>{l.handle}</div></div></div>
            ))}
          </div>
          <button onClick={startCamera} style={{ width: '100%', background: '#ff2d55', color: '#fff', border: 0, padding: 15, borderRadius: 14, fontWeight: 'bold', fontSize: 16, marginTop: 14 }}>▶️ Go Live - Ami Live Korbo</button>
        </div>
      )}

      {tab === 'inbox' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}><h2 style={{ margin: 0 }}>← Activity</h2><span style={{ background: '#111', padding: '8px 14px', borderRadius: 20, border: '1px solid #333' }}>💬 চ্যাট</span></div>
          <div style={{ display: 'flex', gap: 22, padding: '0 16px 12px', borderBottom: '1px solid #222' }}><b style={{ borderBottom: '2px solid #ff2d55', paddingBottom: 6 }}>All</b><span style={{ color: '#888' }}>Likes</span><span style={{ color: '#888' }}>Comments</span><span style={{ color: '#888' }}>Followers</span></div>
          {ACTIVITIES.map((a,i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid #111' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#ff9500,#ff2d55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{a.icon}</div>
              <div><b>{a.user}</b> {a.text}<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{a.time}</div></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'profile' && (
        <div style={{ padding: '16px 16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 22 }}>⚙️</span><span style={{ fontSize: 20, fontWeight: 'bold' }}>🔥 SOT TOK</span><span style={{ display: 'flex', gap: 12 }}>💬 ↗️</span></div>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#222', margin: '16px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, border: '4px solid #ff9500', boxShadow: '0 0 30px #ff950033' }}>👤</div>
          <h2 style={{ margin: '14px 0 4px', fontSize: 26 }}>@{currentUser.name?.replace(/\s/g,'_')?.toLowerCase() || 'sottok_star'}</h2>
          <p style={{ color: '#888', margin: 0 }}>SOT ID: {currentUser.email?.split('@')[0]} 📋</p>
          <div style={{ display: 'inline-block', background: '#1a1a00', border: '1px solid #ffcc00', padding: '5px 14px', borderRadius: 20, fontSize: 13, color: '#ffcc00', margin