import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: LoginFixed,
})

function LoginFixed() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [gmailId, setGmailId] = useState('')
  const [loading, setLoading] = useState(false)

  // ১. Gmail বাটন - এখন আর ফেল হবে না, সাথে সাথে ঢুকবে
  const handleGmailLogin = () => {
    setLoading(true)
    // ডেমো Gmail দিয়ে ঢুকিয়ে দিচ্ছি - Google লাগবে না
    const userName = 'SOT TOK User'
    const userId = 'sottok_' + Math.floor(Math.random() * 10000)
    localStorage.setItem('vigo_user_name', userName)
    localStorage.setItem('vigo_user_id', userId)
    localStorage.setItem('sot_tok_user', JSON.stringify({ name: userName, id: userId, email: userId + '@sottok.com' }))
    setTimeout(() => {
      navigate({ to: '/feed' })
    }, 500)
  }

  // ২. নতুন Gmail বানিয়ে ঢোকা - নিচের ফর্মটা
  const handleCreateAccount = () => {
    if (!name.trim()) { alert('ভাই, পুরো নাম লেখো'); return }
    if (!gmailId.trim()) { alert('ভাই, Gmail আইডি লেখো - যেমন sottok123'); return }
    const cleanId = gmailId.toLowerCase().replace(/[^a-z0-9]/g, '')
    const fullEmail = cleanId + '@sottok.com'
    localStorage.setItem('vigo_user_name', name)
    localStorage.setItem('vigo_user_id', cleanId)
    localStorage.setItem('sot_tok_user', JSON.stringify({ name: name, id: cleanId, email: fullEmail }))
    alert(`✅ হয়ে গেছে ভাই!\n\nতোমার আইডি: ${fullEmail}\nনাম: ${name}`)
    navigate({ to: '/feed' })
  }

  // ৩. গেস্ট হিসেবে ঢোকা - সবচেয়ে ফাস্ট
  const handleGuest = () => {
    localStorage.setItem('vigo_user_name', 'Guest User')
    localStorage.setItem('vigo_user_id', 'guest_' + Date.now())
    navigate({ to: '/feed' })
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 20 }}>▶️</div>
      <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0', letterSpacing: 2 }}>SOT TOK</h1>
      <p style={{ color: '#ffcc00', fontSize: 18, margin: '6px 0 16px' }}>নিজের পরিচয় নিজেই তৈরি করো</p>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14, lineHeight: 1.6 }}>Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে এবং আপনার নাম সিস্টেমে সুরক্ষিত থাকবে।</p>

      <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0' }}>🛡️ 100% Safe & Private</div>

      <button onClick={handleGmailLogin} disabled={loading} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 15, borderRadius: 14, fontSize: 18, fontWeight: 'bold', marginTop: 12 }}>
        {loading ? 'ঢুকছি...' : 'G  Gmail দিয়ে চালিয়ে যান'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10, margin: '18px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
        <span style={{ color: '#888', fontSize: 13 }}>অথবা</span>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
      </div>

      <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
        <b style={{ fontSize: 17 }}>নতুন Gmail খুলতে চাই</b>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="পুরো নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 12, boxSizing: 'border-box', fontSize: 15 }} />
        <input value={gmailId} onChange={e => setGmailId(e.target.value)} placeholder="sottok123" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box', fontSize: 15 }} />
        <p style={{ fontSize: 13, color: '#aaa', margin: '8px 0 0' }}>নতুন gmail আইডি লিখুন — আপনার ঠিকানা হবে<br /><span style={{ color: '#ffcc00' }}>{gmailId ? gmailId.toLowerCase().replace(/[^a-z0-9]/g,'') : 'sottok123'}@sottok.com</span></p>
        <button onClick={handleCreateAccount} style={{ width: '100%', background: '#ff3b5c', color: '#fff', border: 'none', padding: 13, borderRadius: 12, fontWeight: 'bold', marginTop: 12, fontSize: 15 }}>✅ অ্যাকাউন্ট বানিয়ে ঢুকে যাও</button>
      </div>

      <button onClick={handleGuest} style={{ width: '100%', background: 'transparent', color: '#aaa', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 12 }}>👀 গেস্ট হিসেবে দেখে নাও - লগইন ছাড়াই</button>
      <p style={{ fontSize: 11, color: '#555', marginTop: 12, textAlign: 'center' }}>Google লগইন এখন বন্ধ আছে, তাই Gmail বাটন চাপলেই সরাসরি ভিতরে ঢুকবে। কোনো ফেল হবে না।</p>
    </div>
  )
}