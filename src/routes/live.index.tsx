import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/live/')({
  component: LiveList,
})

function LiveList() {
  const lives = [
    { id: 1, name: 'Music LiveHouse 🎤', host: '@priya_12', viewers: 1245, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', tag: 'Singing' },
    { id: 2, name: 'Asansol Adda 🔥', host: '@rahul_asansol', viewers: 850, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', tag: 'Adda' },
    { id: 3, name: 'Dance Queen 💃', host: '@sneha_sing', viewers: 2100, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', tag: 'Dance' },
  ]
  return (
    <div style={{ background: '#0b141a', color: '#fff', minHeight: '100vh', padding: 12, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ margin: 0 }}>🔴 SOTTOK LIVE</h2>
      <p style={{ color: '#8696a0', fontSize: 12 }}>Ekhon Live Cholche - Join Koro</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        {lives.map(l => (
          <a key={l.id} href={`/live/${l.id}`} style={{ textDecoration: 'none', color: '#fff', position: 'relative', borderRadius: 12, overflow: 'hidden', display: 'block' }}>
            <img src={l.img} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
            <span style={{ position: 'absolute', top: 8, left: 8, background: '#ff3b5c', padding: '3px 7px', borderRadius: 6, fontSize: 10, fontWeight: 'bold' }}>🔴 LIVE</span>
            <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', padding: '3px 7px', borderRadius: 10, fontSize: 10 }}>👁️ {l.viewers}</span>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
              <b style={{ fontSize: 13, display: 'block' }}>{l.name}</b>
              <span style={{ fontSize: 11, color: '#ffb400' }}>{l.host} • {l.tag}</span>
            </div>
          </a>
        ))}
      </div>
      <a href="/live/create" style={{ display: 'block', background: '#ff3b5c', color: '#fff', textAlign: 'center', padding: 14, borderRadius: 12, fontWeight: 'bold', textDecoration: 'none', marginTop: 14 }}>▶️ Go Live - Ami Live Korbo</a>
    </div>
  )
}