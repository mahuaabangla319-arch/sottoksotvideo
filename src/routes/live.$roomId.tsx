import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/live/$roomId')({
  component: LiveRoom,
})

function LiveRoom() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [msg, setMsg] = useState('')
  const [guests, setGuests] = useState<string[]>([])
  const [chats, setChats] = useState([
    { user: 'Priya', text: 'Hello Asansol! 🔥' },
    { user: 'Rahul', text: 'Super room bhai!' },
    { user: 'Sneha', text: 'Gaan hobe naki? 🎤' },
  ])
  const [viewers, setViewers] = useState(128)
  const [gifts, setGifts] = useState(0)

  // Agger File Theke Guest List Niye Asa
  useEffect(() => {
    const saved = localStorage.getItem('live_guests_' + roomId)
    if (saved) {
      try { setGuests(JSON.parse(saved)) } catch {}
    }
  }, [roomId])

  const sendChat = () => {
    if (!msg.trim()) return
    setChats([...chats, { user: 'You', text: msg }])
    setMsg('')
  }

  const sendGift = (emoji: string) => {
    setGifts(gifts + 1)
    setChats([...chats, { user: 'You', text: 'Sent ' + emoji + ' Gift 🎁' }])
  }

  const endLive = () => {
    if (confirm('Live sesh korbe bhai?')) {
      navigate({ to: '/live' })
    }
  }

  // Host + Guests = Max 8 Jon - Baki Seat Khali
  const allSeats = ['YOU (Host)', ...guests]
  const emptySeats = 8 - allSeats.length
  const seats = [...allSeats, ...Array(emptySeats > 0 ? emptySeats : 0).fill('EMPTY')]

  return (
    <div style={{ background: '#0b141a', color: '#fff', minHeight: '100vh', padding: 12, maxWidth: 480, margin: '0 auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate({ to: '/live' })} style={{ background: 'none', color: '#fff', border: 'none', fontSize: 20 }}>←</button>
        <div>
          <b>🔴 LIVE • {roomId}</b>
          <p style={{ fontSize: 12, color: '#8696a0', margin: 0 }}>👁️ {viewers} Watching • 🎁 {gifts} Gifts • {allSeats.length}/8 Jon</p>
        </div>
        <button onClick={endLive} style={{ background: '#ff3b30', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 10 }}>END ❌</button>
      </div>

      {/* WhatsApp Style Video Grid - 8 Jon */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        {seats.map((s, i) => (
          <div key={i} style={{
            height: 140, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: s === 'EMPTY' ? '#182229' : s === 'YOU (Host)' ? '#00a884' : '#2a3942',
            border: s === 'YOU (Host)' ? '2px solid #00a884' : 'none'
          }}>
            <div style={{ fontSize: 28 }}>{s === 'EMPTY' ? '➕' : s === 'YOU (Host)' ? '🧑‍💼' : '👤'}</div>
            <b style={{ fontSize: 12, marginTop: 6 }}>{s === 'EMPTY' ? 'Empty Seat' : s}</b>
            <span style={{ fontSize: 10, color: '#8696a0' }}>
              {s === 'EMPTY' ? 'Keu Boseni' : s === 'YOU (Host)' ? (camOn ? '📹 Cam ON' : '📹 Cam OFF') + ' • ' + (micOn ? '🎙️ Mic ON' : '🔇 Muted') : '🟢 Guest Live'}
            </span>
          </div>
        ))}
      </div>

      {/* Gift Bar */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
        {['🌹', '❤️', '🔥', '🎁', '👑', '💎', '🚀'].map(g => (
          <button key={g} onClick={() => sendGift(g)} style={{ fontSize: 22, background: '#202c33', border: 'none', padding: '8px 12px', borderRadius: 20 }}>{g}</button>
        ))}
      </div>

      {/* Chat */}
      <div style={{ background: '#111b21', borderRadius: 12, padding: 10, marginTop: 12, height: 160, overflowY: 'auto' }}>
        <b style={{ fontSize: 13 }}>💬 Live Chat</b>
        {chats.map((c, i) => (
          <p key={i} style={{ fontSize: 13, margin: '6px 0' }}><b style={{ color: '#00a884' }}>{c.user}:</b> {c.text}</p>
        ))}
      </div>

      {/* Bottom Controls - WhatsApp Style */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Chat likho..." style={{ flex: 1, padding: 12, borderRadius: 20, background: '#202c33', color: '#fff', border: 'none' }} />
        <button onClick={sendChat} style={{ padding: '12px 16px', borderRadius: 20, background: '#00a884', color: '#fff', border: 'none' }}>Send</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
        <button onClick={() => setMicOn(!micOn)} style={{ width: 56, height: 56, borderRadius: '50%', background: micOn ? '#00a884' : '#ff3b30', color: '#fff', border: 'none', fontSize: 20 }}>{micOn ? '🎙️' : '🔇'}</button>
        <button onClick={() => setCamOn(!camOn)} style={{ width: 56, height: 56, borderRadius: '50%', background: camOn ? '#00a884' : '#ff3b30', color: '#fff', border: 'none', fontSize: 20 }}>{camOn ? '📹' : '📷'}</button>
        <button onClick={endLive} style={{ width: 56, height: 56, borderRadius: '50%', background: '#ff3b30', color: '#fff', border: 'none', fontSize: 20 }}>📞</button>
      </div>

      <p style={{ textAlign: 'center', color: '#8696a0', fontSize: 12, marginTop: 10 }}>SOT TOK OFFICE • 5 Dec 2026 Live • WhatsApp Style - 8 Jon</p>
    </div>
  )
}