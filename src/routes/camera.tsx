import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'
import { useSearchParams } from '@tanstack/react-router'

export const Route = createFileRoute('/camera')({
  component: SafeSotTokCamera,
})

function SafeSotTokCamera() {
  const videoRef = useRef<HTMLVideoElement>(null) as any
  const [isRec, setIsRec] = useState(false)
  const [sec, setSec] = useState(0)
  const [facing, setFacing] = useState('user')
  const [myId, setMyId] = useState('...')
  const [hasCamera, setHasCamera] = useState(true)
  const [beauty, setBeauty] = useState(50)
  const [showBeauty, setShowBeauty] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('none')
  const [flash, setFlash] = useState(false)

  const filters = [
    { name: 'Original', value: 'none' },
    { name: 'Soft', value: 'brightness(1.1) contrast(0.9)' },
    { name: 'Pink', value: 'sepia(0.2) hue-rotate(-10deg) saturate(1.2)' },
    { name: 'Milky', value: 'brightness(1.2) contrast(0.8)' },
    { name: 'Sunshine', value: 'brightness(1.15) saturate(1.3)' },
    { name: 'Clear', value: 'contrast(1.1) brightness(1.05)' },
    { name: 'Vintage', value: 'sepia(0.4)' },
    { name: 'B&W', value: 'grayscale(1)' },
  ]

  useEffect(() => {
    try {
      let id = localStorage.getItem('sot_tok_id')
      if (!id) {
        id = Math.floor(1000000 + Math.random() * 9000000).toString()
        localStorage.setItem('sot_tok_id', id)
      }
      setMyId(id)
    } catch {}

    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: true
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setHasCamera(true)
      } catch (e) {
        setHasCamera(false)
      }
    }
    startCam()
  }, [facing])

  useEffect(() => {
    let interval: any
    if (isRec) {
      interval = setInterval(() => setSec(s => s + 1), 1000)
    } else {
      setSec(0)
    }
    return () => clearInterval(interval)
  }, [isRec])

  const videoStyle: any = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
    background: '#000',
    zIndex: 1,
    filter: `${filter!== 'none'? filter : ''} brightness(${0.8 + beauty/250})`,
    transform: facing === 'user'? 'scaleX(-1)' : 'none',
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <video ref={videoRef} autoPlay muted playsInline style={videoStyle} />

      {/* TOP BAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px', zIndex: 20 }}>
        <button onClick={() => window.history.back()} style={{ color: 'white', fontSize: 28, background: 'none', border: 'none' }}>✕</button>
        <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 15, fontSize: 13 }}>
          <span style={{ color: 'red' }}>●</span> 00:{sec.toString().padStart(2,'0')} / 0:15
        </div>
        <button style={{ color: 'white', fontSize: 22, background: 'none', border: 'none' }}>⚙️</button>
      </div>

      {/* RIGHT TOOLBAR - PURE VIGO ORIGINAL - NO LIVE BUTTON */}
      <div style={{ position: 'fixed', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 22, zIndex: 20, alignItems: 'center' }}>
        <div onClick={() => {setShowBeauty(!showBeauty); setShowFilter(false)}} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, background: showBeauty? '#ff0050' : 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid rgba(255,255,255,0.3)' }}>✨</div>
          <span style={{ fontSize: 11, color: 'white', marginTop: 4 }}>Beauty</span>
        </div>
        <div onClick={() => {setShowFilter(!showFilter); setShowBeauty(false)}} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, background: showFilter? '#ff0050' : 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(255,255,255,0.3)' }}>🎨</div>
          <span style={{ fontSize: 11, color: 'white' }}>Filter</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '1px solid rgba(255,255,255,0.3)' }}>1x</div>
          <span style={{ fontSize: 11, color: 'white' }}>Speed</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(255,255,255,0.3)' }}>⏱️</div>
          <span style={{ fontSize: 11, color: 'white' }}>Timer</span>
        </div>
        <div onClick={() => window.location.href = '/music'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(255,255,255,0.3)' }}>🎵</div>
          <span style={{ fontSize: 11, color: 'white' }}>Music</span>
        </div>
        <div onClick={() => setFlash(!flash)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, background: flash? '#ffcc00' : 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(255,255,255,0.3)' }}>⚡</div>
          <span style={{ fontSize: 11, color: 'white' }}>Flash</span>
        </div>
      </div>

      {showBeauty && (
        <div style={{ position: 'fixed', bottom: 130, left: 20, right: 20, background: 'rgba(0,0,0,0.75)', borderRadius: 20, padding: 15, zIndex: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: 13, marginBottom: 8 }}><span>Smooth</span><span>{beauty}</span><span>Shape</span></div>
          <input type="range" min="0" max="100" value={beauty} onChange={(e) => setBeauty(Number(e.target.value))} style={{ width: '100%', accentColor: '#ff0050' }} />
        </div>
      )}

      {showFilter && (
        <div style={{ position: 'fixed', bottom: 130, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '12px 10px', zIndex: 20, display: 'flex', gap: 12, overflowX: 'auto' }}>
          {filters.map((f) => (
            <div key={f.name} onClick={() => setFilter(f.value)} style={{ minWidth: 60, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: filter === f.value? '#ff0050' : 'rgba(255,255,255,0.2)', border: filter === f.value? '2px solid #ff0050' : '1px solid rgba(255,255,255,0.3)', filter: f.value as any, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
              <span style={{ fontSize: 11, color: filter === f.value? '#ff0050' : 'white' }}>{f.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM BAR */}
      <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, border: '2px solid white', background: '#222', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #ff0050, #ffcc00)' }}></div>
        </div>
        <button onClick={() => setIsRec(!isRec)} style={{ width: 82, height: 82, background: isRec? 'white' : '#ff0050', borderRadius: '50%', border: '5px solid white', boxShadow: '0 0 20px rgba(255,0,80,0.6)', transform: isRec? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}>
          {isRec && <div style={{ width: 28, height: 28, background: '#ff0050', borderRadius: 4, margin: 'auto' }}></div>}
        </button>
        <button onClick={() => setFacing(facing === 'user'? 'environment' : 'user')} style={{ width: 52, height: 52, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', color: 'white', fontSize: 24, border: '1px solid rgba(255,255,255,0.3)' }}>🔄</button>
      </div>
    </div>
  )
}