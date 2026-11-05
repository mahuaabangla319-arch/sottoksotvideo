import SottokBankWallet from '../components/SottokBankWallet'import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/live/$roomId')({
  component: SOTTOKLiveRoom,
})

function SOTTOKLiveRoom() {
  const [msg, setMsg] = useState('')
  const [viewers, setViewers] = useState(1245)
  const [likes, setLikes] = useState(3881)
  const [comments, setComments] = useState([
    { user: '@priya_12', text: 'Hello didi 🔥', gift: '' },
    { user: '@rahul_asansol', text: 'Gan ta darun ❤️', gift: '' },
    { user: '@sneha_sing', text: 'Gift pathalam 🌹', gift: '🌹 x1' },
    { user: '@amit_99', text: 'SOTTOK sera 👑', gift: '👑 x1 (500)' },
  ])
  const [showGift, setShowGift] = useState(false)
  const [showWallet, setShowWallet] = useState(false)
  const [showBank, setShowBank] = useState(false)

  // ===== WALLET + টাকা + ব্যাংক সিস্টেম - আগের ফর্মের সাথে জোড়া =====
  const [coins, setCoins] = useState(110) // 110 কয়েন = $1.10 - টেস্টের জন্য
  const [bankLinked, setBankLinked] = useState(false)
  const [bankInfo, setBankInfo] = useState('')
  const [bankName, setBankName] = useState('')
  const balance = coins / 100 // 100 Coins = $1
  const canWithdraw = balance >= 1

  const sendMsg = () => {
    if (!msg.trim()) return
    setComments([...comments, { user: 'YOU', text: msg, gift: '' }])
    setMsg('')
  }

  const sendGift = (gift: string, coinValue: number) => {
    setComments([...comments, { user: 'YOU', text: `Gift pathalo ${gift}`, gift: `${gift} (${coinValue})` }])
    setLikes(likes + coinValue)
    // LIVE এ গিফট পেলে হোস্টের ওয়ালেটে কয়েন জমবে
    setCoins(coins + coinValue)
    setShowGift(false)
  }

  const handleWithdraw = () => {
    if (!bankLinked) return setShowBank(true)
    if (!canWithdraw) return alert(`এখন Balance $${balance.toFixed(2)} - $1 হলে তুলতে পারবে`)
    alert(`✅ হয়ে গেছে!\n$${balance.toFixed(2)} তোমার ব্যাংক অ্যাকাউন্টে (${bankInfo}) পাঠানো হচ্ছে।\nসঙ্গে সঙ্গে জমা হয়ে যাবে।`)
    setCoins(0)
    setShowWallet(false)
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      
      {/* LIVE VIDEO */}
      <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'linear-gradient(180deg, #ff6b9d, #ff9a9e)' }}>
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)' }} />

        {/* TOP BAR */}
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
          <div style={{ display: 'flex', gap: 6 }}>
            {/* WALLET বাটন - টাচ করলেই টাকার হিসাব দেখা যাবে */}
            <button onClick={() => setShowWallet(true)} style={{ background: 'linear-gradient(90deg,#FFB300,#FF2E2E)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>💰 ${balance.toFixed(2)}</button>
            <button style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%' }}>✕</button>
          </div>
        </div>

        {/* RIGHT SIDE - Top Gift Ranking */}
        <div style={{ position: 'absolute', top: 70, right: 12, textAlign: 'right' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 20, fontSize: 11 }}>👑 Top Gifter: ValenDINO</div>
          <div style={{ background: 'linear-gradient(90deg,#ff3b5c,#ffb400)', padding: '6px 10px', borderRadius: 20, fontSize: 11, marginTop: 6, fontWeight: 'bold' }}>🏆 SOTTOK LIVE • x1</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <span style={{ fontSize: 28 }}>❤️</span>
            <span style={{ fontSize: 28 }}>🎁</span>
            <span style={{ fontSize: 28 }}>🌹</span>
          </div>
        </div>

        {/* LEFT BOTTOM - Comments */}
        <div style={{ position: 'absolute', bottom: 90, left: 12, right: 90, maxHeight: 220, overflowY: 'auto' }}>
          {comments.map((c, i) => (
            <div key={i} style={{ marginBottom: 6, fontSize: 13 }}>
              <b style={{ color: '#ffb400' }}>👑 {c.user}: </b>
              <span>{c.text}</span>
              {c.gift && <span style={{ color: '#00ff88', fontWeight: 'bold' }}> • {c.gift}</span>}
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#ffb400', marginTop: 4 }}>🟢 {viewers} Jon Dekhche • ❤️ {likes} Likes • 🪙 {coins} Coins</div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{ position: 'absolute', bottom: 16, left: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Comment likho..." style={{ flex: 1, padding: '11px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }} />
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

        {/* WALLET PANEL - কয়েন -> টাকা -> ব্যাংক - প্রোফাইলের ওয়ালেটের মতোই */}
        {showWallet && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#000', borderRadius: '20px 20px 0 0', padding: 18, zIndex: 30, borderTop: '2px solid #FF8A00' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b style={{ fontSize: 17 }}>💰 আমার ওয়ালেট</b>
              <button onClick={() => setShowWallet(false)} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28 }}>✕</button>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#FFB300,#FF8A00)', borderRadius: 16, padding: 14, color: '#000', marginTop: 12 }}>
              <p style={{ margin: 0, fontSize: 13 }}>100 Coins = $1 • LIVE গিফট থেকে জমেছে</p>
              <h2 style={{ margin: '6px 0 2px', fontSize: 28 }}>Balance: ${balance.toFixed(2)}</h2>
              <p style={{ margin: '2px 0', fontSize: 13 }}>🪙 Total Coins: {coins} • ❤️ Likes: {likes}</p>
              <div onClick={() => { setShowWallet(false); setShowBank(true) }} style={{ background: 'rgba(255,255,255,0.4)', borderRadius: 10, padding: 9, marginTop: 8, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{bankLinked ? `✅ Bank Linked - ${bankInfo}` : '🏦 Bank Account লিঙ্ক করো - টাচ করো'}</span>
                <span>›</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 'bold', margin: '8px 0 0' }}>১ ডলার হলেই সঙ্গে সঙ্গে ব্যাংকে নিতে পারবে • Instant Bank Transfer</p>
            </div>
            <button onClick={handleWithdraw} style={{ width: '100%', background: canWithdraw ? 'linear-gradient(90deg,#FFB300,#FF2E2E)' : '#444', color: '#fff', border: 'none', padding: 13, borderRadius: 16, fontWeight: 'bold', fontSize: 16, marginTop: 12 }}>
              🏦 {canWithdraw ? `Withdraw to Bank - $${balance.toFixed(2)} তুলুন` : `Withdraw to Bank - $${balance.toFixed(2)} / $1.00`}
            </button>
            <p style={{ textAlign: 'center', color: '#888', fontSize: 11, margin: '8px 0 0' }}>একবার ব্যাংক লিঙ্ক করলেই প্রতিবার অটো জমা হবে</p>
          </div>
        )}

        {/* BANK LINK PANEL */}
        {showBank && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', color: '#000', borderRadius: '20px 20px 0 0', padding: 20, zIndex: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b>ব্যাংক অ্যাকাউন্ট লিঙ্ক করো</b>
              <button onClick={() => setShowBank(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: 28, height: 28 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#666' }}>একবার লিঙ্ক করলেই প্রতিবার টাকা অটো এই অ্যাকাউন্টে জমা হবে।</p>
            <input placeholder="UPI ID - যেমন 98765@paytm / Bank Account Number" value={bankInfo} onChange={e => setBankInfo(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', boxSizing: 'border-box' }} />
            <input placeholder="Account Holder Name" value={bankName} onChange={e => setBankName(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', marginTop: 8, boxSizing: 'border-box' }} />
            <button onClick={() => { if (!bankInfo) return alert('অ্যাকাউন্টটা লেখো'); setBankLinked(true); setShowBank(false); setShowWallet(true); alert('✅ ব্যাংক অ্যাকাউন্ট লিঙ্ক হয়ে গেছে! এখন $1 হলেই সঙ্গে সঙ্গে টাকা জমা হবে।') }} style={{ width: '100%', background: '#FF8A00', color: '#fff', border: 'none', padding: 13, borderRadius: 14, fontWeight: 'bold', marginTop: 12 }}>Link Bank Account</button>
          </div>
        )}

      </div>
    </div>
  )
}