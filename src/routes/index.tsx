import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: LoginAgerMoto,
})

const SONGS = [
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
  { name: "W🌍RLD GROUP", handle: "@worldgroupofficial", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "হিমাংশু মাহাতো", handle: "@mahatohimanshu755", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "Akeash Sardar", handle: "@sardarakeash61", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
  { name: "Alamgir Hossain", handle: "@alamgirhossain964939", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
]

const ACTIVITIES = [
  { user: "@kolkataofficial", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "22 দিন আগে", icon: "❤️", color: "#ff6b00" },
  { user: "@mahatohimanshu755", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "25 দিন আগে", icon: "❤️", color: "#ff6b00" },
  { user: "@sardarakeash61", text: "আপনাকে ফলো করেছে", time: "30 দিন আগে", icon: "👤+", color: "#ff6b00" },
  { user: "@kolkataofficial", text: "আপনার ভিডিওতে গিফট পাঠিয়েছে heart", time: "30 দিন আগে", icon: "❤️", color: "#ff6b00" },
  { user: "@officesottok", text: "আপনার ভিডিওতে লাইক দিয়েছে", time: "32 দিন আগে", icon: "❤️", color: "#ff6b00" },
]

type VideoItem = { id: number; user: string; email: string; caption: string; song: string; likes: number; time: string; videoUrl?: string }

function LoginAgerMoto() {
  const navigate = useNavigate()
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('sot_tok_user') || 'null') } catch { return null } })
  const [videos, setVideos] = useState<VideoItem[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_all_videos') || '[]') } catch { return [] } })
  const [tab, setTab] = useState<'home'|'explore'|'live'|'inbox'|'profile'>('home')
  const [showCamera, setShowCamera] = useState(false)
  const [showMusic, setShowMusic] = useState(false)
  const [selectedSong, setSelectedSong] = useState("")
  const [recording, setRecording] = useState(false)
  const [caption, setCaption] = useState("")
  const [searchSong, setSearchSong] = useState("")
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [myVideoUrl, setMyVideoUrl] = useState("")
  const [followed, setFollowed] = useState<string[]>([])
  const [beauty, setBeauty] = useState(50)
  const [filter, setFilter] = useState("Normal")
  const [speed, setSpeed] = useState("1x")
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
    setCurrentUser(user)
  }
  const logout = () => { setCurrentUser(null); localStorage.removeItem('sot_tok_user'); localStorage.removeItem('google_user') }
  const startCamera = async () => {
    setShowCamera(true)
    try { const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); if (videoRef.current) videoRef.current.srcObject = s } catch { alert('ক্যামেরার জন্য Allow চাপো') }
  }
  const onPickVideoFile = (e: any) => { const f = e.target.files?.[0]; if (!f) return; setMyVideoUrl(URL.createObjectURL(f)); setShowCamera(true) }
  const uploadVideo = () => {
    if (!currentUser) return
    const v: VideoItem = { id: Date.now(), user: currentUser.name, email: currentUser.email, caption: caption || "আমার নতুন ভিডিও 🔥", song: selectedSong || "কোনো গান নেই", likes: 0, time: "এখনই", videoUrl: myVideoUrl || "" }
    setVideos([v, ...videos]); setShowCamera(false); setCaption(""); setSelectedSong(""); setMyVideoUrl(""); setTab('home'); alert('আপলোড হয়ে গেছে! সবার হোমপেজে চলে গেছে ✅')
  }
  const makeVideoWithSong = (songName: string) => { setSelectedSong(songName); setShowMusic(false); startCamera() }

  // ===== লগইন না থাকলে - আগের লগইন ডিজাইন =====
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
        </div>
        <button onClick={() => openProfile('guest@sottok.com', 'Guest User')} style={{ width: '100%', background: 'transparent', color: '#aaa', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 12 }}>👀 গেস্ট হিসেবে দেখে নাও</button>
      </div>
    )
  }

  // ===== লগইন থাকলে - নতুন প্রো ডার্ক ডিজাইন =====
  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 90, fontFamily: 'sans-serif' }}>
      {/* টপ বার */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', position: 'sticky', top: 0, background: '#000', zIndex: 10, borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ fontSize: 20 }}>⚙️</span><span style={{ fontSize: 22, fontWeight: 'bold' }}>🔥 SOT <span style={{ color: '#ff2d55' }}>TOK</span></span></div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><span style={{ fontSize: 20 }}>💬</span><span style={{ fontSize: 20 }}>↗️</span><button onClick={logout} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: 20 }}>লগআউট</button></div>
      </div>

      {/* HOME TAB */}
      {tab === 'home' && (
        <div>
          <div style={{ padding: 14 }}>
            <div style={{ background: '#111', borderRadius: 16, padding: 14 }}>
              <b>👋 SOT tok</b> <span style={{ fontSize: 12, color: '#aaa' }}>{currentUser.email}</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={startCamera} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#000', color: '#fff', border: '1px solid #333', fontWeight: 'bold' }}>📸 ক্যামেরা দিয়ে বানাও</button>
                <button onClick={() => setShowMusic(true)} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#2563eb', color: '#fff', border: 0, fontWeight: 'bold' }}>🎵 গান দিয়ে বানাও</button>
              </div>
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: 11, borderRadius: 12, background: '#fff', color: '#000', border: 0, marginTop: 8, fontWeight: 'bold' }}>📁 গ্যালারি থেকে ভিডিও নাও</button>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onPickVideoFile} />
            </div>
          </div>

          {videos.length === 0 && <div style={{ textAlign: 'center', padding: '30px 20px', color: '#aaa', lineHeight: 1.8 }}>এখনো কোনো ভিডিও নেই।<br />উপরে 📸 চেপে প্রথম ভিডিও বানাও 🔥<br /><span style={{ fontSize: 12 }}>নিচে Recommended Users থেকে Follow করো</span></div>}

          {videos.map(v => (
            <div key={v.id} style={{ borderTop: '1px solid #222', padding: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ff2d55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{v.user?.[0]?.toUpperCase()}</div><div><b>{v.user}</b><div style={{ fontSize: 12, color: '#aaa' }}>{v.email} • {v.time}</div></div></div>
              <p>{v.caption}</p>
              <div onClick={() => setPlayingId(playingId === v.id ? null : v.id)} style={{ background: '#111', minHeight: 280, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                {v.videoUrl && playingId === v.id ? <video src={v.videoUrl} controls autoPlay loop style={{ width: '100%', height: 280, objectFit: 'cover' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 52 }}>{playingId === v.id ? '⏸️' : '▶️'}</div><div style={{ fontSize: 12, color: '#aaa' }}>{playingId === v.id ? 'চলছে - আবার চাপলে বন্ধ' : 'চাপ দিলেই ভিডিও চলবে'}</div><div style={{ color: '#facc15', marginTop: 6 }}>🎵 {v.song}</div></div>}
              </div>
              <div onClick={() => makeVideoWithSong(v.song)} style={{ background: '#111', padding: 11, borderRadius: 10, marginTop: 8, cursor: 'pointer', border: '1px solid #222' }}>🎵 {v.song} <span style={{ color: '#4d7cff', float: 'right' }}>এই গান দিয়ে ভিডিও বানাও →</span></div>
              <div style={{ display: 'flex', gap: 18, marginTop: 10 }}><span onClick={() => setVideos(videos.map(x => x.id === v.id ? { ...x, likes: x.likes + 1 } : x))}>❤️ {v.likes}</span><span>💬 কমেন্ট</span><span>↗️ শেয়ার</span></div>
            </div>
          ))}

          {/* Recommended Users - ছবির মতন */}
          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ fontSize: 18 }}>Recommended Users</b><span style={{ color: '#ff2d55' }}>Show all</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              {RECOMMENDED.map((u, i) => (
                <div key={i} style={{ background: '#fff', color: '#000', borderRadius: 16, overflow: 'hidden' }}>
                  <img src={u.img} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                  <div style={{ padding: 10 }}><b style={{ fontSize: 14 }}>{u.name}</b><div style={{ fontSize: 12, color: '#888' }}>{u.handle}</div>
                  <button onClick={() => setFollowed(followed.includes(u.handle) ? followed.filter(x => x !== u.handle) : [...followed, u.handle])} style={{ width: '100%', background: followed.includes(u.handle) ? '#111' : '#ff2d55', color: '#fff', border: 0, padding: 9, borderRadius: 10, marginTop: 8, fontWeight: 'bold' }}>{followed.includes(u.handle) ? '✓ Following' : 'Follow'}</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXPLORE */}
      {tab === 'explore' && (
        <div style={{ padding: 14 }}>
          <b style={{ fontSize: 18 }}>Recommended Users</b><span style={{ color: '#ff2d55', float: 'right' }}>Show all</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            {RECOMMENDED.map((u, i) => (
              <div key={i} style={{ background: '#fff', color: '#000', borderRadius: 16, overflow: 'hidden' }}><img src={u.img} style={{ width: '100%', height: 120, objectFit: 'cover' }} /><div style={{ padding: 10 }}><b>{u.name}</b><div style={{ fontSize: 12, color: '#888' }}>{u.handle}</div><button onClick={() => setFollowed(followed.includes(u.handle) ? followed.filter(x => x !== u.handle) : [...followed, u.handle])} style={{ width: '100%', background: '#ff2d55', color: '#fff', border: 0, padding: 9, borderRadius: 10, marginTop: 8, fontWeight: 'bold' }}>{followed.includes(u.handle) ? '✓ Following' : 'Follow'}</button></div></div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE */}
      {tab === 'live' && <div style={{ padding: 40, textAlign: 'center' }}><div style={{ fontSize: 50 }}>📡</div><h3>লাইভ</h3><p style={{ color: '#aaa' }}>খুব তাড়াতাড়ি লাইভ আসছে! 🔥</p><button onClick={startCamera} style={{ background: '#ff2d55', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 20, fontWeight: 'bold' }}>🔴 লাইভ শুরু করো</button></div>}

      {/* INBOX / ACTIVITY */}
      {tab === 'inbox' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}><h2 style={{ margin: 0 }}>Activity</h2><span style={{ background: '#111', padding: '6px 12px', borderRadius: 20, border: '1px solid #333' }}>💬 চ্যাট</span></div>
          <div style={{ display: 'flex', gap: 20, padding: '0 16px 12px', borderBottom: '1px solid #222' }}><b style={{ color: '#fff', borderBottom: '2px solid #ff2d55', paddingBottom: 6 }}>All</b><span style={{ color: '#888' }}>Likes</span><span style={{ color: '#888' }}>Comments</span><span style={{ color: '#888' }}>Followers</span></div>
          {ACTIVITIES.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid #111' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#ff6b00,#ff2d55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{a.icon}</div>
              <div><b>{a.user}</b> {a.text}<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{a.time}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE - ছবির মতন */}
      {tab === 'profile' && (
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#222', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, border: '4px solid #ff9500', boxShadow: '0 0 30px #ff950033' }}>👤</div>
          <h2 style={{ margin: '14px 0 4px' }}>@{currentUser.name?.replace(/\s/g, '_')?.toLowerCase() || 'sottok_star'}</h2>
          <p style={{ color: '#888', margin: 0 }}>SOT ID: {currentUser.email?.split('@')[0]} • 📋</p>
          <div style={{ display: 'inline-block', background: '#1a1a00', border: '1px solid #ffcc00', padding: '5px 14px', borderRadius: 20, fontSize: 13, color: '#ffcc00', marginTop: 10 }}>🔥 Level 10</div>
          <p style={{ color: '#ccc', lineHeight: 1.6 }}>স্বপ্ন দেখি, কনটেন্ট বানাই | ড্যান্স • ফান • লাইফস্টাইল |<br />ভারত থেকে ⭐</p>
          <div style={{ background: '#111', padding: '6px 14px', borderRadius: 20, display: 'inline-block', fontSize: 13 }}>📍 ভারত থেকে 🇮🇳</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', background: '#111', borderRadius: 16, padding: 16, marginTop: 16, border: '1px solid #222' }}>
            <div><b style={{ fontSize: 20 }}>120</b><div style={{ fontSize: 12, color: '#888' }}>Following</div></div>
            <div><b style={{ fontSize: 20 }}>15.2K</b><div style={{ fontSize: 12, color: '#888' }}>Followers</div></div>
            <div><b style={{ fontSize: 20 }}>89K</b><div style={{ fontSize: 12, color: '#888' }}>Likes</div></div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#3a2a00,#1a1a00)', borderRadius: 16, padding: 16, marginTop: 14, textAlign: 'left', border: '1px solid #ffcc0033' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>💰 আমার ওয়ালেট</b><b style={{ color: '#ffcc00', fontSize: 20 }}>🪙 0</b></div>
            <p style={{ fontSize: 13, color: '#aaa' }}>প্রতিটি ভিডিও পোস্টে 50 কয়েন — ২৪ ঘণ্টায় সর্বোচ্চ 50 কয়েন।</p>
            <div style={{ background: '#000', height: 6, borderRadius: 10 }}><div style={{ width: '0%', height: 6, background: '#ffcc00', borderRadius: 10 }} /></div>
            <p style={{ fontSize: 12, color: '#888' }}>আজ পাওয়া: 0/50 কয়েন</p>
            <p style={{ fontSize: 14 }}>বন্ধুকে রেফার করুন — প্রতি রেফারে ৪০ কয়েন</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: 10, borderRadius: 10 }}><b style={{ color: '#ffcc00' }}>কোড: {currentUser.email?.split('@')[0]?.toUpperCase()}</b><button style={{ background: '#ffcc00', border: 0, padding: '7px 14px', borderRadius: 20, fontWeight: 'bold' }}>শেয়ার</button></div>
          </div>
          <div style={{ marginTop: 16, background: '#111', borderRadius: 12, padding: 14, textAlign: 'left' }}><b>আমার ভিডিও ({videos.length})</b>{videos.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>এখনো ভিডিও বানাওনি, + চাপো</p>}</div>
        </div>
      )}

      {/* CAMERA - ছবির মতন TikTok ক্যামেরা */}
      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 99, color: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1, background: '#111', overflow: 'hidden' }}>
            {myVideoUrl ? <video src={myVideoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', right: 12, top: 60, display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'center', fontSize: 12 }}>
              <div onClick={() => setSpeed(speed === '1x' ? '2x' : '1x')}><div style={{ fontSize: 20 }}>⚡</div>Speed<br />{speed}</div>
              <div><div style={{ fontSize: 22 }}>✨</div>Beauty<br />{beauty}%</div>
              <div onClick={() => setFilter(filter === 'Normal' ? 'Cinematic' : 'Normal')}><div style={{ fontSize: 22 }}>✨</div>Filters<br />{filter}</div>
              <div><div style={{ fontSize: 22 }}>⏰</div>Timer<br />Off</div>
              <div onClick={() => setShowMusic(true)}><div style={{ fontSize: 22 }}>⋯</div>More</div>
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, background: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 12, fontSize: 12 }}>ফিল্টার: {filter} • বিউটি: {beauty}% • Speed: {speed} • Effect: নেই • গান: 🎵 {selectedSong || 'ট্রেন্ডিং'} &nbsp; Zoom: - 1x +</div>
          </div>
          <div style={{ background: '#000', padding: '14px 16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div onClick={() => setShowMusic(true)} style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>😊</div><div style={{ fontSize: 12 }}>Effects</div></div>
              <button onClick={() => setRecording(!recording)} style={{ width: 72, height: 72, borderRadius: '50%', background: recording ? '#111' : 'red', border: '4px solid #fff', color: '#fff', fontSize: 20 }}>{recording ? '⏹️' : '●'}</button>
              <div onClick={() => setShowMusic(true)} style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>🎵</div><div style={{ fontSize: 12 }}>Music</div></div>
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12, fontSize: 15 }}><b style={{ color: '#ffcc00' }}>Video</b><span style={{ color: '#888' }}>Photo</span><span style={{ color: '#888' }}>Live</span></div>
            <input placeholder="ক্যাপশন লেখো..." value={caption} onChange={e => setCaption(e.target.value)} style={{ width: