import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: SOTTOKFinal,
})

function SOTTOKFinal() {
  const [screen, setScreen] = useState<'login' | 'feed' | 'upload' | 'profile'>('login')
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')
  const [me, setMe] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [caption, setCaption] = useState('')
  const [videoFile, setVideoFile] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sot_tok_user')
      if (saved) { const u = JSON.parse(saved); setMe(u); setScreen('feed') }
      const myV = JSON.parse(localStorage.getItem('sottok_videos') || '[]')
      const demo = [
        { id: 'd1', user: 'SOTTOK Official', email: 'official@sottok.com', caption: 'SOTTOK এ স্বাগতম! 🔥 #sottok', likes: 1250, views: 15000, video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', time: '2h' },
        { id: 'd2', user: 'Rahul', email: 'rahul@gmail.com', caption: 'আমার প্রথম ভিডিও ❤️ #viral', likes: 890, views: 8200, video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', time: '5h' },
      ]
      setVideos([...myV, ...demo])
    } catch {}
  }, [])

  const login = (gInput: string, nInput?: string) => {
    let g = gInput.trim().toLowerCase()
    if (!g) { alert('ভাই, Gmail টা লেখো'); return }
    if (!g.includes('@')) g += '@gmail.com'
    const old = localStorage.getItem('sot_tok_user')
    if (old) {
      const oldUser = JSON.parse(old)
      if (oldUser.email.toLowerCase() !== g) {
        alert(`⛔ ভাই, তুমি আর নতুন অ্যাকাউন্ট খুলতে পারবে না!\n\nতোমার অ্যাকাউন্ট আগেই এই Gmail দিয়ে খোলা আছে:\n${oldUser.email}\n\nওই Gmail দিয়েই লগইন করো।`)
        return
      }
      setMe(oldUser); setScreen('feed'); return
    }
    const finalName = nInput || g.split('@')[0]
    const user = { name: finalName, email: g, id: g, coins: 100, followers: 0, following: 0 }
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    localStorage.setItem('sot_tok_users', JSON.stringify([user]))
    localStorage.setItem('vigo_user_name', finalName || '')
    localStorage.setItem('vigo_user_email', g)
    localStorage.setItem('vigo_user_id', g)
    setMe(user); setScreen('feed')
  }

  const postVideo = () => {
    if (!videoFile) { alert('ভাই, আগে ভিডিও সিলেক্ট করো'); return }
    const url = URL.createObjectURL(videoFile)
    const newVideo = { id: Date.now().toString(), user: me?.name || 'Me', email: me?.email, caption: caption || 'আমার নতুন ভিডিও 🔥 #sottok', likes: 0, views: 1, video: url, time: 'এখনই', mine: true }
    const all = [newVideo, ...videos]
    setVideos(all)
    localStorage.setItem('sottok_videos', JSON.stringify(all.filter(v => v.mine)))
    setCaption(''); setVideoFile(null)
    alert('✅ ভিডিও পোস্ট হয়ে গেছে! তোমার প্রোফাইলে + সবার ফিডে দেখা যাবে।')
    setScreen('feed')
  }

  if (screen === 'login') {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 20 }}>▶️</div>
        <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0' }}>SOT TOK</h1>
        <p style={{ color: '#ffcc00', fontSize: 18 }}>নিজের পরিচয় নিজেই তৈরি করো</p>
        <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>একটা Gmail = একটা অ্যাকাউন্ট। Gmail দিলেই সঙ্গে সঙ্গে খুলে যাবে।</p>
        <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0' }}>🛡️ 1 Gmail = 1 Account • 100% Safe</div>
        {me ? (
          <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
            <b>✅ তোমার অ্যাকাউন্ট খোলা আছে</b>
            <button onClick={() => login(me.email, me.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ background: '#4285F4', color: '#fff', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span>
              <span style={{ flex: 1 }}><b style={{ display: 'block' }}>{me.name}</b><span style={{ fontSize: 12, color: '#aaa' }}>{me.email}</span></span><span>→</span>
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
            <b style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ background: '#fff', color: '#4285F4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</span> Gmail দিয়ে চালিয়ে যান</b>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 14, boxSizing: 'border-box' }} />
            <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
            <button onClick={() => login(gmail, name)} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12, fontSize: 17 }}>✅ এই Gmail দিয়ে ঢুকে যাও</button>
          </div>
        )}
        {me && (
          <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginTop: 12 }}>
            <b style={{ fontSize: 14 }}>অন্য Gmail দিয়ে চেষ্টা করো?</b>
            <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="অন্য Gmail লিখে দেখো" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
            <button onClick={() => login(gmail)} style={{ width: '100%', background: '#333', color: '#fff', border: 'none', padding: 12, borderRadius: 12, marginTop: 10 }}>চেষ্টা করো - ব্লক হবে</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', position: 'sticky', top: 0, background: '#000', zIndex: 10, borderBottom: '1px solid #222' }}>
        <b style={{ fontSize: 22, color: '#4d7cff' }}>SOT TOK</b>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 20, fontSize: 13 }}>🪙 {me?.coins || 100}</span>
          <button onClick={() => setScreen('profile')} style={{ background: '#4285F4', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontWeight: 'bold' }}>{me?.name?.[0]?.toUpperCase() || 'U'}</button>
        </div>
      </div>

      {screen === 'feed' && (
        <div>
          <div style={{ background: '#ff3b5c', margin: 12, padding: '8px 12px', borderRadius: 20, fontSize: 13, textAlign: 'center' }}>🔥 নতুন ভিডিও এসেছে - সবার উপরে দেখো</div>
          {videos.map((v: any) => (
            <div key={v.id} style={{ borderBottom: '1px solid #222', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
                <span style={{ background: '#4285F4', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{v.user?.[0]}</span>
                <div style={{ flex: 1 }}><b style={{ display: 'block', fontSize: 14 }}>{v.user}</b><span style={{ fontSize: 12, color: '#888' }}>{v.email} • {v.time}</span></div>
                <button style={{ background: '#ff3b5c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 20, fontSize: 12 }}>Follow</button>
              </div>
              <video src={v.video} controls style={{ width: '100%', aspectRatio: '9/14', objectFit: 'cover', background: '#111', marginTop: 10 }} />
              <p style={{ padding: '0 12px', fontSize: 14 }}>{v.caption}</p>
              <div style={{ display: 'flex', gap: 18, padding: '0 12px' }}>
                <button onClick={() => setVideos(videos.map(x => x.id === v.id ? { ...x, likes: x.likes + 1 } : x))} style={{ background: 'none', color: '#fff', border: 'none', fontSize: 16 }}>❤️ {v.likes}</button>
                <span>💬 45</span><span>👁️ {v.views}</span><span>↗️ Share</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {screen === 'upload' && (
        <div style={{ padding: 16 }}>
          <h2>🎥 নতুন ভিডিও পোস্ট করো</h2>
          <input type="file" accept="video/*" capture="user" ref={fileRef} onChange={e => setVideoFile((e.target as any).files?.[0] || null)} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 220, background: '#111', color: '#fff', border: '2px dashed #333', borderRadius: 16, fontSize: 16 }}>{videoFile ? `✅ ${videoFile.name} - রেডি` : '📷 ক্যামেরা খুলে ভিডিও করো'}</button>
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption লেখো... #sottok" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#111', color: '#fff', border: '1px solid #333', marginTop: 12, boxSizing: 'border-box' }} />
          <button onClick={postVideo} style={{ width: '100%', background: '#ff3b5c', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12 }}>🚀 পোস্ট করো - প্রোফাইল + ফিডে যাবে</button>
        </div>
      )}

      {screen === 'profile' && (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: '#4285F4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', margin: '0 auto' }}>{me?.name?.[0]?.toUpperCase()}</div>
          <h2 style={{ margin: '10px 0 2px' }}>{me?.name}</h2>
          <p style={{ color: '#888', margin: 0 }}>{me?.email}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 14 }}>
            <span><b>{videos.filter(v => v.mine).length}</b><br /><span style={{ fontSize: 12, color: '#888' }}>ভিডিও</span></span>
            <span><b>{me?.followers || 0}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Followers</span></span>
            <span><b>🪙 {me?.coins || 100}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Coins</span></span>
          </div>
          <p style={{ textAlign: 'left', marginTop: 18 }}><b>🎥 আমার ভিডিওগুলো</b></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {videos.filter(v => v.mine).length === 0 ? <p style={{ color: '#888', fontSize: 13, gridColumn: '1/4' }}>এখনো ভিডিও পোস্ট করোনি। + বাটন চাপো।</p> : videos.filter(v => v.mine).map((v: any) => (
              <video key={v.id} src={v.video} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
          <button onClick={() => setScreen('login')} style={{ width: '100%', background: '#222', color: '#fff', border: 'none', padding: 12, borderRadius: 12, marginTop: 20 }}>🚪 লগআউট - অ্যাকাউন্ট ডিলিট হবে না</button>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#000', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0' }}>
        <button onClick={() => setScreen('feed')} style={{ background: 'none', border: 'none', color: screen === 'feed' ? '#fff' : '#888', fontSize: 22 }}>🏠<div style={{ fontSize: 10 }}>Home</div></button>
        <button onClick={() => setScreen('upload')} style={{ background: '#fff', color: '#000', border: 'none', width: 52, height: 32, borderRadius: 8, fontSize: 22, fontWeight: 'bold' }}>+</button>
        <button onClick={() => setScreen('profile')} style={{ background: 'none', border: 'none', color: screen === 'profile' ? '#fff' : '#888', fontSize: 22 }}>👤<div style={{ fontSize: 10 }}>Profile</div></button>
      </div>
    </div>
  )
}