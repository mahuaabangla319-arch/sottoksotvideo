 // @ts-nocheck
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'

const pickMime = (): string => {
  if (typeof MediaRecorder === 'undefined') return ''
  return ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find((m) => MediaRecorder.isTypeSupported(m)) ?? ''
}

export const Route = createFileRoute('/create')({ component: VigoCamera })

// ===== Vigo স্টাইল গানের লাইব্রেরি - ক্যাটাগরি সহ =====
const MUSIC_LIBRARY: any[] = [
  { id: 1, cat: '🔥 ট্রেন্ডিং', name: '🔥 ট্রেন্ডিং বিট', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', time: '15s', use: '1.2M ব্যবহার' },
  { id: 2, cat: '💃 ডান্স', name: '💃 ডান্স ধামাকা', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', time: '15s', use: '980K ব্যবহার' },
  { id: 3, cat: '💃 ডান্স', name: '💃 নাচের তালে তালে', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', time: '30s', use: '750K ব্যবহার' },
  { id: 4, cat: '🍛 বাংলা', name: '🍛 বাংলা হিট গান', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', time: '30s', use: '620K ব্যবহার' },
  { id: 5, cat: '🍛 বাংলা', name: '🍛 ঢাকের তালে', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', time: '15s', use: '890K ব্যবহার' },
  { id: 6, cat: '🎬 বলিউড', name: '🎬 বলিউড হিট', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', time: '30s', use: '1.5M ব্যবহার' },
  { id: 7, cat: '🙏 ভক্তি', name: '🙏 শুভ অষ্টমী', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', time: '30s', use: '540K ব্যবহার' },
  { id: 8, cat: '🙏 ভক্তি', name: '🪔 পুজো স্পেশাল', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', time: '15s', use: '410K ব্যবহার' },
  { id: 9, cat: '😂 কমেডি', name: '😂 ফানি বিট', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', time: '15s', use: '730K ব্যবহার' },
  { id: 10, cat: '❤️ রোমান্টিক', name: '❤️ রোমান্টিক গান', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', time: '30s', use: '660K ব্যবহার' },
]
const CATS = ['সব', '🔥 ট্রেন্ডিং', '💃 ডান্স', '🍛 বাংলা', '🎬 বলিউড', '🙏 ভক্তি', '😂 কমেডি', '❤️ রোমান্টিক']

function VigoCamera() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const recCtxRef = useRef<AudioContext | null>(null)
  const recAudioRef = useRef<HTMLAudioElement | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const [galleryUrl, setGalleryUrl] = useState('')
  const [galleryDuration, setGalleryDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [musicFileUrl, setMusicFileUrl] = useState('')
  const [musicFileName, setMusicFileName] = useState('')
  const [musicCat, setMusicCat] = useState('সব')
  const [musicStart, setMusicStart] = useState(0)
  const [musicLen, setMusicLen] = useState(15)
  const [processing, setProcessing] = useState(false)
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
  const [panel, setPanel] = useState<'none' | 'speed' | 'beauty' | 'filters' | 'timer' | 'more' | 'effects' | 'post' | 'music' | 'text' | 'gallery' | 'dance'>('none')
  const [selectedEffect, setSelectedEffect] = useState('')
  const [caption, setCaption] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [music, setMusic] = useState('কোনো গান নেই')
  const [musicUrl, setMusicUrl] = useState('')
  const [textOverlay, setTextOverlay] = useState('')
  const [sticker, setSticker] = useState('')
  const [mirror, setMirror] = useState(true)
  const [grid, setGrid] = useState(false)
  const [night, setNight] = useState(false)
  const [zoom, setZoom] = useState(1)

  const filters = ['Normal', 'Sunset', 'Beauty', 'Cinematic', 'Vintage', 'B&W', 'Warm', 'Cool']
  const speeds = ['0.5x', '1x', '1.5x', '2x']
  const effects = ['😍 Love', '🔥 Fire', '🪔 Puja', '🌸 Flower', '👑 Crown', '😎 Cool', '✨ Sparkle', '🎃 Halloween']
  const timers = ['Off', '3', '5', '10']
  const stickers = ['', '😍', '🔥', '🪔', '🌸', '👑', '✨', '❤️', '🎃']
  const getUserName = () => { return localStorage.getItem('vigo_user_name') || localStorage.getItem('sot_tok_user') || localStorage.getItem('shorttok_username') || 'Sarthak' }

  const startCamera = async (face: any = facing, q: string = quality) => {
    try {
      setCameraError('')
      if (stream) stream.getTracks().forEach(t => t.stop())
      let width = 1280, height = 720
      if (q === '1080P') { width = 1920; height = 1080 }
      if (q === '480P') { width = 854; height = 480 }
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face, width: { ideal: width }, height: { ideal: height } }, audio: true })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
      try {
        const track: any = s.getVideoTracks()[0]
        const caps: any = track.getCapabilities ? track.getCapabilities() : {}
        if (caps.torch) await track.applyConstraints({ advanced: [{ torch: !!flash }] })
      } catch {}
    } catch { setCameraError('ক্যামেরা পারমিশন দাও ভাই, না হলে ভিডিও হবে না। উপরে 🔒 তালা → Camera → Allow করো।') }
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

  // ===== Vigo স্টাইল: গান বাজিয়ে লিপসিং / ডান্স রেকর্ড =====
  const startRecordNow = () => {
    if (!stream) { alert('আগে ক্যামেরা চালু হতে দাও'); return }
    try {
      chunksRef.current = []
      let recStream: MediaStream = stream
      const useUrl = musicFileUrl || musicUrl
      if (useUrl) {
        const ac = new AudioContext()
        const dest = ac.createMediaStreamDestination()
        try { if (stream.getAudioTracks().length) ac.createMediaStreamSource(stream).connect(dest) } catch {}
        const audioEl = new Audio(useUrl)
        audioEl.currentTime = musicStart
        const ms = ac.createMediaElementSource(audioEl)
        ms.connect(dest); ms.connect(ac.destination)
        void ac.resume(); void audioEl.play().catch(() => {})
        // গান কাটা অংশ শেষ হলে গান থামাও
        setTimeout(() => { try { audioEl.pause() } catch {} }, musicLen * 1000)
        recCtxRef.current = ac; recAudioRef.current = audioEl
        recStream = new MediaStream([...stream.getVideoTracks(), ...dest.stream.getAudioTracks()])
      }
      const mime = pickMime()
      const rec = mime ? new MediaRecorder(recStream, { mimeType: mime }) : new MediaRecorder(recStream)
      mediaRecorderRef.current = rec
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'video/webm' })
        recAudioRef.current?.pause(); void recCtxRef.current?.close().catch(() => {})
        recAudioRef.current = null; recCtxRef.current = null
        setRecordedBlob(blob); setPanel('post')
      }
      rec.start(); setIsRecording(true); setRecordTime(0)
    } catch { alert('এই ফোনে রেকর্ড সাপোর্ট করছে না, Photo তোলো') }
  }
  const stopRecordNow = () => { try { if (mediaRecorderRef.current) mediaRecorderRef.current.stop() } catch {}; setIsRecording(false) }
  const handleRecord = () => {
    if (mode === 'Live') { navigate({ to: '/live/create' }); return }
    if (mode === 'Photo') {
      try {
        const canvas = document.createElement('canvas')
        if (videoRef.current) {
          canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) { ctx.filter = getFilterStyle(); ctx.drawImage(videoRef.current, 0, 0); const url = canvas.toDataURL('image/jpeg'); setPhotoUrl(url); alert('📸 ছবি তোলা হয়ে গেছে! এখন পোস্ট করতে পারবে।'); setPanel('post') }
        }
      } catch { alert('ছবি তুলতে পারলাম না') }
      return
    }
    if (isRecording) { stopRecordNow(); return }
    if (timer !== 'Off') { setCountdown(parseInt(timer)); return }
    startRecordNow()
  }

  const onPickGalleryVideo = (file: File | undefined) => {
    if (!file) return
    if (galleryUrl) URL.revokeObjectURL(galleryUrl)
    setGalleryUrl(URL.createObjectURL(file)); setTrimStart(0); setTrimEnd(0); setGalleryDuration(0)
  }
  const onPickMusicFile = (file: File | undefined) => {
    if (!file) return
    if (musicFileUrl) URL.revokeObjectURL(musicFileUrl)
    setMusicFileUrl(URL.createObjectURL(file)); setMusicFileName(file.name); setMusic('🎵 ' + file.name); setMusicUrl(''); setPanel('none')
  }
  const pickLibraryMusic = (m: any) => {
    setMusic('🎵 ' + m.name); setMusicUrl(m.url); setMusicFileUrl(''); setMusicFileName(''); setMusicStart(0); setMusicLen(15)
    // প্রিভিউ বাজাও - লিপসিং দেখো
    try { if (previewAudioRef.current) { previewAudioRef.current.src = m.url; previewAudioRef.current.currentTime = 0; previewAudioRef.current.play().catch(() => {}) } } catch {}
    setPanel('none')
  }

  // গ্যালারি ভিডিও কেটে + গান কেটে নতুন ভিডিও বানায়
  const processGallery = async () => {
    if (!galleryUrl || processing) return
    setProcessing(true)
    try {
      const v = document.createElement('video'); v.src = galleryUrl; v.playsInline = true
      await new Promise<void>((res, rej) => { v.onloadedmetadata = () => res(); v.onerror = () => rej(new Error('video')) })
      const end = trimEnd > trimStart ? trimEnd : v.duration
      v.currentTime = trimStart
      await new Promise<void>((res) => { v.onseeked = () => res() })
      const canvas = document.createElement('canvas'); canvas.width = v.videoWidth || 720; canvas.height = v.videoHeight || 1280
      const c2 = canvas.getContext('2d'); if (!c2) throw new Error('canvas')
      const ac = new AudioContext(); const dest = ac.createMediaStreamDestination()
      let audioEl: HTMLAudioElement | null = null
      const useUrl = musicFileUrl || musicUrl
      if (useUrl) { v.muted = true; audioEl = new Audio(useUrl); audioEl.currentTime = musicStart; ac.createMediaElementSource(audioEl).connect(dest) }
      else { ac.createMediaElementSource(v).connect(dest) }
      const out = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()])
      const mime = pickMime(); const rec = mime ? new MediaRecorder(out, { mimeType: mime }) : new MediaRecorder(out)
      const parts: Blob[] = []; rec.ondataavailable = (e) => { if (e.data.size > 0) parts.push(e.data) }
      const finished = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(parts, { type: rec.mimeType || 'video/webm' })) })
      await ac.resume(); rec.start(); await v.play(); if (audioEl) void audioEl.play().catch(() => {})
      const draw = () => {
        if (v.currentTime >= end || v.ended || rec.state !== 'recording') { v.pause(); audioEl?.pause(); if (rec.state === 'recording') rec.stop(); return }
        c2.filter = getFilterStyle(); c2.drawImage(v, 0, 0, canvas.width, canvas.height); requestAnimationFrame(draw)
      }
      draw(); const blob = await finished; void ac.close().catch(() => {})
      setRecordedBlob(blob); setRecordTime(Math.round(end - trimStart)); setPanel('post')
    } catch { alert('এই ভিডিও কাটা যায়নি, অন্য ভিডিও চেষ্টা করুন') }
    finally { setProcessing(false) }
  }

  const fastUpload = async () => {
    if (!recordedBlob && !photoUrl) { alert('আগে ভিডিও রেকর্ড করুন বা গ্যালারি থেকে নিন'); return }
    if (!user) { navigate({ to: '/login' }); return }
    setIsUploading(true); setUploadProgress(30)
    try {
      let path = ''; let blobToUp: Blob = recordedBlob!
      if (photoUrl && !recordedBlob) {
        const r = await fetch(photoUrl); blobToUp = await r.blob(); path = `${user.id}/${Date.now()}.jpg`
        const { error: upErr } = await supabase.storage.from('videos').upload(path, blobToUp, { contentType: 'image/jpeg' })
        if (upErr) throw upErr
      } else {
        const ext = recordedBlob!.type.includes('mp4') ? 'mp4' : 'webm'; path = `${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('videos').upload(path, blobToUp, { contentType: blobToUp.type || 'video/webm' })
        if (upErr) throw upErr
      }
      setUploadProgress(80)
      const { error: insErr } = await supabase.from('videos').insert({
        user_id: user.id, video_url: path,
        caption: (caption || `Sarthak's Short Tok Video ${selectedEffect} ${sticker}`.trim()),
        sound_name: musicFileName || (music.includes('কোনো গান নেই') ? 'Original sound - Sarthak' : music),
        visibility: 'public',
      })
      if (insErr) throw insErr
      setUploadProgress(100)
      try { localStorage.setItem('shorttok_just_posted', String(Date.now())) } catch {}
      await queryClient.invalidateQueries({ queryKey: ['feed'] })
      await queryClient.invalidateQueries({ queryKey: ['my-videos'] })
      alert('✅ ভিডিও পোস্ট হয়ে গেছে! সবাই এখন দেখতে পারবে।')
      navigate({ to: '/feed' })
    } catch { alert('আপলোড হয়নি, আবার চেষ্টা করুন') }
    finally { setIsUploading(false) }
  }

  const filteredMusic = MUSIC_LIBRARY.filter(m => musicCat === 'সব' || m.cat === musicCat)

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <audio ref={previewAudioRef} preload="auto" />
      <div style={{ background: 'linear-gradient(90deg,#7c4dff,#ff3b5c)', padding: '10px 12px', textAlign: 'center' }}>
        <b style={{ fontSize: 18 }}>📷 Sarthak's SHORT TOK - Vigo Camera</b>
        <div style={{ fontSize: 12, opacity: 0.9 }}>Speed, Beauty, Filter, Timer, Music, Dance - সব চালু</div>
      </div>
      {cameraError && <div style={{ background: '#ff9800', color: '#000', padding: '8px 12px', fontSize: 12, textAlign: 'center' }}>{cameraError}</div>}

      <div style={{ position: 'relative', flex: 1, background: '#111', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `${mirror && facing === 'user' ? 'scaleX(-1)' : ''} scale(${zoom})`, filter: getFilterStyle() }} />
        {grid && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.4)' }} /><div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.4)' }} /><div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.4)' }} /><div style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.4)' }} /></div>}
        {textOverlay && <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', fontSize: 24, fontWeight: 'bold', textShadow: '2px 2px 4px #000', background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: 10 }}>{textOverlay}</div>}
        {(sticker || selectedEffect) && <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', fontSize: 48, textAlign: 'center' }}><div>{sticker}</div><div style={{ fontSize: 14, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 10 }}>{selectedEffect}</div></div>}
        {music !== 'কোনো গান নেই' && music !== '🎵 কোনো গান নেই' && <div style={{ position: 'absolute', top: 60, left: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>🎵 {music} • {musicStart}s থেকে {musicLen}s • Speed: {speed}</div>}

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
          <button onClick={() => setPanel(panel === 'dance' ? 'none' : 'dance')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 26 }}>💃</div><span style={{ fontSize: 11 }}>Dance</span></button>
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
          <button onClick={() => setPanel('gallery')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 28 }}>🖼️</div><span style={{ fontSize: 12 }}>Gallery</span></button>
          <button onClick={() => setPanel('music')} style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 28 }}>🎵</div><span style={{ fontSize: 12 }}>Music</span></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          {(['Video', 'Photo', 'Live'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ background: 'none', border: 'none', color: mode === m ? '#ffb400' : '#aaa', fontWeight: 'bold', fontSize: 14, borderBottom: mode === m ? '2px solid #ffb400' : 'none', paddingBottom: 4 }}>{m}</button>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', margin: '8px 0 0' }}><b style={{ color: '#fff', fontSize: 16 }}>Sarthak's <span style={{ color: '#ff3b5c' }}>SHORT TOK</span></b> | Create • Share</p>
      </div>

      {panel !== 'none' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#111b21', borderRadius: '20px 20px 0 0', padding: 16, zIndex: 50, maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{panel === 'speed' ? '⏱️ Speed' : panel === 'beauty' ? '🪄 Beauty' : panel === 'filters' ? '✨ Filters' : panel === 'timer' ? '⏰ Timer' : panel === 'more' ? '••• More' : panel === 'post' ? '📝 পোস্ট করো - Sarthak' : panel === 'music' ? '🎵 Vigo Music - গান কাটো + লিপসিং' : panel === 'text' ? '✍️ Text' : panel === 'gallery' ? '🖼️ Gallery - ভিডিও কাটো + গান লাগাও' : panel === 'dance' ? '💃 Dance - ডান্স ভিডিও' : '😊 Effects'}</b><button onClick={() => setPanel('none')} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button></div>

          {panel === 'speed' && <div><div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{speeds.map(s => <button key={s} onClick={() => { setSpeed(s); alert(`Speed ${s} লাগানো হয়েছে!`) }} style={{ padding: '10px 18px', borderRadius: 20, background: speed === s ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontWeight: 'bold' }}>{s}</button>)}</div><p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>0.5x = স্লো মোশন, 2x = ফাস্ট মোশন</p></div>}
          {panel === 'beauty' && <div style={{ marginTop: 12 }}><input type="range" min="0" max="100" value={beauty} onChange={e => setBeauty(Number(e.target.value))} style={{ width: '100%' }} /><p style={{ textAlign: 'center' }}>Beauty: {beauty}% - সরাসরি মুখে দেখতে পাবে</p><div style={{ display: 'flex', gap: 8 }}><button onClick={() => setBeauty(0)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none' }}>0% - বন্ধ</button><button onClick={() => setBeauty(50)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none' }}>50%</button><button onClick={() => setBeauty(100)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#ff3b5c', color: '#fff', border: 'none' }}>100% - ফুল</button></div></div>}
          {panel === 'filters' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 14px', borderRadius: 20, background: filter === f ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none' }}>{f}</button>)}</div>}
          {panel === 'timer' && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{timers.map(t => <button key={t} onClick={() => { setTimer(t); if (t !== 'Off') alert(`${t} সেকেন্ড পর রেকর্ড শুরু হবে`) }} style={{ padding: '10px 18px', borderRadius: 20, background: timer === t ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontWeight: 'bold' }}>{t === 'Off' ? 'Off' : `${t}s`}</button>)}</div>}
          {panel === 'dance' && <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 13, color: '#aaa' }}>💃 ডান্স ভিডিও বানাও — নিচের গানটা বেছে, গান বাজতে বাজতে নাচো</p>
            {MUSIC_LIBRARY.filter(m => m.cat === '💃 ডান্স' || m.cat === '🔥 ট্রেন্ডিং').map(m => (
              <button key={m.id} onClick={() => { pickLibraryMusic(m); setPanel('none') }} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', marginTop: 6, textAlign: 'left' }}>{m.name} • {m.time} • {m.use}<br /><span style={{ fontSize: 12, color: '#ffb400' }}>▶️ এই গানে ডান্স করো →</span></button>
            ))}
            <button onClick={() => { setFilter('Beauty'); setBeauty(70); setSpeed('1x'); setPanel('none') }} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#ff3b5c', color: '#fff', border: 'none', marginTop: 8, fontWeight: 'bold' }}>💃 ডান্স মোড চালু করো (Beauty + Filter)</button>
          </div>}
          {panel === 'more' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12, textAlign: 'center' }}>
            <div onClick={() => setPanel('music')} style={{ background: '#202c33', padding: 12, borderRadius: 12 }}><b>🎵 Music</b><div style={{ fontSize: 11, color: '#aaa' }}>{music}</div></div>
            <div onClick={() => setPanel('text')} style={{ background: '#202c33', padding: 12, borderRadius: 12 }}><b>✍️ Text</b><div style={{ fontSize: 11, color: '#aaa' }}>{textOverlay || 'লেখা যোগ করো'}</div></div>
            <div onClick={() => { const s = prompt('Sticker: 😍 🔥 🪔 🌸 👑 ✨ ❤️'); if (s) setSticker(s); setPanel('none') }} style={{ background: '#202c33', padding: 12, borderRadius: 12 }}><b>🖼️ Sticker</b><div style={{ fontSize: 11, color: '#aaa' }}>{sticker || 'স্টিকার'}</div></div>
            <div onClick={() => { setMirror(!mirror) }} style={{ background: mirror ? '#ff3b5c' : '#202c33', padding: 12, borderRadius: 12 }}><b>🪞 Mirror</b><div style={{ fontSize: 11, color: '#aaa' }}>{mirror ? 'চালু' : 'বন্ধ'}</div></div>
            <div onClick={() => { setGrid(!grid) }} style={{ background: grid ? '#ff3b5c' : '#202c33', padding: 12, borderRadius: 12 }}><b>📐 Grid</b><div style={{ fontSize: 11, color: '#aaa' }}>{grid ? 'চালু' : 'বন্ধ'}</div></div>
            <div onClick={() => { setNight(!night) }} style={{ background: night ? '#ff3b5c' : '#202c33', padding: 12, borderRadius: 12 }}><b>🌙 Night</b><div style={{ fontSize: 11, color: '#aaa' }}>{night ? 'চালু' : 'বন্ধ'}</div></div>
          </div>}

          {panel === 'gallery' && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', width: '100%', padding: 12, borderRadius: 10, background: '#ff3b5c', color: '#fff', textAlign: 'center', fontWeight: 'bold', boxSizing: 'border-box' }}>
                📁 গ্যালারি থেকে ভিডিও বাছুন
                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => onPickGalleryVideo(e.target.files?.[0])} />
              </label>
              {galleryUrl && (
                <div style={{ marginTop: 12 }}>
                  <video src={galleryUrl} controls playsInline style={{ width: '100%', maxHeight: 220, borderRadius: 10, background: '#000' }} onLoadedMetadata={e => { const d = e.currentTarget.duration; setGalleryDuration(d); setTrimStart(0); setTrimEnd(Math.min(d, 60)) }} />
                  {galleryDuration > 0 && (
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      <div>✂️ ভিডিও কাটো — শুরু: {trimStart.toFixed(1)}s</div>
                      <input type="range" min={0} max={galleryDuration} step={0.1} value={trimStart} onChange={e => { const s = Number(e.target.value); setTrimStart(Math.min(s, Math.max(0, trimEnd - 0.5))) }} style={{ width: '100%' }} />
                      <div>শেষ: {trimEnd.toFixed(1)}s</div>
                      <input type="range" min={0} max={galleryDuration} step={0.1} value={trimEnd} onChange={e => { const t = Number(e.target.value); setTrimEnd(Math.max(t, trimStart + 0.5)) }} style={{ width: '100%' }} />
                      <p style={{ fontSize: 12, color: '#aaa' }}>কাটা অংশ: {Math.max(0, trimEnd - trimStart).toFixed(1)} সেকেন্ড{musicFileName ? ` • গান: ${musicFileName}` : music ? ` • গান: ${music}` : ''}</p>
                      <button onClick={() => setPanel('music')} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', marginBottom: 8 }}>🎵 এই কাটা ভিডিওতে গান লাগাও</button>
                      <button onClick={processGallery} disabled={processing} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#ff3b5c', color: '#fff', border: 'none', fontWeight: 'bold' }}>{processing ? 'তৈরি হচ্ছে... অপেক্ষা করুন' : '✂️ কেটে ভিডিও তৈরি করুন'}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {panel === 'music' && <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', width: '100%', padding: 12, borderRadius: 10, background: '#ff3b5c', color: '#fff', textAlign: 'center', fontWeight: 'bold', boxSizing: 'border-box' }}>
              📁 গ্যালারি থেকে নিজের গান বাছুন
              <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => onPickMusicFile(e.target.files?.[0])} />
            </label>
            {musicFileName && <p style={{ fontSize: 12, color: '#aaa' }}>বাছা গান: {musicFileName}</p>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>{CATS.map(c => <button key={c} onClick={() => setMusicCat(c)} style={{ padding: '6px 12px', borderRadius: 20, background: musicCat === c ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontSize: 12 }}>{c}</button>)}</div>
            {filteredMusic.map(m => <button key={m.id} onClick={() => pickLibraryMusic(m)} style={{ width: '100%', padding: 12, borderRadius: 10, background: music === '🎵 ' + m.name ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', marginTop: 6, textAlign: 'left' }}>{m.name} • {m.time} • {m.use}<br /><span style={{ fontSize: 11, color: '#aaa' }}>▶️ চাপ দিলে গান বাজবে + লিপসিং দেখতে পারবে</span></button>)}
            <div style={{ marginTop: 12, background: '#202c33', padding: 12, borderRadius: 10 }}>
              <b>✂️ গান কাটো — Vigo স্টাইল</b>
              <div style={{ fontSize: 13, marginTop: 8 }}>গান কোথা থেকে শুরু হবে: {musicStart}s</div>
              <input type="range" min={0} max={60} step={1} value={musicStart} onChange={e => setMusicStart(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ fontSize: 13 }}>কত সেকেন্ড বাজবে: {musicLen}s</div>
              <input type="range" min={5} max={60} step={5} value={musicLen} onChange={e => setMusicLen(Number(e.target.value))} style={{ width: '100%' }} />
              <p style={{ fontSize: 12, color: '#aaa' }}>যেমন: 10s থেকে 15s — শুধু ওই অংশটুকুই ভিডিওতে বাজবে। লিপসিং এর জন্য এটাই আসল।</p>
              <button onClick={() => { try { if (previewAudioRef.current && (musicUrl || musicFileUrl)) { previewAudioRef.current.src = musicUrl || musicFileUrl; previewAudioRef.current.currentTime = musicStart; previewAudioRef.current.play().catch(() => {}) } } catch {} }} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#ff3b5c', color: '#fff', border: 'none', fontWeight: 'bold' }}>▶️ কাটা গান শুনে দেখো</button>
            </div>
          </div>}

          {panel === 'text' && <div style={{ marginTop: 12 }}><input value={textOverlay} onChange={e => setTextOverlay(e.target.value)} placeholder="ভিডিওতে কি লেখা দেখাবে? যেমন শুভ অষ্টমী 🙏" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', boxSizing: 'border-box' }} /><button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 10, background: '#ff3b5c', color: '#fff', border: 'none', fontWeight: 'bold' }}>✅ লেখা লাগাও</button></div>}
          {panel === 'effects' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{effects.map(e => <button key={e} onClick={() => { setSelectedEffect(e); setPanel('none') }} style={{ padding: '10px 14px', borderRadius: 20, background: '#202c33', color: '#fff', border: 'none' }}>{e}</button>)}</div>}

          {panel === 'post' && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 13 }}>✅ ভিডিও রেডি! {recordTime} সেকেন্ড • ফিল্টার: {filter} • Speed: {speed} • Beauty: {beauty}% • Effect: {selectedEffect} • গান: {music}</p>
              {photoUrl && <img src={photoUrl} style={{ width: '100%', borderRadius: 10, marginBottom: 8 }} />}
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption লেখো... Sarthak's Short Tok 🙏" style={{ fontSize: 16, width: '100%', padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', boxSizing: 'border-box' }} />
              {isUploading && <div style={{ marginTop: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>আপলোড হচ্ছে...</span><span>{uploadProgress}%</span></div><div style={{ background: '#202c33', height: 8, borderRadius: 10, marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${uploadProgress}%`, background: '#ff3b5c', height: '100%' }} /></div></div>}
              <button onClick={fastUpload} disabled={isUploading} style={{ width: '100%', marginTop: 12, background: '#ff3b5c', color: '#fff', border: 'none', padding: 13, borderRadius: 20, fontWeight: 'bold' }}>{isUploading ? `আপলোড হচ্ছে... ${uploadProgress}%` : '🚀 ফাস্ট পোস্ট করো - সবাই দেখবে'}</button>
              <button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 8, background: '#202c33', color: '#fff', border: 'none', padding: 12, borderRadius: 20 }}>আবার রেকর্ড করো</button>
            </div>
          )}
          {panel !== 'post' && <button onClick={() => setPanel('none')} style={{ width: '100%', marginTop: 12, background: '#ff3b5c', color: '#fff', border: 'none', padding: 12, borderRadius: 20, fontWeight: 'bold' }}>✅ হয়ে গেছে</button>}
        </div>
      )}
    </div>
  )
}