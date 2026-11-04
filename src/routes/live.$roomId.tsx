import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/live/$roomId')({
  component: LiveRoom,
})

type Seat = { id: number; user: string | null; avatar: string; muted: boolean }

function LiveRoom() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [joined, setJoined] = useState(false)
  const [msg, setMsg] = useState('')
  const [chats, setChats] = useState([
    { user: 'Priya', text: 'Hello Asansol! 🔥', color: 'text-pink-400' },
    { user: 'Rahul', text: 'Super room bhai!', color: 'text-yellow-400' },
    { user: 'Sneha', text: 'Gaan hobe naki? 🎤', color: 'text-green-400' },
  ])

  const [seats, setSeats] = useState<Seat[]>([
    { id: 1, user: 'YOU (Host)', avatar: '👑', muted: false },
    { id: 2, user: 'Priya', avatar: '💃', muted: false },
    { id: 3, user: 'Rahul', avatar: '🕺', muted: true },
    { id: 4, user: null, avatar: '+', muted: false },
    { id: 5, user: null, avatar: '+', muted: false },
    { id: 6, user: null, avatar: '+', muted: false },
    { id: 7, user: null, avatar: '+', muted: false },
    { id: 8, user: null, avatar: '+', muted: false },
  ])

  const sendChat = () => {
    if (!msg.trim()) return
    setChats([...chats, { user: 'You', text: msg, color: 'text-white' }])
    setMsg('')
  }

  const takeSeat = (id: number) => {
    if (joined) return
    setSeats(seats.map(s => s.id === id ? { ...s, user: 'You', avatar: '🎤' } : s))
    setJoined(true)
  }

  const sendGift = (gift: string) => {
    setChats([...chats, { user: 'System', text: `🎁 You sent ${gift} - 50 coins!`, color: 'text-yellow-300' }])
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col pb-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 bg-black/40">
        <div>
          <p className="font-bold text-sm">Asansol Adda 🔥 <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full ml-1">LIVE</span></p>
          <p className="text-xs text-gray-400">Room ID: {roomId} • 👁 1,240 watching</p>
        </div>
        <button onClick={() => navigate({ to: '/live' })} className="bg-red-500 px-3 py-1.5 rounded-full text-xs font-bold">Leave</button>
      </div>

      {/* 8 Seats - Vigo Style */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-2">🎙 8 Speaker Seats - {seats.filter(s => s.user).length}/8 Filled</p>
        <div className="grid grid-cols-4 gap-3">
          {seats.map(seat => (
            <button key={seat.id} onClick={() => takeSeat(seat.id)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border ${seat.user ? 'bg-gradient-to-b from-pink-500/30 to-purple-500/30 border-pink-500' : 'bg-[#1c1c24] border-gray-700'}`}>
              <span className="text-2xl">{seat.avatar}</span>
              <span className="text-[11px] font-bold mt-1 truncate px-1">{seat.user || `Seat ${seat.id}`}</span>
              {seat.user && <span className="text-[10px]">{seat.muted ? '🔇 Muted' : '🎤 Speaking'}</span>}
              {!seat.user && <span className="text-[10px] text-pink-400">Tap to Join</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 mx-3 bg-[#1c1c24]/50 rounded-2xl p-3 min-h-[180px] max-h-[220px] overflow-y-auto">
        {chats.map((c, i) => (
          <p key={i} className="text-sm mb-1.5"><span className={`font-bold ${c.color}`}>{c.user}: </span>{c.text}</p>
        ))}
      </div>

      {/* Gifts */}
      <div className="flex gap-2 px-3 mt-3 overflow-x-auto">
        {['🌹 10', '❤️ 20', '🎁 50', '👑 100', '💎 500', '🚀 1000'].map(g => (
          <button key={g} onClick={() => sendGift(g)} className="bg-[#1c1c24] px-3 py-1.5 rounded-full text-xs whitespace-nowrap">{g}</button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 px-3 mt-3">
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Say something..." className="flex-1 bg-[#1c1c24] rounded-full px-4 py-3 text-sm outline-none" />
        <button onClick={sendChat} className="bg-pink-500 px-4 rounded-full font-bold">Send</button>
      </div>

      <div className="flex justify-center gap-3 mt-3">
        <button onClick={() => setMicOn(!micOn)} className={`w-12 h-12 rounded-full text-xl ${micOn ? 'bg-white text-black' : 'bg-red-500'}`}>{micOn ? '🎤' : '🔇'}</button>
        <button onClick={() => setCamOn(!camOn)} className={`w-12 h-12 rounded-full text-xl ${camOn ? 'bg-white text-black' : 'bg-red-500'}`}>{camOn ? '📹' : '📷'}</button>
        <button onClick={() => alert('LiveKit will connect here - next step!')} className="bg-gradient-to-r from-pink-500 to-red-500 px-6 rounded-full font-bold">Go Live</button>
      </div>
    </div>
  )
}