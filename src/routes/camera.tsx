import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from "react"

export const Route = createFileRoute('/camera')({
  component: SotTokCamera,
})

function SotTokCamera() {
  const videoRef = useRef<any>(null)
  const [rec, setRec] = useState(false)

  useEffect(() => {
    let stream: any = null
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (e) {
        console.log(e)
      }
    }
    start()
    return () => {
      if (stream) stream.getTracks().forEach((t: any) => t.stop())
    }
  }, [])

  return (
    <div className="min-h-screen bg-black relative">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-screen object-cover" />

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">✕</button>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-white">🔥 SOT TOK OFFICIAL</span>
        </div>
        <div className="w-8 h-8" />
      </div>

      <div className="absolute bottom-32 left-4 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
        <span className="text-xs font-black text-white">🔥 SOT TOK OFFICIAL ID:96216703</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-center items-center gap-10">
          <button className="w-12 h-12 rounded-xl bg-white/20 text-white">🖼️</button>
          <button onClick={() => setRec(!rec)} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
            <div className={rec ? "w-6 h-6 bg-white rounded-sm" : "w-16 h-16 bg-red-500 rounded-full"} />
          </button>
          <button className="w-12 h-12 rounded-xl bg-white/20 text-white">✨</button>
        </div>
        <p className="text-center text-white text-xs mt-3">{rec ? "● REC SOT TOK" : "SOT TOK ORIGINAL - NO VIGO NAME"}</p>
      </div>
    </div>
  )
}