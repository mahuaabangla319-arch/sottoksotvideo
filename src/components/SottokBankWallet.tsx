// SottokBankWallet.tsx - নতুন ফর্ম - পুরোনো সাইটে কিছু ডিলিট হবে না, শুধু ADD হবে
// Keep everything exactly as it is. Only ADD this inside Profile, below existing wallet card.
import { useState } from 'react'

export default function SottokBankWallet({ coins = 110, todayCoins = 0 }: { coins?: number, todayCoins?: number }) {
  const [bankLinked, setBankLinked] = useState(false)
  const [bankInfo, setBankInfo] = useState('')
  const [bankName, setBankName] = useState('')
  const [showBank, setShowBank] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Wallet logic: 100 Coins = $1
  const balance = coins / 100
  const canWithdraw = balance >= 1

  return (
    <div style={{ margin: '12px 16px', background: 'linear-gradient(135deg,#FFB300,#FF8A00,#FF6B00)', borderRadius: 20, padding: 16, color: '#000' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ fontSize: 17 }}>💰 আমার ওয়ালেট - টাকায় পরিণত</b>
        <span style={{ background: '#fff', padding: '3px 8px', borderRadius: 10, fontSize: 12, fontWeight: 'bold' }}>🪙 {coins}</span>
      </div>

      <h2 style={{ margin: '10px 0 2px', fontSize: 26 }}>Balance: ${balance.toFixed(2)}</h2>
      <p style={{ margin: 0, fontSize: 12 }}>100 Coins = $1 • Today's Earnings: ${(todayCoins / 100).toFixed(2)} • {todayCoins}/50 Coins</p>

      {/* Bank Linked - UPI / Bank Account Linked */}
      <div onClick={() => setShowBank(true)} style={{ background: 'rgba(255,255,255,0.35)', borderRadius: 12, padding: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold' }}>{bankLinked ? `✅ Bank Linked - ${bankInfo}` : '🏦 Bank Account লিঙ্ক করো - টাচ করো'}</span>
        <span>›</span>
      </div>
      <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>Bank Linked - UPI / Bank Account Linked</p>
      <p style={{ fontSize: 12, fontWeight: 'bold', margin: '8px 0 0' }}>১ ডলার হলেই সঙ্গে সঙ্গে ব্যাংকে নিতে পারবে • Instant Bank Transfer</p>

      {/* Withdraw to Bank */}
      <button onClick={() => {
        if (!bankLinked) return setShowBank(true)
        if (!canWithdraw) return alert(`এখন Balance $${balance.toFixed(2)} - $1 হলে তুলতে পারবে`)
        setShowSuccess(true)
      }} style={{ width: '100%', background: canWithdraw ? '#FFD700' : '#e0e0e0', border: 'none', padding: 13, borderRadius: 14, fontWeight: 'bold', fontSize: 16, marginTop: 10, cursor: 'pointer', color: '#000' }}>
        🏦 {canWithdraw ? `Withdraw to Bank - $${balance.toFixed(2)} তুলুন` : `Withdraw to Bank - $${balance.toFixed(2)} / $1.00`}
      </button>

      {/* Bank form - On click if bank not linked, open bank link form */}
      {showBank && (
        <div style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 14, color: '#000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>ব্যাংক অ্যাকাউন্ট লিঙ্ক করো</b>
            <button onClick={() => setShowBank(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: 26, height: 26 }}>✕</button>
          </div>
          <p style={{ fontSize: 12, color: '#666' }}>একবার লিঙ্ক করলেই প্রতিবার টাকা অটো এই অ্যাকাউন্টে জমা হবে।</p>
          <input placeholder="UPI ID / Bank Account Number" value={bankInfo} onChange={e => setBankInfo(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #ddd', boxSizing: 'border-box' }} />
          <input placeholder="Account Holder Name" value={bankName} onChange={e => setBankName(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #ddd', marginTop: 8, boxSizing: 'border-box' }} />
          <button onClick={() => {
            if (!bankInfo) return alert('অ্যাকাউন্টটা লেখো')
            if (!bankName) return alert('নামটা লেখো')
            setBankLinked(true)
            setShowBank(false)
            alert('✅ ব্যাংক অ্যাকাউন্ট লিঙ্ক হয়ে গেছে! এখন $1 হলেই সঙ্গে সঙ্গে টাকা জমা হবে।')
          }} style={{ width: '100%', background: '#FF8A00', color: '#fff', border: 'none', padding: 12, borderRadius: 12, fontWeight: 'bold', marginTop: 10 }}>
            Link Bank Account
          </button>
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div style={{ marginTop: 10, background: '#fff', borderRadius: 12, padding: 12, textAlign: 'center', color: '#000' }}>
          <b>✅ হয়ে গেছে!</b>
          <p style={{ fontSize: 13, margin: '4px 0 0' }}>${balance.toFixed(2)} তোমার ব্যাংকে ({bankInfo}) পাঠানো হচ্ছে। টাকা সঙ্গে সঙ্গে ব্যাংকে জমা হবে।</p>
          <button onClick={() => setShowSuccess(false)} style={{ marginTop: 8, border: 'none', background: '#FF8A00', color: '#fff', padding: '8px 16px', borderRadius: 10 }}>ঠিক আছে</button>
        </div>
      )}
    </div>
  )
}