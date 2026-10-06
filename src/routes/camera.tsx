import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'

export const Route = createFileRoute('/camera')({
  component: SotTokVigoOriginalCamera,
})

function SotTokVigoOriginalCamera() {
  const videoRef = useRef(null) as any
  const [rec, setRec] = useState(false)
  const [time, setTime] = useState(0)
  const [beauty, setBeauty] = useState(70)
  const [filter, setFilter] = useState(4)
  const [facing, setFacing] = useState('user')
  const [mode, setMode] = useState('60s')

  const filters = [
    { n: 'Normal', f: '' },
    { n: 'Sweet', f: 'sepia(0.1) saturate(1.4)' },
    { n: 'Fresh', f: 'brightness(1.15)' },
    { n: 'Rosy', f: 'hue-rotate(-10deg) saturate(1.4)' },
    { n: 'SOT TOK', f: 'saturate(1.6) contrast(1.1)' },
    { n: 'Vintage', f: 'sepia(0.3)' },
    { n: 'B&W', f: 'grayscale(1)' },
    { n: 'Cold', f: 'hue-rotate(15deg)' },
  ]

  useEffect(() => {
    let stream: any = null
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: true })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (e) { console.log(e) }
    }
    start()
    return () => { if (stream) stream.getTracks().forEach((t: any) => t.stop()) }
  }, [facing])

  useEffect(() => {
    let id: any
    if (rec) id = setInterval(() => setTime(t => t + 1), 1000)
    else setTime(0)
    return () => clearInterval(id)
  }, [rec])

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" style={{ filter: filters[filter].f, transform: facing==='user'?'scaleX(-1)':'none' }} />

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20">
        <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-black/50 text-white">✕</button>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-1 rounded-full"><span className="text-[11px] font-black text-white">🔥 SOT TOK OFFICIAL 🔥</span></div>
        <button onClick={() => setFacing(facing==='user'?'environment':'user')} className="w-9 h-9 rounded-full bg-black/50 text-white">🔄</button>
      </div>

      <div className="absolute bottom-[130px] left-4 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 rounded-full z-20">
        <span className="text-white font-black text-[11px]">🔥 SOT TOK OFFICIAL • ID:96216703 🔥</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent z-20">
        <div className="flex justify-center gap-4 mb-3">
          {['15s','60s','3m','10m'].map(m => <button key={m} onClick={() => setMode(m)} className={`text-xs ${mode===m?'text-white border-b-2 border-pink-500':'text-white/50'}`}>{m}</button>)}
        </div>
        <div className="flex items-center justify-around">
          <button className="w-12 h-12 rounded-xl bg-white/20">🖼️</button>
          <button onClick={() => setRec(!rec)} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"><div className={`${rec?'w-6 h-6 bg-red-500 rounded-sm':'w-16 h-16 bg-red-500 rounded-full'}`}></div></button>
          <button className="w-12 h-12 rounded-xl bg-white/20">✨</button>
        </div>
      </div>
    </div>
  )
}