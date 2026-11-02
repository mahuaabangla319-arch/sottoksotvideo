import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/home" }), 4000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div style={{minHeight:'100vh', background:'#1a1033', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <div onClick={()=>navigate({to:"/create"})} style={{width:'100%', maxWidth:'360px', background:'linear-gradient(to bottom right, #2d1b69, #1a1033)', border:'1px solid gold', borderRadius:'24px', padding:'20px', textAlign:'center'}}>
        <h1 style={{color:'#FFD700', fontSize:'36px', fontWeight:'900'}}>SOT TOK</h1>
        <p style={{color:'#ffeaa7', fontSize:'14px'}}>Happy Diwali Special Offer 2026</p>
        <h2 style={{color:'white', marginTop:'15px', fontWeight:'bold'}}>দীপাবলি স্পেশাল কনটেস্ট<br/>নিজের ক্যামেরায় ভিডিও বানাও<br/><span style={{color:'#FFD700'}}>- জিতে নাও বিশেষ পুরস্কার</span></h2>
        <div style={{marginTop:'15px', background:'#FFD700', color:'black', padding:'10px', borderRadius:'20px', fontWeight:'bold'}}>SOT TOK OFFICIAL - ক্লিক করো</div>
        <p style={{color:'white', fontSize:'10px', marginTop:'10px'}}>🪔 🪔 🪔 ব্যানারে ক্লিক করো 🪔 🪔 🪔</p>
      </div>
      <button onClick={()=>navigate({to:"/home"})} style={{marginTop:'15px', background:'white', color:'black', padding:'10px 20px', borderRadius:'10px', fontWeight:'bold'}}>Trending ভিডিও দেখো</button>
    </div>
  )
}