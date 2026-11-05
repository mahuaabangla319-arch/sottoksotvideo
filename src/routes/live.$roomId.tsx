import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/live/$roomId')({
  component: SOTTOKLiveWithRequest,
})

function SOTTOKLiveWithRequest() {
  const hostVideoRef = useRef<HTMLVideoElement>(null)
  const [msg, setMsg] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [hostName, setHostName] = useState('Tumi')
  const [liveTitle, setLiveTitle] = useState('SOTTOK Live')
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const [guests, setGuests] = useState<any[]>([])
  const [comments, setComments] = useState([
    { user: 'System', text: '🔴 Live Start - Comment kore Video Request pathao' },
  ])
  const [likes, setLikes] = useState(0)
  const [showGift, setShowGift] = useState(false)

  // 1. VIDEO REQUEST - USER RA PATHABE, TUMI TULBE
  const [requests, setRequests] = useState<any[]>([])
  const [showRequests, setShowRequests] = useState(false)

  // HOST ER REAL CAMERA + VOICE
  useEffect(() => {
    const saved = localStorage.getItem('sottok_current_live')
    if (saved) {
      const data = JSON.parse(saved)
      setHostName(data.hostName || data.host || 'Tumi')
      setLiveTitle(data.title || 'SOTTOK Live')
    }
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' }, 
      audio: { echoCancellation: true, noiseSuppression: true } 
    })
    .then(s => { setStream(s); if (hostVideoRef.current) hostVideoRef.current.srcObject = s })
    .catch(() => alert('Camera + Mic Permission dao bhai'))

    // 2. REQUEST CHECK - 3 SEC POR POR DEKHO KEU REQUEST PATHALO KINA
    const checkReq = setInterval(() => {
      const reqs = JSON.parse(localStorage.getItem('sottok_live_requests') || '[]')
      if (reqs.length !== requests.length) setRequests(reqs)
    }, 3000)
    return () => clearInterval(checkReq)
  }, [])

  // HOST - REQUEST ACCEPT KORLE GUEST LIVE E UTHBE
  const acceptRequest = (req: any) => {
    if (guests.length >= 7) { alert('7 jon hoye geche!'); return }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(gs => {
        setGuests([...guests, { id: req.id, name: req.name, stream: gs }])
        setRequests(requests.filter(r => r.id !== req.id))
        localStorage.setItem('sottok_live_requests', JSON.stringify(requests.filter(r => r.id !== req.id)))
        setComments([...comments, { user: 'System', text: `🎉 ${req.name} ke Live e tola holo!` }])
        // GUEST KE JANANO - TOMAKE TOLA HOYECHE
        localStorage.setItem(`sottok_accepted_${req.id}`, 'accepted')
        setShowRequests(false)
      })
      .catch(() => alert('Guest Camera Permission dao'))
  }

  const rejectRequest = (id: number) => {
    const left = requests.filter(r => r.id !== id)
    setRequests(left)
    localStorage.setItem('sottok_live_requests', JSON.stringify(left))
  }

  const toggleMic = () => { if (!stream) return; stream.getAudioTracks().forEach(t => t.enabled = !micOn); setMicOn(!micOn) }
  const toggleCamera = () => { if (!stream) return; stream.getVideoTracks().forEach(t => t.enabled = !cameraOn); setCameraOn(!cameraOn) }

  const sendMsg = () => {
    if (!msg.trim()) return
    setComments([...comments, { user: 'YOU', text: msg }]); setMsg('')
  }

  // TEST ER JONNO - USER REQUEST SIMULATE - REAL E USER ER PHONE THEKE ASBE
  const simulateRequest = () => {
    const names = ['Priya', 'Rahul', 'Sneha', 'Arif', 'Pooja']
    const n = names[Math.floor(Math.random() * names.length)]
    const newReq = { id: Date.now(), name: n, time: 'ekhon', msg: 'Video te uthte chai 🙏' }
    const all = [...requests, newReq]
    setRequests(all)
    localStorage.setItem('sottok_live_requests', JSON.stringify(all))
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      
      {/* TOP BAR */}
      <div style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'linear-gradient(rgba(0,0,0,0.7), transparent)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ background: '#ff3b5c', padding: '4px 8px', borderRadius: 6, fontWeight: 'bold', fontSize: 12 }}>🔴 LIVE</span>
          <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20 }}>
            <b style={{ fontSize: 12, display: 'block' }}>{liveTitle}</b>
            <span style={{ fontSize: 10, color: '#ffb400' }}>Host: {hostName} • {guests.length + 1}/8 • ❤️ {likes}</span>
          </div>
        </div>
        {/* REQUEST BUTTON - LAL HOBE JOKHON REQUEST ASBE */}
        <button onClick={() => setShowRequests(true)} style={{ background: requests.length > 0 ? '#ff3b5c' : '#202c33', color: '#fff', border: requests.length > 0 ? '2px solid #fff' : 'none', padding: '8px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', position: 'relative' }}>
          📹 Request {requests.length > 0 ? `(${requests.length}) 🔴` : ''}
          {requests.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#fff', color: '#ff3b5c', width: 18, height: 18, borderRadius: '50%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{requests.length}</span>}
        </button>
      </div>

      {/* MAIN - HOST + GUEST GRID */}
      {guests.length === 0 ? (
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
          <video ref={hostVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          <div style={{ position: 'absolute', bottom: 170, left: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>👤 {hostName} (Host) • 🎙️ {micOn ? 'Mic On' : 'Mic Off'}</div>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100vh', padding: '60px 8px 170px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111', border: '2px solid #ff3b5c' }}>
            <video ref={hostVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <span style={{ position: 'absolute', bottom: 6, left: 6, background: '#ff3b5c', padding: '3px 7px', borderRadius: 10, fontSize: 10 }}>👑 {hostName}</span>
          </div>
          {guests.map(g => <GuestVideo key={g.id} guest={g} onRemove={() => setGuests(guests.filter(x => x.id !== g.id))} />)}
        </div>
      )}

      {/* REQUEST POPUP - HOST ER KACHE */}
      {showRequests && (
        <div style={{ position: 'absolute', top: 60, left: 12, right: 12, background: '#111b21', borderRadius: 14, padding: 14, zIndex: 40, maxHeight: 320, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>📹 Video Request ({requests.length})</b><button onClick={() => setShowRequests(false)} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button></div>
          {requests.length === 0 ? <p style={{ fontSize: 13, color: '#8696a0' }}>Ekhon kono request nei. User ra comment kore request pathabe.</p> : requests.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#202c33', padding: 10, borderRadius: 12, marginTop: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
              <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{r.name}</b><p style={{ margin: 0, fontSize: 11, color: '#8696a0' }}>{r.msg}</p></div>
              <button onClick={() => acceptRequest(r)} style={{ background: '#00a884', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 20, fontWeight: 'bold', fontSize: 12 }}>✅ Tolo</button>
              <button onClick={() => rejectRequest(r.id)} style={{ background: '#ff3b5c', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 20, fontSize: 12 }}>❌</button>
            </div>
          ))}
          <button onClick={simulateRequest} style={{ width: '100%', marginTop: 10, background: '#ffb400', color: '#000', border: 'none', padding: 10, borderRadius: 10, fontSize: 12 }}>🧪 Test: Ekta Request Pathao</button>
        </div>
      )}

      {/* COMMENTS */}
      <div style={{ position: 'absolute', bottom: 90, left: 12, right: 90, zIndex: 5 }}>
        {comments.slice(-4).map((c, i) => <div key={i} style={{ marginBottom: 5, fontSize: 13 }}><b style={{ color: '#ffb400' }}>{c.user}: </b><span>{c.text}</span></div>)}
      </div>

      {/* BOTTOM */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '10px 12px 16px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, justifyContent: 'center' }}>
          <button onClick={toggleMic} style={{ padding: '8px 12px', borderRadius: 20, background: micOn ? '#00a884' : '#ff3b5c', color: '#fff', border: 'none', fontSize: 12 }}>{micOn ? '🎙️ Mic On' : '🔇 Mic Off'}</button>
          <button onClick={toggleCamera} style={{ padding: '8px 12px', borderRadius: 20, background: cameraOn ? '#00a884' : '#ff3b5c', color: '#fff', border: 'none', fontSize: 12 }}>{cameraOn ? '📷 Cam On' : '📷 Cam Off'}</button>
          <button onClick={() => setShowRequests(true)} style={{ padding: '8px 12px', borderRadius: 20, background: '#ffb400', color: '#000', border: 'none', fontSize: 12, fontWeight: 'bold' }}>📹 Request ({requests.length})</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Comment likho..." style={{ flex: 1, padding: '11px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }} />
          <button onClick={sendMsg} style={{ background: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%' }}>↗️</button>
          <button onClick={() => setShowGift(true)} style={{ background: '#ff3b5c', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 18 }}>🎁</button>
          <button onClick={() => setLikes(likes + 1)} style={{ background: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 18 }}>❤️</button>
        </div>
      </div>

      {showGift && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#111b21', borderRadius: '20px 20px 0 0', padding: 16, zIndex: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>🎁 Gift</b><button onClick={() => setShowGift(false)} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
            {[{ e: '🌹', n: 'Rose', c: 10 }, { e: '👑', n: 'Crown', c: 100 }, { e: '💎', n: 'Diamond', c: 500 }, { e: '🚀', n: 'Rocket', c: 200 }].map(g => (
              <button key={g.n} onClick={() => { setLikes(likes + g.c); setShowGift(false) }} style={{ background: '#202c33', border: 'none', color: '#fff', padding: 10, borderRadius: 12 }}><div style={{ fontSize: 28 }}>{g.e}</div><div style={{ fontSize: 11 }}>{g.n}</div></button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GuestVideo({ guest, onRemove }: any) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => { if (ref.current && guest.stream) ref.current.srcObject = guest.stream }, [guest.stream])
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111', border: '1px solid #00a884' }}>
      <video ref={ref} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      <span style={{ position: 'absolute', bottom: 6, left: 6, background: '#00a884', padding: '3px 7px', borderRadius: 10, fontSize: 10 }}>{guest.name}</span>
      <button onClick={onRemove} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 10 }}>✕</button>
    </div>
  )
}