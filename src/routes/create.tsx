 import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/create')({
  component: CameraChobirMoto,
})

function CameraChobirMoto() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
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
  const [panel, setPanel] = useState<'none' | 'speed' | 'beauty' | 'filters' | 'timer' | 'more' | 'effects'>('none')
  const [selectedEffect, setSelectedEffect] = useState('কোনো Effect নেই')

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
  useEffect(() => { if (countdown <= 0) return; const t = setTimeout(() => setCountdown(countdown - 1), 1000); if (countdown === 1) setTimeout(() => { setIsRecording(true); setRecordTime(0) }, 1000); return () => clearTimeout(t) }, [countdown])

  const handleRecord = () => {
    if (mode === 'Live') { navigate({ to: '/live/ashtami' }); return }
    if (mode === 'Photo') { alert('📸 ছবি তোলা হয়ে গেছে!'); return }
    if (isRecording) { setIsRecording(false); alert(`✅ ভিডিও হয়ে গেছে!\nসময়: ${recordTime} সেকেন্ড\nফিল্টার: ${filter}\nস্পিড: ${speed}\nবিউটি: ${beauty}%\nEffect: ${selectedEffect}`); return }
    if (timer !== 'Off') { setCountdown(parseInt(timer)); return }
    setIsRecording(true); setRecordTime(0)
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
          <button onClick={() => setPanel(panel === 'timer' ? 'none' : 'timer')} style={{ background: 'transparent', border: 'none', color: