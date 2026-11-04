import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/live/create')({
  component: CreateLiveRoom,
})

function CreateLiveRoom() {
  const navigate = useNavigate()

  // ONLY 2 OFFICIAL ACCOUNTS CAN GO LIVE
  const currentUser = localStorage.getItem('username') || localStorage.getItem('user_name') || ''
  const ALLOWED_LIVE_USERS = ["sottokofficial", "kolkataofficial"]
  const canGoLive = ALLOWED_LIVE_USERS.includes(currentUser.toLowerCase().replace('@',''))

  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [type, setType] = useState<'Video' | 'Audio'>('Video')
  const [addUser, setAddUser] = useState('')
  const [guests, setGuests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // WHATSAPP STYLE - Max 8 Jon Ke Add Kora Jabe (Tumi + 7 Guest)
  const MAX_GUEST = 7

  const handleAddGuest = () => {
    if (!addUser.trim()) { alert('Username / SOT ID দাও ভাই!'); return }
    if (guests.length >= MAX_GUEST) { alert('Max 7 জনকে Add করতে পারবে! WhatsApp এর মতো'); return }
    if (guests.includes(addUser.trim())) { alert('এই জন আগেই Add আছে!'); return }
    setGuests([...guests, addUser.trim()])
    setAddUser('')
  }

  const removeGuest = (u: string) => {
    setGuests(guests.filter(g => g !== u))
  }

  const handleCreate = () => {
    if (!name.trim()) { alert('Room Name দাও ভাই!'); return }
    setLoading(true)
    const roomId = 'SOTTOK-' + Math.floor(1000 + Math.random() * 9000)
    // Later: save to Supabase live_rooms table here - with guests list
    localStorage.setItem('live_guests_' + roomId, JSON.stringify(guests))
    setTimeout(() => {
      navigate({ to: '/live/$roomId', params: { roomId } })
    }, 800)
  }

  if (!canGoLive) {
    return (
      <div style={{padding: 20, textAlign: 'center'}}>
        <h2>Only SOT TOK OFFICE & WORLD GROUP Can Go Live</h2>
        <p>You Can Watch Live, Send Gifts, Chat.</p>
        <button onClick={() => navigate({ to: '/live' })}>Watch Live</button>
      </div>
    )
  }

  return (
    <div style={{padding: 16, maxWidth: 480, margin: '0 auto', background: '#0b141a', color: '#fff', minHeight: '100vh'}}>
      <h2 style={{fontSize: 22}}>🔴 New Live - WhatsApp Style</h2>
      <p style={{color: '#8696a0', fontSize: 13}}>SOT TOK OFFICE • {type} Live • Max 8 Jon</p>

      <label>Live Title *</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: SOT TOK OFFICE Live - 5 Dec" style={{width: '100%', padding: 12, borderRadius: 10, margin: '8px 0', background: '#202c33', color: '#fff', border: 'none'}} />

      <label>Description</label>
      <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ajke ki niye kotha hobe?" style={{width: '100%', padding: 12, borderRadius: 10, margin: '8px 0', background: '#202c33', color: '#fff', border: 'none'}} />

      <div style={{display: 'flex', gap: 10, margin: '10px 0'}}>
        <button onClick={() => setType('Video')} style={{flex: 1, padding: 12, borderRadius: 10, background: type==='Video' ? '#00a884' : '#202c33', color: '#fff', border: 'none'}}>📹 Video Live</button>
        <button onClick={() => setType('Audio')} style={{flex: 1, padding: 12, borderRadius: 10, background: type==='Audio' ? '#00a884' : '#202c33', color: '#fff', border: 'none'}}>🎙️ Audio Live</button>
      </div>

      <h3 style={{marginTop: 20}}>👥 Guest Add Koro - WhatsApp Video Call Er Moto</h3>
      <p style={{color: '#8696a0', fontSize: 12}}>{guests.length} / 7 Jon Add Hoyeche - Aro {7 - guests.length} Jon Baki</p>

      <div style={{display: 'flex', gap: 8}}>
        <input value={addUser} onChange={e => setAddUser(e.target.value)} placeholder="@username / SOT ID লেখো" style={{flex: 1, padding: 12, borderRadius: 10, background: '#202c33', color: '#fff', border: 'none'}} />
        <button onClick={handleAddGuest} style={{padding: '12px 16px', borderRadius: 10, background: '#00a884', color: '#fff', border: 'none'}}>+ Add</button>
      </div>

      <div style={{marginTop: 12}}>
        {guests.map(g => (
          <div key={g} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#202c33', padding: 10, borderRadius: 10, marginBottom: 8}}>
            <span>🟢 @{g} - Guest</span>
            <button onClick={() => removeGuest(g)} style={{background: '#ff3b30', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 8}}>Remove ❌</button>
          </div>
        ))}
        {guests.length === 0 && <p style={{color: '#8696a0', fontSize: 13}}>Ekhono keu Add hoyni. Upor theke Add koro.</p>}
      </div>

      <div style={{background: '#182229', padding: 12, borderRadius: 10, marginTop: 16}}>
        <b>Live Preview - WhatsApp Style Grid:</b>
        <p style={{fontSize: 12, color: '#8696a0'}}>Tumi (Host) + {guests.length} Guest = {guests.length + 1} Jon Video Te Thakbe</p>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8}}>
          <div style={{background: '#00a884', height: 80, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>YOU (Host)</div>
          {guests.map(g => <div key={g} style={{background: '#2a3942', height: 80, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>@{g}</div>)}
        </div>
      </div>

      <button onClick={handleCreate} disabled={loading} style={{width: '100%', padding: 15, marginTop: 20, borderRadius: 12, background: '#00a884', color: '#fff', fontSize: 16, fontWeight: 'bold', border: 'none'}}>
        {loading ? 'Live Start Hocche...' : '🔴 GO LIVE - Start Koro'}
      </button>
      <p style={{textAlign: 'center', color: '#8696a0', fontSize: 12, marginTop: 10}}>5 Dec 2026, 8 PM - SOT TOK OFFICE</p>
    </div>
  )
}