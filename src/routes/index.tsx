import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LoginAgerMoto,
})

function LoginAgerMoto() {
  const navigate = useNavigate()
  const [oldUsers, setOldUsers] = useState<any[]>([])
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')

  // আগের সব প্রোফাইল লোড করা - কিছু ডিলিট হবে না
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

  // ===== আগে যেমন ছিল - Gmail দিলেই সঙ্গে সঙ্গে প্রোফাইল খুলবে =====
  const openProfile = (gmailInput: string, nameInput?: string) => {
    let g = gmailInput.trim().toLowerCase()
    if (!g) { alert('ভাই, Gmail টা লেখো'); return }
    if (!g.includes('@')) g += '@gmail.com'
    const finalName = nameInput || g.split('@')[0]
    const user = { name: finalName, email: g, id: g, loginType: 'gmail' }

    localStorage.setItem('vigo_user_name', finalName)
    localStorage.setItem('vigo_user_id', g)
    localStorage.setItem('vigo_user_email', g)
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    localStorage.setItem('google_user', JSON.stringify(user))

    const old = JSON.parse(localStorage.getItem('sot_tok_users') || '[]')
    if (!old.find((x: any) => x.email === g)) {
      localStorage.setItem('sot_tok_users', JSON.stringify([...old, user]))
    }
    // সঙ্গে সঙ্গে Feed / প্রোফাইল খুলে যাবে
    navigate({ to: '/feed' })
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 20 }}>▶️</div>
      <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0', letterSpacing: 2 }}>SOT TOK</h1>
      <p style={{ color: '#ffcc00', fontSize: 18, margin: '6px 0 16px' }}>নিজের পরিচয় নিজেই তৈরি করো</p>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14, lineHeight: 1.6 }}>Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে এবং আপনার নাম সিস্টেমে সুরক্ষিত থাকবে।</p>
      <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0 16px' }}>🛡️ 100% Safe & Private</div>

      {/* ===== আগে যেমন ছিল - তোমার প্রোফাইলগুলো ===== */}
      {oldUsers.length > 0 && (
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginBottom: 14 }}>
          <b style={{ fontSize: 16 }}>👇 তোমার প্রোফাইলগুলো</b>
          <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0 0' }}>একটায় চাপ দিলেই সঙ্গে সঙ্গে খুলে যাবে</p>
          {oldUsers.map((u: any, i: number) => (
            <button key={i} onClick={() => openProfile(u.email, u.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ background: '#4285F4', color: '#fff', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }}>G</span>
              <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{u.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{u.email}</span></span>
              <span>→</span>
            </button>
          ))}
        </div>
      )}

      {/* ===== Gmail দিয়ে চালিয়ে যান - আগে যেমন ছিল ===== */}
      <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
        <b style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: '#fff', color: '#4285F4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>
          Gmail দিয়ে চালিয়ে যান
        </b>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 14, boxSizing: 'border-box', fontSize: 15 }} />
        <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box', fontSize: 15 }} />

        <button onClick={() => openProfile(gmail, name)} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12, fontSize: 17 }}>✅ এই Gmail দিয়ে ঢুকে যাও</button>
        <p style={{ fontSize: 12, color: '#888', textAlign: 'center', margin: '8px 0 0' }}>Gmail দিলেই সঙ্গে সঙ্গে তোমার প্রোফাইল খুলে যাবে</p>
      </div>

      <button onClick={() => openProfile('guest@sottok.com', 'Guest User')} style={{ width: '100%', background: 'transparent', color: '#aaa', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 12 }}>👀 গেস্ট হিসেবে দেখে নাও</button>
    </div>
  )
}// ===== SOT TOK - STEP 1 : গ্যালারি + মিউজিক কেটে ভিডিও বানানো =====
// পুরোনো কোড মুছবে না, শুধু এইটা নিচে বসাও

import { useState } from "react";

export function SOTUpload() {
  const [video, setVideo] = useState("");
  const [music, setMusic] = useState("");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(15);

  const postVideo = () => {
    if (!video) return alert("আগে গ্যালারি থেকে ভিডিও নাও");
    const old = JSON.parse(localStorage.getItem("sottok_videos") || "[]");
    old.unshift({ id: Date.now(), user: "Tumi", video, music, start, end, cap: "#SOTTOK", likes: 0, comments: [] });
    localStorage.setItem("sottok_videos", JSON.stringify(old));
    alert("পাবলিক হয়ে গেছে! এখন হোম + প্রোফাইলে দেখা যাবে");
  };

  return (
    <div style={{ background: "#111", padding: 14, borderRadius: 14 }}>
      <h3>🎬 ভিডিও বানাও</h3>
      <p>1. গ্যালারি থেকে ভিডিও</p>
      <input type="file" accept="video/*" onChange={(e) => setVideo(URL.createObjectURL(e.target.files[0]))} />
      <p style={{ marginTop: 10 }}>2. গ্যালারি থেকে মিউজিক</p>
      <input type="file" accept="audio/*" onChange={(e) => setMusic(URL.createObjectURL(e.target.files[0]))} />
      <p style={{ marginTop: 10 }}>3. মিউজিক কেটে নাও</p>
      <p>শুরু: {start}s <input type="range" min="0" max="60" value={start} onChange={(e) => setStart(e.target.value)} /></p>
      <p>শেষ: {end}s <input type="range" min="5" max="60" value={end} onChange={(e) => setEnd(e.target.value)} /></p>
      {video && <video src={video} controls style={{ width: "100%", marginTop: 10 }} />}
      {music && <audio src={music} controls style={{ width: "100%" }} />}
      <button onClick={postVideo} style={{ background: "#fe2c55", color: "#fff", border: 0, padding: 12, borderRadius: 10, width: "100%", marginTop: 10 }}>🚀 পাবলিক পোস্ট করো</button>
    </div>
  );
}// ===== SOT TOK - STEP 1 : গ্যালারি + মিউজিক কেটে ভিডিও বানানো =====
// পুরোনো কোড মুছবে না, শুধু এইটা নিচে বসাও

import { useState } from "react";

export function SOTUpload() {
  const [video, setVideo] = useState("");
  const [music, setMusic] = useState("");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(15);

  const postVideo = () => {
    if (!video) return alert("আগে গ্যালারি থেকে ভিডিও নাও");
    const old = JSON.parse(localStorage.getItem("sottok_videos") || "[]");
    old.unshift({ id: Date.now(), user: "Tumi", video, music, start, end, cap: "#SOTTOK", likes: 0, comments: [] });
    localStorage.setItem("sottok_videos", JSON.stringify(old));
    alert("পাবলিক হয়ে গেছে! এখন হোম + প্রোফাইলে দেখা যাবে");
  };

  return (
    <div style={{ background: "#111", padding: 14, borderRadius: 14 }}>
      <h3>🎬 ভিডিও বানাও</h3>
      <p>1. গ্যালারি থেকে ভিডিও</p>
      <input type="file" accept="video/*" onChange={(e) => setVideo(URL.createObjectURL(e.target.files[0]))} />
      <p style={{ marginTop: 10 }}>2. গ্যালারি থেকে মিউজিক</p>
      <input type="file" accept="audio/*" onChange={(e) => setMusic(URL.createObjectURL(e.target.files[0]))} />
      <p style={{ marginTop: 10 }}>3. মিউজিক কেটে নাও</p>
      <p>শুরু: {start}s <input type="range" min="0" max="60" value={start} onChange={(e) => setStart(e.target.value)} /></p>
      <p>শেষ: {end}s <input type="range" min="5" max="60" value={end} onChange={(e) => setEnd(e.target.value)} /></p>
      {video && <video src={video} controls style={{ width: "100%", marginTop: 10 }} />}
      {music && <audio src={music} controls style={{ width: "100%" }} />}
      <button onClick={postVideo} style={{ background: "#fe2c55", color: "#fff", border: 0, padding: 12, borderRadius: 10, width: "100%", marginTop: 10 }}>🚀 পাবলিক পোস্ট করো</button>
    </div>
  );
}