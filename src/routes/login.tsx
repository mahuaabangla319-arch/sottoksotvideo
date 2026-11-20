import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export default function Login() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  
  return (
    <div style={{background:'#000',color:'#fff',minHeight:'100vh',padding:20,textAlign:'center'}}>
      <h1 style={{fontSize:32,background:'linear-gradient(45deg,#ff0050,#a855f7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>SOT TOK</h1>
      <p>বাংলা শর্ট ভিডিও অ্যাপ</p>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="তোমার নাম লেখো" style={{width:'100%',padding:12,marginTop:20,borderRadius:10,background:'#222',color:'#fff',border:'none'}} />
      <button onClick={()=>{localStorage.setItem('sottok_user',name||'SOT TOK User'); navigate({to:'/feed'})}} style={{width:'100%',padding:13,marginTop:15,borderRadius:10,background:'linear-gradient(45deg,#ff0050,#a855f7)',color:'#fff',border:'none',fontWeight:'bold'}}>লগইন করো</button>
    </div>
  )
}