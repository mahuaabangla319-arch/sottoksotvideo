import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/live/create')({
  component: SOTTOKGoLive,
})

function SOTTOKGoLive() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [isLive, setIsLive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // CAMERA ON - SOBAI LIVE KORTE PARBE
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {
        console.log('Camera permission dao bhai')
      })
  }, [])

  const startLive = () => {
    if (!title.trim()) {
      alert('Live er Title dao bhai! Ex: Asansol Adda')
      return
    }
    // SOBAI LIVE - KONO BLOCK NEI - OFFICE GROUP CHECK DELETE KORA
    setIsLive(true)
    alert(`Live Start hoye geche! 🎉 Title: ${title}`)
    navigate({ to: '/live/1' })
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate({ to: '/live' })} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20 }}>←</button>
        <b>🎬 SOTTOK Go Live</b>
        <span style={{ fontSize: 11, background: '#ff3b5c', padding: '4px 8px', borderRadius: 10 }}>🔴 LIVE</span>
      </div>

      {/* CAMERA PREVIEW */}
      <div style={{ flex: 1, background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        {!isLive && <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>📷 Camera Ready - Tumi Dekha Jaccho ✅</div>}
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>👁️ 0 Watching • Sobai Join Korte Parbe</div>
      </div>

      {/* TITLE + START */}
      <div style={{ padding: 14, background: '#111b21' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Live Title dao - ex: Asansol Adda 🔥" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none' }} />
        <p style={{ fontSize: 12, color: '#00ff88', margin: '8px 0' }}>✅ Sobai Live Korte Parbe - Kono Office Group Block Nei</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ flex: 1, padding: 12, borderRadius: 20, background: '#202c33', color: '#fff', border: 'none' }}>💬 Chat</button>
          <button style={{ flex: 1, padding: 12, borderRadius: 20, background: '#202c33', color: '#fff', border: 'none' }}>🎙️ Mic</button>
          <button onClick={startLive} style={{ flex: 2, padding: 12, borderRadius: 20, background: '#ff3b5c', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 15 }}>🔴 Publish - Live Start</button>
        </div>
      </div>
    </div>
  )
}