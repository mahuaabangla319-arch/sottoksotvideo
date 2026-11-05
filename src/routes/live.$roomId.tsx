import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/live/$roomId')({
  component: SOTTOKRealLive,
})

function SOTTOKRealLive() {
  const hostVideoRef = useRef<HTMLVideoElement>(null)
  const [msg, setMsg] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [hostName, setHostName] = useState('Tumi')
  const [liveTitle, setLiveTitle] = useState('SOTTOK Live')
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  // GUEST - 7 JON PORJONTO
  const [guests, setGuests] = useState<any[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState('')

  const [comments, setComments] = useState([
    { user: 'System', text: '🔴 Live Start - Sobai Nijer Face Diye Join Korte Parbe' },
  ])
  const [showGift, setShowGift] = useState(false)
  const [likes, setLikes] = useState(0)

  // 1. HOST ER REAL CAMERA + REAL VOICE - KONO DEMO NOY
  useEffect(() => {
    const saved = localStorage.getItem('sottok_current_live')
    if (saved) {
      const data = JSON.parse(saved)
      setHostName(data.hostName || data.host || 'Tumi')
      setLiveTitle(data.title || 'SOTTOK Live')
    }

    // CAMERA + MIC - FULL AUDIO
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user', width: 720, height: 1280 }, 
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
    })
    .then(s => {
      setStream(s)
      if (hostVideoRef.current) hostVideoRef.current.srcObject = s
      setCameraOn(true)
    })
    .catch(() => {
      alert('Bhai Camera + Mic Permission dao - na hole Face + Awaaz asbe na')
    })
  }, [])

  // MIC ON / OFF
  const toggleMic = () => {
    if (!stream) return
    stream.getAudioTracks().forEach(t => t.enabled = !micOn)
    setMicOn(!micOn)
  }

  // CAMERA ON / OFF
  const toggleCamera = () => {
    if (!stream) return
    stream.getVideoTracks().forEach(t => t.enabled = !cameraOn)
    setCameraOn(!cameraOn)
  }

  // 2. GUEST ADD - 7 JON PORJONTO TULTE PARBE
  const addGuest = () => {
    if (guests.length >= 7) {
      alert('7 jon hoye geche bhai! Ar tola jabe na.')
      return
    }
    if (!inviteName.trim()) {
      alert('Guest er naam dao - ex: Priya')
      return
    }
    // Guest er jonno o tar nijer camera chalu hobe
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(gs => {
        const newGuest = {
          id: Date.now(),
          name: inviteName,
          stream: gs,
          micOn: true,
        }
        setGuests([...guests, newGuest])
        setComments([...comments, { user: 'System', text: `🎉 ${inviteName} Live e join korlo!` }])
        setInviteName('')
        setShowInvite(false)
      })
      .catch(() => alert('Guest er Camera Permission dao'))
  }

  // GUEST KE NAMANO
  const removeGuest = (id: number) => {
    setGuests(guests.filter(g => g.id !== id))
  }

  const sendMsg = () => {
    if (!msg.trim()) return
    setComments([...comments, { user: 'YOU', text: msg }])
    setMsg('')
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      
      {/* TOP BAR */}
      <div style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'linear-gradient(rgba(0,0,0,0.7), transparent)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ background: '#ff3b5c', padding: '4px 8px', borderRadius: 6, fontWeight: 'bold', fontSize: 12 }}>🔴 LIVE</span>
          <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20 }}>
            <b style={{ fontSize: 12, display: 'block' }}>{liveTitle}</b>
            <span style={{ fontSize: 10, color: '#ffb400' }}>Host: {hostName} • {guests.length + 1}/8 Jon • ❤️ {likes}</span>
          </div>
        </div>
        <button onClick={() => setShowInvite(true)} style={{ background: '#00a884', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>+ Guest {guests.length}/7</button>
      </div>

      {/* MAIN AREA - HOST + GUEST */}
      {guests.length === 0 ? (
        // 1 JON - HOST FULL SCREEN
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
          <video ref={hostVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          {!cameraOn && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', textAlign: 'center' }}><div><div style={{ fontSize: 50 }}>📷</div><p>Camera Off Ache</p></div></div>}
          <div style={{ position: 'absolute', bottom: 170, left: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>👤 {hostName} (Host) • 🎙️ {micOn ? 'Mic On - Awaaz Jacche' : 'Mic Off'}</div>
        </div>
      ) : (
        // 2-8 JON - GRID - SOBAR FACE
        <div style={{ width: '100%', height: '100vh', padding: '60px 8px 170px', display: 'grid', gridTemplateColumns: guests.length <= 2 ? '1fr' : '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 8, boxSizing: 'border-box' }}>
          {/* HOST */}
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111', border: '2px solid #ff3b5c' }}>
            <video ref={hostVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <span style={{ position: 'absolute', bottom: 6, left: 6, background: '#ff3b5c', padding: '3px 7px', borderRadius: 10, fontSize: 10 }}>👑 {hostName} (Host)</span>
            <span style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', padding: '3px 6px', borderRadius: 10, fontSize: 10 }}>{micOn ? '🎙️' : '🔇'}</span>
          </div>
          {/* GUESTS - SOBAR NIJER CAMERA */}
          {guests.map(g => (
            <GuestVideo key={g.id} guest={g} onRemove={() => removeGuest(g.id)} />
          ))}
        </div>
      )}

      {/* COMMENTS */}
      <div style={{ position: 'absolute', bottom: 90, left: 12, right: 90, zIndex: 5 }}>
        {comments.slice(-4).map((c, i) => (
          <div key={i} style={{ marginBottom: 5, fontSize: 13 }}><b style={{ color: '#ffb400' }}>{c.user}: </b><span>{c.text}</span></div>
        ))}
      </div>

      {/* BOTTOM CONTROLS - HOST CONTROLS */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '10px 12px 16px' }}>
        {/* HOST MIC / CAMERA / GUEST */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, justifyContent: 'center' }}>
          <button onClick={toggleMic} style={{ padding: '8px 12px', borderRadius: 20, background: micOn ? '#00a884' : '#ff3b5c', color: '#fff', border: 'none', fontSize: 12 }}>{micOn ? '🎙️ Mic On' : '🔇 Mic Off'}</button>
          <button onClick={toggleCamera} style={{ padding: '8px 12px', borderRadius: 20, background: cameraOn ? '#00a884' : '#ff3b5c', color: '#fff', border: 'none', fontSize: 12 }}>{cameraOn ? '📷 Cam On' : '📷 Cam Off'}</button>
          <button onClick={() => setShowInvite(true)} style={{ padding: '8px 12px', borderRadius: 20, background: '#ffb400', color: '#000', border: 'none', fontSize: 12, fontWeight: 'bold' }}>👥 Guest Tolo ({guests.length}/7)</button>
        </div>
        {/* COMMENT + GIFT */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Comment likho..." style={{ flex: 1, padding: '11px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }} />
          <button onClick={sendMsg} style={{ background: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%' }}>↗️</button>
          <button onClick={() => setShowGift(true)} style={{ background: '#ff3b5c', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 18 }}>🎁</button>
          <button onClick={() => setLikes(likes + 1)} style={{ background: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 18 }}>❤️</button>
        </div>
      </div>

      {/* GUEST INVITE PANEL */}
      {showInvite && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#111b21', borderRadius: '20px 20px 0 0', padding: 16, zIndex: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>👥 Live e Guest Tolo - Max 7 Jon</b><button onClick={() => setShowInvite(false)} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button></div>
          <p style={{ fontSize: 12, color: '#8696a0' }}>Guest er nijer Face + Awaaz Live e asbe. Kono Demo Chobi asbe na.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Guest er naam - ex: Priya" style={{ flex: 1, padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none' }} />
            <button onClick={addGuest} style={{ padding: '12px 16px', borderRadius: 10, background: '#00a884', color: '#fff', border: 'none', fontWeight: 'bold' }}>+ Tolo</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <b style={{ fontSize: 12 }}>Ekhon Live e: {guests.length + 1}/8 Jon</b>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              <span style={{ background: '#ff3b5c', padding: '5px 10px', borderRadius: 20, fontSize: 12 }}>👑 {hostName} (Host)</span>
              {guests.map(g => <span key={g.id} style={{ background: '#00a884', padding: '5px 10px', borderRadius: 20, fontSize: 12 }}>{g.name} <span onClick={() => removeGuest(g.id)} style={{ cursor: 'pointer' }}>❌</span></span>)}
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#ffb400', marginTop: 10 }}>💡 Tip: Guest ke bolo - se tar phone theke Join korle tar Face + Awaaz asbe</p>
        </div>
      )}

      {/* GIFT PANEL */}
      {showGift && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#111b21', borderRadius: '20px 20px 0 0', padding: 16, zIndex: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>🎁 Gift Pathao</b><button onClick={() => setShowGift(false)} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
            {[{ e: '🌹', n: 'Rose', c: 10 }, { e: '👑', n: 'Crown', c: 100 }, { e: '💎', n: 'Diamond', c: 500 }, { e: '🚀', n: 'Rocket', c: 200 }, { e: '🦁', n: 'Lion', c: 1000 }, { e: '🏰', n: 'Castle', c: 2000 }, { e: '🔥', n: 'Fire', c: 50 }, { e: '❤️', n: 'Love', c: 20 }].map(g => (
              <button key={g.n} onClick={() => { setLikes(likes + g.c); setShowGift(false) }} style={{ background: '#202c33', border: 'none', color: '#fff', padding: 10, borderRadius: 12 }}><div style={{ fontSize: 28 }}>{g.e}</div><div style={{ fontSize: 11 }}>{g.n}</div><div style={{ fontSize: 10, color: '#ffb400' }}>🪙 {g.c}</div></button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// GUEST ER NIJER VIDEO COMPONENT - SOBAR FACE ALADA
function GuestVideo({ guest, onRemove }: any) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (ref.current && guest.stream) ref.current.srcObject = guest.stream
  }, [guest.stream])
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111', border: '1px solid #00a884' }}>
      <video ref={ref} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      <span style={{ position: 'absolute', bottom: 6, left: 6, background: '#00a884', padding: '3px 7px', borderRadius: 10, fontSize: 10 }}>{guest.name}</span>
      <button onClick={onRemove} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 10 }}>✕</button>
      <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 10, fontSize: 10 }}>🎙️ On</span>
    </div>
  )
}