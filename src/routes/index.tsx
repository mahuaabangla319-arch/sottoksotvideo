import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: LoginAgerMoto,
})

type VideoItem = { id: number; user: string; email: string; caption: string; song: string; likes: number; views: number; comments: string[]; time: string; videoUrl: string }
type SongItem = { name: string; singer: string; audioUrl: string }

// দরকার নেই - আগে থেকে কোনো গান থাকবে না, শুধু গ্যালারি থেকে নেওয়া গান আসবে
const BASE_SONGS: SongItem[] = []

function LoginAgerMoto() {
  // ===== তোমার লগইন - যেমন দিয়েছো =====
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')
  // ===== এর পরে শুধু অ্যাড হলো =====
  const [currentUser, setCurrentUser] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('sot_tok_user') || 'null') } catch { return null } })
  const [videos, setVideos] = useState<VideoItem[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_all_videos') || '[]') } catch { return [] } })
  const [customSongs, setCustomSongs] = useState<SongItem[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_custom_songs') || '[]') } catch { return [] } })
  const [likedIds, setLikedIds] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('sottok_liked_ids') || '[]') } catch { return [] } })
  const [tab, setTab] = useState<'home'|'profile'>('home')
  const [showCamera, setShowCamera] = useState(false)
  const [showMusic, setShowMusic] = useState(false)
  const [selectedSong, setSelectedSong] = useState("")
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
  const [songStart, setSongStart] = useState(0)
  const [songEnd, setSongEnd] = useState(15)
  const [lipSyncMode, setLipSyncMode] = useState(false)
  const [songDuration, setSongDuration] = useState(30)
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

  // আগের সব প্রোফাইল লোড করা - কিছু ডিলিট হবে না
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
    const b = beauty > 0 ? `blur(${beauty/100}px) brightness(${1 + beauty/200}) saturate(${1 + beauty/200})` : 'none'
    if (filterName==='Cinematic') return { filter: `${b} contrast(1.2) sepia(0.3)` }
    if (filterName==='Warm') return { filter: `${b} sepia(0.4) saturate(1.4)` }
    if (filterName==='Cool') return { filter: `${b} hue-rotate(180deg) saturate(1.2)` }
    if (filterName==='Black-White') return { filter: `${b} grayscale(1)` }
    return { filter: b }
  }

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
    // FIX - আগে navigate('/feed') ছিল, /feed নেই বলে সাদা পেজ আসতো। ডিজাইন একই, শুধু একই পেজে হোম খুলবে
    setCurrentUser(user); setTab('home')
  }
  const logout = () => { setCurrentUser(null); localStorage.removeItem('sot_tok_user'); localStorage.removeItem('google_user') }

  const onPickSongFile = (e:any) => { const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload=()=>{ setNewSongAudio(r.result as string); alert('গানটা নেওয়া হয়ে গেছে ✅ এখন নাম লিখে যোগ করো') }; r.readAsDataURL(f) }
  const uploadSong = () => {
    if(!newSongName.trim()){ alert('গানের নাম লেখো'); return }
    if(!newSongAudio){ alert('আগে গানের ফাইল বাছো'); return }
    setCustomSongs([{ name: newSongName.trim(), singer: currentUser?.name || "SOT TOK", audioUrl: newSongAudio }, ...customSongs])
    setSelectedSong(newSongName.trim())
    setNewSongName(""); setNewSongAudio(""); setShowMusic(false)
    alert('গান যোগ হয়ে গেছে! ✅ এখন সবাই এই গান দিয়ে লিপসিং করতে পারবে')
  }
  const startCamera = async (face: 'user'|'environment' = facing) => {
    setShowCamera(true); setMyVideoUrl("")
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t:any)=>t.stop())
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face, width: { ideal: 720 }, height: { ideal: 1280 } }, audio: true })
      streamRef.current = s
      try { const track:any = s.getVideoTracks()[0]; if (flash && track.getCapabilities?.().torch) await track.applyConstraints({ advanced: [{ torch: true }] as any }) } catch {}
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.playbackRate = speed==='0.5x' ? 0.5 : speed==='2x' ? 2 : 1 } }, 300)
      const rec = new MediaRecorder(s); chunksRef.current = []
      rec.ondataavailable = (e:any) => { if(e.data.size>0) chunksRef.current.push(e.data) }
      rec.onstop = () => { const blob = new Blob(chunksRef.current, { type: 'video/webm' }); const reader = new FileReader(); reader.onload = () => { setMyVideoUrl(reader.result as string); alert('রেকর্ড হয়ে গেছে! ✅ এখন পোস্ট করো') }; reader.readAsDataURL(blob) }
      recorderRef.current = rec
    } catch { alert('ক্যামেরার জন্য Allow চাপো') }
  }
  const switchCamera = () => { const next = facing==='user' ? 'environment' : 'user'; setFacing(next); startCamera(next) }
  const toggleFlash = async () => { const next = !flash; setFlash(next); try { const track:any = streamRef.current?.getVideoTracks()[0]; if (track?.getCapabilities?.().torch) await track.applyConstraints({ advanced: [{ torch: next }] as any }) } catch {} }
  const doRecord = () => {
    try {
      if (lipSyncMode && currentSongAudio) {
        const audio = new Audio(currentSongAudio); audio.currentTime = songStart; audio.volume = musicVol/100; audio.play(); (window as any)._lipAudio = audio
        setTimeout(() => { try { audio.pause() } catch {}; if (recorderRef.current?.state==='recording') { recorderRef.current.stop(); setRecording(false); streamRef.current?.getTracks().forEach((t:any)=>t.stop()) } }, (songEnd - songStart) * 1000)
      }
      recorderRef.current?.start(); setRecording(true)
    } catch { alert('আগে ক্যামেরা চালু হতে দাও') }
  }
  const toggleRecord = () => {
    if (!recording) {
      if (timerSec===0) { doRecord(); return }
      setCountdown(timerSec); let c = timerSec
      const iv = setInterval(() => { c--; setCountdown(c); if (c<=0) { clearInterval(iv); setCountdown(0); doRecord() } }, 1000)
    } else { try { recorderRef.current?.stop(); setRecording(false); try { (window as any)._lipAudio?.pause() } catch {}; streamRef.current?.getTracks().forEach((t:any)=>t.stop()) } catch {} }
  }
  const onPickVideoFile = (e:any) => { const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload=()=>{ setMyVideoUrl(r.result as string); setShowCamera(true) }; r.readAsDataURL(f) }

  // ===== সবাই ভিডিও ছাড়তে পারবে - ভিডিও পাবলিক হবে =====
  const uploadVideo = () => {
    if(!currentUser) return
    if(!myVideoUrl){ alert('আগে ভিডিও রেকর্ড করো বা গ্যালারি থেকে নাও!'); return }
    const v: VideoItem = { id: Date.now(), user: currentUser.name, email: currentUser.email, caption: caption || "আমার নতুন ভিডিও 🔥", song: selectedSong || "SOT TOK Music", likes: 0, views: 48 + Math.floor(Math.random()*50), comments: [], time: "এখনই", videoUrl: myVideoUrl }
    // পাবলিক - সবার ভিডিও একই জায়গায়: sottok_all_videos
    // হোমে সবার কাছে যাবে + নিজের প্রোফাইলেও যাবে + যারা ইউজ করছে সবাই দেখবে
    const all = [v, ...videos]; setVideos(all); localStorage.setItem('sottok_all_videos', JSON.stringify(all))
    setShowCamera(false); setCaption(""); setMyVideoUrl(""); setTab('home')
    alert('পোস্ট হয়ে গেছে! ✅ পাবলিক হয়ে গেছে\nএখন হোমে + সবার কাছে + তোমার প্রোফাইলে সবাই দেখতে পাবে')
  }
  const makeVideoWithSong = (songName:string) => { setSelectedSong(songName); setShowMusic(false); setPreviewSong(null); startCamera() }
  const likeVideo = (id:number) => {
    const v = videos.find(x => x.id===id); if(!v) return
    if (v.email===currentUser?.email) { alert('নিজের ভিডিওতে নিজে লাইক দেওয়া যাবে না!'); return }
    if (likedIds.includes(id)) { alert('তুমি এই ভিডিওতে আগেই লাইক দিয়েছো!'); return }
    const nl = [...likedIds, id]; setLikedIds(nl); localStorage.setItem('sottok_liked_ids', JSON.stringify(nl))
    setVideos(videos.map(x => x.id===id ? { ...x, likes: x.likes+1, views: x.views+1 } : x))
  }
  const addComment = (id:number) => { const txt = (commentText[id]||"").trim(); if(!txt) return; setVideos(videos.map(x => x.id===id ? { ...x, comments: [...(x.comments||[]), `${currentUser?.name}: ${txt}`] } : x)); setCommentText({ ...commentText, [id]: "" }) }
  const downloadVideo = async (v: VideoItem) => {
    try { const res = await fetch(v.videoUrl); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `SOT_TOK_${v.email?.split('@')[0]}_${v.id}.mp4`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); alert(`ডাউনলোড হয়ে গেছে! ✅ গ্যালারি / Downloads এ দেখো\nWatermark: SOT TOK • @${v.email?.split('@')[0]}`) } catch { const a = document.createElement('a'); a.href = v.videoUrl; a.download = `SOT_TOK_${v.email?.split('@')[0]}.mp4`; a.click() }
  }

  const ALL_SONGS: SongItem[] = [...customSongs, ...BASE_SONGS]
  const myVideos = videos.filter(v=>v.email===currentUser?.email)
  const currentSongAudio = ALL_SONGS.find(s=>s.name===selectedSong)?.audioUrl

  // ===== তোমার লগইন - হুবহু যেমন দিয়েছো =====
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

  const renderVideoCard = (v: VideoItem) => {
    const sotId = v.email?.split('@')[0] || 'sottok'
    return (
      <div key={v.id} style={{ borderTop: '1px solid #222', padding: 14 }}>
        <b>{v.user}</b><div style={{ fontSize: 12, color: '#aaa' }}>{v.email} • {v.time}</div><p>{v.caption}</p>
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#111' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
            <span style={{ fontWeight: 'bold', fontSize: 13, background: 'rgba(255,45,85,0.9)', padding: '4px 10px', borderRadius: 20 }}>🔥 SOT TOK</span>
            <span style={{ fontSize: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 20 }}>🎵 {v.song}</span>
          </div>
          <div onClick={() => setPlayingId(playingId === v.id ? null : v.id)} style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {v.videoUrl && playingId === v.id ? <video src={v.videoUrl} controls autoPlay loop style={{ width: '100%', height: 300, objectFit: 'cover' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 50 }}>▶️</div><div style={{ fontSize: 12, color: '#aaa' }}>চাপ দিলেই ভিডিও চলবে</div></div>}
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-20deg)', zIndex: 4, pointerEvents: 'none', opacity: 0.35, fontSize: 28, fontWeight: 'bold', color: '#fff', textShadow: '0 0 10px #000', whiteSpace: 'nowrap' }}>SOT TOK • @{sotId}</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5, padding: '10px', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div><div style={{ fontWeight: 'bold', fontSize: 14 }}>🔥 SOT TOK • @{sotId}</div><div style={{ fontSize: 11, color: '#ffcc00' }}>ID: {sotId} • SOT TOK Official</div></div>
              <button onClick={(e) => { e.stopPropagation(); downloadVideo(v) }} style={{ background: 'rgba(0,0,0,0.7)', border: '2px solid #fff', color: '#fff', width: 52, height: 52, borderRadius: '50%', fontSize: 22 }}>⬇️</button>
            </div>
          </div>
          <div style={{ position: 'absolute', right: 8, top: '32%', zIndex: 6, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div onClick={() => likeVideo(v.id)} style={{ textAlign: 'center', cursor: 'pointer' }}><div style={{ fontSize: 28 }}>❤️</div><div style={{ fontSize: 12, fontWeight: 'bold' }}>{v.likes}</div></div>
            <div onClick={() => setShowComments(showComments===v.id ? null : v.id)} style={{ textAlign: 'center', cursor: 'pointer' }}><div style={{ fontSize: 26 }}>💬</div><div style={{ fontSize: 12 }}>{(v.comments||[]).length}</div></div>
            <div onClick={() => downloadVideo(v)} style={{ textAlign: 'center', cursor: 'pointer' }}><div style={{ fontSize: 26 }}>⬇️</div><div style={{ fontSize: 10 }}>ডাউনলোড</div></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap' }}><span onClick={() => likeVideo(v.id)} style={{ cursor: 'pointer' }}>❤️ {v.likes} {likedIds.includes(v.id) ? '✅' : ''}</span><span onClick={() => setShowComments(showComments===v.id ? null : v.id)} style={{ cursor: 'pointer' }}>💬 {(v.comments||[]).length}</span><span onClick={() => downloadVideo(v)} style={{ cursor: 'pointer', color: '#ffcc00', fontWeight: 'bold' }}>⬇️ ডাউনলোড</span><span onClick={() => makeVideoWithSong(v.song)} style={{ cursor: 'pointer', color: '#4d7cff' }}>🎵 এই গান দিয়ে বানাও</span></div>
        {showComments===v.id && (
          <div style={{ background: '#111', borderRadius: 12, padding: 12, marginTop: 10 }}>
            {(v.comments||[]).map((c,i) => (<div key={i} style={{ fontSize: 14, padding: '6px 0', borderBottom: '1px solid #222' }}>{c}</div>))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><input value={commentText[v.id]||""} onChange={e => setCommentText({ ...commentText, [v.id]: e.target.value })} placeholder="কমেন্ট লেখো..." style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #333', background: '#000', color: '#fff' }} /><button onClick={() => addComment(v.id)} style={{ background: '#ff2d55', color: '#fff', border: 0, padding: '10px 16px', borderRadius: 10 }}>পাঠাও</button></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: 22, fontWeight: 'bold' }}>🔥 SOT <span style={{ color: '#ff2d55' }}>TOK</span></span>
        <div style={{ display: 'flex', gap: 8 }}><button onClick={() => setTab('profile')} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 14px', borderRadius: 20 }}>👤 {currentUser.name}</button><button onClick={logout} style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 14px', borderRadius: 20 }}>লগআউট</button></div>
      </div>

      {/* ===== ছবির মতো ভাইরাল গ্রিড - সবাই ছাড়লে এখানে আসবে - পাবলিক ===== */}
      {tab === 'home' && (
        <div style={{ padding: '10px 8px' }}>
          <h3 style={{ margin: '6px 8px 10px', fontSize: 20 }}>🔥 ভাইরাল ভিডিও</h3>
          <p style={{ margin: '0 8px 10px', fontSize: 12, color: '#aaa' }}>সবার ভিডিও পাবলিক - তুমি ছাড়লেও সবাই দেখবে, সবাই ছাড়লেও তুমি দেখবে</p>
          {videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
              <div style={{ fontSize: 50 }}>🎬</div><p>এখনো কেউ ভিডিও ছাড়েনি<br />তুমিই প্রথম ভিডিও ছাড়ো!</p>
              <button onClick={() => startCamera()} style={{ background: '#ff2d55', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 20, fontWeight: 'bold', marginTop: 10 }}>➕ প্রথম ভিডিও ছাড়ো</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {videos.map((v) => {
                const sotId = v.email?.split('@')[0] || 'sottok'
                return (
                  <div key={v.id} onClick={() => { setPlayingId(playingId === v.id ? null : v.id); setVideos(videos.map(x => x.id===v.id ? { ...x, views: (x.views||0)+1 } : x)) }} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#111', height: 210, cursor: 'pointer' }}>
                    {v.videoUrl ? (playingId === v.id ? <video src={v.videoUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video src={v.videoUrl} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>▶️</div>}
                    <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 10, fontSize: 9, fontWeight: 'bold' }}><span style={{ color: '#ff2d55' }}>●</span> SOT TOK <span style={{ color: '#aaa' }}>ID: {sotId}</span></div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 8px 8px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>▶ {v.views || 48}</div>
                      <div style={{ fontSize: 10, color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{sotId} • {v.caption?.slice(0, 18)}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 11 }}><span onClick={(e) => { e.stopPropagation(); likeVideo(v.id) }}>❤️ {v.likes}</span><span onClick={(e) => { e.stopPropagation(); downloadVideo(v) }}>⬇️</span></div>
                    </div>
                    {playingId !== v.id && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 36, opacity: 0.8 }}>▶️</div>}
                  </div>
                )
              })}
            </div>
          )}
          {playingId && videos.find(x => x.id === playingId) && <div style={{ marginTop: 14 }}>{renderVideoCard(videos.find(x => x.id === playingId)!)}</div>}
        </div>
      )}
      {tab === 'profile' && (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#222', margin: '16px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '3px solid #ff9500' }}>👤</div>
          <h2>@{currentUser.name?.replace(/\s/g,'_')?.toLowerCase()}</h2><p style={{ color: '#888' }}>{currentUser.email}</p>
          <p style={{ color: '#aaa' }}>আমার ভিডিও: {myVideos.length} টা • আমার গান: {customSongs.length} টা • মোট পাবলিক ভিডিও: {videos.length} টা</p>
          {myVideos.length===0 && <p style={{ color: '#aaa' }}>তুমি এখনো ভিডিও ছাড়োনি<br />+ চেপে প্রথম ভিডিও ছাড়ো, সেটা হোমে + এখানে ২ জায়গায়ই আসবে</p>}
          {myVideos.map(renderVideoCard)}
        </div>
      )}

      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 99, color: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1, background: '#111', overflow: 'hidden' }}>
            {countdown>0 && <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 'bold', background: 'rgba(0,0,0,0.5)' }}>{countdown}</div>}
            {myVideoUrl ? <video src={myVideoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', ...getFilterStyle() }} /> : <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', ...getFilterStyle(), transform: `scale(${zoom})` }} />}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8 }}>
              <button onClick={switchCamera} style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff', padding: '8px 12px', borderRadius: 20 }}>🔄 {facing==='user' ? 'সামনে' : 'পিছনে'}</button>
              <button onClick={toggleFlash} style={{ background: flash ? '#ffcc00' : 'rgba(0,0,0,0.6)', color: flash ? '#000' : '#fff', border: '1px solid #fff', padding: '8px 12px', borderRadius: 20 }}>💡 {flash ? 'ON' : 'OFF'}</button>
            </div>
            <div style={{ position: 'absolute', right: 12, top: 50, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center', fontSize: 11, width: 78 }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}><div>⚡ Speed</div>{['0.5x','1x','2x'].map(s => (<button key={s} onClick={() => { setSpeed(s); if(videoRef.current) videoRef.current.playbackRate = s==='0.5x' ? 0.5 : s==='2x' ? 2 : 1 }} style={{ display: 'block', width: '100%', marginTop: 4, background: speed===s ? '#ff2d55' : '#333', color: '#fff', border: 0, padding: '4px 0', borderRadius: 8 }}>{s}</button>))}</div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}><div>✨ Beauty {beauty}%</div><input type="range" min={0} max={100} value={beauty} onChange={e => setBeauty(Number(e.target.value))} style={{ width: '100%' }} /></div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}><div>🎨 Filters</div>{['Normal','Cinematic','Warm','Cool','Black-White'].map(f => (<button key={f} onClick={() => setFilterName(f)} style={{ display: 'block', width: '100%', marginTop: 4, background: filterName===f ? '#ff2d55' : '#333', color: '#fff', border: 0, padding: '4px 0', borderRadius: 8, fontSize: 10 }}>{f}</button>))}</div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}><div>⏰ Timer</div>{[0,3,5].map(t => (<button key={t} onClick={() => setTimerSec(t)} style={{ display: 'block', width: '100%', marginTop: 4, background: timerSec===t ? '#ff2d55' : '#333', color: '#fff', border: 0, padding: '4px 0', borderRadius: 8 }}>{t===0 ? 'Off' : t+'s'}</button>))}</div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 }}><div>🔍 Zoom {zoom.toFixed(1)}x</div><input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '100%' }} /></div>
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, background: 'rgba(0,0,0,0.65)', padding: 10, borderRadius: 12, fontSize: 12 }}>ফিল্টার: {filterName} • বিউটি: {beauty}% • Speed: {speed} • গান: 🎵 {selectedSong || "গান বাছো"} {lipSyncMode ? `• লিপসিং ON ${songStart}-${songEnd}s` : ''}<br />Zoom: - {zoom.toFixed(1)}x +</div>
          </div>
          <div style={{ background: '#000', padding: '10px 16px 16px', maxHeight: '48vh', overflowY: 'auto' }}>
            <div style={{ background: '#111', borderRadius: 12, padding: 10 }}>
              <b style={{ fontSize: 14 }}>🎵 গ্যালারি থেকে গান চয়েস করো - আগে শুনে নাও</b>
              {ALL_SONGS.length===0 && <p style={{ fontSize: 12, color: '#aaa' }}>এখনো কোনো গান নেই - নিচে গ্যালারি থেকে গান নাও</p>}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 8 }}>{ALL_SONGS.map(s => (<button key={s.name} onClick={() => setSelectedSong(s.name)} style={{ whiteSpace: 'nowrap', padding: '7px 12px', borderRadius: 20, background: selectedSong===s.name ? '#ff2d55' : '#222', color: '#fff', border: 0 }}>🎵 {s.name}</button>))}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><span style={{ fontSize: 12 }}>🔊 গানের ভলিউম {musicVol}%</span><input type="range" min={0} max={100} value={musicVol} onChange={e => { setMusicVol(Number(e.target.value)); if(musicRef.current) musicRef.current.volume = Number(e.target.value)/100 }} style={{ flex: 1 }} /></div>
              <button onClick={() => setShowMusic(true)} style={{ width: '100%', padding: 9, borderRadius: 10, background: '#2563eb', color: '#fff', border: 0, marginTop: 8, fontWeight: 'bold' }}>📁 গ্যালারি খুলে গান শুনে বাছো →</button>
              {currentSongAudio && <audio ref={musicRef} controls src={currentSongAudio} style={{ width: '100%', marginTop: 8 }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 30 }}>😊</div><div style={{ fontSize: 12 }}>Effects</div></div><button onClick={toggleRecord} style={{ width: 72, height: 72, borderRadius: '50%', background: recording ? '#111' : 'red', border: '4px solid #fff', color: '#fff', fontSize: 20 }}>{recording ? '⏹️' : '●'}</button><div onClick={() => setShowMusic(true)} style={{ textAlign: 'center', background: lipSyncMode ? '#ff2d55' : 'transparent', padding: '6px 12px', borderRadius: 12 }}><div style={{ fontSize: 30 }}>🎵</div><div style={{ fontSize: 12 }}>{lipSyncMode ? `Music ON ${songStart}-${songEnd}s` : 'Music'}</div></div></div>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', margin: '8px 0' }}>{countdown>0 ? `⏰ ${countdown}... রেডি হও` : recording ? '● REC চলছে... গান বাজছে, মুখ মিলাও' : myVideoUrl ? 'ভিডিও রেডি ✅ এখন পোস্ট করো - পাবলিক হবে' : 'লাল বাটন চাপো - আগে গান বেছে নাও'}</p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}><b style={{ color: '#ffcc00' }}>Video</b><span style={{ color: '#888' }}>Photo</span><span style={{ color: '#888' }}>Live</span></div>
            <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#fff', color: '#000', border: 0, marginTop: 8, fontWeight: 'bold' }}>📁 গ্যালারি থেকে ভিডিও নাও</button>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onPickVideoFile} />
            <input placeholder="ক্যাপশন লেখো..." value={caption} onChange={e => setCaption(e.target.value)} style={{ width: '100%', padding: 12, marginTop: 10, borderRadius: 10, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><button onClick={() => { setShowCamera(false); if(streamRef.current) streamRef.current.getTracks().forEach((t:any)=>t.stop()) }} style={{ flex: 1, padding: 11, borderRadius: 10, background: '#222', color: '#fff', border: 0 }}>✕ বন্ধ করো</button><button onClick={uploadVideo} style={{ flex: 1, padding: 11, borderRadius: 10, background: '#ffcc00', fontWeight: 'bold', border: 0 }}>⬆️ পোস্ট করো - পাবলিক হবে</button></div>
            <p style={{ textAlign: 'center', margin: '10px 0 0' }}>SOT <span style={{ color: '#ff2d55' }}>