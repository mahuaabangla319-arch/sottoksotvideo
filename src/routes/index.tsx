import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: GmailOnlyFinal,
})

function GmailOnlyFinal() {
  const navigate = useNavigate()
  const [showList, setShowList] = useState(false)
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [manualGmail, setManualGmail] = useState('')
  const [manualName, setManualName] = useState('')

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
      const uniq = list.filter((u, i, a) => a.findIndex(x => x.email === u.email) === i && u.email)
      setOldUsers(uniq)
    } catch {}
  }, [])

  // ===== ক্লিক করলেই অ্যাপ খুলে যাবে =====
  const openAppWithGmail = (gmail: string, name?: string) => {
    const finalName = name || gmail.split('@')[0]
    const user = { name: finalName, email: gmail, id: gmail, loginType: 'gmail' }
    localStorage.setItem('vigo_user_name', finalName)
    localStorage.setItem('vigo_user_id', gmail)
    localStorage.setItem('vigo_user_email', gmail)
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    localStorage.setItem('google_user', JSON.stringify(user))
    const old = JSON.parse(localStorage.getItem('sot_tok_users') || '[]')
    if (!old.find((x: any) => x.email === gmail)) localStorage.setItem('sot_tok_users', JSON.stringify([...old, user]))
    // সঙ্গে সঙ্গে অ্যাপ খুলে যাবে
    navigate({ to: '/feed' })
  }

  const handleGmailClick = () => {
    setShowList(true)
    // ফোনের আসল Gmail Chooser খুলবে - ID ছাড়াই
    try { window.open('https://accounts.google.com/AccountChooser', '_blank') } catch {}
  }

  const handleManual = () => {
    if (!manualGmail.trim()) { alert('ভাই, Gmail টা লেখো'); return }
    let g = manualGmail.trim().toLowerCase()
    if (!g.includes('@')) g += '@gmail.com'
    openAppWithGmail(g, manualName || undefined)
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 30 }}>▶️</div>
      <h1 style={{ fontSize: 38, color: '#4d7cff', margin: '16px 0 0', letterSpacing: 2 }}>SOT TOK</h1>
      <p style={{ color: '#ffcc00', fontSize: 18, margin: '6px 0 20px' }}>নিজের পরিচয় নিজেই তৈরি করো</p>

      {!showList ? (
        <>
          <button onClick={handleGmailClick} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: 16, borderRadius: 14, fontSize: 19, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ background: '#4285F4', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>G</span>
            Gmail দিয়ে চালিয়ে যান
          </button>
          <p style={{ fontSize: 12, color: '#888', marginTop: 10, textAlign: 'center' }}>ক্লিক করলেই ফোনের Gmail গুলো আসবে, একটায় ক্লিক করলেই অ্যাপ খুলে যাবে</p>
        </>
      ) : (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
          <b style={{ fontSize: 16 }}>👇 তোমার Gmail চয়েস করো</b>
          <p style={{ fontSize: 12, color: '#aaa', margin: '6px 0 0' }}>ফোনে যার যেমন Gmail আছে, একটায় ক্লিক করলেই অ্যাপ খুলে যাবে</p>

          {oldUsers.length > 0 ? oldUsers.map((u: any, i: number) => (
            <button key={i} onClick={() => openAppWithGmail(u.email, u.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 13, borderRadius: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ background: '#4285F4', color: '#fff', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }}>G</span>
              <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{u.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{u.email}</span></span>
              <span>→</span>
            </button>
          )) : (
            <div style={{ background: '#000', padding: 12, borderRadius: 10, marginTop: 10, fontSize: 13, color: '#aaa', textAlign: 'center' }}>
              উপরে Google এর পেজে তোমার Gmail গুলো দেখতে পাবে।<br />ওই Gmail টা নিচে লেখো, ক্লিক করলেই খুলবে।
            </div>
          )}

          <div style={{ marginTop: 14, borderTop: '1px solid #222', paddingTop: 12 }}>
            <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', boxSizing: 'border-box' }} />
            <input value={manualGmail} onChange={e => setManualGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 8, boxSizing: 'border-box' }} />
            <button onClick={handleManual} style={{ width: '100%', background: '#00c853', color: '#fff', border: 'none', padding: 13, borderRadius: 12, fontWeight: 'bold', marginTop: 10 }}>✅ এই Gmail দিয়ে অ্যাপ খুলো</button>
          </div>
          <button onClick={() => setShowList(false)} style={{ width: '100%', background: 'transparent', color: '#aaa', border: 'none', padding: 8, marginTop: 6 }}>← পিছনে যাও</button>
        </div>
      )}
    </div>
  )
}