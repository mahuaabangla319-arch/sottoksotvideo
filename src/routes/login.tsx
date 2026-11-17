// @ts-nocheck
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'phone' | 'gmail'>('phone')
  const [phone, setPhone] = useState('+91 ')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1. মোবাইল নাম্বারে OTP পাঠাও - সবাই পারবে
  const sendOtp = async () => {
    if (phone.replace(/\D/g,'').length < 10) return alert('সঠিক মোবাইল নাম্বার দাও')
    setLoading(true)
    const cleanPhone = phone.replace(/\s/g, '')
    const { error } = await supabase.auth.signInWithOtp({ phone: cleanPhone })
    setLoading(false)
    if (error) return alert('OTP পাঠানো যায়নি: ' + error.message)
    setOtpSent(true)
    alert('OTP পাঠানো হয়েছে! মোবাইলে দেখো')
  }

  // 2. OTP দিয়ে একাউন্ট খোলো / লগইন করো
  const verifyOtp = async () => {
    if (otp.length < 4) return alert('OTP লেখো')
    setLoading(true)
    const cleanPhone = phone.replace(/\s/g, '')
    const { data, error } = await supabase.auth.verifyOtp({ phone: cleanPhone, token: otp, type: 'sms' })
    setLoading(false)
    if (error) return alert('OTP ভুল: ' + error.message)
    if (data?.user) {
      localStorage.setItem('shorttok_persist_login', '1')
      localStorage.removeItem('shorttok_logged_out')
      navigate({ to: '/feed', replace: true })
    }
  }

  // 3. Gmail দিয়ে একাউন্ট খোলো
  const gmailLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/feed' } })
    if (error) alert('Gmail এ সমস্যা: ' + error.message)
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 20px', maxWidth: 480, margin: '0 auto' }}>
      {/* তোমার ছবির মতোই S লোগো */}
      <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#fe2c55,#ff6a00,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: '900', color: '#fff' }}>S</div>
      <b style={{ fontSize: 26, marginTop: 14 }}>Short Tok এ স্বাগতম</b>
      <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4 }}>মোবাইল নাম্বার দিয়ে একবার একাউন্ট খোলো —<br />এরপর বারবার লগইন করতে হবে না</p>

      {/* মোবাইল / Gmail ট্যাব */}
      <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 22 }}>
        <button onClick={() => setTab('phone')} style={{ flex: 1, padding: '10px', borderRadius: 999, border: 'none', fontWeight: '700', background: tab === 'phone' ? '#000' : '#f1f1f1', color: tab === 'phone' ? '#fff' : '#000' }}>📱 মোবাইল দিয়ে</button>
        <button onClick={() => setTab('gmail')} style={{ flex: 1, padding: '10px', borderRadius: 999, border: 'none', fontWeight: '700', background: tab === 'gmail' ? '#000' : '#f1f1f1', color: tab === 'gmail' ? '#fff' : '#000' }}>G Gmail দিয়ে</button>
      </div>

      {tab === 'phone' ? (
        <div style={{ width: '100%', marginTop: 16 }}>
          {!otpSent ? (
            <>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={{ width: '100%', padding: '14px 18px', borderRadius: 999, border: '1px solid #ddd', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={sendOtp} disabled={loading} style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 999, border: 'none', background: '#ff2d55', color: '#fff', fontWeight: '700', fontSize: 16 }}>{loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠাও →'}</button>
              <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 10 }}>যে কোনো মোবাইল নাম্বার দিলেই হবে — Jio, Airtel, Vi, BSNL সব চলবে</p>
            </>
          ) : (
            <>
              <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6 সংখ্যার OTP" style={{ width: '100%', padding: '14px 18px', borderRadius: 999, border: '1px solid #ddd', fontSize: 20, letterSpacing: 6, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 999, border: 'none', background: '#ff2d55', color: '#fff', fontWeight: '700', fontSize: 16 }}>{loading ? 'চেক হচ্ছে...' : 'OTP দিয়ে একাউন্ট খোলো →'}</button>
              <button onClick={() => setOtpSent(false)} style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', color: '#888' }}>নাম্বার বদলাও</button>
            </>
          )}
        </div>
      ) : (
        <div style={{ width: '100%', marginTop: 16 }}>
          <button onClick={gmailLogin} style={{ width: '100%', padding: 14, borderRadius: 999, border: '1px solid #ddd', background: '#fff', fontWeight: '700', fontSize: 16 }}>G Gmail দিয়ে লগইন করো</button>
          <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 10 }}>Gmail এ চাপ দিলে Google পেজ খুলবে</p>
        </div>
      )}

      <button onClick={() => navigate({ to: '/feed' })} style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 999, border: 'none', background: '#f1f1f1', fontWeight: '700' }}>পরে করবো — এমনি দেখবো</button>
      <p style={{ fontSize: 11, color: '#ddd', marginTop: 24 }}>SHORT TOK • Sarthak</p>
    </div>
  )
}