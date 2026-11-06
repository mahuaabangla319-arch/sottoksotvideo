import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/live/create')({
  component: SOTTOKLiveCreateForm,
})

function SOTTOKLiveCreateForm() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  // FORM ER SOB KICHU
  const [userName, setUserName] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Adda 🔥')
  const [description, setDescription] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [loading, setLoading] = useState(false)

  // CAMERA + MIC ON KORO - PREVIEW ER JONNO
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' }, 
      audio: true 
    })
    .then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOn(true)
    })
    .catch(() => {
      alert('Bhai Camera + Mic Permission dao - na hole Face dekhabe na')
    })
    // NOTIFICATION PERMISSION - AGE THEKE NIYE RAKHO
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }, [])

  // PUBLISH CHAPLEI SOB TOIRI HOYE JABE
  const createLive = () => {
    if (!userName.trim()) {
      alert('Bhai Tomar Naam dao! Ex: Rahul')
      return
    }
    if (!title.trim()) {
      alert('Bhai Live er Title dao! Ex: Asansol Adda')
      return
    }

    setLoading(true)

    // 1. LIVE DATA TOIRI
    const liveId = Date.now().toString()
    const liveData = {
      id: liveId,
      roomId: '1',
      title: title.trim(),
      description: description.trim() || `${title} - SOTTOK Live`,
      host: userName.trim(),
      hostName: userName.trim(),
      category: category,
      viewers: 1,
      likes: 0,
      comments: [],
      guests: [],
      requests: [],
      isLive: true,
      startedAt: new Date().toLocaleTimeString(),
      startedDate: new Date().toLocaleDateString(),
    }

    // 2. SOB JAYGAY SAVE - JATE SOBAI DEKHTE PAY
    localStorage.setItem('sottok_current_live', JSON.stringify(liveData))
    localStorage.setItem('sottok_live_id', liveId)
    localStorage.setItem('sottok_host_name', userName.trim())
    localStorage.setItem('sottok_live_title', title.trim())

    // 3. LIVE LIST E ADD - live.index.tsx TE DEKHABE
    const oldList = JSON.parse(localStorage.getItem('sottok_all_lives') || '[]')
    oldList.unshift(liveData)
    localStorage.setItem('sottok_all_lives', JSON.stringify(oldList))

    // 4. NOTIFICATION + BANNER ER JONNO
    const notifText = `🔴 ${userName} Live e eseche! ${title} - Join koro!`
    localStorage.setItem('sottok_live_notification', notifText)
    localStorage.setItem('sottok_live_banner', JSON.stringify({
      show: true,
      text: `🔴 LIVE: ${userName} - ${title}`,
      host: userName.trim(),
      title: title.trim(),
    }))

    // 5. REQUEST LIST KHALI KORO - NOTUN LIVE
    localStorage.setItem('sottok_live_requests', JSON.stringify([]))
    localStorage.setItem('sottok_live_comments', JSON.stringify([
      { user: 'System', text: `🔴 ${userName} Live Start korlo - ${title}` }
    ]))

    // 6. PHONE NOTIFICATION PATHAO
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🔴 ${userName} Live e eseche!`, {
        body: `${title} - SOTTOK Live e Join koro!`,
      })
    }

    // 7. SOB TAB / SOB USER KE JANANO
    window.dispatchEvent(new Event('sottok-live-started'))
    window.dispatchEvent(new Event('storage'))

    setTimeout(() => {
      alert(`Live Toiri Hoye Geche! 🎉\n\nHost: ${userName}\nTitle: ${title}\nCategory: ${category}\n\nEkhon sobai dekhbe + Notification geche!`)
      // 8. LIVE ROOM E NIYE JAO
      navigate({ to: '/live/1' })
    }, 500)
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* BANNER */}
      <div style={{ background: 'linear-gradient(90deg,#ff3b5c,#ff6b00)', padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>
        🎉 🔴 SOTTOK LIVE - EKHON SOBAI LIVE KORTE PARBE!
      </div>

      {/* HEADER */}
      <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate({ to: '/live' })} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20 }}>←</button>
        <b>🎬 Live Create Form</b>
        <span style={{ fontSize: 11, background: '#ff3b5c', padding: '4px 8px', borderRadius: 10 }}>🔴 LIVE</span>
      </div>

      {/* CAMERA PREVIEW - NIJER FACE */}
      <div style={{ background: '#111', position: 'relative', height: 280, overflow: 'hidden', margin: '0 12px', borderRadius: 14 }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        {!cameraOn && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}><div><div style={{ fontSize: 50 }}>📷</div><p>Camera On Hocche...</p><p style={{ fontSize: 12, color: '#8696a0' }}>Permission dao bhai</p></div></div>}
        {cameraOn && <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>📷 Preview - {userName || 'Tumi'} ke dekha jacche ✅</div>}
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 12 }}>🎙️ {micOn ? 'Mic On - Awaaz Jacche' : 'Mic Off'}</div>
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#ff3b5c', padding: '6px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>🔴 PREVIEW</div>
      </div>

      {/* FORM - SOB KICHU EK JAYGAY */}
      <div style={{ padding: 14, background: '#111b21', margin: '12px', borderRadius: 14, flex: 1 }}>
        <label style={{ fontSize: 12, color: '#8696a0' }}>👤 Tomar Naam *</label>
        <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Tomar Naam - ex: Rahul" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', margin: '6px 0 12px', boxSizing: 'border-box' }} />

        <label style={{ fontSize: 12, color: '#8696a0' }}>🎬 Live Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Live Title - ex: Asansol Adda 🔥" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', margin: '6px 0 12px', boxSizing: 'border-box' }} />

        <label style={{ fontSize: 12, color: '#8696a0' }}>📂 Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '6px 0 12px' }}>
          {['Adda 🔥', 'Music 🎵', 'Game 🎮', 'Cooking 🍳', 'Study 📚', 'Comedy 😂', 'News 📰'].map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '8px 12px', borderRadius: 20, background: category === c ? '#ff3b5c' : '#202c33', color: '#fff', border: 'none', fontSize: 12 }}>{c}</button>
          ))}
        </div>

        <label style={{ fontSize: 12, color: '#8696a0' }}>📝 Description (Optional)</label>
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Live e ki hobe? ex: Gaan + Adda hobe" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none', margin: '6px 0 12px', boxSizing: 'border-box' }} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setMicOn(!micOn)} style={{ flex: 1, padding: 11, borderRadius: 10, background: micOn ? '#00a884' : '#ff3b5c', color: '#fff', border: 'none', fontSize: 12 }}>{micOn ? '🎙️ Mic On' : '🔇 Mic Off'}</button>
          <button onClick={() => setCameraOn(!cameraOn)} style={{ flex: 1, padding: 11, borderRadius: 10, background: cameraOn ? '#00a884' : '#ff3b5c', color: '#fff', border: 'none', fontSize: 12 }}>{cameraOn ? '📷 Cam On' : '📷 Cam Off'}</button>
        </div>

        <p style={{ fontSize: 12, color: '#00ff88', margin: '0 0 6px' }}>✅ Publish chaplei sob toiri hobe - Live + Notification + Banner + Room</p>
        <p style={{ fontSize: 12, color: '#ffb400', margin: '0 0 12px' }}>🔔 Sob User er kache Notification jabe - {userName || 'Tumi'} Live e esecho!</p>

        <button onClick={createLive} disabled={loading} style={{ width: '100%', padding: 15, borderRadius: 20, background: loading ? '#8696a0' : '#ff3b5c', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16 }}>
          {loading ? '⏳ Live Toiri Hocche...' : '🔴 Publish - Live Start Korbo'}
        </button>

        <p style={{ fontSize: 11, color: '#8696a0', textAlign: 'center', marginTop: 10 }}>Je Live korbe tar Face + Awaaz diye cholbe - Kono Demo Chobi Nei</p>
      </div>
    </div>
  )
}