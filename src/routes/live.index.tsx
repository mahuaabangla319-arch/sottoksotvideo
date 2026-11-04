import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/live/')({
  component: LiveDiscovery,
})

const MOCK_ROOMS = [
  { id: 'SOTTOK-1001', name: 'Asansol Adda 🔥', host: 'Rahul', viewers: 1240, speakers: 5, type: 'Video', cover: 'https://picsum.photos/400/300?random=1', live: true },
  { id: 'SOTTOK-1002', name: 'Bangla Gaan Night 🎤', host: 'Priya', viewers: 860, speakers: 8, type: 'Audio', cover: 'https://picsum.photos/400/300?random=2', live: true },
  { id: 'SOTTOK-1003', name: 'Cricket Talk 🏏', host: 'Amit', viewers: 432, speakers: 3, type: 'Video', cover: 'https://picsum.photos/400/300?random=3', live: true },
  { id: 'SOTTOK-1004', name: 'Late Night Chai ☕', host: 'Sneha', viewers: 210, speakers: 2, type: 'Audio', cover: 'https://picsum.photos/400/300?random=4', live: true },
]

function LiveDiscovery() {
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const tabs = ['All', 'Video', 'Audio', 'Popular', 'New']

  const filtered = MOCK_ROOMS.filter(r => {
    if (tab !== 'All' && tab !== 'Popular' && tab !== 'New' && r.type !== tab) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">LIVE <span className="text-red-500">●</span></h1>
          <Link to="/live/create" className="bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 rounded-full text-sm font-bold">
            + Go Live
          </Link>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search Live Rooms, Room ID..."
          className="w-full mt-3 bg-[#1c1c24] rounded-full px-4 py-3 text-sm outline-none"
        />
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${tab === t ? 'bg-white text-black font-bold' : 'bg-[#1c1c24]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map(room => (
          <Link key={room.id} to="/live/$roomId" params={{ roomId: room.id }} className="bg-[#1c1c24] rounded-2xl overflow-hidden">
            <div className="relative">
              <img src={room.cover} alt={room.name} className="w-full h-32 object-cover" />
              <span className="absolute top-2 left-2 bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
              <span className="absolute bottom-2 left-2 bg-black/70 text-[11px] px-2 py-0.5 rounded-full">👁 {room.viewers}</span>
              <span className="absolute bottom-2 right-2 bg-black/70 text-[11px] px-2 py-0.5 rounded-full">{room.type}</span>
            </div>
            <div className="p-3">
              <p className="font-bold text-sm truncate">{room.name}</p>
              <p className="text-xs text-gray-400 truncate">Host: {room.host} • {room.id}</p>
              <p className="text-xs text-pink-400 mt-1">🎙 {room.speakers}/8 Speakers</p>
              <div className="mt-2 bg-pink-500 text-center py-1.5 rounded-full text-xs font-bold">Join Room</div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No live rooms found. Be the first to go live!</p>
      )}
    </div>
  )
}