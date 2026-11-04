import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/live/create')({
  component: CreateLiveRoom,
})

function CreateLiveRoom() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [type, setType] = useState<'Video' | 'Audio'>('Video')
  const [loading, setLoading] = useState(false)

  const handleCreate = () => {
    if (!name.trim()) { alert('Room Name দাও ভাই!'); return }
    setLoading(true)
    const roomId = 'SOTTOK-' + Math.floor(1000 + Math.random() * 9000)
    // Later: save to Supabase live_rooms table here
    setTimeout(() => {
      navigate({ to: '/live/$roomId', params: { roomId } })
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 pb-24">
      <h1 className="text-2xl font-black">Create Live Room 🎙️</h1>
      <p className="text-gray-400 text-sm mt-1">Vigo Style - 8 Seat Room</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-bold">Room Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Asansol Adda 🔥"
            className="w-full mt-1 bg-[#1c1c24] rounded-xl px-4 py-3 outline-none" />
        </div>

        <div>
          <label className="text-sm font-bold">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Room টা কিসের ব্যাপারে?"
            className="w-full mt-1 bg-[#1c1c24] rounded-xl px-4 py-3 outline-none h-20" />
        </div>

        <div>
          <label className="text-sm font-bold">Room Type</label>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setType('Video')} className={`flex-1 py-4 rounded-2xl font-bold ${type === 'Video' ? 'bg-pink-500' : 'bg-[#1c1c24]'}`}>
              📹 Video Room<br /><span className="text-xs font-normal">Camera + Mic</span>
            </button>
            <button onClick={() => setType('Audio')} className={`flex-1 py-4 rounded-2xl font-bold ${type === 'Audio' ? 'bg-pink-500' : 'bg-[#1c1c24]'}`}>
              🎙️ Audio Room<br /><span className="text-xs font-normal">Only Mic</span>
            </button>
          </div>
        </div>

        <div className="bg-[#1c1c24] p-4 rounded-2xl text-sm space-y-1">
          <p>✅ Max 8 Speaker Seats</p>
          <p>✅ Host Control - Accept / Reject</p>
          <p>✅ Live Chat + Gifts</p>
          <p>✅ Room ID Auto Generate হবে</p>
        </div>

        <button onClick={handleCreate} disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-red-500 py-4 rounded-full font-black text-lg">
          {loading ? 'Creating...' : '🚀 Go Live Now'}
        </button>

        <button onClick={() => navigate({ to: '/live' })} className="w-full text-gray-400 text-sm">
          Cancel
        </button>
      </div>
    </div>
  )
}