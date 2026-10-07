import { useEffect, useRef, useState } from "react"

export default function VigoCamera(){
  const videoRef = useRef<HTMLVideoElement>(null)
  const [beauty, setBeauty] = useState(70)
  const [filter, setFilter] = useState("vigo")
  const [facing, setFacing] = useState<"user"|"environment">("user")
  const [rec, setRec] = useState(false)
  const [time, setTime] = useState(0)

  const startCamera = async (mode: any) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode, width: 720, height: 1280 },
      audio: true
    })
    if(videoRef.current) videoRef.current.srcObject = stream
  }

  useEffect(()=>{ startCamera(facing) },[facing])
  useEffect(()=>{
    let t:any
    if(rec){ t = setInterval(()=> setTime(s=>s+1), 1000) }
    else setTime(0)
    return ()=> clearInterval(t)
  },[rec])

  const filters:any = {
    vigo: "contrast(1.1) brightness(1.1) saturate(1.2)",
    natural: "contrast(1.05) brightness(1.05)",
    rosy: "sepia(0.2) hue-rotate(-10deg) saturate(1.4)",
    white: "brightness(1.25) contrast(1.1)",
    film: "contrast(1.2) sepia(0.3)"
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden flex flex-col">
      {/* CAMERA VIEW */}
      <video
        ref={videoRef} autoPlay muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: `${filters[filter]} brightness(${90+beauty/5}%)`, transform: facing==="user"? "scaleX(-1)" : "" }}
      />

      {/* TOP BAR - VIGO STYLE */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <button onClick={()=> history.back()} className="w-9 h-9 bg-black/50 rounded-full text-white">✕</button>
        <div className="flex gap-2">
          <span className="bg-black/60 px-3 py-1 rounded-full text-white text-xs">⚙️ Beauty</span>
          <span className="bg-red-600 px-3 py-1 rounded-full text-white text-xs">● {String(Math.floor(time/60)).padStart(2,'0')}:{String(time%60).padStart(2,'0')}</span>
        </div>
        <button onClick={()=> setFacing(facing==="user"?"environment":"user")} className="w-9 h-9 bg-black/50 rounded-full text-white">⇄</button>
      </div>

      {/* RIGHT SIDE TOOLS - VIGO */}
      <div className="absolute right-3 top-20 z-10 flex flex-col gap-4">
        <button className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">FLIP</button>
        <button className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">⚡</button>
        <button className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">⏱️</button>
      </div>

      {/* BEAUTY SLIDER - যেমন ছবিতে দিয়েছিলে */}
      <div className="absolute bottom-36 left-3 right-3 z-10 bg-black/70 backdrop-blur-xl border border-green-500/50 p-4 rounded-[22px]">
        <div className="flex justify-between text-white text-sm font-bold mb-2">
          <span>Beauty Filters</span>
          <span className="text-green-400">{beauty > 0? "ON" : "OFF"} {beauty}</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-xs w-16">Smooth</span>
            <input type="range" min="0" max="100" value={beauty} onChange={e=>setBeauty(Number(e.target.value))} className="flex-1 accent-green-400 h-1" />
            <span className="text-green-400 text-xs w-6">{beauty}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {Object.keys(filters).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border ${filter===f? "bg-green-500 text-black border-green-500 font-bold" : "bg-zinc-800 text-white border-zinc-700"}`}>{f.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM RECORD BAR - VIGO STYLE */}
      <div className="absolute bottom-0 w-full z-10 bg-gradient-to-t from-black to-transparent p-5">
        <div className="flex justify-between items-center mb-4 text-white text-xs">
          <span>15s</span><span className="bg-white text-black px-3 py-1 rounded-full font-bold">60s</span><span>3m</span>
        </div>
        <div className="flex justify-between items-center">
          <button className="w-12 h-12 bg-white/20 rounded-xl">🖼️</button>
          <button onClick={()=>setRec(!rec)} className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center transition-all ${rec? "border-red-500 bg-red-500" : "border-green-400 bg-white/20"}`}>
            <div className={`${rec? "w-7 h-7 rounded-sm bg-white" : "w-16 h-16 rounded-full bg-white"} transition-all`}></div>
          </button>
          <button className="w-12 h-12 bg-white/20 rounded-xl">✨</button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/camera' as any)({
  component: VigoCamera,
})