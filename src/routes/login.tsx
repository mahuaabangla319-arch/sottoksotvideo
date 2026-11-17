// @ts-nocheck
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')

  // ===== অটোমেটিক লগইন — আগে লগইন করা থাকলে নিজে নিজে ঢুকে যাবে =====
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const saved = localStorage.getItem('shorttok_persist_login')
        const loggedOut = localStorage.getItem('shorttok_logged_out')
        if (data?.session?.user || (saved && !loggedOut)) {
          // অটো লগইন হয়ে গেছে — সোজা ফিডে
          navigate({ to: '/feed', replace: true })
          return
        }
      } catch {}
      setChecking(false)
    })()
  }, [])

  const loginGmail = async () => {
    try {
      setMsg('Gmail খুলছে... একটু দাঁড়াও')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/feed', queryParams: { prompt: 'select_account' } },
      })
      if (error) throw error
    } catch {
      setMsg('Gmail লগইন হয়নি, আবার চেষ্টা করো')
    }
  }

  const loginEmail = async () => {
    if (!email || !pass) { setMsg('Email আর Password ২টোই দাও'); return }
    try {
      setMsg('লগইন হচ্ছে...')
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
      if (error) throw error
      localStorage.removeItem('shorttok_logged_out')
      navigate({ to: '/feed', replace: true })
    } catch { setMsg('Email / Password ভুল, আবার দেখো') }
  }

  const skipLogin = () => {
    try { localStorage.setItem('shorttok_skip_login', '1') } catch {}
    navigate({ to: '/feed' })
  }

  if (checking) {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#fe2c55,#ff6a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, fontWeight: '900' }}>S</div>
        <p style={{ marginTop: 14, fontSize: 13, color: '#aaa' }}>অটো লগইন দেখা হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', color: '#000', minHeight: '100vh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      {/* পিছনে হালকা জলছবি — সবসময় থাকবে */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.05, fontSize: 180, fontWeight: '900' }}>S</div>

      <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg,#fe2c55,#ff6a00,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, fontWeight: '900', color: '#fff', position: 'relative', zIndex: 1 }}>S</div>
      <b style={{ fontSize: 24, marginTop: 12, position: 'relative', zIndex: 1 }}>Short Tok এ স্বাগতম</b>
      <p style={{ fontSize: 12, color: '#666', textAlign: 'center', position: 'relative', zIndex: 1 }}>Gmail দিয়ে একবার লগইন করো — এরপর বারবার লগইন করতে হবে না<br />অটোমেটিক লগইন হয়ে যাবে</p>

      <button onClick={loginGmail} style={{ width: '100%', marginTop: 22, padding: 13, borderRadius: 999, background: '#fff', border: '2px solid #ddd', fontWeight: 'bold', fontSize: 15, position: 'relative', zIndex: 1 }}>G Gmail দিয়ে লগইন করো</button>

      <p style={{ fontSize: 12, color: '#999', margin: '16px 0 8px', position: 'relative', zIndex: 1 }}>— অথবা Email দিয়ে —</p>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', marginBottom: 8, boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
      <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="Password" style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', marginBottom: 8, boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
      <button onClick={loginEmail} style={{ width: '100%', padding: 13, borderRadius: 999, background: '#fe2c55', color: '#fff', border: 'none', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>লগইন করো →</button>
      {msg && <p style={{ fontSize: 12, color: '#fe2c55', marginTop: 8 }}>{msg}</p>}

      <button onClick={skipLogin} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 999, background: '#f1f1f1', border: 'none', fontWeight: 'bold', fontSize: 13, position: 'relative', zIndex: 1 }}>পরে করবো — এমনি দেখবো</button>

      <p style={{ fontSize: 11, color: '#aaa', marginTop: 20, position: 'relative', zIndex: 1 }}>SHORT TOK • Sarthak • জলছবি সহ</p>
    </div>
  )
}