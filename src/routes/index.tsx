// @ts-nocheck
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/')({ component: Splash })

function Splash() {
  const navigate = useNavigate()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(async () => {
      // আগে লগইন করা আছে কিনা দেখো
      try {
        const { data } = await supabase.auth.getSession()
        const saved = localStorage.getItem('shorttok_persist_login')
        const loggedOut = localStorage.getItem('shorttok_logged_out')
        // লগইন করা থাকলে সোজা ফিডে, না থাকলে লগইন পেজে
        if (data?.session?.user || (saved && !loggedOut)) {
          navigate({ to: '/feed', replace: true })
        } else {
          navigate({ to: '/login', replace: true })
        }
      } catch {
        navigate({ to: '/login', replace: true })
      }
    }, 2000) // 2 সেকেন্ড জলছবি দেখাবে
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
      {/* জলছবি / লোগো — তুমি যেই ছবিটা দিয়েছো ওই স্টাইল */}
      <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,#fe2c55,#ff6a00,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: '900', boxShadow: '0 0 40px rgba(254,44,85,0.6)' }}>S</div>
      <b style={{ fontSize: 30, marginTop: 16 }}>SHORT <span style={{ color: '#fe2c55' }}>TOK</span></b>
      <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Sarthak's Short Tok • Made in India 🇮🇳</p>
      <p style={{ fontSize: 12, color: '#666', marginTop: 30 }}>লোড হচ্ছে... একটু দাঁড়াও ❤️</p>
      {/* নিচে হালকা জলছবি লেখা */}
      <p style={{ position: 'fixed', bottom: 20, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>SHORT TOK • Sarthak</p>
    </div>
  )
}