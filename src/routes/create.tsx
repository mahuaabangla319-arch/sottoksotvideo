 import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/create')({
  component: CameraFullFinal,
})

function CameraFullFinal() {
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
  const [panel, setPanel] = useState<'none' | 'speed' | 'beauty' | 'filters' | 'timer' | 'more' | 'effects' | 'post'>('none')
  const [selectedEffect, setSelectedEffect] = useState('কোনো Effect নেই')
  const [caption, setCaption] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSpeed, setUploadSpeed] = useState('')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const filters = ['Normal', 'Sunset', 'Beauty', 'Cinematic', 'Vintage', 'B&W', 'Warm', 'Cool']
  const speeds = ['0.5x', '1x', '1.5x', '2x']
  const effects = ['😍 Love', '🔥 Fire', '🪔 Puja', '🌸 Flower', '👑 Crown', '😎 Cool', '✨ Sparkle', '🎃 Halloween']
  const timers = ['Off', '3', '5', '10']

  const startCamera = async (face: any = facing) => {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop())
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face, width: quality === '720P' ? 1280 : quality === '1080P' ? 1920 : 640 }, audio: true })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch { alert('ক্যামেরা পারমিশন দাও ভাই') }
  }

  useEffect(() => { startCamera(); return () => { if (stream) stream.getTracks().forEach(t => t.stop()) } }, [])
  useEffect(() => { if (!isRecording) return; const t = setInterval(() => setRecordTime(r => r + 1), 1000); return () => clearInterval(t) }, [isRecording])
  useEffect(() => { if (countdown <= 0) return; const t = setTimeout(() => setCountdown(countdown - 1), 1000); if (countdown === 1) setTimeout(() => startRecordNow(), 1000); return () => clearTimeout(t) }, [countdown])

  const startRecordNow = () => {
    if (!stream) return
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
    setIsRecording(true)
    setRecordTime(0)
  }

  const stopRecordNow = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  const handleRecord = () => {
    if (mode === 'Live') { navigate({ to: '/live/ashtami' }); return }
    if (mode === 'Photo') { alert('📸 ছবি তোলা হয়ে গেছে!'); return }
    if (isRecording) { stopRecordNow(); return }
    if (timer !== 'Off') { setCountdown(parseInt(timer)); return }
    startRecordNow()
  }

  const fastUploadVideo = async () => {
    if (!recordedBlob) { alert('আগে ভিডিও রেকর্ড করো ভাই'); return }
    setIsUploading(true)
    setUploadProgress(0)
    const startTime = Date.now()
    const CHUNK_SIZE = 512 * 1024
    const totalChunks = Math.ceil(recordedBlob.size / CHUNK_SIZE)
    let uploaded = 0
    for (let i = 0; i < totalChunks; i++) {
      const chunk = recordedBlob.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      await new Promise(r => setTimeout(r, 30))
      uploaded += chunk.size
      const percent = Math.floor((uploaded / recordedBlob.size) * 100)
      setUploadProgress(percent)
      const elapsed = (Date.now() - startTime) / 1000
      const speedMB = (uploaded / 1024 / 1024 / Math.max(elapsed, 0.1)).toFixed(1)
      setUploadSpeed(`${speedMB} MB/s`)
    }
    const videoUrl = URL.createObjectURL(recordedBlob)
    const newPost = {
      id: Date.now().toString(),
      user: localStorage.getItem('vigo_user_name') || 'Tumi',
      videoUrl: videoUrl,
      caption: caption || 'SOT TOK Video 🔥',
      likes: 0,
      comments: [],
      time: 'এখনই',
      filter: filter,
      speed: speed,
      beauty: beauty,
      effect: selectedEffect,
    }
    const oldFeed = JSON.parse(localStorage.getItem('sot_tok_feed') || '[]')
    localStorage.setItem('sot_tok_feed', JSON.stringify([newPost, ...oldFeed]))
    setIsUploading(false)
    setUploadProgress(100)
    setPanel('none')
    setCaption('')
    setRecordedBlob(null)
    alert(`✅ ফাস্ট পোস্ট হয়ে গেছে!\nসময়: ${((Date.now() - startTime) / 1000).toFixed(1)} সেকেন্ড\nস্পিড: ${uploadSpeed}`)
    navigate({ to: '/' })
  }

  const getFilterStyle = () => {
    if (filter === 'Sunset') return 'sepia(0.5) saturate(1.5) hue-rotate(-20deg)'
    if (filter === 'B&W') return 'grayscale(1)'
    if (filter === 'Vintage') return 'sepia(0.6) contrast(1.1)'
    if (filter === 'Warm') return 'sepia(0.3) saturate(1.4)'
    if (filter === 'Cool') return 'hue-rotate(180deg) saturate(1.2)'
    if (filter === 'Cinematic') return 'contrast(1.2) brightness(0.9) saturate(1.3)'
    if (filter === 'Beauty') return 'brightness(1.1) saturate(1.2) contrast(0.95)'
    return 'none'
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(90deg,#7c4dff,#ff3b5c)', padding: '10px 12px', textAlign: 'center' }}>
        <b style={{ fontSize: 18 }}>📷 Camera</b>
        <div style={{ fontSize: 12, opacity: 0.9 }}>উন্নত ক্যামেরা দিয়ে ভিডিও রেকর্ড করুন সহজে</div>
      </div>

      <div style={{ position: 'relative', flex: 1, background: '#111', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facing === 'user' ? 'scaleX(-1)' : 'none', filter: getFilterStyle() }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate({ to: '/' })} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontSize: 18 }}>✕</button>
          <button onClick={() => setFlash(!flash)} style={{ background: flash ? '#ffb400' : 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontSize: 18 }}>⚡</button>
          <select value={quality} onChange={e => { setQuality(e.target.value); setTimeout(() => startCamera(), 100) }} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 20, fontWeight: 'bold' }}>
            <option>720P</option><option>1080P</option><option>480P</option>
          </select>
          <button onClick={() => { const n = facing === 'user' ? 'environment' : 'user'; setFacing(n); startCamera(n) }} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontSize: 18 }}>🔄</button>
        </div>

        <div style={{ position: 'absolute', top: 70, right: 12, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <button onClick={() => setPanel(panel === 'speed' ? 'none' : 'speed')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>⏱️</div><span style={{ fontSize: 11 }}>Speed<br />{speed}</span></button>
          <button onClick={() => setPanel(panel === 'beauty' ? 'none' : 'beauty')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>🪄</div><span style={{ fontSize: 11 }}>Beauty<br />{beauty}%</span></button>
          <button onClick={() => setPanel(panel === 'filters' ? 'none' : 'filters')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>✨</div><span style={{ fontSize: 11 }}>Filters<br />{filter}</span></button>
          <button onClick={() => setPanel(panel === 'timer' ? 'none' : 'timer')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>⏰</div><span style={{ fontSize: 11 }}>Timer<br />{timer === 'Off' ? 'Off' : `${timer}s`}</span></button>
          <button onClick={() => setPanel(panel === 'more' ? 'none' : 'more')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>•••</div><span style={{ fontSize: 11 }}>More</span></button>
        </div>

        {isRecording && <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#ff0000', padding: '5px 12px', borderRadius: 20, fontWeight: 'bold', fontSize: 12 }}>🔴 REC {recordTime}s • {quality} • {speed}</div>}
        {countdown > 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 'bold' }}>{countdown}</div>}
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.5)', padding: '7px 10px', borderRadius: 10, fontSize: 11 }}>
          <div>ফিল্টার: {filter} • বিউটি: {beauty}% • Effect: {selectedEffect}</div>
        </div>
      </div>

      <div style={{ background: '#000', padding: '12px 14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setPanel('effects')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 28 }}>😊</div><span style={{ fontSize: 12 }}>Effects</span></button>
          <button onClick={handleRecord} style={{ width: 72, height: 72, borderRadius: '50%', background: isRecording ? '#fff' : '#ff0000', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', color: isRecording ? '#ff0000' : '#fff' }}>{isRecording ? 'STOP' : mode === 'Photo' ? '📸' : mode === 'Live' ? 'LIVE' : '●'}</button>
          <button onClick={() => alert('গ্যালারি থেকে ভিডিও / ছবি বেছে নাও')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 28 }}>🖼️</div><span style={{ fontSize: 12 }}>Upload</span></button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{panel === 'speed' ? '⏱️ Speed' : panel === 'beauty' ? '🪄 Beauty' : panel === 'filters' ? '✨ Filters' : panel === 'timer' ? '⏰ Timer' : panel === 'more' ? '••• More' : panel === 'post' ? '📝 পোস্ট করো' : '😊 Effects'}</b><button onClick={() => setPanel('none')} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button></div>
          {panel === 'speed' && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{speeds.map(s => <button key={s} onClick={() => setSpeed(s)} style={{ padding: '10px 18px', borderRadius: 20, background: speed === s ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontWeight: 'bold' }}>{s}</button>)}</div>}
          {panel === 'beauty' && <div style={{ marginTop: 12 }}><input type="range" min="0" max="100" value={beauty} onChange={e => setBeauty(Number(e.target.value))} style={{ width: '100%' }} /><p style={{ textAlign: 'center', fontSize: 12 }}>Beauty: {beauty}% - মুখ সুন্দর দেখাবে</p></div>}
          {panel === 'filters' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 20, background: filter === f ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none' }}>{f}</button>)}</div>}
          {panel === 'timer' && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{timers.map(t => <button key={t} onClick={() => setTimer(t)} style={{ padding: '10px 18px', borderRadius: 20, background: timer === t ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontWeight: 'bold' }}>{t === 'Off' ? 'Off' : `${t}s`}</button>)}</div>}
          {panel === 'more' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12, textAlign: 'center' }}>{[{ t: '🎵 Music', d: 'গান যোগ করো' }, { t: '✍️ Text', d: 'লেখা যোগ করো' }, { t: '🖼️ Sticker', d: 'স্টিকার' }, { t: '🪞 Mirror', d: 'আয়না' }, { t: '📐 Grid', d: 'গ্রিড' }, { t: '🌙 Night', d: 'রাতের মোড' }].map(x => <div key={x.t} style={{ background: '#202c33', padding: 12, borderRadius: 12 }}><b>{x.t}</b><div style={{ fontSize: 11, color: '#aaa' }}>{x.d}</div></div>)}</div>}
          {panel === 'effects' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{effects.map(e => <button key={e} onClick={() => { setSelectedEffect(e); setPanel('none') }} style={{ padding: '10px 14px', borderRadius: 20, background: '#202c33', color: '#fff', border: 'none' }}>{e}</button>)}</div>}
          {panel === 'post' && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 13 }}>✅ ভিডিও রেডি! {recordTime} সেকেন্ড • ফিল্টার: {filter} • Effect: {selectedEffect}</p>
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption লেখো... শুভ অষ্টমী 🙏" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', boxSizing: 'border-box' }} />
              {isUploading && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>⚡ ফাস্ট আপলোড...</span><span>{uploadProgress}% • {uploadSpeed}</span></div>
                  <div style={{ background: '#202c33', height: 8, borderRadius: 10, marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg,#ff3b5c,#ffb400)', height: '100%' }} /></div>
                </div>
              )}
              <button onClick={fastUploadVideo} disabled={isUploading} style={{ width: '100%', marginTop: 12, background: '#ff3b5c', color: '#fff', border: 'none', padding: 13, borderRadius: 20, fontWeight: 'bold' }}>{isUploading ? `আপলোড হচ্ছে... ${uploadProgress}%` : '🚀 ফাস্ট পোস্ট করো'}</button>
              <button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 8, background: '#202c33', color: '#fff', border: 'none', padding: 12, borderRadius: 20 }}>আবার রেকর্ড করো</button>
            </div>
          )}
          {panel !== 'post' && <button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 12, background: '#ff3b5c', color: '#fff', border: 'none', padding: 12, borderRadius: 20, fontWeight: 'bold' }}>✅ হয়ে গেছে</button>}
        </div>
      )}
    </div>
  )
}