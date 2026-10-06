import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'

export const Route = createFileRoute('/camera')({
  component: SafeSotTokCamera,
})

function SafeSotTokCamera() {
  const videoRef = useRef(null) as any
  const [isRec, setIsRec] = useState(false)
  const [sec, setSec] = useState(0)
  const [facing, setFacing] = useState('user')
  const [myId, setMyId] = useState('...')
  const [hasCamera, setHasCamera] = useState(true)

  useEffect(() => {
    try {
      let id = localStorage.getItem('sot_tok_id')
      if (!id) {
        id = Math.floor(10000000 + Math.random() * 90000000).toString()
        localStorage.setItem('sot_tok_id', id)
      }
      setMyId(id)
    } catch {}
  }, [])

  useEffect(() => {
    // White Screen Fix - window check
    if (typeof window === 'undefined') return
    if (!navigator.mediaDevices) {
      setHasCamera(false)
      return
    }

    let stream: any = null
    async function open() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: false
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setHasCamera(true)
      } catch (e) {
        console.log('no camera', e)
        setHasCamera(false)
      }
    }
    open()
    return () => {
      try {
        if (stream) stream.getTracks().forEach((t: any) => t.stop())
      } catch {}
    }
  }, [facing])

  useEffect(() => {
    let t: any
    if (isRec) t = setInterval(() => setSec(s => s + 1), 1000)
    else setSec(0)
    return () => clearInterval(t)
  }, [isRec])

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden flex items-center justify-center">

      {hasCamera? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover absolute top-0 left-0"
          style={{ transform: facing==='user'?'scaleX(-1)':'none' }}
        />
      ) : (
        <div className="text-center">
          <p className="text-white text-5xl mb-4">📷</p>
          <p className="text-white">Camera Permission দাও দাদা</p>
          <p className="text-white/50 text-xs mt-2">SOT TOK • ID:{myId}</p>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between bg-gradient-to-b from-black/70 to-transparent z-10">
        <button onClick={() => { try { window.history.back() } catch {} }} className="w-10 h-10 bg-black/50 rounded-full text-white">✕</button>
        <div className="bg-red-500 px-6 py-1 rounded-full"><p className="text-white font-black text-sm">SOT TOK</p></div>
        <button onClick={() => setFacing(facing==='user'?'environment':'user')} className="w-10 h-10 bg-black/50 rounded-full text-white">🔄</button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black to-transparent z-10">
        <div className="flex justify-center">
          <button onClick={() => setIsRec(!isRec)} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
            <div className={isRec?'w-7 h-7 bg-red-500':'w-16 h-16 bg-red-500 rounded-full'}></div>
          </button>
        </div>
        <p className="text-center text-white text-xs mt-3">SOT TOK • ID:{myId} {isRec?`• REC ${sec}s`:''}</p>
      </div>
    </div>
  )
}