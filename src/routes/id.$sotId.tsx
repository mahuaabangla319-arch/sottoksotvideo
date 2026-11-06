import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'

export const Route = createFileRoute('/live/$roomId')({
  component: SOTTOKLiveRoom,
})

function SOTTOKLiveRoom() {
  const [msg, setMsg] = useState('')
  const [isLive, setIsLive] = useState(true)
  const [viewers, setViewers] = useState(1245)
  const [likes, setLikes] = useState(3881)
  const [comments, setComments] = useState([
    { user: '@priya_12', text: 'Hello didi 🔥', gift: '' },
    { user: '@rahul_asansol', text: 'Gan ta darun ❤️', gift: '' },
    { user: '@sneha_sing', text: 'Gift pathalam 🌹', gift: '🌹 x1' },
    { user: '@amit_99', text: 'SOTTOK sera 👑', gift: '👑 x1 (500)' },
  ])
  const [showGift, setShowGift] = useState(false)

  const sendMsg = () => {
    if (!msg.trim()) return
    setComments([...comments, { user: 'YOU', text: msg, gift: '' }])
    setMsg('')
  }

  const sendGift = (gift: string, coins: number) => {
    setComments([...comments, { user: 'YOU', text: `Gift pathalo ${gift}`, gift: `${gift} (${coins})` }])
    setLikes(likes + coins)
    setShowGift(false)
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      
      {/* LIVE VIDEO - Camera */}
      <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'linear-gradient(180deg, #ff6b9d, #ff9a9e)' }}>
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)' }} />

        {/* TOP BAR - Chobir Moto */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ background: '#ff3b5c', padding: '4px 8px', borderRadius: 6, fontWeight: 'bold', fontSize: 12 }}>LIVE</div>
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <b style={{ fontSize: 12, display: 'block' }}>Music LiveHouse 🎤</b>
                <span style={{ fontSize: 10, color: '#ffb400' }}>⭐ ID: sottok_123 • 👁️ {viewers}</span>
              </div>
              <button style={{ background: '#ff3b5c', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 12, fontSize: 11, marginLeft: 6 }}>+ Follow</button>
            </div>
          </div>
          <button style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%' }}>✕</button>
        </div>

        {/* RIGHT SIDE - Top Gift Ranking - Chobir Moto */}
        <div style={{ position: 'absolute', top: 70, right: 12, textAlign: 'right' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 11 }}>👑 Top Gifter: ValenDINO</div>
          <div style={{ background: 'linear-gradient(90deg,#ff3b5c,#ffb400)', padding: '6px 10px', borderRadius: 20, fontSize: 11, marginTop: 6, fontWeight: 'bold' }}>🏆 SOTTOK LIVE • x1</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <span style={{ fontSize: 28 }}>❤️</span>
            <span style={{ fontSize: 28 }}>🎁</span>
            <span style={{ fontSize: 28 }}>🌹</span>
          </div>
        </div>

        {/* LEFT BOTTOM - Comments - Chobir Moto */}
        <div style={{ position: 'absolute', bottom: 90, left: 12, right: 90, maxHeight: 220, overflowY: 'auto' }}>
          {comments.map((c, i) => (
            <div key={i} style={{ marginBottom: 6, fontSize: 13 }}>
              <b style={{ color: '#ffb400' }}>👑 {c.user}: </b>
              <span>{c.text}</span>
              {c.gift && <span style={{ color: '#00ff88', fontWeight: 'bold' }}> • {c.gift}</span>}
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#ffb400', marginTop: 4 }}>🟢 {viewers} Jon Dekhche • ❤️ {likes} Likes</div>
        </div>

        {/* BOTTOM BAR - Chobir Moto */}
        <div style={{ position: 'absolute', bottom: 16, left: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Comment likho..." style={{ flex: 1, padding: '11px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', backdropFilter: 'blur(10px)' }} />
          <button onClick={sendMsg} style={{ background: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 16 }}>↗️</button>
          <button onClick={() => setShowGift(true)} style={{ background: '#ff3b5c', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 18 }}>🎁</button>
          <button onClick={() => setLikes(likes + 1)} style={{ background: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 18 }}>❤️</button>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 16 }}>↗️</button>
        </div>

        {/* GIFT PANEL */}
        {showGift && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#111b21', borderRadius: '20px 20px 0 0', padding: 16, zIndex: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b>🎁 Gift Pathao - SOTTOK Coins</b>
              <button onClick={() => setShowGift(false)} style={{ background: '#202c33', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
              {[
                { emoji: '🌹', name: 'Rose', coins: 10 },
                { emoji: '👑', name: 'Crown', coins: 100 },
                { emoji: '💎', name: 'Diamond', coins: 500 },
                { emoji: '🚀', name: 'Rocket', coins: 200 },
                { emoji: '🦁', name: 'Lion', coins: 1000 },
                { emoji: '🏰', name: 'Castle', coins: 2000 },
                { emoji: '🔥', name: 'Fire', coins: 50 },
                { emoji: '❤️', name: 'Love', coins: 20 },
              ].map(g => (
                <button key={g.name} onClick={() => sendGift(g.emoji, g.coins)} style={{ background: '#202c33', border: 'none', color: '#fff', padding: 10, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 28 }}>{g.emoji}</div>
                  <div style={{ fontSize: 11 }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: '#ffb400' }}>🪙 {g.coins}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}