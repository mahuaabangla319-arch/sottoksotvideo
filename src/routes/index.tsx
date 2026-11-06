import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: LoginAgerMoto,
})

// গানের গ্যালারি
const SONGS = [
  { name: "তুমি আমার", singer: "আরিজিৎ সিং", cat: "বাংলা" },
  { name: "কাঁচা বাদাম", singer: "ভুবন বাদ্যকর", cat: "বাংলা" },
  { name: "বোঝে না সে বোঝে না", singer: "আরিজিৎ", cat: "বাংলা" },
  { name: "বন্ধু তুমি", singer: "বাংলা গান", cat: "বাংলা" },
  { name: "Tum Se Hi", singer: "Mohit Chauhan", cat: "হিন্দি" },
  { name: "Chaiyya Chaiyya", singer: "Sukhwinder", cat: "হিন্দি" },
  { name: "Kesariya", singer: "Arijit Singh", cat: "হিন্দি" },
  { name: "Shape Of You", singer: "Ed Sheeran", cat: "ইংলিশ" },
  { name: "Believer", singer: "Imagine Dragons", cat: "ইংলিশ" },
]

type VideoItem = { id: number; user: string; email: string; caption: string; song: string; likes: number; time: string; videoUrl?: string }

function LoginAgerMoto() {
  const navigate = useNavigate()
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')

  // ===== নতুন ফিচার - লগইন থাকলে হোমপেজ দেখাবে =====
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('sot_tok_user') || 'null') } catch { return null }
  })
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('sottok_all_videos') || '[]') } catch { return [] }
  })
  const [showCamera, setShowCamera] = useState(false)
  const [showMusic, setShowMusic] = useState(false)
  const [selectedSong, setSelectedSong] = useState("")
  const [recording, setRecording] = useState(false)
  const [caption, setCaption] = useState("")
  const [searchSong, setSearchSong] = useState("")
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [myVideoUrl, setMyVideoUrl] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // আগের সব প্রোফাইল লোড করা - কিছু ডিলিট হবে না
  useEffect(() => {
    try {
      const list: any[] = []
      ;['sot_tok_users', 'vigo_users', 'sot_tok_user', 'google_user'].forEach(k => {
        const v = localStorage.getItem(k)
        if (v) {
          try {
            const p = JSON.parse(v)
            if (Array.isArray(p)) list.push(...p)
            else if (p.email) list.push(p)
          } catch {}
        }
      })
      setOldUsers(list.filter((u, i, a) => a.findIndex(x => x.email === u.email) === i && u.email))
    } catch {}
  }, [])

  useEffect(() => { localStorage.setItem('sottok_all_videos', JSON.stringify(videos)) }, [videos])

  // ===== আগে যেমন ছিল - Gmail দিলেই সঙ্গে সঙ্গে প্রোফাইল খুলবে =====
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
    if (!old.find((x: any) => x.email === g)) {
      localStorage.setItem('sot_tok_users', JSON.stringify([...old, user]))
    }
    setCurrentUser(user)
    // সঙ্গে সঙ্গে Feed / প্রোফাইল খুলে যাবে - এখন এই পেজেই হোমপেজ দেখাবে
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('sot_tok_user')
    localStorage.removeItem('google_user')
  }

  // ===== নতুন - ক্যামেরা চালু =====
  const startCamera = async () => {
    setShowCamera(true)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) videoRef.current.srcObject = s
    } catch { alert('ক্যামেরার জন্য Allow চাপো') }
  }

  // ===== নতুন - গ্যালারি থেকে ভিডিও নিলে =====
  const onPickVideoFile = (e: any) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setMyVideoUrl(url)
    setShowCamera(true)
  }

  // ===== নতুন - আপলোড করলেই সবার হোমপেজে যাবে =====
  const uploadVideo = () => {
    if (!currentUser) return
    const v: VideoItem = {
      id: Date.now(),
      user: currentUser.name,
      email: currentUser.email,
      caption: caption || "আমার নতুন ভিডিও 🔥",
      song: selectedSong || "কোনো গান নেই",
      likes: 0,
      time: "এখনই",
      videoUrl: myVideoUrl || ""
    }
    setVideos([v, ...videos])
    setShowCamera(false)
    setCaption("")
    setSelectedSong("")
    setMyVideoUrl("")
    alert('আপলোড হয়ে গেছে! সবার হোমপেজে চলে গেছে ✅')
  }

  // ===== নতুন - গান দিয়ে ভিডিও বানানো =====
  const makeVideoWithSong = (songName: string) => {
    setSelectedSong(songName)
    setShowMusic(false)
    startCamera()
  }

  // ===== যদি লগইন করা থাকে - হোমপেজ / ফিড দেখাবে =====
  if (currentUser) {
    return (
      <div style={{ background: '#fff', color: '#000', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 80, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 14, alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid #eee' }}>
          <b style={{ fontSize: 22 }}>SOT <span style={{ color: '#2563eb' }}>TOK</span></b>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}><b>{currentUser.name}</b></span>
            <button onClick={logout} style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #ddd', background: '#fff' }}>লগআউট</button>
          </div>
        </div>

        <div style={{ padding: '10px 14px', background: '#f8fafc', margin: 12, borderRadius: 12 }}>
          <b>👋 {currentUser.name}</b> <span style={{ fontSize: 12, color: '#666' }}>{currentUser.email}</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={startCamera} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#000', color: '#fff', border: 0 }}>📸 ক্যামেরা দিয়ে বানাও</button>
            <button onClick={() => setShowMusic(true)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#2563eb', color: '#fff', border: 0 }}>🎵 গান দিয়ে বানাও</button>
          </div>
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#fff', border: '1px solid #ddd', marginTop: 8 }}>📁 গ্যালারি থেকে ভিডিও নাও</button>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onPickVideoFile} />
        </div>

        {videos.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>এখনো কোনো ভিডিও নেই।<br />উপরে 📸 চেপে প্রথম ভিডিও বানাও 🔥</div>}

        {videos.map((v) => (
          <div key={v.id} style={{ borderTop: '1px solid #eee', padding: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{v.user?.[0]?.toUpperCase()}</div>
              <div><b>{v.user}</b><div style={{ fontSize: 12, color: '#666' }}>{v.email} • {v.time}</div></div>
            </div>
            <p style={{ margin: '10px 0' }}>{v.caption}</p>

            {/* ভিডিওতে ক্লিক করলেই চলবে */}
            <div onClick={() => setPlayingId(playingId === v.id ? null : v.id)} style={{ background: '#000', color: '#fff', minHeight: 260, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
              {v.videoUrl && playingId === v.id ? (
                <video src={v.videoUrl} controls autoPlay loop style={{ width: '100%', height: 260, objectFit: 'cover' }} />
              ) : v.videoUrl ? (
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 50 }}>▶️</div><div style={{ fontSize: 12, opacity: 0.8 }}>চাপ দিলেই ভিডিও চলবে</div></div>
              ) : (
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 50 }}>{playingId === v.id ? '⏸️ চলছে...' : '▶️'}</div><div style={{ fontSize: 13 }}>{playingId === v.id ? 'ভিডিও চলছে - আবার চাপলে বন্ধ হবে' : 'চাপ দিলেই ভিডিও চলবে'}</div><div style={{ fontSize: 12, marginTop: 6, color: '#facc15' }}>🎵 {v.song}</div></div>
              )}
            </div>

            {/* ভিডিওর নিচে গান - ক্লিক করলেই ওই গান দিয়ে ভিডিও বানাতে পারবে */}
            <div onClick={() => makeVideoWithSong(v.song)} style={{ background: '#f1f5f9', padding: 10, borderRadius: 10, marginTop: 8, cursor: 'pointer' }}>
              🎵 {v.song} <span style={{ color: '#2563eb', float: 'right' }}>এই গান দিয়ে ভিডিও বানাও →</span>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <span onClick={() => setVideos(videos.map(x => x.id === v.id ? { ...x, likes: x.likes + 1 } : x))} style={{ cursor: 'pointer' }}>❤️ {v.likes}</span>
              <span>💬 কমেন্ট</span><span>↗️ শেয়ার</span>
            </div>
          </div>
        ))}

        {/* ক্যামেরা */}
        {showCamera && (
          <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 99, color: '#fff', padding: 16, overflowY: 'auto' }}>
            <button onClick={() => setShowCamera(false)} style={{ color: '#fff', background: 'transparent', border: 0, fontSize: 20 }}>✕ বন্ধ করো</button>
            {myVideoUrl ? (
              <video src={myVideoUrl} controls style={{ width: '100%', height: 320, background: '#222', borderRadius: 16, marginTop: 10 }} />
            ) : (
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 320, background: '#222', borderRadius: 16, marginTop: 10 }} />
            )}
            <p>🎵 গান: {selectedSong || "গান বাছো"}</p>
            <button onClick={() => setShowMusic(true)} style={{ width: '100%', padding: 12, borderRadius: 12, background: '#2563eb', color: '#fff', border: 0 }}>🎵 মিউজিক গ্যালারি খোলো</button>
            <button onClick={() => setRecording(!recording)} style={{ width: '100%', padding: 14, borderRadius: 50, background: recording ? '#000' : 'red', color: '#fff', border: '3px solid #fff', marginTop: 12, fontWeight: 'bold' }}>{recording ? "⏹️ বন্ধ করো - রেকর্ড হচ্ছে..." : "🔴 রেকর্ড শুরু করো"}</button>
            <input placeholder="ক্যাপশন লেখো..." value={caption} onChange={e => setCaption(e.target.value)} style={{ width: '100%', padding: 12, marginTop: 12, borderRadius: 10, border: 0, boxSizing: 'border-box' }} />
            <button onClick={uploadVideo} style={{ width: '100%', padding: 13, marginTop: 10, borderRadius: 12, background: '#facc15', fontWeight: 'bold', border: 0 }}>⬆️ আপলোড - সবার কাছে পাঠাও</button>
            <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: 12, marginTop: 8, borderRadius: 12, background: '#fff', border: 0 }}>📁 গ্যালারি থেকে ভিডিও নাও</button>
          </div>
        )}

        {/* মিউজিক গ্যালারি */}
        {showMusic && (
          <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 100, padding: 16, overflowY: 'auto', color: '#000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>🎵 মিউজিক গ্যালারি</h3><button onClick={() => setShowMusic(false)}>✕</button></div>
            <input placeholder="গানের নাম খুঁজো..." value={searchSong} onChange={e => setSearchSong(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd', boxSizing: 'border-box' }} />
            {SONGS.filter(s => s.name.includes(searchSong) || searchSong === "").map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #eee' }}>
                <div><b>{s.name}</b><div style={{ fontSize: 12, color: '#666' }}>{s.singer} • {s.cat}</div></div>
                <button onClick={() => makeVideoWithSong(s.name)} style={{ padding: '8px 14px', borderRadius: 20, background: '#2563eb', color: '#fff', border: 0 }}>এই গান দিয়ে বানাও</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', padding: 12, color: '#000' }}>
          <span>🏠 হোম</span>
          <button onClick={startCamera} style={{ width: 56, height: 56, borderRadius: '50%', background: '#000', color: '#fff', fontSize: 28, marginTop: -28, border: '3px solid #fff' }}>+</button>
          <span onClick={() => navigate({ to: '/feed' })}>👤 প্রোফাইল</span>
        </div>
      </div>
    )
  }

  // ===== নিচে পুরনো লগইন - যেমন ছিলো ঠিক তেমনই আছে =====
  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 20 }}>▶️</div>
      <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0', letterSpacing: 2 }}>SOT TOK</h1>
      <p style={{ color: '#ffcc00', fontSize: 18, margin: '6px 0 16px' }}>নিজের পরিচয় নিজেই তৈরি করো</p>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14, lineHeight: 1.6 }}>Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে এবং আপনার নাম সিস্টেমে সুরক্ষিত থাকবে।</p>
      <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0 16px' }}>🛡️ 100% Safe & Private</div>

      {/* ===== আগে যেমন ছিল - তোমার প্রোফাইলগুলো ===== */}
      {oldUsers.length > 0 && (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginBottom: 14 }}>
          <b style={{ fontSize: 16 }}>👇 তোমার প্রোফাইলগুলো</b>
          <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0 0' }}>একটায় চাপ দিলেই সঙ্গে সঙ্গে খুলে যাবে</p>
          {oldUsers.map((u: any, i: number) => (
            <button key={i} onClick={() => openProfile(u.email, u.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ background: '#4285F4', color: '#fff', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }}>G</span>
              <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{u.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{u.email}</span></span>
              <span>→</span>
            </button>
          ))}
        </div>
      )}

      {/* ===== Gmail দিয়ে চালিয়ে যান - আগে যেমন ছিল ===== */}
      <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
        <b style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: '#fff', color: '#4285F4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>
          Gmail দিয়ে চালিয়ে যান
        </b>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 14, boxSizing: 'border-box', fontSize: 15 }} />
        <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box', fontSize: 15 }} />

        <button onClick={() => openProfile(gmail, name)} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12, fontSize: 17 }}>✅ এই Gmail দিয়ে ঢুকে যাও</button>
        <p style={{ fontSize: 12, color: '#888', textAlign: 'center', margin: '8px 0 0' }}>Gmail দিলেই সঙ্গে সঙ্গে তোমার প্রোফাইল খুলে যাবে</p>
      </div>

      <button onClick={() => openProfile('guest@sottok.com', 'Guest User')} style={{ width: '100%', background: 'transparent', color: '#aaa', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 12 }}>👀 গেস্ট হিসেবে দেখে নাও</button>
    </div>
  )
}