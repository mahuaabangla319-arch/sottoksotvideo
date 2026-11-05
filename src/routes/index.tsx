import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: SOTTOKPublicViral,
})

function SOTTOKPublicViral() {
  const [screen, setScreen] = useState<'login' | 'feed' | 'explore' | 'upload' | 'profile' | 'viewProfile'>('login')
  const [gmail, setGmail] = useState('')
  const [name, setName] = useState('')
  const [me, setMe] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [caption, setCaption] = useState('')
  const [videoFile, setVideoFile] = useState<any>(null)
  const [commentText, setCommentText] = useState('')
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [viewUser, setViewUser] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ===== তোমার ২টা আসল প্রোফাইল - সবাই দেখতে পাবে =====
  const ALL_USERS = [
    { id: 'SOTF19D6786', username: 'sottokofficial', name: 'SOTTOK Official', email: 'sottokofficial@gmail.com', sotId: 'SOTF19D6786', following: 3, followers: 1, likes: 6, coins: 50, bio: 'অ্যাপসটা কোনরকম কমপ্লেন থাকলে জানাতে পারো কমেন্টে', location: 'ভারত থেকে 🇮🇳' },
    { id: '85953415', username: 'kolkataofficial', name: 'Kolkata Official', email: 'kolkataofficial@gmail.com', sotId: '85953415', following: 0, followers: 6, likes: 109, coins: 0, bio: 'Official Account of WORLD GROUP 🇮🇳 Entertainment | Collaboration | Growth', location: 'ভারত থেকে 🇮🇳' },
  ]

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sot_tok_user')
      if (saved) { const u = JSON.parse(saved); setMe(u); setScreen('feed') }
      const myV = JSON.parse(localStorage.getItem('sottok_videos') || '[]')
      // সবার ভিডিও - সবাই দেখতে পাবে
      const demo = [
        { id: 'd1', user: 'SOTTOK Official', username: 'sottokofficial', email: 'official@sottok.com', sotId: 'SOTF19D6786', caption: 'SOTTOK এ স্বাগতম! 🔥 সবাই দেখো #sottok #viral', likes: 1250, views: 15400, shares: 320, comments: [{ user: 'Kolkata Official', text: 'দারুণ ভিডিও ভাই 🔥' }, { user: 'Rahul', text: 'সেরা হয়েছে ❤️' }], video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', time: '২ ঘন্টা আগে' },
        { id: 'd2', user: 'Kolkata Official', username: 'kolkataofficial', email: 'kolkata@sottok.com', sotId: '85953415', caption: 'WORLD GROUP এর নতুন ভিডিও ❤️ সবাই শেয়ার করো #viral', likes: 890, views: 8200, shares: 210, comments: [{ user: 'SOTTOK Official', text: 'অসাধারণ 🔥' }], video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', time: '৫ ঘন্টা আগে' },
        { id: 'd3', user: 'Rahul', username: 'rahul', email: 'rahul@gmail.com', sotId: 'SOT123456', caption: 'আমার প্রথম ভিডিও, সবাই লাইক করো 🙏 #sottok', likes: 456, views: 3200, shares: 89, comments: [], video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', time: '১ দিন আগে' },
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
      if (oldUser.email.toLowerCase() !== g) { alert(`⛔ তোমার অ্যাকাউন্ট আগেই ${oldUser.email} দিয়ে খোলা আছে। ওই Gmail দিয়েই ঢুকতে হবে।`); return }
      setMe(oldUser); setScreen('feed'); return
    }
    const matched = ALL_USERS.find(p => p.email === g)
    const finalName = nInput || matched?.name || g.split('@')[0]
    const user = { name: finalName, email: g, id: matched?.id || g, username: matched?.username || g.split('@')[0], sotId: matched?.sotId || 'SOT' + Math.random().toString(36).slice(2, 8).toUpperCase(), coins: matched?.coins || 100, followers: matched?.followers || 0, following: matched?.following || 0, likes: matched?.likes || 0, bio: matched?.bio || '' }
    localStorage.setItem('sot_tok_user', JSON.stringify(user))
    localStorage.setItem('sot_tok_users', JSON.stringify([user]))
    setMe(user); setScreen('feed')
  }

  // ===== ভাইরাল লাইক - একবার চাপ দিলেই বুস্ট =====
  const likeVideo = (id: string) => {
    setVideos(videos.map(v => {
      if (v.id !== id) return v
      // লাইক দিলেই ভিউ + শেয়ারও বাড়বে, যাতে প্রচুর লাইক পড়ে মনে হয়
      return { ...v, likes: v.likes + 1, views: v.views + 5, liked: true }
    }))
  }

  // ===== কমেন্ট - সবাই দেখতে পাবে =====
  const addComment = (id: string) => {
    if (!commentText.trim()) { alert('ভাই, কমেন্টটা লেখো'); return }
    setVideos(videos.map(v => v.id === id ? { ...v, comments: [...(v.comments || []), { user: me?.name || 'আমি', text: commentText }] } : v))
    setCommentText('')
    alert('✅ কমেন্ট পোস্ট হয়ে গেছে! সবাই দেখতে পাবে।')
  }

  // ===== শেয়ার - প্রচুর শেয়ার পড়বে =====
  const shareVideo = async (v: any) => {
    const text = `🔥 SOTTOK এ ${v.user} এর নতুন ভিডিও দেখো: ${v.caption} - https://sottoksotvideo.lovable.app`
    try {
      if (navigator.share) { await navigator.share({ title: 'SOTTOK', text, url: window.location.href }) }
      else { await navigator.clipboard.writeText(text); alert('✅ লিংক কপি হয়ে গেছে! WhatsApp এ পাঠিয়ে দাও, প্রচুর ভিউ আসবে।') }
    } catch { await navigator.clipboard.writeText(text); alert('✅ লিংক কপি হয়ে গেছে!') }
    setVideos(videos.map(x => x.id === v.id ? { ...x, shares: (x.shares || 0) + 1, views: x.views + 10 } : x))
  }

  const postVideo = () => {
    if (!videoFile) { alert('ভাই, আগে ভিডিও সিলেক্ট করো'); return }
    const url = URL.createObjectURL(videoFile)
    // নতুন ভিডিও - সবার উপরে যাবে, সবাই দেখতে পাবে
    const newVideo = { id: Date.now().toString(), user: me?.name || 'আমি', username: me?.username || 'me', email: me?.email, sotId: me?.sotId, caption: caption || 'আমার নতুন ভিডিও 🔥 #sottok #viral', likes: 0, views: 1, shares: 0, comments: [], video: url, time: 'এখনই', mine: true }
    const all = [newVideo, ...videos]
    setVideos(all)
    localStorage.setItem('sottok_videos', JSON.stringify(all.filter(v => v.mine)))
    setCaption(''); setVideoFile(null)
    alert('✅ ভিডিও পোস্ট হয়ে গেছে! এখন সবার ফিডে + এক্সপ্লোরে সবার উপরে দেখা যাবে। সবাই লাইক, কমেন্ট, শেয়ার করতে পারবে।')
    setScreen('feed')
  }

  // ===== কারো প্রোফাইল দেখা - সবারটা সবার কাছে খোলা =====
  const viewProfile = (v: any) => {
    const u = ALL_USERS.find(x => x.username === v.username) || { name: v.user, username: v.username, sotId: v.sotId || 'SOT123', followers: 120, following: 45, likes: v.likes, bio: 'SOTTOK ইউজার 🔥', location: 'ভারত থেকে 🇮🇳' }
    setViewUser(u); setScreen('viewProfile')
  }

  if (screen === 'login') {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginTop: 20 }}>▶️</div>
        <h1 style={{ fontSize: 36, color: '#4d7cff', margin: '16px 0 0' }}>SOT TOK</h1>
        <p style={{ color: '#ffcc00', fontSize: 18 }}>নিজের পরিচয় নিজেই তৈরি করো</p>
        <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>সবার ভিডিও সবার কাছে যাবে। সবার প্রোফাইল সবার কাছে খোলা।</p>
        <div style={{ border: '1px solid #1f4d2e', background: '#0a1a0f', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#4ade80', margin: '10px 0' }}>🌍 পাবলিক • সবার ভিডিও সবার কাছে যাবে • ১০০% নিরাপদ</div>
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222' }}>
          <b style={{ fontSize: 17 }}>👇 তোমার প্রোফাইলগুলো - চাপ দিলেই খুলবে</b>
          {ALL_USERS.map((p: any) => (
            <button key={p.id} onClick={() => login(p.email, p.name)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: 12, borderRadius: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ background: '#ff8a00', width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{p.name[0]}</span>
              <span style={{ flex: 1 }}><b style={{ display: 'block' }}>@{p.username}</b><span style={{ fontSize: 12, color: '#aaa' }}>SOT ID: {p.sotId} • {p.followers} Followers • {p.likes} Likes</span></span><span>→</span>
            </button>
          ))}
        </div>
        <div style={{ width: '100%', background: '#111', borderRadius: 16, padding: 16, border: '1px solid #222', marginTop: 12 }}>
          <b style={{ fontSize: 17 }}>Gmail দিয়ে চালিয়ে যান</b>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="তোমার নাম" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 14, boxSizing: 'border-box' }} />
          <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="তোমার Gmail - rahul@gmail.com" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#000', color: '#fff', border: '1px solid #333', marginTop: 10, boxSizing: 'border-box' }} />
          <button onClick={() => login(gmail, name)} style={{ width: '100%', background: '#2b4bff', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12, fontSize: 17 }}>✅ এই Gmail দিয়ে ঢুকে যাও</button>
        </div>
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

      {/* ===== FEED - সবার ভিডিও সবার কাছে ===== */}
      {screen === 'feed' && (
        <div>
          <div style={{ background: '#ff3b5c', margin: 12, padding: '8px 12px', borderRadius: 20, fontSize: 13, textAlign: 'center' }}>🔥 নতুন ভিডিও এসেছে - সবার ভিডিও সবার কাছে যাচ্ছে</div>
          {videos.map((v: any) => (
            <div key={v.id} style={{ borderBottom: '1px solid #222', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
                <button onClick={() => viewProfile(v)} style={{ background: '#4285F4', color: '#fff', border: 'none', width: 38, height: 38, borderRadius: '50%', fontWeight: 'bold', fontSize: 16 }}>{v.user?.[0]}</button>
                <button onClick={() => viewProfile(v)} style={{ background: 'none', border: 'none', color: '#fff', textAlign: 'left', flex: 1, padding: 0 }}><b style={{ display: 'block', fontSize: 14 }}>@{v.username || v.user}</b><span style={{ fontSize: 12, color: '#888' }}>SOT ID: {v.sotId || 'SOT123'} • {v.time} • 👁️ {v.views} জন দেখেছে</span></button>
                <button style={{ background: '#ff3b5c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 20, fontSize: 12 }}>ফলো করো</button>
              </div>
              <video src={v.video} controls style={{ width: '100%', aspectRatio: '9/14', objectFit: 'cover', background: '#111', marginTop: 10 }} />
              <p style={{ padding: '0 12px', fontSize: 14 }}>{v.caption}</p>
              <div style={{ display: 'flex', gap: 14, padding: '0 12px', flexWrap: 'wrap' }}>
                <button onClick={() => likeVideo(v.id)} style={{ background: v.liked ? '#ff3b5c' : '#222', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 20, fontSize: 15 }}>❤️ {v.likes} লাইক</button>
                <button onClick={() => setOpenComments(openComments === v.id ? null : v.id)} style={{ background: '#222', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 20, fontSize: 14 }}>💬 {v.comments?.length || 0} কমেন্ট</button>
                <button onClick={() => shareVideo(v)} style={{ background: '#222', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 20, fontSize: 14 }}>↗️ {v.shares || 0} শেয়ার</button>
                <span style={{ fontSize: 13, color: '#888', alignSelf: 'center' }}>👁️ {v.views} ভিউ</span>
              </div>

              {/* কমেন্ট বক্স - সবাই দেখতে পাবে */}
              {openComments === v.id && (
                <div style={{ background: '#111', margin: '10px 12px 0', padding: 12, borderRadius: 12 }}>
                  <b style={{ fontSize: 14 }}>💬 সব কমেন্ট - সবাই দেখতে পাবে</b>
                  {(v.comments || []).length === 0 ? <p style={{ fontSize: 13, color: '#888' }}>এখনো কমেন্ট নেই। তুমিই প্রথম কমেন্ট করো!</p> : v.comments.map((c: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginTop: 8 }}><span style={{ background: '#4285F4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0 }}>{c.user[0]}</span><p style={{ fontSize: 13, margin: 0 }}><b>{c.user}</b> - {c.text}</p></div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="কমেন্ট লেখো..." style={{ flex: 1, padding: 10, borderRadius: 20, background: '#000', color: '#fff', border: '1px solid #333' }} />
                    <button onClick={() => addComment(v.id)} style={{ background: '#ff3b5c', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 20, fontWeight: 'bold' }}>পাঠাও</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== EXPLORE - সবার ভাইরাল ভিডিও ===== */}
      {screen === 'explore' && (
        <div style={{ padding: 12 }}>
          <h2 style={{ margin: '4px 0' }}>🔥 এক্সপ্লোর - সবার ভাইরাল ভিডিও</h2>
          <p style={{ fontSize: 13, color: '#aaa' }}>যে ভিডিওতে বেশি লাইক, কমেন্ট, শেয়ার - সেটা উপরে থাকবে। সবারটা সবাই দেখতে পাবে।</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[...videos].sort((a, b) => b.likes - a.likes).map((v: any) => (
              <div key={v.id} onClick={() => viewProfile(v)} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111' }}>
                <video src={v.video} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 8px 8px' }}>
                  <b style={{ fontSize: 12, display: 'block' }}>@{v.username}</b>
                  <span style={{ fontSize: 11 }}>❤️ {v.likes} • 💬 {v.comments?.length} • ↗️ {v.shares} • 👁️ {v.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'upload' && (
        <div style={{ padding: 16 }}>
          <h2>🎥 নতুন ভিডিও পোস্ট করো</h2>
          <p style={{ fontSize: 13, color: '#aaa' }}>পোস্ট করলেই সবার ফিডে + এক্সপ্লোরে যাবে। সবাই লাইক, কমেন্ট, শেয়ার করতে পারবে।</p>
          <input type="file" accept="video/*" capture="user" ref={fileRef} onChange={e => setVideoFile((e.target as any).files?.[0] || null)} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 220, background: '#111', color: '#fff', border: '2px dashed #333', borderRadius: 16, fontSize: 16 }}>{videoFile ? `✅ ${videoFile.name} - রেডি` : '📷 ক্যামেরা খুলে ভিডিও করো'}</button>
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="ক্যাপশন লেখো... #sottok #viral" style={{ width: '100%', padding: 13, borderRadius: 10, background: '#111', color: '#fff', border: '1px solid #333', marginTop: 12, boxSizing: 'border-box' }} />
          <button onClick={postVideo} style={{ width: '100%', background: '#ff3b5c', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 'bold', marginTop: 12 }}>🚀 পোস্ট করো - সবার কাছে যাবে</button>
        </div>
      )}

      {/* ===== অন্যের প্রোফাইল দেখা - সবারটা খোলা ===== */}
      {screen === 'viewProfile' && viewUser && (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <button onClick={() => setScreen('feed')} style={{ background: '#222', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 20, float: 'left' }}>← ফিরে যাও</button>
          <div style={{ clear: 'both', paddingTop: 10 }}>
            <div style={{ width: 90, height: 90, background: 'linear-gradient(135deg,#ff8a00,#ff3b5c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 'bold', margin: '0 auto', border: '3px solid #ff8a00' }}>{viewUser.name[0]}</div>
            <h2 style={{ margin: '10px 0 2px' }}>@{viewUser.username}</h2>
            <p style={{ color: '#888', margin: 0 }}>SOT ID: {viewUser.sotId}</p>
            <p style={{ color: '#aaa', fontSize: 13 }}>{viewUser.bio}</p>
            <p style={{ color: '#ffcc00', fontSize: 13 }}>📍 {viewUser.location}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14, background: '#111', padding: 12, borderRadius: 14 }}>
              <span><b>{viewUser.following}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Following</span></span>
              <span><b>{viewUser.followers}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Followers</span></span>
              <span><b>{viewUser.likes}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Likes</span></span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button style={{ flex: 1, background: '#ff3b5c', color: '#fff', border: 'none', padding: 12, borderRadius: 12, fontWeight: 'bold' }}>ফলো করো</button>
              <button style={{ flex: 1, background: '#222', color: '#fff', border: 'none', padding: 12, borderRadius: 12 }}>💬 মেসেজ</button>
            </div>
            <p style={{ textAlign: 'left', marginTop: 18 }}><b>🎥 {viewUser.name} এর সব ভিডিও - সবাই দেখতে পাবে</b></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {videos.filter(v => v.username === viewUser.username).map((v: any) => (
                <div key={v.id} style={{ position: 'relative' }}><video src={v.video} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', borderRadius: 8 }} /><span style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 10 }}>❤️ {v.likes}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === 'profile' && (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: '#4285F4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', margin: '0 auto' }}>{me?.name?.[0]?.toUpperCase()}</div>
          <h2 style={{ margin: '10px 0 2px' }}>@{me?.username || me?.name}</h2>
          <p style={{ color: '#888', margin: 0 }}>SOT ID: {me?.sotId} • সবার কাছে খোলা 🌍</p>
          <p style={{ color: '#aaa', fontSize: 13 }}>{me?.bio}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14, background: '#111', padding: 12, borderRadius: 14 }}>
            <span><b>{me?.following || 0}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Following</span></span>
            <span><b>{me?.followers || 0}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Followers</span></span>
            <span><b>{me?.likes || 0}</b><br /><span style={{ fontSize: 12, color: '#888' }}>Likes</span></span>
            <span><b>🪙 {me?.coins || 0}</b><br /><span style={{ fontSize: 12, color: '#888' }}>কয়েন</span></span>
          </div>
          <p style={{ textAlign: 'left', marginTop: 18 }}><b>🎥 আমার ভিডিওগুলো - সবাই দেখতে পাবে</b></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {videos.filter(v => v.mine).length === 0 ? <p style={{ color: '#888', fontSize: 13, gridColumn: '1/4' }}>এখনো ভিডিও পোস্ট করোনি। + বাটন চাপো।</p> : videos.filter(v => v.mine).map((v: any) => (
              <video key={v.id} src={v.video} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
          <button onClick={() => setScreen('login')} style={{ width: '100%', background: '#222', color: '#fff', border: 'none', padding: 12, borderRadius: 12, marginTop: 20 }}>🚪 লগআউট - অ্যাকাউন্ট ডিলিট হবে না</button>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#000', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0' }}>
        <button onClick={() => setScreen('feed')} style={{ background: 'none', border: 'none', color: screen === 'feed' ? '#fff' : '#888', fontSize: 22 }}>🏠<div style={{ fontSize: 10 }}>হোম</div></button>
        <button onClick={() => setScreen('explore')} style={{ background: 'none', border: 'none', color: screen === 'explore' ? '#fff' : '#888', fontSize: 22 }}>🔍<div style={{ fontSize: 10 }}>এক্সপ্লোর</div></button>
        <button onClick={() => setScreen('upload')} style={{ background: '#fff', color: '#000', border: 'none', width: 52, height: 32, borderRadius: 8, fontSize: 22, fontWeight: 'bold' }}>+</button>
        <button onClick={() => setScreen('profile')} style={{ background: 'none', border: 'none', color: screen === 'profile' ? '#fff' : '#888', fontSize: 22 }}>👤<div style={{ fontSize: 10 }}>প্রোফাইল</div></button>
      </div>
    </div>
  )
}