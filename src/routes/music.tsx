import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/music')({
  component: MusicPage,
})

function MusicPage() {
  const [sounds, setSounds] = useState<any[]>([])
  const [tab, setTab] = useState<'trending'|'new'>('trending')
  const [search, setSearch] = useState('')
  const [playingId, setPlayingId] = useState<string|null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File|null>(null)
  const [cover, setCover] = useState<File|null>(null)
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const navigate = useNavigate()

  useEffect(()=>{ fetchSounds() },[tab])
  const fetchSounds = async ()=>{
    let q = supabase.from('sounds').select('*')
    if(tab==='trending') q=q.order('use_count',{ascending:false})
    else q=q.order('created_at',{ascending:false})
    const {data}=await q
    if(data) setSounds(data)
  }

  const handleUpload = async ()=>{
    if(!file ||!title) return alert('Title + mp3 দাও')
    if(file.size > 5*1024*1024) return alert('5MB Max')
    const fileName = `${Date.now()}_${file.name}`
    const {data: upData, error} = await supabase.storage.from('sounds').upload(fileName, file)
    if(error) return alert(error.message)
    const {data: urlData} = supabase.storage.from('sounds').getPublicUrl(fileName)

    let coverUrl = null
    if(cover){
      const coverName = `cover_${Date.now()}_${cover.name}`
      await supabase.storage.from('sounds').upload(coverName, cover)
      coverUrl = supabase.storage.from('sounds').getPublicUrl(coverName).data.publicUrl
    }

    await supabase.from('sounds').insert({ title, file_url: urlData.publicUrl, cover_url: coverUrl, use_count:0 })
    alert('Sound uploaded! Others can now use it')
    setShowUpload(false); fetchSounds()
  }

  const filtered = sounds.filter(s=>s.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-white p-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">SOT TOK SOUNDS</h1>
        <button onClick={()=>setShowUpload(true)} className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl">+</button>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sounds" className="w-full p-3 rounded-full border bg-gray-50 mb-4" />

      <div className="flex gap-6 mb-4 border-b">
        <button onClick={()=>setTab('trending')} className={`pb-2 ${tab==='trending'?'border-b-2 border-pink-500 font-bold':''}`}>Trending</button>
        <button onClick={()=>setTab('new')} className={`pb-2 ${tab==='new'?'border-b-2 border-pink-500 font-bold':''}`}>New</button>
      </div>

      <div className="space-y-3">
        {filtered.map(s=>(
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl border">
            <img src={s.cover_url || 'https://via.placeholder.com/60'} className="w-14 h-14 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="font-bold text-sm truncate">{s.title}</p>
              <p className="text-[11px] text-gray-500">{s.use_count || 0} videos • {s.duration || 15}s</p>
            </div>
            <button onClick={()=> setPlayingId(playingId===s.id? null : s.id)} className="w-8 h-8 rounded-full bg-black text-white text-xs">{playingId===s.id?'■':'▶'}</button>
            <button onClick={()=> navigate({ to: '/create', search: { sound_id: s.id } as any })} className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white px-3 py-1.5 rounded-full text-[11px] font-bold">Use this sound</button>
            {playingId===s.id && <audio src={s.file_url} autoPlay ref={audioRef} />}
          </div>
        ))}
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">Upload Sound</h2>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Sound Title" className="w-full border p-2 rounded-lg" />
            <div><p className="text-xs">MP3 (max 30s, 5MB)</p><input type="file" accept="audio/mp3,audio/wav" onChange={e=>setFile(e.target.files?.[0]||null)} /></div>
            <div><p className="text-xs">Cover Image</p><input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0]||null)} /></div>
            <div className="flex gap-2">
              <button onClick={()=>setShowUpload(false)} className="flex-1 border rounded-full p-2">Cancel</button>
              <button onClick={handleUpload} className="flex-1 bg-black text-white rounded-full p-2">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}