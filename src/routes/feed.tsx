// ========== SHORT TOK - FINAL ALL IN ONE - HOME + VIDEO + SIGNUP MOBILE/GMAIL ==========
// পুরনো ডাটা থাকবে - shorttok_users, shorttok_my_videos, sottok_videos

// --- 1. SIGNUP / LOGIN - 👤 চিহ্নে ক্লিক করলে এটাই খুলবে - Sign Up লেখা আসবে না ---
export function AuthSheet({onLogin}:any){
  const [mode,setMode]=React.useState("mobile"); // mobile | gmail
  const [name,setName]=React.useState("");
  const [mobile,setMobile]=React.useState("");
  const [gmail,setGmail]=React.useState("");
  const [show,setShow]=React.useState(true);
  if(!show) return null;

  const handleOK=()=>{
    if(!name.trim()) return alert("নাম দাও");
    let key="", val="";
    if(mode==="mobile"){ if(mobile.length<10) return alert("সঠিক Mobile Number দাও"); key=mobile; val=mobile; }
    else { if(!gmail.includes("@")) return alert("সঠিক Gmail দাও"); key=gmail; val=gmail; }

    const users=JSON.parse(localStorage.getItem("shorttok_users")||"[]");
    // পুরনো আছে কিনা চেক - থাকলে Active করে দাও, নতুন বানাবে না
    let found=users.find((u:any)=>u.mobile===key||u.gmail===key||u.id===key);
    if(found){
      found.name=name; // নাম আপডেট
      found.isActive=true;
      localStorage.setItem("shorttok_users",JSON.stringify(users));
      localStorage.setItem("shorttok_current",JSON.stringify(found));
      alert("Welcome Back "+name+" ✅ পুরনো Profile Active হয়ে গেছে");
      onLogin?.(found); setShow(false); return;
    }
    // নতুন Profile
    const newUser={id:"u-"+Date.now(), name:name, username:"@"+name.toLowerCase().replace(/\s/g,"")+Math.floor(Math.random()*99), mobile:mode==="mobile"?mobile:"", gmail:mode==="gmail"?gmail:"", avatar:"", bio:"SHORT TOK • নিজের পরিচয় নিজে তৈরি করো", isActive:true, createdAt:Date.now()};
    localStorage.setItem("shorttok_users",JSON.stringify([newUser,...users]));
    localStorage.setItem("shorttok_current",JSON.stringify(newUser));
    alert("Profile তৈরি হয়ে গেছে ✅ "+name);
    onLogin?.(newUser); setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-end justify-center" onClick={()=>setShow(false)}>
      <div className="bg-white w-full max-w-md rounded-t-[24px] p-5 pb-8" onClick={e=>e.stopPropagation()}>
        <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-4"></div>
        <b className="text-xl block text-center">SHORT TOK</b>
        <p className="text-center text-[13px] text-zinc-500 mt-1">নিজের Profile বানাও • ১০ সেকেন্ডে</p>
        {/* Mobile / Gmail ট্যাব */}
        <div className="flex bg-zinc-100 rounded-full p-1 mt-4">
          <button onClick={()=>setMode("mobile")} className={`flex-1 py-2 rounded-full font-bold text-sm ${mode==="mobile"?"bg-black text-white":""}`}>📱 Mobile Number</button>
          <button onClick={()=>setMode("gmail")} className={`flex-1 py-2 rounded-full font-bold text-sm ${mode==="gmail"?"bg-black text-white":""}`}>📧 Gmail</button>
        </div>
        <p className="text-[13px] font-bold mt-4">👤 নাম দাও</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="তোমার নাম লিখো..." className="w-full bg-zinc-100 rounded-xl px-4 py-3 mt-1 outline-none" />
        {mode==="mobile" ? <>
          <p className="text-[13px] font-bold mt-3">📱 Mobile Number দাও</p>
          <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="10 Digit Mobile Number" type="tel" maxLength={10} className="w-full bg-zinc-100 rounded-xl px-4 py-3 mt-1 outline-none" />
        </> : <>
          <p className="text-[13px] font-bold mt-3">📧 Gmail দাও</p>
          <input value={gmail} onChange={e=>setGmail(e.target.value)} placeholder="example@gmail.com" type="email" className="w-full bg-zinc-100 rounded-xl px-4 py-3 mt-1 outline-none" />
        </>}
        <button onClick={handleOK} className="w-full bg-[#fe2c55] text-white rounded-full py-3 font-bold mt-4 text-[16px]">OK ✅ Profile তৈরি করো</button>
        <p className="text-center text-[11px] text-zinc-400 mt-2">পুরনো Profile থাকলে Mobile / Gmail দিলেই Active হয়ে যাবে</p>
      </div>
    </div>
  );
}

// --- 2. HOME FEED - সবাই সবার ভিডিও দেখবে ---
export function HomeFeedAll({onOpenProfile}:any){
  const allOld=[...(JSON.parse(localStorage.getItem("sottok_videos")||"[]")),...(JSON.parse(localStorage.getItem("shorttok_feed_extra")||"[]")),...(JSON.parse(localStorage.getItem("shorttok_my_videos")||"[]"))];
  const seen=new Set(); const videos=allOld.filter((v:any)=>{if(seen.has(v.id))return false; seen.add(v.id); return true;});
  return (
    <div className="bg-black pb-20">
      <div className="sticky top-0 bg-black text-white px-3 py-3 flex justify-between items-center z-10"><b className="text-xl">SHORT TOK</b><span>🔍 💬</span></div>
      {videos.map((v:any)=>(
        <div key={v.id} className="relative bg-black mb-[2px]">
          <video src={v.url} controls className="w-full aspect-[9/16] object-cover" />
          <div className="absolute bottom-2 left-3 text-white"><b onClick={()=>onOpenProfile?.(v)}>@{v.username||v.userId}</b><p className="text-[13px]">{v.caption}</p><p className="text-[12px] opacity-80">🎵 {v.sound||"Original sound"} • SHORT TOK</p></div>
          <div className="absolute bottom-2 right-3 flex flex-col gap-4 text-white text-center"><span>❤️<br/>{v.likes||0}</span><span>💬<br/>{v.comments||0}</span><span>↗️</span><span>⬇️</span></div>
        </div>
      ))}
      {videos.length===0 && <p className="text-white text-center py-20">এখনো ভিডিও নেই<br/>+ দিয়ে প্রথম ভিডিও বানাও 🎬</p>}
    </div>
  );
}

// --- 3. PROFILE - Instagram এর মতো ---
export function ProfileInstagram({user, myVideos, onOpenVideo}:any){
  const [tab,setTab]=React.useState("videos");
  const allOld=[...(JSON.parse(localStorage.getItem("shorttok_my_videos")||"[]")),...(JSON.parse(localStorage.getItem("sottok_videos")||"[]"))];
  const seen=new Set(); const videos=(myVideos?.length?myVideos:allOld).filter((v:any)=>{if(seen.has(v.id))return false; seen.add(v.id); return true;});
  const savedIds=JSON.parse(localStorage.getItem("shorttok_saved")||"[]");
  const saved=videos.filter((v:any)=>savedIds.includes(v.id));
  const following=JSON.parse(localStorage.getItem("shorttok_following")||"[]");
  const followers=JSON.parse(localStorage.getItem("shorttok_followers")||"[]");
  return (
    <div className="bg-white pb-10">
      <div className="flex items-center justify-between px-3 py-3 border-b"><b>🔒 {user?.name||"shorttok"}</b><b>☰</b></div>
      <div className="flex items-center gap-4 px-4 pt-4">
        <div className="w-[85px] h-[85px] rounded-full bg-gradient-to-tr from-[#fe2c55] via-[#ff9a00] to-[#fe2c55] p-[3px]"><div className="w-full h-full rounded-full bg-white p-[2px]"><div className="w-full h-full rounded-full bg-[#fe2c55] text-white flex items-center justify-center text-3xl font-black">{(user?.name||"S")[0]}</div></div></div>
        <div className="flex flex-1 justify-around text-center"><div><b className="block">{videos.length}</b><span className="text-[12px]">Posts</span></div><div><b className="block">{followers.length}</b><span className="text-[12px]">Followers</span></div><div><b className="block">{following.length}</b><span className="text-[12px]">Following</span></div></div>
      </div>
      <div className="px-4 mt-2"><b>{user?.name||"SHORT TOK User"}</b><p className="text-[13px] text-zinc-600">@{user?.username||"shorttok"}</p><p className="text-[12px] text-zinc-500">SHORT TOK • 🎬 ভিডিও • ❤️ পরিচয়</p></div>
      <div className="flex gap-2 px-4 mt-3"><button className="flex-1 bg-zinc-100 rounded-lg py-2 font-bold text-sm">Edit Profile</button><button className="flex-1 bg-zinc-100 rounded-lg py-2 font-bold text-sm">Share Profile</button></div>
      <div className="flex border-t mt-4"><button onClick={()=>setTab("videos")} className={`flex-1 py-3 ${tab==="videos"?"border-t-2 border-black":"text-zinc-400"}`}>▦</button><button onClick={()=>setTab("saved")} className={`flex-1 py-3 ${tab==="saved"?"border-t-2 border-black":"text-zinc-400"}`}>🔖</button><button onClick={()=>setTab("tagged")} className={`flex-1 py-3 ${tab==="tagged"?"border-t-2 border-black":"text-zinc-400"}`}>👤</button></div>
      <div className="grid grid-cols-3 gap-[2px]">{(tab==="videos"?videos:tab==="saved"?saved:[]).map((v:any)=>(<div key={v.id} className="relative aspect-[9/16] bg-black" onClick={()=>onOpenVideo?.(v)}><video src={v.url} className="w-full h-full object-cover" muted /><span className="absolute top-1 right-1 text-[9px] bg-black/60 text-white px-1 rounded">SHORT TOK</span></div>))}</div>
    </div>
  );
}

// --- 4. PEOPLE - সব ইউজার দেখাবে ---
export function PeopleList({onOpenProfile}:any){
  const [search,setSearch]=React.useState("");
  const users=JSON.parse(localStorage.getItem("shorttok_users")||"[]");
  const filtered=users.filter((u:any)=>(u.name||"").toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="bg-white pb-20">
      <div className="sticky top-0 bg-white px-3 py-3 border-b"><b>👥 People • SHORT TOK</b><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 People খুঁজো..." className="w-full mt-2 bg-zinc-100 rounded-full px-4 py-2 text-sm outline-none" /></div>
      {filtered.map((u:any)=>(<div key={u.id} className="flex items-center gap-3 px-3 py-2 border-b" onClick={()=>onOpenProfile?.(u)}><div className="w-12 h-12 rounded-full bg-[#fe2c55] text-white flex items-center justify-center font-black">{(u.name||"S")[0]}</div><div className="flex-1"><b className="block text-sm">{u.name}</b><span className="text-[12px] text-zinc-500">{u.username} • {u.isActive?"🟢 Active":"⚪"}</span></div><button className="bg-[#fe2c55] text-white px-4 py-1 rounded-full text-[12px] font-bold">View</button></div>))}
      {filtered.length===0 && <p className="text-center py-10 text-sm">এখনো কেউ নেই<br/>👤 তে চাপ দিয়ে প্রথম Profile বানাও</p>}
    </div>
  );
}

// --- 5. DOWNLOAD / LIKE / COMMENT / FOLLOW ---
export function toggleLike(id:string){ const k="shorttok_likes"; const l=JSON.parse(localStorage.getItem(k)||"[]"); const i=l.indexOf(id); if(i>=0)l.splice(i,1); else l.push(id); localStorage.setItem(k,JSON.stringify(l)); return l.includes(id); }
export function toggleFollow(id:string){ const k="shorttok_following"; const f=JSON.parse(localStorage.getItem(k)||"[]"); const i=f.indexOf(id); if(i>=0)f.splice(i,1); else f.push(id); localStorage.setItem(k,JSON.stringify(f)); return f.includes(id); }
export async function downloadWithWatermark(url:string, caption:string){ const a=document.createElement("a"); a.href=url; a.download="SHORT-TOK-"+Date.now()+".mp4"; a.click(); }
export function postVideoToAll(newItem:any){ const get=(k:string)=>JSON.parse(localStorage.getItem(k)||"[]"); const put=(k:string,v:any)=>localStorage.setItem(k,JSON.stringify(v)); put("shorttok_my_videos",[newItem,...get("shorttok_my_videos")]); put("shorttok_feed_extra",[newItem,...get("shorttok_feed_extra")]); put("sottok_videos",[newItem,...get("sottok_videos")]); }

// --- 6. BOTTOM BAR - 👤 তে ক্লিক করলে AuthSheet খুলবে, Checking আসবে না ---
// feed.tsx এ Bottom Bar এ এইটা বসাও:
// <button onClick={()=>setShowAuth(true)}>👤</button>
// {showAuth && <AuthSheet onLogin={(u)=>{setCurrentUser(u); setShowAuth(false);}} />}
// Checking / Loading / Verifying লেখা রাখবে না।