import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

function VigoCameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [beauty, setBeauty] = useState(70)
  const [time, setTime] = useState(0)
  const [rec, setRec] = useState(false)
  const [filter, setFilter] = useState('vigo')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 720, height: 1280 }, audio: true })
  .then(s => { if(videoRef.current) videoRef.current.srcObject = s })
  .catch(()=>{})
  }, [])

  useEffect(() => {
    let t:any
    if(rec) t = setInterval(()=> setTime(v=>v+1), 1000)
    else setTime(0)
    return ()=> clearInterval(t)
  }, [rec])

  const startRecording = () => {
    if(!videoRef.current?.srcObject) return
    const stream = videoRef.current.srcObject as MediaStream
    chunksRef.current = []
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm' })
    mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data) }
    mr.onstop = handleAutoPublicUpload
    mr.start()
    mediaRecorderRef.current = mr
    setRec(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRec(false)
    setUploading(true)
  }

  // AUTO PUBLIC LOGIC - রেকর্ড হলেই অটো For You তে যাবে
  const handleAutoPublicUpload = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Video = reader.result as string

      const newPost = {
        id: Date.now(),
        user: '@sottokofficial',
        name: 'Ganesh Thaku',
        video: base64Video,
        likes: 0,
        caption: 'New Vigo Video 🔥',
        isPublic: true, // অটো পাবলিক
        createdAt: new Date().toISOString()
      }

      // For You ফিডে অটো ঢুকিয়ে দিচ্ছে
      const oldFeed = JSON.parse(localStorage.getItem('OT_PUBLIC_FEED') || '[]')
      oldFeed.unshift(newPost)
      localStorage.setItem('OT_PUBLIC_FEED', JSON.stringify(oldFeed))

      // Main feed এর জন্যেও
      const mainFeed = JSON.parse(localStorage.getItem('videos') || '[]')
      mainFeed.unshift(newPost)
      localStorage.setItem('videos', JSON.stringify(mainFeed))

      setUploading(false)
      alert('✅ অটো পাবলিক হয়ে গেছে! For You তে চলে গেছে')
      window.location.href = '/'
    }
    reader.readAsDataURL(blob)
  }

  const filters:any = {
    vigo: 'contrast(1.1) brightness(1.1) saturate(1.2)',
    natural: 'contrast(1.05) brightness(1.05)',
    rosy: 'sepia(0.2) hue-rotate(-10deg) saturate(1.4)',
    white: 'brightness(1.25) contrast(1.1)',
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: `${filters[filter]} brightness(${90+beauty/4}%)`, transform: 'scaleX(-1)' }} />

      <div className="relative z-10 flex justify-between items-center p-4">
        <button onClick={()=>history.back()} className="w-9 h-9 bg-black/60 rounded-full text-white flex items-center justify-center">✕</button>
        <div className="flex gap-2">
          <span className="bg-black/60 px-3 py-1 rounded-full text-white text-xs border border-green-500/50">AUTO PUBLIC</span>
          <span className={`px-3 py-1 rounded-full text-white text-xs ${rec? 'bg-red-600 animate-pulse' : 'bg-black/60'}`}>● 00:{String(time).padStart(2,'0')}</span>
        </div>
        <button className="w-9 h-9 bg-black/60 rounded-full text-white">⇄</button>
      </div>

      {uploading && (
        <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-bold">অটো আপলোড হচ্ছে...</p>
          <p className="text-xs text-zinc-400">For You তে পাবলিক হচ্ছে</p>
        </div>
      )}

      <div className="absolute bottom-28 left-3 right-3 z-10 bg-black/70 backdrop-blur-xl border border-green-500/50 p-4 rounded-[22px]">
        <div className="flex justify-between text-white text-sm font-bold mb-2">
          <span>Beauty Filters</span>
          <span className="text-green-400">ON {beauty}</span>
        </div>
        <input type="range" min="0" max="100" value={beauty} onChange={e=>setBeauty(Number(e.target.value))} className="w-full accent-green-400" />
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {Object.keys(filters).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs border whitespace-nowrap ${filter===f? 'bg-green-500 text-black border-green-500 font-bold' : 'bg-zinc-800 text-white border-zinc-700'}`}>{f.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 w-full z-10 bg-gradient-to-t from-black to-transparent p-5">
        <div className="flex justify-center gap-6 mb-4 text-white text-xs">
          <span>15s</span><span className="bg-white text-black px-3 py-1 rounded-full font-bold">60s</span><span>3m</span>
        </div>
        <div className="flex justify-between items-center">
          <button className="w-12 h-12 bg-white/20 rounded-xl">🖼️</button>
          <button onClick={()=> rec? stopRecording() : startRecording()} className={`w-20 h-20 rounded-full border-[5px] flex items-center justify-center transition-all ${rec? 'border-red-500 bg-red-500/30' : 'border-green-400 bg-white/10'}`}>
            <div className={`bg-white transition-all ${rec? 'w-7 h-7 rounded-[4px]' : 'w-16 h-16 rounded-full'}`}></div>
          </button>
          <button className="w-12 h-12 bg-white/20 rounded-xl">✨</button>
        </div>
        <p className="text-center text-white/60 text-[10px] mt-2">{rec? 'ট্যাপ করলে অটো পাবলিক হবে' : 'হোল্ড নয়, ট্যাপ করে রেকর্ড'}</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/create' as any)({
  component: VigoCameraPage,
})