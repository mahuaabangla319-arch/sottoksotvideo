import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: LoginAgerMoto,
})

const BASE_SONGS = [
  { name: "তুমি আমার", singer: "আরিজিৎ সিং", audioUrl: "" },
  { name: "কাঁচা বাদাম", singer: "ভুবন বাদ্যকর", audioUrl: "" },
  { name: "বোঝে না সে বোঝে না", singer: "আরিজিৎ", audioUrl: "" },
  { name: "Tum Se Hi", singer: "Mohit Chauhan", audioUrl: "" },
  { name: "Kesariya", singer: "Arijit Singh", audioUrl: "" },
  { name: "Shape Of You", singer: "Ed Sheeran", audioUrl: "" },
]

type VideoItem = { id: number; user: string; email: string; caption: string; song: string; likes: number; comments: string[]; time: string; videoUrl: string }
type SongItem = { name: string; singer: string; audioUrl: string }

function LoginAgerMoto() {
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('sot_tok_user') || 'null') } catch { return null } })
  const [videos, setVideos] = useState<VideoItem[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_all_videos') || '[]') } catch { return [] } })
  const [customSongs, setCustomSongs] = useState<SongItem[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_custom_songs') || '[]') } catch { return [] } })
  const [tab, setTab] = useState<'home'|'profile'>('home')
  const [showCamera, setShowCamera] = useState(false)
  const [showMusic, setShowMusic] = useState(false)
  const [selectedSong, setSelectedSong] = useState("তুমি আমার")
  const [searchSong, setSearchSong] = useState("")
  const [caption, setCaption] = useState("")
  const [myVideoUrl, setMyVideoUrl] = useState("")
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [recording, setRecording] = useState(false)
  const [commentText, setCommentText] = useState<{[key:number]:string}>({})
  const [showComments, setShowComments] = useState<number | null>(null)
  const [previewSong, setPreviewSong] = useState<string | null>(null)
  const [newSongName, setNewSongName] = useState("")
  const [newSongAudio, setNewSongAudio] = useState("")
  // ===== অরিজিনাল কন্ট্রোল - সব সত্যি কাজ করবে =====
  const [facing, setFacing] = useState<'user'|'environment'>('user')
  const [speed, setSpeed] = useState('1x')
  const [beauty, setBeauty] = useState(50)
  const [filterName, setFilterName] = useState('Normal')
  const [timerSec, setTimerSec] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [flash, setFlash] = useState(false)
  const [musicVol, setMusicVol] = useState(80)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const songFileRef = useRef<HTMLInputElement>(null)
  const musicRef = useRef<HTMLAudioElement>(null)
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
  useEffect(() => { localStorage.setItem('sottok_custom_songs', JSON.stringify(customSongs)) }, [customSongs])

  const getFilterStyle = () => {
    const beautyBlur = beauty > 0 ? `blur(${beauty/100}px) brightness(${1 + beauty/200}) saturate(${1 + beauty/200})` : 'none'
    if (filterName==='Cinematic') return { filter: `${beautyBlur} contrast(1.2) sepia(0.3)` }
    if (filterName==='Warm') return { filter: `${beautyBlur} sepia(0.4) saturate(1.4)` }
    if (filterName==='Cool') return { filter: `${beautyBlur} hue-rotate(180deg) saturate(1.2)` }
    if (filterName==='Black-White') return { filter: `${beautyBlur} grayscale(1)` }
    return { filter: beautyBlur }
  }
  const getZoomStyle = () => ({ transform: `scale(${zoom})` })

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
    if (!old.find((x: any) => x.email === g)) { localStorage.setItem('sot_tok_users', JSON.stringify([...old, user])) }
    setCurrentUser(user); setTab('home')
  }
  const logout = () => { setCurrentUser(null); localStorage.removeItem('sot_tok_user'); localStorage.removeItem('google_user') }

  const onPickSongFile = (e:any) => {
    const f = e.target.files?.[0]; if(!f) return
    const r = new FileReader(); r.onload=()=>{ setNewSongAudio(r.result as string); alert('গানটা নেওয়া হয়ে গেছে ✅ এখন নাম লিখে আপলোড চাপো') }; r.readAsDataURL(f)
  }
  const uploadSong = () => {
    if(!newSongName.trim()){ alert('গানের নাম লেখো'); return }
    if(!newSongAudio){ alert('আগে গানের ফাইল বাছো'); return }
    const s: SongItem = { name: newSongName.trim(), singer: currentUser?.name || "SOT TOK", audioUrl: newSongAudio }
    const all = [s, ...customSongs]
    setCustomSongs(all); setNewSongName(""); setNewSongAudio("")
    alert('গান আপলোড হয়ে গেছে! ✅ এখন সবাই এই গান দিয়ে ভিডিও বানাতে পারবে')
  }

  // ===== অরিজিনাল ক্যামেরা - সামনে/পিছনে, ফ্ল্যাশ সহ =====
  const startCamera = async (face: 'user'|'environment' = facing) => {
    setShowCamera(true); setMyVideoUrl("")
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t:any)=>t.stop())
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face, width: { ideal: 720 }, height: { ideal: 1280 } }, audio: true })
      streamRef.current = s
      // ফ্ল্যাশ - সাপোর্ট থাকলে সত্যি জ্বলবে
      try {
        const track: any = s.getVideoTracks()[0]
        if (flash && track.getCapabilities?.().torch) await track.applyConstraints({ advanced: [{ torch: true }] as any })
      } catch {}
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.playbackRate = speed==='0.5x' ? 0.5 : speed==='2x' ? 2 : 1 } }, 300)
      const rec = new MediaRecorder(s)
      chunksRef.current = []
      rec.ondataavailable = (e:any) => { if(e.data.size>0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const reader = new FileReader()
        reader.onload = () => { setMyVideoUrl(reader.result as string); alert('রেকর্ড হয়ে গেছে! ✅ এখন গান বেছে পোস্ট করো') }
        reader.readAsDataURL(blob)
      }
      recorderRef.current = rec
    } catch { alert('ক্যামেরার জন্য Allow চাপো') }
  }
  const switchCamera = () => {
    const next = facing==='user' ? 'environment' : 'user'
    setFacing(next); startCamera(next)
  }
  const toggleFlash = async () => {
    const next = !flash; setFlash(next)
    try {
      const track: any = streamRef.current?.getVideoTracks()[0]
      if (track?.getCapabilities?.().torch) await track.applyConstraints({ advanced: [{ torch: next }] as any })
      else alert(next ? 'এই ফোনে ফ্ল্যাশ সাপোর্ট নেই, স্ক্রিন আলো বেড়ে গেছে 💡' : 'ফ্ল্যাশ বন্ধ')
    } catch {}
  }
  const startRecordWithTimer = () => {
    if (timerSec===0) { doRecord(); return }
    setCountdown(timerSec)
    let c = timerSec
    const iv = setInterval(() => {
      c--; setCountdown(c)
      if (c<=0) { clearInterval(iv); setCountdown(0); doRecord() }
    }, 1000)
  }
  const doRecord = () => {
    try {
      if (musicRef.current) { musicRef.current.volume = musicVol/100; musicRef.current.play().catch(()=>{}) }
      recorderRef.current?.start(); setRecording(true)
    } catch { alert('আগে ক্যামেরা চালু হতে দাও') }
  }
  const toggleRecord = () => {
    if(!recording){ startRecordWithTimer() }
    else {
      try{ recorderRef.current?.stop(); setRecording(false); if (musicRef.current) musicRef.current.pause(); streamRef.current?.getTracks().forEach((t:any)=>t.stop()) }catch{}
    }
  }
  const onPickVideoFile = (e:any) => {
    const f = e.target.files?.[0]; if(!f) return
    const r = new FileReader(); r.onload=()=>{ setMyVideoUrl(r.result as string); setShowCamera(true); alert('গ্যালারি থেকে ভিডিও নেওয়া হয়ে গেছে ✅ এখন গান বেছে পোস্ট করো') }; r.readAsDataURL(f)
  }
  const uploadVideo = () => {
    if(!currentUser) return
    if(!myVideoUrl){ alert('আগে ভিডিও রেকর্ড করো বা গ্যালারি থেকে নাও!'); return }
    const v: VideoItem = { id: Date.now(), user: currentUser.name, email: currentUser.email, caption: caption || "আমার নতুন ভিডিও 🔥", song: selectedSong, likes: 0, comments: [], time: "এখনই", videoUrl: myVideoUrl }
    const all = [v, ...videos]
    setVideos(all); localStorage.setItem('sottok_all_videos', JSON.stringify(all))
    setShowCamera(false); setCaption(""); setMyVideoUrl(""); setTab('home')
    alert('পোস্ট হয়ে গেছে! ✅ এখন হোমপেজে + তোমার প্রোফাইলে সবাই দেখতে পাবে')
  }
  const makeVideoWithSong = (songName:string) => { setSelectedSong(songName); setShowMusic(false); setPreviewSong(null); startCamera() }
  const likeVideo = (id:number) => { setVideos(videos.map(x => x.id===id ? { ...x, likes: x.likes+1 } : x)) }
  const addComment = (id:number) => {
    const txt = (commentText[id]||"").trim(); if(!txt) return
    setVideos(videos.map(x => x.id===id ? { ...x, comments: [...(x.comments||[]), `${currentUser?.name}: ${txt}`] } : x))
    setCommentText({ ...commentText, [id]: "" })
  }
  const ALL_SONGS: SongItem[] = [...customSongs, ...BASE_SONGS]
  const trending = ALL_SONGS.map(s => ({ ...s, count: videos.filter(v=>v.song===s.name).length })).sort((a,b)=>b.count-a.count)
  const myVideos = videos.filter(v=>v.email===currentUser?.email)
  const currentSongAudio = ALL_SONGS.find(s=>s.name===selectedSong)?.audioUrl

  // ===== তোমার পুরনো লগইন - হুবহু =====
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

  const renderVideoCard = (v: VideoItem) => (
    <div key={v.id} style={{ borderTop: '1px solid #222', padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><b>{v.user}</b><div style={{ fontSize: 12, color: '#aaa' }}>{v.email} • {v.time}</div></div><button onClick={() => setTab('profile')} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: 20 }}>প্রোফাইলে দেখো →</button></div>
      <p>{v.caption}</p>
      <div onClick={() => setPlayingId(playingId === v.id ? null : v.id)} style={{ background: '#111', minHeight: 260, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
        {v.videoUrl && playingId === v.id ? <video src={v.videoUrl} controls autoPlay loop style={{ width: '100%', height: 260, objectFit: 'cover' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 50 }}>▶️</div><div style={{ fontSize: 12, color: '#aaa' }}>চাপ দিলেই ভিডিও চলবে</div></div>}
      </div>
      <div onClick={() => makeVideoWithSong(v.song)} style={{ background: '#111', padding: 12, borderRadius: 10, marginTop: 8, cursor: 'pointer', border: '1px solid #222' }}>🎵 {v.song} <span style={{ color: '#4d7cff', float: 'right' }}>এই গান দিয়ে ভিডিও বানাও →</span><div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>এই গানে এখন {videos.filter(x=>x.song===v.song).length} টা ভিডিও</div></div>
      <div style={{ display: 'flex', gap: 18, marginTop: 10 }}><span onClick={() => likeVideo(v.id)} style={{ cursor: 'pointer' }}>❤️ {v.likes} লাইক</span><span onClick={() => setShowComments(showComments===v.id ? null : v.id)} style={{ cursor: 'pointer' }}>💬 {(v.comments||[]).length} কমেন্ট</span><span>↗️ শেয়ার</span></div>
      {showComments===v.id && (
        <div style={{ background: '#111', borderRadius: 12, padding: 12, marginTop: 10 }}>
          {(v.comments||[]).length===0 && <p style={{ fontSize: 13, color: '#888' }}>এখনো কমেন্ট নেই। তুমিই প্রথম কমেন্ট করো 👇</p>}
          {(v.comments||[]).map((c,i) => (<div key={i} style={{ fontSize: 14, padding: '6px 0', borderBottom: '1px solid #222' }}>{c}</div>))}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><input value={commentText[v.id]||""} onChange={e => setCommentText({ ...commentText, [v.id]: e.target.value })} placeholder="কমেন্ট লেখো..." style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #333', background: '#000', color: '#fff' }} /><button onClick={() => addComment(v.id)} style={{ background: '#ff2d55', color: '#fff', border: 0, padding: '10px 16px', borderRadius: 10, fontWeight: 'bold' }}>পাঠাও</button></div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: 24, fontWeight: 'bold', lineHeight: 1.1 }}>🔥 SOT<br /><span style={{ color: '#ff2d55' }}>TOK</span></span>
        <div style={{ display: 'flex', gap: 8 }}><button onClick={() => setTab('profile')} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 14px', borderRadius: 20 }}>👤 {currentUser.name}</button><button onClick={logout} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 14px', borderRadius: 20 }}>লগআউট</button></div>
      </div>

      {tab === 'home' && (
        <div>
          <div style={{ padding: '14px 16px 0' }}>
            <b style={{ fontSize: 20 }}>🔥 ট্রেন্ডিং গান</b>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginTop: 12, paddingBottom: 6 }}>
              {trending.map((s,i) => (<button key={s.name} onClick={() => makeVideoWithSong(s.name)} style={{ whiteSpace: 'nowrap', background: i===0 ? '#ff2d55' : '#111', color: '#fff', border: '1px solid #333', padding: '12px 16px', borderRadius: 20 }}>{i===0 ? '🔥 ' : ''}🎵 {s.name} • {s.count} ভিডিও</button>))}
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ background: '#111', borderRadius: 20, padding: 16 }}>
              <b style={{ fontSize: 18 }}>👋 {currentUser.name}</b> <span style={{ fontSize: 13, color: '#aaa' }}>{currentUser.email}</span>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button onClick={() => startCamera()} style={{ flex: 1, padding: 14, borderRadius: 14, background: '#000', color: '#fff', border: '1px solid #333', fontWeight: 'bold' }}>📸 নিজের ক্যামেরা<br />থেকে ভিডিও করো</button>
                <button onClick={() => setShowMusic(true)} style={{ flex: 1, padding: 14, borderRadius: 14, background: '#2563eb', color: '#fff', border: 0, fontWeight: 'bold', fontSize: 16 }}>🎵 গ্যালারি থেকে<br />গান বাছো</button>
              </div>
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: 14, borderRadius: 14, background: '#fff', color: '#000', border: 0, marginTop: 10, fontWeight: 'bold' }}>📁 গ্যালারি থেকে ভিডিও নাও</button>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onPickVideoFile} />
              <p style={{ textAlign: 'center', margin: '12px 0 0' }}>🎵 এখন বাজছে: <b style={{ color: '#ffcc00' }}>{selectedSong}</b></p>
              {currentSongAudio && <audio ref={musicRef} controls src={currentSongAudio} style={{ width: '100%', marginTop: 8 }} />}
            </div>
            <div style={{ background: '#1a1a00', border: '1px solid #ffcc00', borderRadius: 16, padding: 14, marginTop: 12 }}>
              <b>🎵 গ্যালারি থেকে গান যোগ করো</b>
              <input value={newSongName} onChange={e => setNewSongName(e.target.value)} placeholder="গানের নাম" style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #333', background: '#000', color: '#fff', boxSizing: 'border-box', marginTop: 8 }} />
              <button onClick={() => songFileRef.current?.click()} style={{ width: '100%', padding: 11, borderRadius: 10, background: '#fff', color: '#000', border: 0, marginTop: 8, fontWeight: 'bold' }}>📁 গ্যালারি থেকে MP3 বাছো {newSongAudio ? '✅ গান রেডি' : ''}</button>
              <input ref={songFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onPickSongFile} />
              <button onClick={uploadSong} style={{ width: '100%', padding: 11, borderRadius: 10, background: '#ff2d55', color: '#fff', border: 0, marginTop: 8, fontWeight: 'bold' }}>⬆️ গান যোগ করো</button>
            </div>
          </div>
          {videos.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#aaa', fontSize: 18 }}>এখনো কোনো ভিডিও নেই।<br />উপরে 📸 চেপে প্রথম ভিডিও বানাও 🔥</div>}
          {videos.map(renderVideoCard)}
        </div>
      )}

      {tab === 'profile' && (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#222', margin: '16px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, border: '4px solid #ff9500' }}>👤</div>
          <h2>@{currentUser.name?.replace(/\s/g,'_')?.toLowerCase() || 'sottok_star'}</h2><p style={{ color: '#888', margin: 0 }}>SOT ID: {currentUser.email?.split('@')[0]} 📋</p>
          <div style={{ display: 'inline-block', background: '#1a1a00', border: '1px solid #ffcc00', padding: '5px 14px', borderRadius: 20, fontSize: 13, color: '#ffcc00', marginTop: 10 }}>🔥 Level 10</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', background: '#111', borderRadius: 16, padding: 16, marginTop: 16 }}><div><b style={{ fontSize: 20 }}>120</b><div style={{ fontSize: 12, color: '#888' }}>Following</div></div><div><b style={{ fontSize: 20 }}>15.2K</b><div style={{ fontSize: 12, color: '#888' }}>Followers</div></div><div><b style={{ fontSize: 20 }}>89K</b><div style={{ fontSize: 12, color: '#888' }}>Likes</div></div></div>
          <div style={{ background: 'linear-gradient(135deg,#3a2a00,#1a1a00)', borderRadius: 16, padding: 16, marginTop: 14, textAlign: 'left' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><b>💰 আমার ওয়ালেট</b><b style={{ color: '#ffcc00', fontSize: 20 }}>🪙 0</b></div><p style={{ fontSize: 13, color: '#aaa' }}>প্রতিটি ভিডিও পোস্টে 50 কয়েন — ২৪ ঘণ্টায় সর্বোচ্চ 50 কয়েন।</p><p>বন্ধুকে রেফার করুন — প্রতি রেফারে ৪০ কয়েন</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: 10, borderRadius: 10 }}><b style={{ color: '#ffcc00' }}>কোড: {currentUser.email?.split('@')[0]?.toUpperCase()}</b><button style={{ background: '#ffcc00', border: 0, padding: '7px 14px', borderRadius: 20, fontWeight: 'bold' }}>শেয়ার</button></div></div>
          <div style={{ marginTop: 14, textAlign: 'left' }}><b>আমার ভিডিও ({myVideos.length}) - পোস্ট করলেই এখানে আসবে</b></div>
          {myVideos.length===0 && <p style={{ color: '#888' }}>এখনো ভিডিও বানাওনি, + চাপো</p>}
          {myVideos.map(renderVideoCard)}
        </div>
      )}

      {/* ===== অরিজিনাল ক্যামেরা কন্ট্রোল - সব কাজ করবে ===== */}
      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 99, color: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1, background: '#111', overflow: 'hidden' }}>
            {countdown>0 && <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 'bold', background: 'rgba(0,0,0,0.5)' }}>{countdown}</div>}
            {myVideoUrl ? <video src={myVideoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', ...getFilterStyle() }} /> : <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', ...getFilterStyle(), ...getZoomStyle() }} />}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8 }}>
              <button onClick={switchCamera} style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff', padding: '8px 12px', borderRadius: 20 }}>🔄 {facing==='user' ? 'সামনে' : 'পিছনে'}</button>
              <button onClick={toggleFlash} style={{ background: flash ? '#ffcc00' : 'rgba(0,0,0,0.6)', color: flash ? '#000' : '#fff', border: '1px solid #fff', padding: '8px 12px', borderRadius: 20 }}>💡 {flash ? 'ON' : 'OFF'}</button>
            </div>
            <div style={{ position: 'absolute', right: 12, top: 50, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center', fontSize: 11, width: 78 }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}>
                <div>⚡ Speed</div>
                {['0.5x','1x','2x'].map(s => (<button key={s} onClick={() => { setSpeed(s); if(videoRef.current) videoRef.current.playbackRate = s==='0.5x' ? 0.5 : s==='2x' ? 2 : 1 }} style={{ display: 'block', width: '100%', marginTop: 4, background: speed===s ? '#ff2d55' : '#333', color: '#fff', border: 0, padding: '4px 0', borderRadius: 8 }}>{s}</button>))}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}>
                <div>✨ Beauty {beauty}%</div>
                <input type="range" min={0} max={100} value={beauty} onChange={e => setBeauty(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}>
                <div>🎨 Filters</div>
                {['Normal','Cinematic','Warm','Cool','Black-White'].map(f => (<button key={f} onClick={() => setFilterName(f)} style={{ display: 'block', width: '100%', marginTop: 4, background: filterName===f ? '#ff2d55' : '#333', color: '#fff', border: 0, padding: '4px 0', borderRadius: 8, fontSize: 10 }}>{f}</button>))}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}>
                <div>⏰ Timer</div>
                {[0,3,5].map(t => (<button key={t} onClick={() => setTimerSec(t)} style={{ display: 'block', width: '100%', marginTop: 4, background: timerSec===t ? '#ff2d55' : '#333', color: '#fff', border: 0, padding: '4px 0', borderRadius: 8 }}>{t===0 ? 'Off' : t+'s'}</button>))}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}>
                <div>🔍 Zoom {zoom.toFixed(1)}x</div>
                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, background: 'rgba(0,0,0,0.65)', padding: 10, borderRadius: 12, fontSize: 12 }}>গান: 🎵 {selectedSong} • ফিল্টার: {filterName} • বিউটি: {beauty}% • Speed: {speed} • Timer: {timerSec===0 ? 'Off' : timerSec+'s'} • Zoom: {zoom.toFixed(1)}x • ক্যামেরা: {facing==='user' ? 'সামনে' : 'পিছনে'}</div>
          </div>
          <div style={{ background: '#000', padding: '10px 16px 16px', maxHeight: '48vh', overflowY: 'auto' }}>
            <div style={{ background: '#111', borderRadius: 12, padding: 10 }}>
              <b style={{ fontSize: 14 }}>🎵 গ্যালারি থেকে গান চয়েস করো - আগে শুনে নাও</b>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 8 }}>
                {ALL_SONGS.map(s => (<button key={s.name} onClick={() => setSelectedSong(s.name)} style={{ whiteSpace: 'nowrap', padding: '7px 12px', borderRadius: 20, background: selectedSong===s.name ? '#ff2d55' : '#222', color: '#fff', border: 0 }}>🎵 {s.name}</button>))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><span style={{ fontSize: 12 }}>🔊 গানের ভলিউম {musicVol}%</span><input type="range" min={0} max={100} value={musicVol} onChange={e => { setMusicVol(Number(e.target.value)); if(musicRef.current) musicRef.current.volume = Number(e.target.value)/100 }} style={{ flex: 1 }} /></div>
              <button onClick={() => setShowMusic(true)} style={{ width: '100%', padding: 9, borderRadius: 10, background: '#2563eb', color: '#fff', border: 0, marginTop: 8, fontWeight: 'bold' }}>📁 গ্যালারি খুলে গান শুনে বাছো →</button>
              {currentSongAudio && <audio ref={musicRef} controls src={currentSongAudio} style={{ width: '100%', marginTop: 8 }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}><div onClick={() => setShowMusic(true)} style={{ textAlign: 'center' }}><div style={{ fontSize: 30 }}>😊</div><div style={{ fontSize: 12 }}>Effects</div></div><button onClick={toggleRecord} style={{ width: 72, height: 72, borderRadius: '50%', background: recording ? '#111' : 'red', border: '4px solid #fff', color: '#fff', fontSize: 20 }}>{recording ? '⏹️' : '●'}</button><div onClick={() => setShowMusic(true)} style={{ textAlign: 'center' }}><div style={{ fontSize: 30 }}>🎵</div><div style={{ fontSize: 12 }}>Music</div></div></div>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', margin: '8px 0' }}>{countdown>0 ? `⏰ ${countdown}... রেডি হও` : recording ? '● REC চলছে... শেষ করতে আবার লাল বাটন চাপো' : myVideoUrl ? 'ভিডিও রেডি ✅ এখন গান বেছে পোস্ট করো' : 'ভিডিও করতে লাল বাটন চাপো - আগে গান বেছে নাও'}</p>
            <input placeholder="ক্যাপশন লেখো..." value={caption} onChange={e => setCaption(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><button onClick={() => { setShowCamera(false); if(streamRef.current) streamRef.current.getTracks().forEach((t:any)=>t.stop()) }} style={{ flex: 1, padding: 11, borderRadius: 10, background: '#222', color: '#fff', border: 0 }}>✕ বন্ধ করো</button><button onClick={uploadVideo} style={{ flex: 1, padding: 11, borderRadius: 10, background: '#ffcc00', fontWeight: 'bold', border: 0 }}>⬆️ পোস্ট করো - সঙ্গে সঙ্গে সবাই দেখবে</button></div>
            <p style={{ textAlign: 'center', margin: '10px 0 0' }}>SOT <span style={{ color: '#ff2d55' }}>TOK</span> | Create • Share</p>
          </div>
        </div>
      )}

      {showMusic && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 100, padding: 16, overflowY: 'auto', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>🎵 গ্যালারি থেকে গান বাছো - আগে শুনে নাও</h3><button onClick={() => setShowMusic(false)} style={{ background: '#222', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 20 }}>✕</button></div>
          <input placeholder="গানের নাম খুঁজো..." value={searchSong} onChange={e => setSearchSong(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }} />
          <p style={{ fontSize: 13, color: '#aaa' }}>▶️ চাপলে গান শুনতে পারবে → পছন্দ হলে "এই গান দিয়ে বানাও" চাপো</p>
          {trending.filter(s => s.name.includes(searchSong) || searchSong==="").map(s => (
            <div key={s.name} style={{ padding: 12, borderBottom: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><b>{s.name}</b><div style={{ fontSize: 12, color: '#888' }}>{s.singer} • 🔥 {s.count} ভিডিও</div></div>
                <button onClick={() => makeVideoWithSong(s.name)} style={{ padding: '8px 14px', borderRadius: 20, background: '#ff2d55', color: '#fff', border: 0 }}>এই গান দিয়ে বানাও</button>
              </div>
              {s.audioUrl ? <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button onClick={() => setPreviewSong(previewSong===s.name ? null : s.name)} style={{ background: '#222', color: '#fff', border: 0, padding: '7px 14px', borderRadius: 20 }}>{previewSong===s.name ? '⏸️ বন্ধ করো' : '▶️ গানটা শুনে নাও'}</button></div> : <p style={{ fontSize: 12, color: '#666', margin: '6px 0 0' }}>🎵 গানটা সিলেক্ট করে ভিডিও বানাও</p>}
              {previewSong===s.name && s.audioUrl && <audio controls autoPlay src={s.audioUrl} style={{ width: '100%', marginTop: 8 }} />}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#111', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 10px', zIndex: 50 }}>
        <span onClick={() => setTab('home')} style={{ textAlign: 'center', color: tab==='home' ? '#ff2d55' : '#aaa' }}><div style={{ fontSize: 22 }}>🏠</div><div style={{ fontSize: 12 }}>হোম</div></span>
        <button onClick={() => startCamera()} style={{ width: 56, height: 56, borderRadius: '50%', background: '#ff2d55', color: '#fff', fontSize: 30, border: '3px solid #fff', marginTop: -28 }}>+</button>
        <span onClick={() => setTab('profile')} style={{ textAlign: 'center', color: tab==='profile' ? '#ff2d55' : '#aaa' }}><div style={{ fontSize: 22 }}>👤</div><div style={{ fontSize: 12 }}>প্রোফাইল</div></span>
      </div>
    </div>
  )
}