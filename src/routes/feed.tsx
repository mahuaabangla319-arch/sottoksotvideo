// ========== SHORT TOK - ALL IN ONE FORM (পুরনো + নতুন) ==========
// পুরনো ডাটা ডিলিট হবে না - shorttok_my_videos, sottok_videos, shorttok_feed_extra থেকেই নেবে

// --- 1. DOWNLOAD - SHORT TOK Watermark সহ গ্যালারিতে ---
export async function downloadWithWatermark(videoUrl:string, caption:string){
  try{
    const v=document.createElement("video"); v.src=videoUrl; v.muted=true; v.playsInline=true; await v.play();
    const c=document.createElement("canvas"); c.width=v.videoWidth||720; c.height=v.videoHeight||1280;
    const ctx=c.getContext("2d")!;
    const stream=(c as any).captureStream(30);
    const rec=new MediaRecorder(stream,{mimeType:"video/webm"}); const chunks:any[]=[];
    rec.ondataavailable=(e:any)=>{if(e.data.size)chunks.push(e.data)};
    rec.onstop=()=>{ const blob=new Blob(chunks,{type:"video/webm"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="SHORT-TOK-"+Date.now()+".webm"; a.click(); };
    rec.start();
    const draw=()=>{ if(v.paused||v.ended){rec.stop(); return;}
      ctx.drawImage(v,0,0,c.width,c.height);
      ctx.fillStyle="rgba(0,0,0,0.55)"; ctx.fillRect(0,c.height-70,c.width,70);
      ctx.fillStyle="#fff"; ctx.font="bold 28px Arial"; ctx.fillText("SHORT TOK  •  @"+(caption||"shorttok"),20,c.height-25);
      requestAnimationFrame(draw);
    }; draw();
  }catch{ const a=document.createElement("a"); a.href=videoUrl; a.download="SHORT-TOK-"+Date.now()+".mp4"; a.click(); }
}

// --- 2. LIKE / FOLLOW / SAVE / COMMENT - সব সত্যি কাজ করবে ---
export function toggleLike(id:string){ const k="shorttok_likes"; const l=JSON.parse(localStorage.getItem(k)||"[]"); const i=l.indexOf(id); if(i>=0)l.splice(i,1); else l.push(id); localStorage.setItem(k,JSON.stringify(l)); return l.includes(id); }
export function toggleFollow(id:string){ const k="shorttok_following"; const f=JSON.parse(localStorage.getItem(k)||"[]"); const i=f.indexOf(id); if(i>=0)f.splice(i,1); else f.push(id); localStorage.setItem(k,JSON.stringify(f)); return f.includes(id); }
export function toggleSave(id:string){ const k="shorttok_saved"; const s=JSON.parse(localStorage.getItem(k)||"[]"); const i=s.indexOf(id); if(i>=0)s.splice(i,1); else s.push(id); localStorage.setItem(k,JSON.stringify(s)); return s.includes(id); }
export function addComment(vid:string, text:string, name:string){ const k="shorttok_comments"; const c=JSON.parse(localStorage.getItem(k)||"{}"); if(!c[vid])c[vid]=[]; c[vid].push({name,text,at:Date.now()}); localStorage.setItem(k,JSON.stringify(c)); return c[vid]; }
export function getComments(vid:string){ const c=JSON.parse(localStorage.getItem("shorttok_comments")||"{}"); return c[vid]||[]; }

// --- 3. POST - Home + Profile দুই জায়গায় + Notification ---
export function postVideoToAll(newItem:any, uid:string, userName:string){
  const get=(k:string)=>JSON.parse(localStorage.getItem(k)||"[]");
  const put=(k:string,v:any)=>localStorage.setItem(k,JSON.stringify(v));
  put("shorttok_my_videos",[newItem,...get("shorttok_my_videos")]);
  put("shorttok_feed_extra",[newItem,...get("shorttok_feed_extra")]);
  put("sottok_videos",[newItem,...get("sottok_videos")]);
  put("shorttok_notifications_all",[{id:"nt-"+Date.now(),actor_name:userName,type:"video",video_id:newItem.id,message:`🎬 ${userName} নতুন ভিডিও পোস্ট করেছে`,created_at:Date.now(),is_read:false},...get("shorttok_notifications_all")].slice(0,100));
}

// --- 4. PROFILE - পুরো Instagram এর মতো, নাম শুধু SHORT TOK ---
export function ProfileInstagram({user, myVideos, onOpenVideo}:any){
  const [tab,setTab]=React.useState("videos");
  const allOld=[...(JSON.parse(localStorage.getItem("shorttok_my_videos")||"[]")),...(JSON.parse(localStorage.getItem("sottok_videos")||"[]"))];
  const seen=new Set(); const videos=(myVideos?.length?myVideos:allOld).filter((v:any)=>{if(seen.has(v.id))return false; seen.add(v.id); return true;});
  const savedIds=JSON.parse(localStorage.getItem("shorttok_saved")||"[]");
  const saved=videos.filter((v:any)=>savedIds.includes(v.id));
  const following=JSON.parse(localStorage.getItem("shorttok_following")||"[]");
  const followers=JSON.parse(localStorage.getItem("shorttok_followers")||"[]");
  const likes=JSON.parse(localStorage.getItem("shorttok_likes")||"[]");
  return (
    <div className="bg-white pb-10">
      <div className="flex items-center justify-between px-3 py-3 border-b sticky top-0 bg-white z-10"><b className="text-lg">🔒 {user?.name||"shorttok"}</b><b className="text-xl">☰</b></div>
      <div className="flex items-center gap-4 px-4 pt-4">
        <div className="w-[85px] h-[85px] rounded-full bg-gradient-to-tr from-[#fe2c55] via-[#ff9a00] to-[#fe2c55] p-[3px] shrink-0"><div className="w-full h-full rounded-full bg-white p-[2px]">{user?.avatar?<img src={user.avatar} className="w-full h-full rounded-full object-cover"/>:<div className="w-full h-full rounded-full bg-[#fe2c55] text-white flex items-center justify-center text-3xl font-black">{(user?.name||"S")[0]}</div>}</div></div>
        <div className="flex flex-1 justify-around text-center"><div><b className="block">{videos.length}</b><span className="text-[12px]">Posts</span></div><div><b className="block">{followers.length}</b><span className="text-[12px]">Followers</span></div><div><b className="block">{following.length}</b><span className="text-[12px]">Following</span></div></div>
      </div>
      <div className="px-4 mt-2"><b className="text-[14px]">{user?.name||"SHORT TOK User"}</b><p className="text-[13px] text-zinc-600">@{user?.username||user?.name||"shorttok"} • নিজের পরিচয় নিজে তৈরি করো</p><p className="text-[12px] text-zinc-500">SHORT TOK • 🎬 ভিডিও • ❤️ পরিচয় • 🌍 নিজের জগৎ</p></div>
      <div className="flex gap-2 px-4 mt-3"><button className="flex-1 bg-zinc-100 rounded-lg py-2 font-bold text-sm">Edit Profile</button><button className="flex-1 bg-zinc-100 rounded-lg py-2 font-bold text-sm">Share Profile</button></div>
      <div className="flex border-t mt-4"><button onClick={()=>setTab("videos")} className={`flex-1 py-3 text-center text-lg ${tab==="videos"?"border-t-2 border-black":"text-zinc-400"}`}>▦</button><button onClick={()=>setTab("saved")} className={`flex-1 py-3 text-center text-lg ${tab==="saved"?"border-t-2 border-black":"text-zinc-400"}`}>🔖</button><button onClick={()=>setTab("tagged")} className={`flex-1 py-3 text-center text-lg ${tab==="tagged"?"border-t-2 border-black":"text-zinc-400"}`}>👤</button></div>
      <div className="grid grid-cols-3 gap-[2px]">{(tab==="videos"?videos:tab==="saved"?saved:[]).map((v:any)=>(<div key={v.id} className="relative aspect-[9/16] bg-black" onClick={()=>onOpenVideo?.(v)}><video src={v.url} className="w-full h-full object-cover" muted playsInline /><span className="absolute bottom-1 left-1 text-white text-[11px] font-bold">▶ {v.views||0}</span><span className="absolute bottom-1 right-1 text-white text-[11px]">❤️ {likes.includes(v.id)?(v.likes||0)+1:v.likes||0}</span><span className="absolute top-1 right-1 text-[10px] bg-black/60 text-white px-1 rounded">SHORT TOK</span></div>))}</div>
      {videos.length===0 && <p className="text-center text-[13px] text-zinc-500 py-10">এখনো কোনো ভিডিও নেই<br/>+ দিয়ে প্রথম ভিডিও বানাও 🎬</p>}
    </div>
  );
}

// --- 5. VIDEO ACTIONS - Like Comment Follow Share Download ---
export function VideoActions({video, currentUser}:any){
  const [liked,setLiked]=React.useState(JSON.parse(localStorage.getItem("shorttok_likes")||"[]").includes(video.id));
  const [saved,setSaved]=React.useState(JSON.parse(localStorage.getItem("shorttok_saved")||"[]").includes(video.id));
  const [following,setFollowing]=React.useState(JSON.parse(localStorage.getItem("shorttok_following")||"[]").includes(video.userId));
  const [showC,setShowC]=React.useState(false); const [txt,setTxt]=React.useState("");
  const [comments,setComments]=React.useState(getComments(video.id));
  return (
    <div className="px-3 py-2">
      <div className="flex gap-4 text-[22px]"><button onClick={()=>setLiked(toggleLike(video.id))}>{liked?"❤️":"🤍"}</button><button onClick={()=>setShowC(!showC)}>💬 {comments.length}</button><button onClick={()=>{navigator.share?.({title:"SHORT TOK",text:video.caption,url:location.href}).catch(()=>{});}}>↗️</button><button onClick={()=>setSaved(toggleSave(video.id))} className="ml-auto">{saved?"🔖":"📑"}</button><button onClick={()=>downloadWithWatermark(video.url, video.caption)}>⬇️</button></div>
      <p className="text-sm mt-1"><b>{video.username}</b> {video.caption}</p><p className="text-[12px] text-zinc-500">🎵 {video.sound} • SHORT TOK</p>
      {!following && <button onClick={()=>setFollowing(toggleFollow(video.userId))} className="mt-1 bg-[#fe2c55] text-white px-4 py-1 rounded-full text-[12px] font-bold">+ Follow</button>}
      {showC && <div className="mt-2 bg-zinc-50 rounded-xl p-2">{comments.map((c:any,i:number)=><p key={i} className="text-[13px]"><b>{c.name}:</b> {c.text}</p>)}<div className="flex gap-2 mt-2"><input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Comment লিখো..." className="flex-1 bg-white border rounded-full px-3 py-1 text-sm"/><button onClick={()=>{if(!txt)return; setComments(addComment(video.id,txt,currentUser?.name||"User")); setTxt("");}} className="bg-black text-white px-3 rounded-full text-sm">Post</button></div></div>}
      <button onClick={()=>downloadWithWatermark(video.url, video.caption)} className="w-full mt-2 bg-zinc-100 rounded-full py-2 text-[12px] font-bold">⬇️ Download • SHORT TOK Watermark সহ গ্যালারিতে যাবে</button>
    </div>
  );
}

// --- 6. GALLERY VIDEO LIST + GALLERY MUSIC LIP-SYNC - সবার জন্য ---
export function GalleryPicker({onPickVideo, onPickSong}:any){
  return (
    <div className="p-3 space-y-3">
      <label className="block bg-zinc-100 rounded-2xl py-3 text-center font-bold text-sm cursor-pointer">📁 গ্যালারি থেকে ভিডিও নাও - লিস্ট থেকে চয়েস করো<input type="file" accept="video/*" multiple className="hidden" onChange={(e)=>{const f=e.target.files?.[0]; if(f) onPickVideo?.(f);}} /></label>
      <label className="block bg-zinc-100 rounded-2xl py-3 text-center font-bold text-sm cursor-pointer">🎵 গ্যালারি থেকে গান নাও - Lip-sync ভিডিও বানাও<input type="file" accept="audio/*" multiple className="hidden" onChange={(e)=>{const f=e.target.files?.[0]; if(f) onPickSong?.(f);}} /></label>
      <p className="text-[11px] text-center text-zinc-500">গ্যালারির ভিডিও + গ্যালারির গান দিয়ে সবাই ভিডিও করতে পারবে • SHORT TOK</p>
    </div>
  );
}