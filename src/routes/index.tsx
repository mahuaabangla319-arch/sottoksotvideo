import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LoginOriginalGmailSelect,
})

// ===== এখানে তোমার আসল Client ID বসাও =====
const GOOGLE_CLIENT_ID = 'PASTE_TOMAR_CLIENT_ID_EKHANE'

function LoginOriginalGmailSelect() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [oldVideos, setOldVideos] = useState<any[]>([])
  const [name, setName] = useState('')
  const [gmailId, setGmailId] = useState('')

  // পুরোনো সব ফিরিয়ে আনা - কিছু ডিলিট হবে না
  useEffect(() => {
    try {
      const allUsers: any[] = []
      ;['vigo_user_name', 'sot_tok_user', 'google_user', 'sot_tok_users', 'vigo_users', 'users'].forEach(k => {
        const v = localStorage.getItem(k)
        if (v) {
          try {
            const p = JSON.parse(v)
            if (Array.isArray(p)) allUsers.push(...p)
            else if (p.name) allUsers.push(p)
            else allUsers.push({ name: v, email: v + '@sottok.com', id: k })
          } catch { allUsers.push({ name: v, email: v + '@sottok.com', id: k }) }
        }
      })
      const uniq = allUsers.filter((u, i, a) => a.findIndex(x => x.name === u.name) === i && u.name && u.name !== 'Tumi')
      setOldUsers(uniq)
      let vids: any[] = []
      ;['sot_tok_feed', 'vigo_feed', 'feed', 'videos'].forEach(f => {
        const v = localStorage.getItem(f)
        if (v) { try { vids = [...vids, ...JSON.parse(v)] } catch {} }
      })
      setOldVideos(vids.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i))
    } catch {}
  }, [])

  // Google এর আসল Script লোড
  useEffect(() => {
    if ((window as any).google) { setGoogleReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => setGoogleReady(true)
    document.head.appendChild(s)
  }, [])

  // ===== আসল Gmail সিলেক্ট - এইটাই তুমি চাইছো =====
  const handleGmailSelect = () => {
    if (!googleReady) { alert('Google লোড হচ্ছে ভাই, ২ সেকেন্ড পর আবার চাপো'); return }
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'PASTE_TOMAR_CLIENT_ID_EKHANE') {
      alert('ভাই, Client ID বসানো হয়নি!\n\nconsole.cloud.google.com থেকে Client ID নিয়ে Code এর উপরে বসাও। তারপর Gmail গুলো আসবে।')
      return
    }
    setLoading(true)
    const google = (window as any).google

    // ১. প্রথমে Google Account Chooser খুলবে - Gmail গুলো আসবে
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      // এই prompt টাই Gmail লিস্ট খুলবে
      callback: async (res: any) => {
        try {
          // ২. চয়েস করা Gmail এর আসল তথ্য আনছি
          const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${res.access_token}` },
          }).then(r => r.json())

          // ৩. সেই Gmail দিয়েই অ্যাকাউন্ট খুলে দিচ্ছি
          const user = {
            name: info.name,
            email: info.email,
            picture: info.picture,
            id: info.sub,
            loginType: 'google_original',
            time: new Date().toISOString(),
          }

          // ৪. এই Gmail কে SOT TOK এর ইউজার হিসেবে সেভ করছি - যাতে এই অ্যাকাউন্ট থেকে ভিডিও ছাড়তে পারে
          localStorage.setItem('vigo_user_name', user.name)
          localStorage.setItem('vigo_user_id', user.id)
          localStorage.setItem('vigo_user_email', user.email)
          localStorage.setItem('vigo_user_picture', user.picture || '')
          localStorage.setItem('sot_tok_user', JSON.stringify(user))
          localStorage.setItem('google_user', JSON.stringify(user))

          // পুরোনো লিস্টে যোগ করছি, মুছছি না
          const oldList = JSON.parse(localStorage.getItem('sot_tok_users') || '[]')
          if (!oldList.find((x: any) => x.email === user.email)) {
            localStorage.setItem('sot_tok_users', JSON.stringify([...oldList, user]))
          }

          alert(`✅ ${user.name}\n${user.email}\n\nএই Gmail দিয়ে অ্যাকাউন্ট খুলে গেছে!\nএখন এই অ্যাকাউন্ট থেকেই ভিডিও ছাড়তে পারবে।`)
          navigate({ to: '/feed' })
        } catch {
          alert('Google থেকে তথ্য আনতে পারলাম না, আবার চেষ্টা করো')
          setLoading(false)
        }
      },
    })
    // এই লাইনটাই Gmail সিলেক্ট করার পেজ খুলবে
    client.requestAccessToken({ prompt: 'select_account' })
  }

  const handleCreateAccount = () => {
    if (!name.trim() || !gmailId.trim()) { alert('নাম আর Gmail আইডি লেখো ভাই'); return }
    const clean = gmailId.toLowerCase().replace(/[^a-z0-9]/g, '')
    const user = { name, id: clean, email: clean + '@sottok.com', loginType: 'sottok_create' }
    localStorage.setItem('vigo_user_name', name)
    localStorage.setItem('vigo_user_id', clean)
    localStorage.setItem('vigo_user_email', clean + '@sottok.com')
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    navigate({ to: '/feed' })
  }

  const handleRestore = (u: any) => {
    localStorage.setItem('vigo_user_name', u.name)
    localStorage.setItem('vigo_user_id', u.id || u.name)
    localStorage.setItem('vigo_user_email', u.email || '')
    localStorage.setItem('sot_tok_user', JSON.stringify(u))
    navigate({ to: '/feed' })
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 20 }}>▶️</div>
      <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0', letterSpacing: 2 }}>SOT TOK</h1>
      <p style={{ color: '#ffcc00', fontSize: 18, margin: '6px 0 16px' }}>নিজের পরিচয় নিজেই তৈরি করো</p>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14, lineHeight: 1.6 }}>Gmail এ ক্লিক করুন, আপনার Gmail গুলো আসবে, একটা চয়েস করুন, সেই অ্যাকাউন্ট খুলে যাবে। সেই অ্যাকাউন্ট থেকেই ভিডিও ছাড়তে পারবেন। পুরোনো সব একই থাকবে।</p>

      <div style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 14, padding: 12, margin: '12px 0' }}>
        <b style={{ fontSize: 14 }}>♻️ পুরোনো ডাটা আছে</b>
        <div style={{ fontSize: 12, color: '#aaa' }}>ইউজার: {oldUsers.length} জন • ভিডিও: {oldVideos.length} টা • কিছু ডিলিট হয়নি</div>
      </div>

      <button onClick={handleGmailSelect} disabled={loading || !googleReady} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: 15, borderRadius: 14, fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ background: '#4285F4', color: '#fff', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>G</span>
        {loading ? 'Gmail খুলছে...' : !googleReady ? 'Google লোড হচ্ছে...' : 'Gmail দিয়ে চালিয়ে যান'}
      </button>
      <p style={{ fontSize: 11, color: '#888', marginTop: 6 }}>চাপ দিলেই Gmail গুলো আসবে, চয়েস করলেই অ্যাকাউন্ট খুলবে</p>

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
        <span style={{ color: '#888', fontSize: 13 }}>অথবা</span>
        <div style={{ flex: 1, height: 1, background: '#333' }} />
      </div>

      <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
        <b>নতুন Gmail খুলতে চাই</b>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="পুরো নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 12, boxSizing: 'border-box' }} />
        <input value={gmailId} onChange={e => setGmailId(e.target.value)} placeholder="sottok123" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
        <p style={{ fontSize: 13, color: '#aaa' }}>ঠিকানা হবে <span style={{ color: '#ffcc00' }}>{gmailId ? gmailId.toLowerCase().replace(/[^a-z0-9]/g, '') : 'sottok123'}@sottok.com</span></p>
        <button onClick={handleCreateAccount} style={{ width: '100%', background: '#ff3b5c', color: '#fff', border: 'none', padding: 13, borderRadius: 12, fontWeight: 'bold', marginTop: 10 }}>✅ অ্যাকাউন্ট বানিয়ে ঢুকে যাও</button>
      </div>

      {oldUsers.length > 0 && (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginTop: 12 }}>
          <b>♻️ পুরোনো অ্যাকাউন্ট</b>
          {oldUsers.map((u: any, i: number) => (
            <div key={i} onClick={() => handleRestore(u)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: 12, borderRadius: 10, marginTop: 8, border: '1px solid #222' }}>
              <div><b>{u.name}</b><div style={{ fontSize: 11, color: '#aaa' }}>{u.email}</div></div>
              <span style={{ background: '#00c853', padding: '6px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>খুলো →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}