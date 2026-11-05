import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: PlayLogin,
})

function PlayLogin() {
  const navigate = useNavigate()
  const [showGmail, setShowGmail] = useState(false)
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [myGmail, setMyGmail] = useState('')
  const [myName, setMyName] = useState('')
  const [newName, setNewName] = useState('')
  const [newId, setNewId] = useState('')

  useEffect(() => {
    try {
      const list: any[] = []
      ;['sot_tok_users', 'vigo_users', 'sot_tok_user', 'google_user'].forEach(k => {
        const v = localStorage.getItem(k)
        if (v) {
          try {
            const p = JSON.parse(v)
            if (Array.isArray(p)) list.push(...p)
            else if (p.email) list.push(p)
          } catch {}
        }
      })
      setOldUsers(list.filter((u, i, a) => a.findIndex(x => x.email === u.email) === i && u.email))
    } catch {}
  }, [])

  const openApp = (gmail: string, name?: string) => {
    const finalName = name || gmail.split('@')[0]
    const user = { name: finalName, email: gmail, id: gmail }
    localStorage.setItem('vigo_user_name', finalName)
    localStorage.setItem('vigo_user_id', gmail)
    localStorage.setItem('vigo_user_email', gmail)
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    const old = JSON.parse(localStorage.getItem('sot_tok_users') || '[]')
    if (!old.find((x: any) => x.email === gmail)) localStorage.setItem('sot_tok_users', JSON.stringify([...old, user]))
    navigate({ to: '/feed' })
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: 36, color: '#4d7cff' }}>SOT TOK</h1>
      <p style={{ color: '#ffcc00', fontSize: 18 }}>নিজের পরিচয় নিজেই তৈরি করো</p>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে।</p>
      <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0' }}>🛡️ 100% Safe & Private</div>

      {!showGmail ? (
        <button onClick={() => setShowGmail(true)} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 15, borderRadius: 14, fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ background: '#fff', color: '#4285F4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>G</span>
          Gmail দিয়ে চালিয়ে যান
        </button>
      ) : (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
          <b>👇 তোমার Gmail চয়েস করো</b>
          {oldUsers.length > 0 ? oldUsers.map((u: any, i: number) => (
            <button key={i} onClick={() => openApp(u.email, u.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ background: '#fff', color: '#4285F4', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>
              <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{u.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{u.email}</span></span>
              <span>→</span>
            </button>
          )) : <p style={{ color: '#aaa', fontSize: 13, marginTop: 10 }}>নিচে তোমার Gmail লেখো, ক্লিক করলেই খুলবে</p>}
          <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 12, boxSizing: 'border-box' }} />
          <input value={myGmail} onChange={e => setMyGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 8, boxSizing: 'border-box' }} />
          <button onClick={() => { if (!myGmail.trim()) return alert('Gmail টা লেখো ভাই'); let g = myGmail.trim().toLowerCase(); if (!g.includes('@')) g += '@gmail.com'; openApp(g, myName || undefined) }} style={{ width: '100%', background: '#00c853', color: '#fff', border: 'none', padding: 13, borderRadius: 12, fontWeight: 'bold', marginTop: 10 }}>✅ এই Gmail দিয়ে ঢুকে যাও</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10, margin: '18px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
        <span style={{ color: '#888', fontSize: 13 }}>অথবা</span>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
      </div>

      <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
        <b>নতুন Gmail খুলতে চাই</b>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="পুরো নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 12, boxSizing: 'border-box' }} />
        <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="sottok123" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
        <p style={{ fontSize: 13, color: '#aaa' }}>তোমার ঠিকানা হবে<br /><span style={{ color: '#ffcc00' }}>{newId ? newId.toLowerCase().replace(/[^a-z0-9]/g, '') : 'sottok123'}@sottok.com</span></p>
        <button onClick={() => { if (!newName.trim() || !newId.trim()) return alert('নাম + আইডি লেখো'); const clean = newId.toLowerCase().replace(/[^a-z0-9]/g, ''); openApp(clean + '@sottok.com', newName) }} style={{ width: '100%', background: '#ff3b5c', color: '#fff', border: 'none', padding: 13, borderRadius: 12, fontWeight: 'bold', marginTop: 12 }}>✅ অ্যাকাউন্ট বানিয়ে ঢুকে যাও</button>
      </div>
    </div>
  )
}