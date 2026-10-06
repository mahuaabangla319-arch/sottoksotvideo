import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'

export const Route = createFileRoute('/camera')({
  component: SotTokVigoOriginalCamera,
})

function SotTokVigoOriginalCamera() {
  const videoRef = useRef(null) as any
  const [rec, setRec] = useState(false)
  const [time, setTime] = useState(0)
  const [beautyMode, setBeautyMode] = useState(true)
  const [filterMode, setFilterMode] = useState(false)
  const [beauty, setBeauty] = useState(70)
  const [white, setWhite] = useState(50)
  const [bigEye, setBigEye] = useState(30)
  const [filter, setFilter] = useState(4)
  const [speed, setSpeed] = useState('1x')
  const [timer, setTimer] = useState('off')
  const [mode, setMode] = useState('60s')
  const [facing, setFacing] = useState('user')
  const [flash, setFlash] = useState(false)

  const filters = [
    { n: 'Normal', f: '' },
    { n: 'Sweet', f: 'sepia(0.1) saturate(1.4) brightness(1.05)' },
    { n: 'Fresh', f: 'brightness(1.15) saturate(1.3)' },
    { n: 'Rosy', f: 'hue-rotate(-10deg) saturate(1.4) brightness(1.08)' },
    { n: 'SOT TOK', f: 'saturate(1.6) contrast(1.1) brightness(1.1)' },
    { n: 'Vintage', f: 'sepia(0.3) contrast(1.1)' },
    { n: 'B&W', f: 'grayscale(1)' },
    { n: 'Cold', f: 'hue-rotate(15deg) saturate(1.2)' },
  ]

  useEffect(() => {
    let stream: any = null
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: true,
        })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        console.log(err)
      }
    }
    start()
    return () => {
      if (stream) stream.getTracks().forEach((t: any) => t.stop())
    }
  }, [facing])

  useEffect(() => {
    let id: any
    if (rec) id = setInterval(() => setTime((t) => t + 1), 1000)
    else setTime(0)
    return () => clearInterval(id)
  }, [rec])

  const curFilter = filters[filter]?.f || ''

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
        style={{
          filter: `${curFilter} brightness(${1 + beauty / 400})`,
          transform: facing === 'user'? 'scaleX(-1)' : 'none',
        }}
      />

      {/* TOP BAR - ONLY SOT TOK NAME - NO VIGO */}
      <div className="absolute top-0 left-0 right-0 h-[70px] bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-4 z-20">
        <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center">✕</button>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-1 rounded-full shadow-[0_0_15px_orange]">
          <span className="text-[11px] font-black text-white tracking-wider">🔥 SOT TOK OFFICIAL 🔥</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFlash(!flash)} className={`w-9 h-9 rounded-full flex items-center justify-center ${flash? 'bg-yellow-500' : 'bg-black/40'} text-white`}>{flash? '⚡' : '✕'}</button>
          <button onClick={() => setFacing(facing === 'user'? 'environment' : 'user')} className="w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center">🔄</button>
        </div>
      </div>

      {/* LEFT TOOLS - VIGO STYLE */}
      <div className="absolute left-3 top-20 flex flex-col gap-4 z-20">
        <button onClick={() => { setBeautyMode(true); setFilterMode(false) }} className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border ${beautyMode? 'bg-[#ff0050] border-[#ff0050]' : 'bg-black/40 border-white/20'}`}>
          <span className="text-[10px]">✨</span><span className="text-[7px] text-white">Beauty</span>
        </button>
        <button onClick={() => { setFilterMode(true); setBeautyMode(false) }} className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border ${filterMode? 'bg-[#ff0050] border-[#ff0050]' : 'bg-black/40 border-white/20'}`}>
          <span className="text-[10px]">🎨</span><span className="text-[7px] text-white">Filter</span>
        </button>
        <button className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex flex-col items-center justify-center">
          <span className="text-[10px]">😍</span><span className="text-[7px] text-white">Sticker</span>
        </button>
        <button className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex flex-col items-center justify-center">
          <span className="text-[10px]">💄</span><span className="text-[7px] text-white">Makeup</span>
        </button>
      </div>

      {/* RIGHT TOOLS - VIGO STYLE */}
      <div className="absolute right-3 top-20 flex flex-col gap-4 z-20">
        <button className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex flex-col items-center justify-center">
          <span className="text-sm">♪</span><span className="text-[7px] text-white