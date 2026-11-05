import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: YoutubeGmailLogin,
})

// ===== এখানে তোমার Google Client ID বসাও - YouTube এর মতো চলার জন্য এইটুকুই লাগবে =====
const GOOGLE_CLIENT_ID = 'PASTE_TOMAR_CLIENT_ID_EKHANE'

function YoutubeGmailLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [showList, setShowList] = useState(false)
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newId, setNewId] = useState('')
  const [newPass, setNewPass] = useState('')

  // পুরোনো ইউজার - কিছু ডিলিট হবে না
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

  // Google এর আসল Script - YouTube যেটা ব্যবহার করে
  useEffect(() => {
    if ((window as any).google) { setGoogleReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => setGoogleReady(true)
    document.head.appendChild(s)
  }, [])

  // ইউজার সেভ করে অ্যাপ খোলা
  const saveAndOpen = (user: any) => {
    localStorage.setItem('vigo_user_name', user.name)
    localStorage.setItem('vigo_user_id', user.id)
    localStorage.setItem('vigo_user_email', user.email)
    localStorage.setItem('vigo_user_picture', user.picture || '')
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    localStorage.setItem('google_user', JSON.stringify(user))
    const old = JSON.parse(localStorage.getItem('sot_tok_users') || '[]')
    if (!old.find((x: any) => x.email === user.email)) localStorage.setItem('sot_tok_users', JSON.stringify([...old, user]))
    navigate({ to: '/feed' })
  }

  // ===== YouTube এর মতো Gmail - বাটন চাপলেই Gmail গুলো আসবে =====
  const handleYoutubeGmail = () => {
    if (!googleReady) { alert('Google লোড হচ্ছে ভাই, ২ সেকেন্ড পর আবার চাপো'); return }
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('PASTE')) {
      // Client ID না থাকলে পুরোনো লিস্ট দেখাবে, যাতে আটকে না থাকে
      setShowList(true)
      alert('ভাই, Client ID বসানো হয়নি!\n\nYouTube এর মতো আসল Gmail লিস্ট চাইলে উপরে Client ID বসাও।\nএখন আপাতত নিচের লিস্ট থেকে Gmail চয়েস করো, তাতেও খুলবে।')
      return
    }
    setLoading(true)
    const google = (window as any).google
    // এইটাই YouTube এর মতো Account Chooser খুলবে
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: async (res: any) => {
        try {
          // চয়েস করা Gmail এর আসল নাম + ছবি + Gmail আনছি
          const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${res.access_token}` },
          }).then(r => r.json())
          const user = { name: info.name, email: info.email, picture: info.picture, id: info.sub, loginType: 'google_youtube' }
          alert(`✅ ${user.name}\n${user.email}\n\nYouTube এর মতো Gmail দিয়ে খুলে গেছে!`)
          saveAndOpen(user)
        } catch {
          alert('Google থেকে তথ্য আনতে পারলাম না, আবার চেষ্টা করো')
          setLoading(false)
        }
      },
    })
    // এই লাইনটাই ফোনের Gmail গুলো দেখাবে
    client.requestAccessToken({ prompt: 'select_account' })
  }

  // নতুন আইডি বানানো - ছবির নিচের অংশ
  const handleCreateNew = () => {
    if (!newName.trim()) { alert('ভাই, পুরো নাম লেখো'); return }
    if (!newId.trim()) { alert('ভাই, Gmail আইডি লেখো'); return }
    if (newPass.length < 6) { alert('ভাই, পাসওয়ার্ড ৬ অক্ষরের দাও'); return }
    const clean = newId.toLowerCase().replace(/[^a-z0-9]/g, '')
    const user = { name: newName, email: clean + '@sottok.com', id: clean, loginType: 'sottok_new' }
    saveAndOpen(user)
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ color: '#ffcc00', fontSize: 19, fontWeight: 'bold', textAlign: 'center' }}>নিজের পরিচয় নিজেই তৈরি করো</p>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14, lineHeight: 1.6 }}>Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে এবং আপনার নাম সিস্টেমে সুরক্ষিত থাকবে।</p>
      <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '12px 0' }}>🛡️ 100% Safe & Private</div>

      {/* YouTube এর মতো Gmail বাটন */}
      <button onClick={handleYoutubeGmail} disabled={loading} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontSize: 19, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ background: '#fff', color: '#4285F4', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold' }}>G</span>
        {loading ? 'Gmail খুলছে...' : !googleReady ? 'Google লোড হচ্ছে...' : 'Gmail দিয়ে চালিয়ে যান'}
      </button>
      <p style={{ fontSize: 11, color: '#888', marginTop: 8, textAlign: 'center' }}>YouTube এর মতো - চাপ দিলেই Gmail গুলো আসবে, একটা চাপলেই অ্যাপ খুলবে</p>

      {/* Client ID না থাকলে পুরোনো Gmail লিস্ট */}
      {showList && oldUsers.length > 0 && (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginTop: 12 }}>
          <b>👇 তোমার Gmail চয়েস করো</b>
          {oldUsers.map((u: any, i: number) => (
            <button key={i} onClick={() => saveAndOpen(u)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ background: '#fff', color: '#4285F4', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>
              <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{u.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{u.email}</span></span>
              <span>→</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
        <span style={{ color: '#888', fontSize: 13 }}>অথবা</span>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
      </div>

      <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
        <b style={{ fontSize: 17 }}>নতুন Gmail খুলতে চাই</b>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="পুরো নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 12, boxSizing: 'border-box' }} />
        <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="sottok123" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
        <p style={{ fontSize: 13, color: '#aaa' }}>নতুন gmail আইডি লিখুন — আপনার ঠিকানা হবে<br /><span style={{ color: '#ffcc00' }}>{newId ? newId.toLowerCase().replace(/[^a-z0-9]/g, '') : 'sottok123'}@sottok.com</span></p>
        <input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
        <button onClick={handleCreateNew} style={{ width: '100%', background: '#ffcc00', color: '#000', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12, fontSize: 17 }}>নতুন আইডি তৈরি করুন</button>
      </div>
      <p style={{ fontSize: 11, color: '#555', marginTop: 14 }}>Privacy Policy • Terms of Service</p>
    </div>
  )
}