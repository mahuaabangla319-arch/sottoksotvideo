 // SottokBankWallet.tsx - সবার জন্য - ALL USERS - এই আপডেট রেখেই ADD হবে
// Update index.tsx - Published Nov 5, 5:41 PM - Do NOT restore / delete
// প্রত্যেক ইউজার তার নিজের ভিডিওর টাকা, তার নিজের ব্যাংকে তুলবে
import { useState, useEffect } from 'react'

export default function SottokBankWallet({ userId = 'me', coins = 0, todayCoins = 0 }: { userId?: string, coins?: number, todayCoins?: number }) {
  // প্রত্যেক ইউজারের ব্যাংক আলাদা করে সেভ হবে - localStorage এ userId দিয়ে
  const [bankLinked, setBankLinked] = useState(false)
  const [bankInfo, setBankInfo] = useState('')
  const [bankName, setBankName] = useState('')
  const [showBank, setShowBank] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [myCoins, setMyCoins] = useState(coins)
  const [history, setHistory] = useState<any[]>([])

  // ইউজার বদলালে তার কয়েন / ব্যাংক লোড হবে
  useEffect(() => {
    setMyCoins(coins)
    const savedBank = localStorage.getItem(`sottok_bank_${userId}`)
    if (savedBank) {
      const b = JSON.parse(savedBank)
      setBankLinked(true); setBankInfo(b.bankInfo); setBankName(b.bankName)
    }
    const savedHistory = localStorage.getItem(`sottok_history_${userId}`)
    if (savedHistory) setHistory(JSON.parse(savedHistory))
  }, [userId, coins])

  // সবার জন্য একই নিয়ম: 100 Coins = $1
  const balance = myCoins / 100
  const canWithdraw = balance >= 1

  const handleWithdraw = () => {
    if (!bankLinked) return setShowBank(true)
    if (!canWithdraw) return alert(`এখন Balance $${balance.toFixed(2)} - $1 হলে তুলতে পারবে`)
    // এই ইউজারের হিস্টোরি সেভ হবে - অন্য ইউজার দেখতে পাবে না
    const newHistory = [{ amount: balance, bank: bankInfo, time: new Date().toLocaleString('bn-IN'), status: '✅ পাঠানো হয়েছে' }, ...history]
    setHistory(newHistory)
    localStorage.setItem(`sottok_history_${userId}`, JSON.stringify(newHistory))
    setShowSuccess(true)
  }

  return (
    <div style={{ margin: '12px 16px', background: 'linear-gradient(135deg,#FFB300,#FF8A00,#FF6B00)', borderRadius: 20, padding: 16, color: '#000' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <b style={{ fontSize: 17 }}>💰 আমার ওয়ালেট - সবার জন্য টাকা তোলা চালু</b>
        <span style={{ background: '#fff', padding: '3px 8px', borderRadius: 10, fontSize: 12, fontWeight: 'bold' }}>🪙 {myCoins}</span>
      </div>

      <h2 style={{ margin: '10px 0 2px', fontSize: 26 }}>Balance: ${balance.toFixed(2)}</h2>
      <p style={{ margin: 0, fontSize: 12 }}>100 Coins = $1 • ভিডিও করলেই টাকা জমবে • Today's Earnings: ${(todayCoins / 100).toFixed(2)} • {todayCoins}/50 Coins</p>

      {/* প্রত্যেক ইউজারের নিজের ব্যাংক */}
      <div onClick={() => setShowBank(true)} style={{ background: 'rgba(255,255,255,0.35)', borderRadius: 12, padding: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold' }}>{bankLinked ? `✅ Bank Linked - ${bankInfo}` : '🏦 তোমার Bank Account লিঙ্ক করো - টাচ করো'}</span>
        <span>›</span>
      </div>
      <p style={{ fontSize: 12, margin: '4px 0 0' }}>Bank Linked - UPI / Bank Account Linked • তোমার নিজের অ্যাকাউন্ট</p>
      <p style={{ fontSize: 12, fontWeight: 'bold', margin: '8px 0 0' }}>১ ডলার হলেই সঙ্গে সঙ্গে তোমার ব্যাংকে নিতে পারবে • Instant Bank Transfer</p>

      {/* সবার জন্য Withdraw */}
      <button onClick={handleWithdraw} style={{ width: '100%', background: canWithdraw ? '#FFD700' : '#e0e0e0', border: 'none', padding: 13, borderRadius: 14, fontWeight: 'bold', fontSize: 16, marginTop: 10, color: '#000' }}>
        🏦 {canWithdraw ? `Withdraw to Bank - $${balance.toFixed(2)} তুলুন` : `Withdraw to Bank - $${balance.toFixed(2)} / $1.00`}
      </button>

      {showBank && (
        <div style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 14, color: '#000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>তোমার ব্যাংক অ্যাকাউন্ট লিঙ্ক করো</b><button onClick={() => setShowBank(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: 26, height: 26 }}>✕</button></div>
          <p style={{ fontSize: 12, color: '#666' }}>একবার লিঙ্ক করলেই প্রতিবার টাকা অটো তোমার এই অ্যাকাউন্টে জমা হবে। অন্য কেউ দেখতে পাবে না।</p>
          <input placeholder="তোমার UPI ID / Bank Account Number" value={bankInfo} onChange={e => setBankInfo(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #ddd', boxSizing: 'border-box' }} />
          <input placeholder="তোমার Account Holder Name" value={bankName} onChange={e => setBankName(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid #ddd', marginTop: 8, boxSizing: 'border-box' }} />
          <button onClick={() => {
            if (!bankInfo) return alert('অ্যাকাউন্টটা লেখো')
            if (!bankName) return alert('নামটা লেখো')
            setBankLinked(true); setShowBank(false)
            localStorage.setItem(`sottok_bank_${userId}`, JSON.stringify({ bankInfo, bankName }))
            alert('✅ তোমার ব্যাংক অ্যাকাউন্ট লিঙ্ক হয়ে গেছে! এখন $1 হলেই সঙ্গে সঙ্গে তোমার ব্যাংকে টাকা জমা হবে।')
          }} style={{ width: '100%', background: '#FF8A00', color: '#fff', border: 'none', padding: 12, borderRadius: 12, fontWeight: 'bold', marginTop: 10 }}>Link Bank Account</button>
        </div>
      )}

      {showSuccess && (
        <div style={{ marginTop: 10, background: '#fff', borderRadius: 12, padding: 12, textAlign: 'center', color: '#000' }}>
          <b>✅ টাকা তোলা হয়ে গেছে!</b>
          <p style={{ fontSize: 13, margin: '4px 0 0' }}>${balance.toFixed(2)} তোমার ব্যাংকে ({bankInfo}) পাঠানো হচ্ছে। টাকা সঙ্গে সঙ্গে তোমার ব্যাংকে জমা হবে।</p>
          <button onClick={() => { setMyCoins(0); setShowSuccess(false) }} style={{ marginTop: 8, border: 'none', background: '#FF8A00', color: '#fff', padding: '8px 16px', borderRadius: 10 }}>ঠিক আছে</button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 10, color: '#000' }}>
          <b style={{ fontSize: 13 }}>🧾 তোমার Withdraw History</b>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6 }}>
              <span>${h.amount.toFixed(2)} • {h.bank}</span>
              <span>{h.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}