import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const nav = useNavigate();
  const [showSplash, setShowSplash] = useState(true); // প্রথমে ডিজাইন
  const [tab, setTab] = useState<"signup"|"login">("signup");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");

  // আগেই লগইন থাকলে সোজা Feed
  useEffect(()=>{ if(localStorage.getItem("shorttok_current")) nav("/feed"); },[]);
  // Splash - 2.5 সেকেন্ড SHORT TOK ডিজাইন দেখাবে, তারপর Sign Up
  useEffect(()=>{ const t=setTimeout(()=>setShowSplash(false), 2500); return ()=>clearTimeout(t); },[]);

  const getUsers = ()=> JSON.parse(localStorage.getItem("shorttok_users")||"[]");

  function handleSignup(){
    if(!fullName.trim()) return alert("নাম দাও");
    if(!username.trim()) return alert("Username দাও - যেমন: somnath701");
    if(mobile.length!==10) return alert("১০ সংখ্যার মোবাইল দাও");
    if(!gmail.includes("@")) return alert("Gmail দাও");
    if(password.length<4) return alert("Password ৪ সংখ্যার দাও");
    let users = getUsers();
    if(users.find((u:any)=>u.username===username.toLowerCase())) return alert("এই Username টা নেওয়া হয়ে গেছে");
    if(users.find((u:any)=>u.mobile==="+91"+mobile)) return alert("এই মোবাইল দিয়ে আগেই আছে, Log In করো");
    let old = users.find((u:any)=>u.email===gmail);
    if(old){ old.name=fullName; old.username=username.toLowerCase(); old.mobile="+91"+mobile; old.pin=password; localStorage.setItem("shorttok_users", JSON.stringify(users)); }
    else { users.push({email:gmail, name:fullName, username:username.toLowerCase(), mobile:"+91"+mobile, pin:password}); localStorage.setItem("shorttok_users", JSON.stringify(users)); }
    localStorage.setItem("shorttok_current", gmail);
    nav("/feed");
  }

  function handleLogin(){
    let users = getUsers();
    let found = users.find((u:any)=>(u.username===username.toLowerCase() || u.mobile==="+91"+username || u.mobile===username || u.email===username) && u.pin===password);
    if(!found) return alert("Username / Mobile বা Password ভুল");
    localStorage.setItem("shorttok_current", found.email); nav("/feed");
  }

  // ---------- ১. প্রথমে SHORT TOK ডিজাইন ----------
  if(showSplash){
    return (
      <div style={{minHeight:"100vh", background:"#000", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:20}}>
        <div style={{width:110, height:110, borderRadius:28, background:"#fe2c55", display:"flex", alignItems:"center", justifyContent:"center", fontSize:58, fontWeight:"900", boxShadow:"0 0 40px #fe2c55"}}>S</div>
        <h1 style={{fontSize:42, fontWeight:"900", letterSpacing:2, margin:"18px 0 4px"}}>SHORT TOK</h1>
        <p style={{fontSize:16, color:"#ddd", margin:0}}>নিজের পরিচয় নিজে তৈরি করো</p>
        <p style={{fontSize:12, color:"#888", marginTop:30}}>ভিডিও • পরিচয় • নিজের জগৎ</p>
      </div>
    );
  }

  // ---------- ২. তারপর Sign Up / Log In ----------
  const inp:any = { padding:13, borderRadius:10, border:"1px solid #ddd", background:"#fafafa", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" };
  return (
    <div style={{maxWidth:380, margin:"0 auto", padding:"20px 16px", background:"#fff", minHeight:"100vh", fontFamily:"sans-serif"}}>
      <div style={{textAlign:"center", marginBottom:14}}>
        <div style={{width:64, height:64, borderRadius:18, background:"#fe2c55", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:"900", margin:"0 auto"}}>S</div>
        <h1 style={{fontSize:28, fontWeight:"900", letterSpacing:1, margin:"8px 0 2px"}}>SHORT TOK</h1>
        <p style={{fontSize:14, fontWeight:"bold", margin:0}}>নিজের পরিচয় নিজে তৈরি করো</p>
      </div>

      <div style={{border:"1px solid #eee", borderRadius:12, padding:18}}>
        {tab==="signup" ? (
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            <input style={inp} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full Name" />
            <input style={inp} value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g,""))} placeholder="Username - যেমন somnath701" />
            <input style={inp} value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="Mobile - 10 digit" inputMode="numeric" />
            <input style={inp} value={gmail} onChange={e=>setGmail(e.target.value)} placeholder="Gmail" />
            <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password - 4 digit" />
            <button onClick={handleSignup} style={{background:"#fe2c55", color:"#fff", border:"none", padding:13, borderRadius:10, fontWeight:"bold", fontSize:15}}>Sign Up</button>
          </div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            <input style={inp} value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username / Mobile / Gmail" />
            <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <button onClick={handleLogin} style={{background:"#fe2c55", color:"#fff", border:"none", padding:13, borderRadius:10, fontWeight:"bold", fontSize:15}}>Log In</button>
          </div>
        )}
      </div>

      <div style={{textAlign:"center", marginTop:12, fontSize:14}}>
        {tab==="signup" ? <>অ্যাকাউন্ট আছে? <b onClick={()=>setTab("login")} style={{color:"#fe2c55", cursor:"pointer"}}>Log In</b></> : <>অ্যাকাউন্ট নেই? <b onClick={()=>setTab("signup")} style={{color:"#fe2c55", cursor:"pointer"}}>Sign Up</b></>}
      </div>
      <p style={{textAlign:"center", fontSize:11, color:"#888", marginTop:14}}>ডিজাইন, ভিডিও, লাইক - সব আগের মতোই থাকবে।</p>
    </div>
  );
}