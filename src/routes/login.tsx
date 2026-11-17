// @ts-nocheck
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isNew, setIsNew] = useState(true)
  const [loading, setLoading] = useState(false)

  // মোবাইল দিয়ে একাউন্ট খোলো - ফ্রি, SMS লাগে না
  const handleAuth = async () => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) return alert('সঠিক 10 সংখ্যার মোবাইল নাম্বার দাও')
    if (password.length < 6) return alert('পাসওয়ার্ড কম করে 6 অক্ষর দাও')
    setLoading(true)
    // মোবাইলকে Email বানিয়ে Supabase এ রাখছি - ইউজার বুঝবেও না
    const fakeEmail = `${cleanPhone}@shorttok.app`
    if (isNew) {
      const { data, error } = await supabase.auth.signUp({ email: fakeEmail, password, options: { data: { phone: cleanPhone, display_name: name || 'ShortTok User' } } })
      if (error) { setLoading(false); return alert(error.message) }
      alert('একাউন্ট খোলা হয়ে গেছে! ❤️')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password })
      if (error) { setLoading(false); return alert('নাম্বার বা পাসওয়ার্ড ভুল') }
    }
    localStorage.setItem('shorttok_persist_login', '1')
    localStorage.removeItem('shorttok_logged_out')
    setLoading(false)
    navigate({ to: '/feed', replace: true })
  }

  const gmailLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/feed' } })
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 20px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#fe2c55,#ff6a00,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: '900', color: '#fff' }}>S</div>
      <b style={{ fontSize: 26, marginTop: 14 }}>Short Tok এ স্বাগতম</b>
      <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4 }}>মোবাইল নাম্বার দিয়ে একাউন্ট খোলো —<br />Jio, Airtel, Vi, BSNL সবার চলবে</p>

      <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 22 }}>
        <button onClick={() => setIsNew(true)} style={{ flex: 1, padding: 10, borderRadius: 999, border: 'none', fontWeight: '700', background: isNew ? '#000' : '#f1f1f1', color: isNew ? '#fff' : '#000' }}>📱 নতুন একাউন্ট</button>
        <button onClick={() => setIsNew(false)} style={{ flex: 1, padding: 10, borderRadius: 999, border: 'none', fontWeight: '700', background: !isNew ? '#000' : '#f1f1f1', color: !isNew ? '#fff' : '#000' }}>🔑 লগইন করো</button>
      </div>

      <div style={{ width: '100%', marginTop: 16 }}>
        {isNew && <input value={name} onChange={e => setName(e.target.value)} placeholder="তোমার নাম (যেমন: Sarthak)" style={{ width: '100%', padding: '14px 18px', borderRadius: 999, border: '1px solid #ddd', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />}
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="মোবাইল নাম্বার - 98765 43210" inputMode="numeric" style={{ width: '100%', padding: '14px 18px', borderRadius: 999, border: '1px solid #ddd', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="পাসওয়ার্ড - 6 অক্ষর" style={{ width: '100%', padding: '14px 18px', borderRadius: 999, border: '1px solid #ddd', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginTop: 10 }} />
        <button onClick={handleAuth} disabled={loading} style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 999, border: 'none', background: '#ff2d55', color: '#fff', fontWeight: '700', fontSize: 16 }}>{loading ? 'হচ্ছে...' : isNew ? 'মোবাইল দিয়ে একাউন্ট খোলো →' : 'লগইন করো →'}</button>
      </div>

      <p style={{ margin: '14px 0 4px', color: '#aaa', fontSize: 13 }}>— অথবা —</p>
      <button onClick={gmailLogin} style={{ width: '100%', padding: 14, borderRadius: 999, border: '1px solid #ddd', background: '#fff', fontWeight: '700', fontSize: 16 }}>G Gmail দিয়ে লগইন করো</button>
      <button onClick={() => navigate({ to: '/feed' })} style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 999, border: 'none', background: '#f1f1f1', fontWeight: '700' }}>পরে করবো — এমনি দেখবো</button>
      <p style={{ fontSize: 11, color: '#ddd', marginTop: 24 }}>SHORT TOK • Sarthak</p>
    </div>
  )
}