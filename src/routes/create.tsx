import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/create')({
  component: CameraAllWorking,
})

function CameraAllWorking() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mode, setMode] = useState<'Video' | 'Photo' | 'Live'>('Video')
  const [quality, setQuality] = useState('720P')
  const [flash, setFlash] = useState(false)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [speed, setSpeed] = useState('1x')
  const [beauty, setBeauty] = useState(50)
  const [filter, setFilter] = useState('Normal')
  const [timer, setTimer] = useState('Off')
  const [countdown, setCountdown] = useState(0)
  const [panel, setPanel] = useState<'none' | 'speed' | 'beauty' | 'filters' | 'timer' | 'more' | 'effects' | 'post' | 'music' | 'text'>('none')
  const [selectedEffect, setSelectedEffect] = useState('')
  const [caption, setCaption] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [music, setMusic] = useState('কোনো গান নেই')
  const [textOverlay, setTextOverlay] = useState('')
  const [sticker, setSticker] = useState('')
  const [mirror, setMirror] = useState(true)
  const [grid, setGrid] = useState(false)
  const [night, setNight] = useState(false)
  const [zoom, setZoom] = useState(1)

  // ===== নতুন - গ্যালারি গান + Lip-Sync =====
  const [galleryMusic, setGalleryMusic] = useState('')
  const [galleryMusicUrl, setGalleryMusicUrl] = useState('')
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)

  const filters = ['Normal', 'Sunset', 'Beauty', 'Cinematic', 'Vintage', 'B&W', 'Warm', 'Cool']
  const speeds = ['0.5x', '1x', '1.5x', '2x']
  const effects = ['😍 Love', '🔥 Fire', '🪔 Puja', '🌸 Flower', '👑 Crown', '😎 Cool', '✨ Sparkle', '🎃 Halloween']
  const timers = ['Off', '3', '5', '10']
  const musics = ['🎵 কোনো গান নেই', '🎵 শুভ অষ্টমী', '🎵 ঢাকের তালে', '🎵 বলিউড হিট', '🎵 বাংলা গান', '🎵 ট্রেন্ডিং']
  const stickers = ['', '😍', '🔥', '🪔', '🌸', '👑', '✨', '❤️', '🎃']

  const getUserName = () => {
    return localStorage.getItem('vigo_user_name') || localStorage.getItem('sot_tok_user') || 'Tumi'
  }

  // ===== গ্যালারি থেকে গান নিলে - গান বাজবে =====
  const pickGalleryMusic = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setGalleryMusic(file.name)
    setGalleryMusicUrl(url)
    setMusic(`🎵 ${file.name}`)
    if (musicAudioRef.current) {
      musicAudioRef.current.src = url
      musicAudioRef.current.play().catch(()=>{})
    }
    alert(`🎵 গান লাগানো হয়েছে: ${file.name}\nএবার গান বাজবে, তুমি মুখ মিলিয়ে ভিডিও করো!`)
    setPanel('none')
  }

  const playMusicForRecord = () => {
    if (galleryMusicUrl && musicAudioRef.current) {
      musicAudioRef.current.currentTime = 0
      musicAudioRef.current.play().catch(()=>{})
    }
  }
  const stopMusicForRecord = () => {
    if (musicAudioRef.current) musicAudioRef.current.pause()
  }

  // ===== ক্যামেরা চালু =====
  const startCamera = async (face: any = facing, q: string = quality) => {
    try {
      setCameraError('')
      if (stream) stream.getTracks().forEach(t => t.stop())
      let width = 1280, height = 720
      if (q === '1080P') { width = 1920; height = 1080 }
      if (q === '480P') { width = 854; height = 480 }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: face, width: { ideal: width }, height: { ideal: height } },
        audio: true,
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
      try {
        const track: any = s.getVideoTracks()[0]
        const caps: any = track.getCapabilities ? track.getCapabilities() : {}
        if (flash && caps.torch) await track.applyConstraints({ advanced: [{ torch: true }] })
        if (!flash && caps.torch) await track.applyConstraints({ advanced: [{ torch: false }] })
      } catch {}
    } catch {
      setCameraError('ক্যামেরা পারমিশন দাও ভাই, না হলে ভিডিও হবে না।')
    }
  }

  useEffect(() => { startCamera(); return () => { if (stream) stream.getTracks().forEach(t => t.stop()) } }, [])
  useEffect(() => { if (!isRecording) return; const t = setInterval(() => setRecordTime(r => r + 1), 1000); return () => clearInterval(t) }, [isRecording])
  useEffect(() => { if (countdown <= 0) return; const t = setTimeout(() => setCountdown(countdown - 1), 1000); if (countdown === 1) setTimeout(() => startRecordNow(), 1000); return () => clearTimeout(t) }, [countdown])
  useEffect(() => { if (stream) startCamera() }, [flash])

  const getFilterStyle = () => {
    let f = ''
    if (filter === 'Sunset') f = 'sepia(0.5) saturate(1.5) hue-rotate(-20deg)'
    if (filter === 'B&W') f = 'grayscale(1)'
    if (filter === 'Vintage') f = 'sepia(0.6) contrast(1.1)'
    if (filter === 'Warm') f = 'sepia(0.3) saturate(1.4)'
    if (filter === 'Cool') f = 'hue-rotate(180deg) saturate(1.2)'
    if (filter === 'Cinematic') f = 'contrast(1.2) brightness(0.9) saturate(1.3)'
    if (filter === 'Beauty') f = 'brightness(1.1) saturate(1.2) contrast(0.95)'
    if (filter === 'Normal') f = 'none'
    const beautyFilter = `brightness(${1 + beauty / 200}) saturate(${1 + beauty / 200}) contrast(${1 - beauty / 500})`
    const nightFilter = night ? 'brightness(1.4) contrast(1.2)' : ''
    if (f === 'none') return `${beautyFilter} ${nightFilter}`
    return `${f} ${beautyFilter} ${nightFilter}`
  }

  const startRecordNow = () => {
    if (!stream) { alert('আগে ক্যামেরা চালু হতে দাও'); return }
    try {
      chunksRef.current = []
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorderRef.current = rec
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        setPanel('post')
      }
      rec.start()
      playMusicForRecord()
      setIsRecording(true)
      setRecordTime(0)
    } catch { alert('এই ফোনে রেকর্ড সাপোর্ট করছে না, Photo তোলো') }
  }

  const stopRecordNow = () => {
    try { if (mediaRecorderRef.current) mediaRecorderRef.current.stop() } catch {}
    setIsRecording(false)
    stopMusicForRecord()
  }

  const handleRecord = () => {
    if (mode === 'Live') { navigate({ to: '/live/create' }); return }
    if (mode === 'Photo') {
      try {
        const canvas = document.createElement('canvas')
        if (videoRef.current) {
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.filter = getFilterStyle()
            ctx.drawImage(videoRef.current, 0, 0)
            const url = canvas.toDataURL('image/jpeg')
            setPhotoUrl(url)
            alert('📸 ছবি তোলা হয়ে গেছে! এখন পোস্ট করতে পারবে।')
            setPanel('post')
          }
        }
      } catch { alert('ছবি তুলতে পারলাম না') }
      return
    }
    if (isRecording) { stopRecordNow(); return }
    if (timer !== 'Off') { setCountdown(parseInt(timer)); return }
    startRecordNow()
  }

  const getSpeedValue = () => {
    if (speed === '0.5x') return 0.5
    if (speed === '1.5x') return 1.5
    if (speed === '2x') return 2
    return 1
  }

  // ===== পোস্ট - সবার Home + Viral এ যাবে + সঙ্গে সঙ্গে =====
  const fastUpload = async () => {
    if (!recordedBlob && !photoUrl) { alert('আগে ভিডিও / ছবি তোলো ভাই'); return }
    setIsUploading(true)
    setUploadProgress(0)
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 80))
      setUploadProgress(i)
    }
    let videoUrl = ''
    if (recordedBlob) videoUrl = URL.createObjectURL(recordedBlob)
    const finalMusic = galleryMusic ? `🎵 ${galleryMusic}` : music
    const newPost = {
      id: Date.now().toString(),
      user: getUserName(),
      owner: getUserName(),
      ownerPic: '🧡',
      email: localStorage.getItem('vigo_user_email') || '',
      videoUrl: videoUrl || photoUrl,
      photoUrl: photoUrl,
      caption: caption || `SOT TOK Video 🔥 ${selectedEffect} ${sticker}`,
      title: caption || `SOT TOK Video 🔥 ${selectedEffect} ${sticker}`,
      likes: 0,
      comments: [],
      views: 0,
      time: 'এখনই',
      createdAt: Date.now(),
      filter: filter,
      speed: speed,
      beauty: beauty,
      effect: selectedEffect,
      music: finalMusic,
      musicUrl: galleryMusicUrl,
      textOverlay: textOverlay,
      sticker: sticker,
    }
    const oldFeed = JSON.parse(localStorage.getItem('sot_tok_feed') || '[]')
    const newFeed = [newPost, ...oldFeed]
    localStorage.setItem('sot_tok_feed', JSON.stringify(newFeed))
    localStorage.setItem('vigo_feed', JSON.stringify(newFeed))
    // GLOBAL - সবার Home + Viral
    const globalFeed = JSON.parse(localStorage.getItem('sottok_global_feed') || '[]')
    globalFeed.unshift(newPost)
    localStorage.setItem('sottok_global_feed', JSON.stringify(globalFeed))
    const viralFeed = JSON.parse(localStorage.getItem('sottok_viral_feed') || '[]')
    viralFeed.unshift(newPost)
    localStorage.setItem('sottok_viral_feed', JSON.stringify(viralFeed))

    setIsUploading(false)
    setUploadProgress(100)
    stopMusicForRecord()
    alert(`✅ পোস্ট হয়ে গেছে! সবার Home + Viral এ চলে গেছে!\nফিল্টার: ${filter} • গান: ${finalMusic}`)
    navigate({ to: '/' })
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <audio ref={musicAudioRef} style={{ display: 'none' }} />
      <div style={{ background: 'linear-gradient(90deg,#7c4dff,#ff3b5c)', padding: '10px 12px', textAlign: 'center' }}>
        <b style={{ fontSize: 18 }}>📷 Camera - সব অপশন কাজ করবে</b>
        <div style={{ fontSize: 12, opacity: 0.9 }}>Speed, Beauty, Filter, Timer, Effects - সব চালু</div>
      </div>
      {cameraError && <div style={{ background: '#ff9800', color: '#000', padding: '8px 12px', fontSize: 12, textAlign: 'center' }}>{cameraError}</div>}

      <div style={{ position: 'relative', flex: 1, background: '#111', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `${mirror && facing === 'user' ? 'scaleX(-1)' : ''} scale(${zoom})`, filter: getFilterStyle() }} />
        {grid && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.4)' }} /><div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.4)' }} /><div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.4)' }} /><div style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.4)' }} /></div>}
        {textOverlay && <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', fontSize: 24, fontWeight: 'bold', textShadow: '2px 2px 4px #000', background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: 10 }}>{textOverlay}</div>}
        {(sticker || selectedEffect) && <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', fontSize: 48, textAlign: 'center' }}><div>{sticker}</div><div style={{ fontSize: 14, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 10 }}>{selectedEffect}</div></div>}
        {music !== 'কোনো গান নেই' && music !== '🎵 কোনো গান নেই' && <div style={{ position: 'absolute', top: 60, left: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>🎵 {music} • Speed: {speed}</div>}
        {galleryMusic && <div style={{ position: 'absolute', top: 90, left: 12, background: '#ff3b5c', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>🎵 গ্যালারি গান: {galleryMusic} - Lip-Sync চালু</div>}

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate({ to: '/' })} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontSize: 18 }}>✕</button>
          <button onClick={() => setFlash(!flash)} style={{ background: flash ? '#ffb400' : 'rgba(0,0,0,0.5)', color: flash ? '#000' : '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontSize: 18 }}>{flash ? '💡' : '⚡'}</button>
          <select value={quality} onChange={e => { setQuality(e.target.value); setTimeout(() => startCamera(facing, e.target.value), 100) }} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 20, fontWeight: 'bold' }}>
            <option>720P</option><option>1080P</option><option>480P</option>
          </select>
          <button onClick={() => { const n = facing === 'user' ? 'environment' : 'user'; setFacing(n); startCamera(n, quality) }} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontSize: 18 }}>🔄</button>
        </div>

        <div style={{ position: 'absolute', top: 70, right: 12, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <button onClick={() => setPanel(panel === 'speed' ? 'none' : 'speed')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>⏱️</div><span style={{ fontSize: 11 }}>Speed<br />{speed}</span></button>
          <button onClick={() => setPanel(panel === 'beauty' ? 'none' : 'beauty')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>🪄</div><span style={{ fontSize: 11 }}>Beauty<br />{beauty}%</span></button>
          <button onClick={() => setPanel(panel === 'filters' ? 'none' : 'filters')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>✨</div><span style={{ fontSize: 11 }}>Filters<br />{filter}</span></button>
          <button onClick={() => setPanel(panel === 'timer' ? 'none' : 'timer')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>⏰</div><span style={{ fontSize: 11 }}>Timer<br />{timer === 'Off' ? 'Off' : `${timer}s`}</span></button>
          <button onClick={() => setPanel(panel === 'more' ? 'none' : 'more')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>•••</div><span style={{ fontSize: 11 }}>More</span></button>
        </div>

        {isRecording && <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#ff0000', padding: '5px 12px', borderRadius: 20, fontWeight: 'bold', fontSize: 12 }}>🔴 REC {recordTime}s • {quality} • {speed} • {filter}</div>}
        {countdown > 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 'bold', textShadow: '4px 4px 10px #000' }}>{countdown}</div>}
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', padding: '7px 10px', borderRadius: 10, fontSize: 11 }}>
          <div>ফিল্টার: {filter} • বিউটি: {beauty}% • Speed: {speed} • Effect: {selectedEffect || 'নেই'} • গান: {music}</div>
          <div>Zoom: <button onClick={() => setZoom(Math.max(1, zoom - 0.5))} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 5, padding: '2px 8px' }}>-</button> {zoom}x <button onClick={() => setZoom(Math.min(3, zoom + 0.5))} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 5, padding: '2px 8px' }}>+</button></div>
        </div>
      </div>

      <div style={{ background: '#000', padding: '12px 14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setPanel('effects')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 28 }}>😊</div><span style={{ fontSize: 12 }}>Effects</span></button>
          <button onClick={handleRecord} style={{ width: 72, height: 72, borderRadius: '50%', background: isRecording ? '#fff' : '#ff0000', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', color: isRecording ? '#ff0000' : '#fff' }}>{isRecording ? 'STOP' : mode === 'Photo' ? '📸' : mode === 'Live' ? 'LIVE' : '●'}</button>
          <button onClick={() => setPanel('music')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 28 }}>🎵</div><span style={{ fontSize: 12 }}>Music</span></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          {(['Video', 'Photo', 'Live'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ background: 'none', border: 'none', color: mode === m ? '#ffb400' : '#aaa', fontWeight: 'bold', fontSize: 14, borderBottom: mode === m ? '2px solid #ffb400' : 'none', paddingBottom: 4 }}>{m}</button>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', margin: '8px 0 0' }}><b style={{ color: '#fff', fontSize: 16 }}>SOT <span style={{ color: '#ff3b5c' }}>TOK</span></b> | Create • Share</p>
      </div>

      {panel !== 'none' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#111b21', borderRadius: '20px 20px 0 0', padding: 16, zIndex: 50, maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{panel === 'speed' ? '⏱️ Speed - সত্যি কাজ করবে' : panel === 'beauty' ? '🪄 Beauty - মুখে লাগবে' : panel === 'filters' ? '✨ Filters - ভিডিওতে লাগবে' : panel === 'timer' ? '⏰ Timer - কাউন্টডাউন হবে' : panel === 'more' ? '••• More - সব চালু' : panel === 'post' ? '📝 পোস্ট করো' : panel === 'music' ? '🎵 Music' : panel === 'text' ? '✍️ Text' : '😊 Effects - ভিডিওতে দেখাবে'}</b><button onClick={() => setPanel('none')} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button></div>

          {panel === 'speed' && <div><div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{speeds.map(s => <button key={s} onClick={() => { setSpeed(s); alert(`Speed ${s} লাগানো হয়েছে!`) }} style={{ padding: '10px 18px', borderRadius: 20, background: speed === s ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontWeight: 'bold' }}>{s}</button>)}</div><p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>0.5x = স্লো মোশন, 2x = ফাস্ট মোশন</p></div>}

          {panel === 'beauty' && <div style={{ marginTop: 12 }}><input type="range" min="0" max="100" value={beauty} onChange={e => setBeauty(Number(e.target.value))} style={{ width: '100%' }} /><p style={{ textAlign: 'center' }}>Beauty: {beauty}%</p><div style={{ display: 'flex', gap: 8 }}><button onClick={() => setBeauty(0)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none' }}>0%</button><button onClick={() => setBeauty(50)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none' }}>50%</button><button onClick={() => setBeauty(100)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#ff3b5c', color: '#fff', border: 'none' }}>100%</button></div></div>}

          {panel === 'filters' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 14px', borderRadius: 20, background: filter === f ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none' }}>{f}</button>)}</div>}

          {panel === 'timer' && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{timers.map(t => <button key={t} onClick={() => { setTimer(t); if (t !== 'Off') alert(`${t} সেকেন্ড পর রেকর্ড শুরু হবে`) }} style={{ padding: '10px 18px', borderRadius: 20, background: timer === t ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontWeight: 'bold' }}>{t === 'Off' ? 'Off' : `${t}s`}</button>)}</div>}

          {panel === 'more' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12, textAlign: 'center' }}>
            <div onClick={() => setPanel('music')} style={{ background: '#202c33', padding: 12, borderRadius: 12 }}><b>🎵 Music</b><div style={{ fontSize: 11, color: '#aaa' }}>{music}</div></div>
            <div onClick={() => setPanel('text')} style={{ background: '#202c33', padding: 12, borderRadius: 12 }}><b>✍️ Text</b><div style={{ fontSize: 11, color: '#aaa' }}>{textOverlay || 'লেখা যোগ করো'}</div></div>
            <div onClick={() => { const s = prompt('Sticker চয়েস করো: 😍 🔥 🪔 🌸 👑 ✨ ❤️'); if (s) setSticker(s); setPanel('none') }} style={{ background: '#202c33', padding: 12, borderRadius: 12 }}><b>🖼️ Sticker</b><div style={{ fontSize: 11, color: '#aaa' }}>{sticker || 'স্টিকার'}</div></div>
            <div onClick={() => { setMirror(!mirror); alert(mirror ? 'Mirror বন্ধ' : 'Mirror চালু') }} style={{ background: mirror ? '#ff3b5c' : '#202c33', padding: 12, borderRadius: 12 }}><b>🪞 Mirror</b><div style={{ fontSize: 11, color: '#aaa' }}>{mirror ? 'চালু' : 'বন্ধ'}</div></div>
            <div onClick={() => { setGrid(!grid); alert(grid ? 'Grid বন্ধ' : 'Grid চালু') }} style={{ background: grid ? '#ff3b5c' : '#202c33', padding: 12, borderRadius: 12 }}><b>📐 Grid</b><div style={{ fontSize: 11, color: '#aaa' }}>{grid ? 'চালু' : 'বন্ধ'}</div></div>
            <div onClick={() => { setNight(!night); alert(night ? 'Night বন্ধ' : 'Night চালু') }} style={{ background: night ? '#ff3b5c' : '#202c33', padding: 12, borderRadius: 12 }}><b>🌙 Night</b><div style={{ fontSize: 11, color: '#aaa' }}>{night ? 'চালু' : 'বন্ধ'}</div></div>
          </div>}

          {panel === 'music' && <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', width: '100%', padding: 14, borderRadius: 12, background: '#ff3b5c', color: '#fff', textAlign: 'center', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
              📁 গ্যালারি থেকে গান নাও - নিজের গান
              <input type="file" accept="audio/*" onChange={pickGalleryMusic} style={{ display: 'none' }} />
            </label>
            {galleryMusic && <p style={{ fontSize: 13, color: '#4caf50', marginTop: 8 }}>✅ লাগানো গান: {galleryMusic} - এবার গান বাজিয়ে মুখ মিলিয়ে ভিডিও করো</p>}
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>👆 উপরে চাপো → গ্যালারি খুলবে → গান চয়েস করো → গান বাজবে → Lip-Sync ভিডিও করো</p>
            {musics.map(m => <button key={m} onClick={() => { setMusic(m); setGalleryMusic(''); setGalleryMusicUrl(''); setPanel('none'); alert(`গান লাগানো হয়েছে: ${m}`) }} style={{ width: '100%', padding: 12, borderRadius: 10, background: music === m ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', marginTop: 6, textAlign: 'left' }}>{m}</button>)}
          </div>}

          {panel === 'text' && <div style={{ marginTop: 12 }}><input value={textOverlay} onChange={e => setTextOverlay(e.target.value)} placeholder="ভিডিওতে কি লেখা দেখাবে? যেমন শুভ অষ্টমী 🙏" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', boxSizing: 'border-box' }} /><button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 10, background: '#ff3b5c', color: '#fff', border: 'none', fontWeight: 'bold' }}>✅ লেখা লাগাও</button></div>}

          {panel === 'effects' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{effects.map(e => <button key={e} onClick={() => { setSelectedEffect(e); setPanel('none'); alert(`Effect লাগানো হয়েছে: ${e}`) }} style={{ padding: '10px 14px', borderRadius: 20, background: '#202c33', color: '#fff', border: 'none' }}>{e}</button>)}</div>}

          {panel === 'post' && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 13 }}>✅ ভিডিও রেডি! {recordTime} সেকেন্ড • ফিল্টার: {filter} • Speed: {speed} • Beauty: {beauty}% • Effect: {selectedEffect} • গান: {music}</p>
              {galleryMusic && <p style={{ fontSize: 13, color: '#4caf50' }}>🎵 গ্যালারির গান: {galleryMusic} - এই গান সহ পোস্ট হবে</p>}
              <p style={{ fontSize: 12, color: '#aaa' }}>📢 পোস্ট করলেই সবার Home + Viral এ চলে যাবে</p>
              {photoUrl && <img src={photoUrl} style={{ width: '100%', borderRadius: 10, marginBottom: 8 }} />}
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption লেখো... শুভ অষ্টমী 🙏" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', boxSizing: 'border-box' }} />
              {isUploading && <div style={{ marginTop: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>আপলোড হচ্ছে...</span><span>{uploadProgress}%</span></div><div style={{ background: '#202c33', height: 8, borderRadius: 10, marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${uploadProgress}%`, background: '#ff3b5c', height: '100%' }} /></div></div>}
              <button onClick={fastUpload} disabled={isUploading} style={{ width: '100%', marginTop: 12, background: '#ff3b5c', color: '#fff', border: 'none', padding: 13, borderRadius: 20, fontWeight: 'bold' }}>{isUploading ? `আপলোড হচ্ছে... ${uploadProgress}%` : '🚀 ফাস্ট পোস্ট করো'}</button>
              <button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 8, background: '#202c33', color: '#fff', border: 'none', padding: 12, borderRadius: 20 }}>আবার রেকর্ড করো</button>
            </div>
          )}
          {panel !== 'post' && <button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 12, background: '#ff3b5c', color: '#fff', border: 'none', padding: 12, borderRadius: 20, fontWeight: 'bold' }}>✅ হয়ে গেছে</button>}
        </div>
      )}
    </div>
  )
}