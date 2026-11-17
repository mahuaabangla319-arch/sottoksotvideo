import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Login(){
  const nav=useNavigate();
  const [tab,setTab]=useState("signup");
  const [name,setName]=useState(""); const [mobile,setMobile]=useState("");
  const [gmail,setGmail]=useState(""); const [pin,setPin]=useState("");
  const [cpin,setCpin]=useState("");
  const get=()=>JSON.parse(localStorage.getItem("shorttok_users")||"[]");
  function signup(){
    if(!name||mobile.length!==10||!gmail.includes("@")||pin.length<4) return alert("সব ঠিক করে দাও");
    if(pin!==cpin) return alert("PIN মিলছে না");
    let u=get();
    let old=u.find((x:any)=>x.email===gmail);
    if(old){ old.mobile="+91"+mobile; old.pin=pin; old.name=name; }
    else u.push({email:gmail,name,mobile:"+91"+mobile,pin});
    localStorage.setItem("shorttok_users",JSON.stringify(u));
    alert("হয়ে গেছে ✅"); setTab("login");
  }
  function login(){
    let f=get().find((x:any)=>x.mobile==="+91"+mobile && x.pin===pin);
    if(!f) return alert("মোবাইল বা PIN ভুল");
    localStorage.setItem("shorttok_current",f.email); nav("/feed");
  }
  return <div style={{maxWidth:380,margin:"0 auto",padding:16,background:"#fff",minHeight:"100vh"}}>
    <h2 style={{textAlign:"center"}}>SOT TOK</h2>
    <div style={{display:"flex",gap:8}}><button onClick={()=>setTab("signup")} style={{flex:1,padding:10,borderRadius:99,background:tab==="signup"?"#fe2c55":"#eee",color:tab==="signup"?"#fff":"#000",border:"none",fontWeight:"bold"}}>সাইনআপ</button><button onClick={()=>setTab("login")} style={{flex:1,padding:10,borderRadius:99,background:tab==="login"?"#fe2c55":"#eee",color:tab==="login"?"#fff":"#000",border:"none",fontWeight:"bold"}}>লগইন</button></div>
    {tab==="signup" && <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:14}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="১. নাম" style={{padding:12,borderRadius:12,border:"1px solid #ddd"}}/>
      <input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="২. মোবাইল ১০ সংখ্যা" style={{padding:12,borderRadius:12,border:"1px solid #ddd"}}/>
      <input value={gmail} onChange={e=>setGmail(e.target.value)} placeholder="৩. পুরনো Gmail" style={{padding:12,borderRadius:12,border:"1px solid #ddd"}}/>
      <input type="password" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="৪. PIN" style={{padding:12,borderRadius:12,border:"1px solid #ddd"}}/>
      <input type="password" value={cpin} onChange={e=>setCpin(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="৫. Confirm PIN" style={{padding:12,borderRadius:12,border:"1px solid #ddd"}}/>
      <button onClick={signup} style={{padding:14,borderRadius:99,background:"#fe2c55",color:"#fff",border:"none",fontWeight:"bold"}}>✅ সাইনআপ করো</button>
    </div>}
    {tab==="login" && <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:14}}>
      <input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="মোবাইল নম্বর" style={{padding:12,borderRadius:12,border:"1px solid #ddd"}}/>
      <input type="password" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="PIN" style={{padding:12,borderRadius:12,border:"1px solid #ddd"}}/>
      <button onClick={login} style={{padding:14,borderRadius:99,background:"#fe2c55",color:"#fff",border:"none",fontWeight:"bold"}}>📱 মোবাইল + PIN লগইন</button>
    </div>}
  </div>
}