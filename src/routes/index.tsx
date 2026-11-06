import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: LoginAgerMoto,
})

// ===== নতুন - শুধু গান + ট্রেন্ডিং এর জন্য, পুরনো কিছু কাটা হয়নি =====
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
type VideoItem = { id: number; user: string; email: string; caption: string; song: string; likes: number; time: string; videoUrl: string }

function LoginAgerMoto() {
  const navigate = useNavigate()
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')

  // ===== নতুন - শুধু লগইনের পর হোমপেজ / ক্যামেরা দেখানোর জন্য =====
  const [currentUser, setCurrentUser] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('sot_tok_user') || 'null') } catch { return null } })
  const [videos, setVideos] = useState<VideoItem[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_all_videos') || '[]') } catch { return [] } })
  const [tab, setTab] = useState<'home'|'profile'>('home')
  const [showCamera, setShowCamera] = useState(false)
  const [showMusic, setShowMusic] = useState(false)
  const [selectedSong, setSelectedSong] = useState("তুমি আমার")
  const [searchSong, setSearchSong] = useState("")
  const [caption, setCaption] = useState("")
  const [myVideoUrl, setMyVideoUrl] = useState("")
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [recording, setRecording] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<any>(null)
  const chunksRef = useRef<any[]>([])
  const streamRef = useRef<any>(null)

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
    // নতুন - /feed এ না গিয়ে একই পেজে হোমপেজ খুলবে, যাতে পুরনো ডিজাইন না ভাঙে
    setCurrentUser(user)
    setTab('home')
  }
  const logout = () => { setCurrentUser(null); localStorage.removeItem('sot_tok_user'); localStorage.removeItem('google_user') }

  // ===== নতুন - শুধু ক্যামেরা =====
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
  // ===== নতুন - পোস্ট করলেই সঙ্গে সঙ্গে হোমপেজে + সবাই দেখবে =====
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

  // ট্রেন্ডিং হিসাব - যত বেশি ভিডিও, তত উপরে
  const trending = ALL_SONGS.map(s => ({ ...s, count: videos.filter(v=>v.song===s.name).length })).sort((a,b)=>b.count-a.count)

  // ===== পুরনো লগইন পেজ - হুবহু যেমন ছিল =====
  if (!currentUser) {
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

  // ===== নতুন - লগইনের পর হোমপেজ + ক্যামেরা + প্রোফাইল =====
  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: 22, fontWeight: 'bold' }}>🔥 SOT <span style={{ color: '#ff2d55' }}>TOK</span></span>
        <div style={{ display: 'flex', gap: 8 }}><button onClick={() => setTab('profile')} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: 20 }}>👤 {currentUser.name}</button><button onClick={logout} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: 20 }}>লগআউট</button></div>
      </div>

      {tab === 'home' && (
        <div>
          {/* ট্রেন্ডিং গান - যত ভিডিও হবে তত উপরে যাবে */}
          <div style={{ padding: 14 }}>
            <b style={{ fontSize: 18 }}>🔥 ট্রেন্ডিং গান</b>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10, paddingBottom: 4 }}>
              {trending.map((s,i) => (
                <button key={s.name} onClick={() => makeVideoWithSong(s.name)} style={{ whiteSpace: 'nowrap', background: i===0 ? '#ff2d55' : '#111', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: 20 }}>
                  {i===0 ? '🔥 ' : ''}🎵 {s.name} • {s.count} ভিডিও
                </button>
              ))}
            </div>
            <div style={{ background: '#111', borderRadius: 16, padding: 14, marginTop: 12 }}>
              <b>👋 {currentUser.name}</b> <span style={{ fontSize: 12, color: '#aaa' }}>{currentUser.email}</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={startCamera} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#000', color: '#fff', border: '1px solid #333', fontWeight: 'bold' }}>📸 ক্যামেরা + গান দিয়ে বানাও</button>
                <button onClick={() => setShowMusic(true)} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#2563eb', color: '#fff', border: 0, fontWeight: 'bold' }}>🎵 গান বাছো</button>
              </div>
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: 11, borderRadius: 12, background: '#fff', color: '#000', border: 0, marginTop: 8, fontWeight: 'bold' }}>📁 গ্যালারি থেকে ভিডিও নাও</button>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onPickVideoFile} />
              <p style={{ textAlign: 'center', fontSize: 13, margin: '10px 0 0' }}>🎵 এখন বাজছে: <b style={{ color: '#ffcc00' }}>{selectedSong}</b></p>
            </div>
          </div>

          {videos.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#aaa' }}>এখনো কোনো ভিডিও নেই।<br />উপরে 📸 চেপে প্রথম ভিডিও বানাও 🔥</div>}

          {videos.map(v => (
            <div key={v.id} style={{ borderTop: '1px solid #222', padding: 14 }}>
              <b>{v.user}</b><div style={{ fontSize: 12, color: '#aaa' }}>{v.email} • {v.time}</div>
              <p>{v.caption}</p>
              <div onClick={() => setPlayingId(playingId === v.id ? null : v.id)} style={{ background: '#111', minHeight: 260, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                {v.videoUrl && playingId === v.id ? <video src={v.videoUrl} controls autoPlay loop style={{ width: '100%', height: 260, objectFit: 'cover' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 50 }}>{playingId === v.id ? '⏸️' : '▶️'}</div><div style={{ fontSize: 12, color: '#aaa' }}>চাপ দিলেই ভিডিও চলবে</div></div>}
              </div>
              {/* ভিডিওর নিচে গান - চাপ দিলেই ওই গান দিয়ে গাদা গাদা ভিডিও বানাতে পারবে */}
              <div onClick={() => makeVideoWithSong(v.song)} style={{ background: '#111', padding: 12, borderRadius: 10, marginTop: 8, cursor: 'pointer', border: '1px solid #222' }}>
                🎵 {v.song} <span style={{ color: '#4d7cff', float: 'right' }}>এই গান দিয়ে ভিডিও বানাও →</span>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>এই গানে এখন {videos.filter(x=>x.song===v.song).length} টা ভিডিও • চাপ দিলে তুমিও বানাতে পারবে</div>
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 10 }}><span onClick={() => setVideos(videos.map(x => x.id === v.id ? { ...x, likes: x.likes + 1 } : x))}>❤️ {v.likes}</span><span>💬 কমেন্ট</span><span>↗️ শেয়ার</span></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'profile' && (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#222', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '3px solid #ff9500' }}>👤</div>
          <h2>@{currentUser.name?.replace(/\s/g,'_')?.toLowerCase()}</h2>
          <p style={{ color: '#888' }}>{currentUser.email}</p>
          <p style={{ color: '#aaa' }}>আমার ভিডিও: {videos.filter(v=>v.email===currentUser.email).length} টা • মোট ভিডিও: {videos.length} টা</p>
          <button onClick={() => setTab('home')} style={{ background: '#ff2d55', color: '#fff', border: 0, padding: '10px 20px', borderRadius: 20, fontWeight: 'bold' }}>হোমে যাও</button>
          <div style={{ textAlign: 'left', marginTop: 16 }}>
            {videos.filter(v=>v.email===currentUser.email).map(v => (
              <div key={v.id} style={{ background: '#111', padding: 12, borderRadius: 12, marginBottom: 10 }}><b>{v.caption}</b><div style={{ fontSize: 12, color: '#888' }}>🎵 {v.song}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* ক্যামেরা - গান + গ্যালারি + লিপসিং */}
      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 99, color: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1, background: '#111' }}>
            {myVideoUrl ? <video src={myVideoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', top: 12, left: 12, background: recording ? 'red' : 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 20, fontSize: 13 }}>{recording ? '● REC চলছে...' : '🎵 ' + selectedSong}</div>
            <div style={{ position: 'absolute', right: 12, top: 60, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center', fontSize: 12 }}>
              <div><div style={{ fontSize: 22 }}>✨</div>Beauty</div><div><div style={{ fontSize: 22 }}>✨</div>Filters</div><div><div style={{ fontSize: 22 }}>⏰</div>Timer</div>
            </div>
          </div>
          <div style={{ background: '#000', padding: '14px 16px 20px' }}>
            {/* ক্যামেরায় গান বাছা - লিপসিং এর জন্য */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {ALL_SONGS.map(s => (
                <button key={s.name} onClick={() => setSelectedSong(s.name)} style={{ whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 20, background: selectedSong===s.name ? '#ff2d55' : '#222', color: '#fff', border: 0 }}>🎵 {s.name}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div onClick={() => setShowMusic(true)} style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>😊</div><div style={{ fontSize: 12 }}>Effects</div></div>
              <button onClick={toggleRecord} style={{ width: 72, height: 72, borderRadius: '50%', background: recording ? '#111' : 'red', border: '4px solid #fff', color: '#fff', fontSize: 20 }}>{recording ? '⏹️' : '●'}</button>
              <div onClick={() => setShowMusic(true)} style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>🎵</div><div style={{ fontSize: 12 }}>Music</div></div>
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa' }}>{recording ? 'রেকর্ড হচ্ছে... শেষ করতে আবার লাল বাটন চাপো' : myVideoUrl ? 'ভিডিও রেডি ✅ নিচে আপলোড চাপো' : 'লিপসিং করতে লাল বাটন চাপো - গান বাজবে'}</p>
            <input placeholder="ক্যাপশন লেখো..." value={caption} onChange={e => setCaption(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setShowCamera(false)} style={{ flex: 1, padding: 11, borderRadius: 10, background: '#222', color: '#fff', border: 0 }}>✕ বন্ধ করো</button>
              <button onClick={uploadVideo} style={{ flex: 1, padding: 11, borderRadius: 10, background: '#ffcc00', fontWeight: 'bold', border: 0 }}>⬆️ পোস্ট করো - হোমপেজে যাবে</button>
            </div>
          </div>
        </div>
      )}

      {/* মিউজিক বাছা - প্রোফাইল থেকে */}
      {showMusic && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 100, padding: 16, overflowY: 'auto', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>🎵 মিউজিক বাছো</h3><button onClick={() => setShowMusic(false)} style={{ background: '#222', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 20 }}>✕</button></div>
          <input placeholder="গানের নাম খুঁজো..." value={searchSong} onChange={e => setSearchSong(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }} />
          <p style={{ fontSize: 13, color: '#aaa' }}>🔥 ট্রেন্ডিং - যত ভিডিও হবে তত উপরে যাবে</p>
          {trending.filter(s => s.name.includes(searchSong) || searchSong==="").map(s => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #222' }}>
              <div><b>{s.name}</b><div style={{ fontSize: 12, color: '#888' }}>{s.singer} • {s.cat} • 🔥 {s.count} ভিডিও</div></div>
              <button onClick={() => makeVideoWithSong(s.name)} style={{ padding: '8px 14px', borderRadius: 20, background: '#ff2d55', color: '#fff', border: 0 }}>এই গান দিয়ে বানাও</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#111', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 12px', zIndex: 50 }}>
        <span onClick={() => setTab('home')} style={{ textAlign: 'center', color: tab==='home' ? '#ff2d55' : '#aaa' }}><div style={{ fontSize: 22 }}>🏠</div><div style={{ fontSize: 12 }}>হোম</div></span>
        <button onClick={startCamera} style={{ width: 56, height: 56, borderRadius: '50%', background: '#ff2d55', color: '#fff', fontSize: 30, border: '3px solid #fff', marginTop: -28 }}>+</button>
        <span onClick={() => setTab('profile')} style={{ textAlign: 'center', color: tab==='profile' ? '#ff2d55' : '#aaa' }}><div style={{ fontSize: 22 }}>👤</div><div style={{ fontSize: 12 }}>প্রোফাইল</div></span>
      </div>
    </div>
  )
}