import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: OneGmailOneAccount,
})

function OneGmailOneAccount() {
  const navigate = useNavigate()
  const [myGmail, setMyGmail] = useState('')
  const [myName, setMyName] = useState('')
  const [oldAccount, setOldAccount] = useState<any>(null)

  // এই ফোনে আগেই কোনো অ্যাকাউন্ট খোলা আছে কিনা দেখো
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sot_tok_user') || localStorage.getItem('google_user')
      if (saved) {
        const u = JSON.parse(saved)
        if (u.email) setOldAccount(u)
      }
      // পুরোনো লিস্ট থেকেও দেখো
      const list = JSON.parse(localStorage.getItem('sot_tok_users') || '[]')
      if (list.length > 0 && !saved) setOldAccount(list[0])
    } catch {}
  }, [])

  const openAccount = (gmailInput: string, nameInput?: string) => {
    let g = gmailInput.trim().toLowerCase()
    if (!g) { alert('ভাই, Gmail টা লেখো'); return }
    if (!g.includes('@')) g += '@gmail.com'

    // ===== ১ নম্বর নিয়ম: একটা Gmail = একটা অ্যাকাউন্ট =====
    // যদি এই ফোনে আগেই একটা অ্যাকাউন্ট থাকে
    if (oldAccount && oldAccount.email) {
      const oldEmail = oldAccount.email.toLowerCase()
      // আর সে যদি অন্য Gmail দিয়ে ঢুকতে চায় -> ব্লক করে দাও
      if (g !== oldEmail) {
        alert(`⛔ ভাই, তুমি আর নতুন অ্যাকাউন্ট খুলতে পারবে না!\n\nতোমার অ্যাকাউন্ট আগেই এই Gmail দিয়ে খোলা আছে:\n${oldEmail}\n\nওই Gmail দিয়েই লগইন করো, তোমার পুরোনো অ্যাকাউন্ট খুলে যাবে।`)
        return
      }
      // একই Gmail হলে -> পুরোনো অ্যাকাউন্টই খুলে যাবে, নতুন বানাবে না
      navigate({ to: '/feed' })
      return
    }

    // ===== নতুন অ্যাকাউন্ট - প্রথমবার =====
    const finalName = nameInput || g.split('@')[0]
    const user = { name: finalName, email: g, id: g, loginType: 'gmail', createdAt: new Date().toISOString() }
    // এই ফোনে এই একটাই অ্যাকাউন্ট লক করে দিলাম
    localStorage.setItem('vigo_user_name', finalName)
    localStorage.setItem('vigo_user_id', g)
    localStorage.setItem('vigo_user_email', g)
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    localStorage.setItem('google_user', JSON.stringify(user))
    localStorage.setItem('sot_tok_users', JSON.stringify([user])) // শুধু ১টাই রাখলাম, ২টা রাখলাম না
    localStorage.setItem('sottok_device_locked_email', g) // ডিভাইস লক
    setOldAccount(user)
    navigate({ to: '/feed' })
  }

  // লগআউট করলেও নতুন অ্যাকাউন্ট বানাতে দেবো না, শুধু পুরোনোটা দিয়েই ঢুকতে হবে
  // এইটা চাইলে প্রোফাইল পেজে লগআউট বাটনে ব্যবহার করবে

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0' }}>SOT TOK</h1>
      <p style={{ color: '#ffcc00', fontSize: 18 }}>নিজের পরিচয় নিজেই তৈরি করো</p>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>একটা Gmail = একটা অ্যাকাউন্ট। দ্বিতীয় Gmail দিয়ে নতুন অ্যাকাউন্ট খোলা যাবে না।</p>
      <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0' }}>🛡️ 1 Gmail = 1 Account • 100% Safe</div>

      {/* যদি আগেই অ্যাকাউন্ট থাকে, তাহলে ওইটাই দেখাবে */}
      {oldAccount ? (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
          <b style={{ fontSize: 16 }}>✅ তোমার অ্যাকাউন্ট খোলা আছে</b>
          <p style={{ fontSize: 13, color: '#aaa' }}>তুমি আর নতুন অ্যাকাউন্ট খুলতে পারবে না। এই Gmail দিয়েই ঢুকতে হবে।</p>
          <button onClick={() => openAccount(oldAccount.email, oldAccount.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
            <span style={{ background: '#4285F4', color: '#fff', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>
            <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{oldAccount.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{oldAccount.email}</span></span>
            <span>→</span>
          </button>
          <p style={{ fontSize: 12, color: '#ffcc00', textAlign: 'center', marginTop: 10 }}>👆 এই Gmail এ চাপ দিলেই তোমার পুরোনো অ্যাকাউন্ট খুলে যাবে</p>
        </div>
      ) : (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
          <b style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#fff', color: '#4285F4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>
            Gmail দিয়ে চালিয়ে যান
          </b>
          <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 14, boxSizing: 'border-box' }} />
          <input value={myGmail} onChange={e => setMyGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
          <button onClick={() => openAccount(myGmail, myName)} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12 }}>✅ এই Gmail দিয়ে অ্যাকাউন্ট খুলো</button>
          <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>একবার খুলে গেলে এই Gmail দিয়েই সবসময় ঢুকতে হবে।</p>
        </div>
      )}

      {/* নিচে অন্য Gmail দিয়ে ঢোকার চেষ্টা করলে ব্লক হবে */}
      {oldAccount && (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginTop: 14 }}>
          <b style={{ fontSize: 14 }}>অন্য Gmail দিয়ে চেষ্টা করো?</b>
          <input value={myGmail} onChange={e => setMyGmail(e.target.value)} placeholder="অন্য Gmail লিখে দেখো" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
          <button onClick={() => openAccount(myGmail)} style={{ width: '100%', background: '#333', color: '#fff', border: 'none', padding: 12, borderRadius: 12, marginTop: 10 }}>চেষ্টা করো</button>
          <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>অন্য Gmail দিলে ব্লক হয়ে যাবে, পুরোনোটাই খুলবে।</p>
        </div>
      )}
    </div>
  )
}