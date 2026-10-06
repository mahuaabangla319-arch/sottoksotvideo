import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";

function HomeFinal(){
  const [joined, setJoined] = useState<string[]>(()=>JSON.parse(localStorage.getItem("st_joined_groups")||"[]"));
  const [adminData, setAdminData] = useState<any>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTag, setActiveTag] = useState("Trending");
  const [notif, setNotif] = useState<string>("");

  const tags = ["Trending","Comedy","Food","Dance | Sing","Family","#GaneshChaturdashi","#SotTokOfficial","#Viral","#Bengali"];

  const videos = [
    {id:1, user:"@kolkataofficial", views:"29 ভিউ", likes:2, tag:"Trending", hashtag:"#GaneshChaturdashi", thumb:"🙏", title:"গণেশ চতুর্থী স্পেশাল"},
    {id:2, user:"@sottokofficial", views:"1.2k ভিউ", likes:125, tag:"Comedy", hashtag:"#SotTokOfficial", thumb:"😂", title:"Comedy Video Viral"},
    {id:3, user:"@purulia_star", views:"890 ভিউ", likes:45, tag:"Dance | Sing", hashtag:"#Viral", thumb:"💃", title:"Dance Trending Now"},
    {id:4, user:"@bengali_food", views:"560 ভিউ", likes:32, tag:"Food", hashtag:"#Bengali", thumb:"🍛", title:"Food Trending"},
  ];

  useEffect(()=>{
    const all = JSON.parse(localStorage.getItem("st_admin_all")||"{}");
    setAdminData(all);
    const gData = JSON.parse(localStorage.getItem("st_22_public")||"[]");
    const g = gData.filter((x:any)=>x.tab==="Groups");
    if(g.length>0) setGroups(g);
    else setGroups([
      {id:"1", name:"🙏 Ganesh Thakur Official Group", leader:"@sottokofficial", members:1250},
      {id:"2", name:"SOT TOK Family", leader:"@sottokofficial", members:890},
    ]);
  },[]);

  const handleJoin = (id:string, name:string) => {
    if(joined.includes(id)){
      setNotif(`Already Joined ${name} ✅`);
    } else {
      const newJ = [...joined, id];
      setJoined(newJ);
      localStorage.setItem("st_joined_groups", JSON.stringify(newJ));
      setNotif(`✅ ${name} JOINED! Leader @sottokofficial`);
    }
    setTimeout(()=>setNotif(""), 2000);
    // ভিডিও পেজে নিয়ে যাবে না, গ্রুপে থাকবে
  };

  const handleTagClick = (tag:string) => {
    setActiveTag(tag);
    setNotif(`🔍 ${tag} ভিডিও দেখাচ্ছে...`);
    setTimeout(()=>setNotif(""), 1500);
  };

  const handleVideoClick = (v:any) => {
    window.location.href = `/watch?id=${v.id}&tag=${v.hashtag}`;
  };

  const filteredVideos = activeTag==="Trending"? videos : videos.filter(v=>v.tag===activeTag || v.hashtag===activeTag);

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {notif && (
        <div className="fixed top-2 left-2 right-2 z-50 bg-black text-white p-3 rounded-xl text-center text-sm font-bold animate-bounce">
          {notif}
        </div>
      )}

      {/* SEARCH */}
      <div className="p-3">
        <div className="bg-gray-100 rounded-full p-3 flex items-center gap-2">
          <span>🔍</span>
          <input placeholder="SOT ID বা নাম দিয়ে খুঁজুন" className="bg-transparent w-full text-sm outline-none" />
        </div>
      </div>

      {/* BANNER - Admin থেকে LIVE */}
      <div className="mx-3 rounded-2xl overflow-hidden border-2 border-orange-400 bg-gradient-to-br from-orange-100 to-yellow-100">
        <div className="p-3 text-center">
          <p className="text-4xl">🙏</p>
          <h2 className="font-bold text-orange-800">{adminData["Banners"]||"গণেশ চতুর্থী স্পেশাল কনটেস্ট"}</h2>
          <p className="text-xs">নিজের ক্যামেরায় ভিডিও বানাও</p>
          <div className="flex justify-center gap-2 mt-2 text-[10px]">
            <span className="bg-white px-2 py-1 rounded-full">📷 নিজের ক্যামেরায়</span>
            <span className="bg-white px-2 py-1 rounded-full" onClick={()=>handleTagClick("#GaneshChaturdashi")}># {activeTag}</span>
            <span className="bg-white px-2 py-1 rounded-full">🎁 জিত নাও</span>
          </div>
          <div className="bg-black text-white mt-2 py-1 rounded-full text-xs">▶️ SOT TOK OFFICIAL</div>
        </div>
      </div>

      {/* 1️⃣ GROUP JOIN SYSTEM - CLICK JOIN */}
      <div className="mx-3 mt-4">
        <h2 className="font-bold text-sm">👥 OFFICIAL GROUPS - JOIN করো</h2>
        <div className="mt-2 space-y-2">
          {groups.map((g:any)=>(
            <div key={g.id} className="bg-zinc-900 text-white p-3 rounded-2xl flex justify-between items-center border border-orange-500/30">
              <div>
                <p className="font-bold text-sm">{g.name}</p>
                <p className="text-[10px] text-yellow-400">👑 {g.leader||"@sottokofficial"} • 👥 {g.members} • PUBLIC</p>
              </div>
              <button
                onClick={()=>handleJoin(g.id.toString(), g.name)}
                className={`px-5 py-2 rounded-full text-xs font-bold ${joined.includes(g.id.toString())?'bg-green-600':'bg-blue-600 animate-pulse'}`}
              >
                {joined.includes(g.id.toString())?'Joined ✅':'JOIN'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* আজকের সেরা নির্মাতা */}
      <div className="mx-3 mt-4 bg-gray-50 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span>🏆</span><p className="font-bold text-sm">আজকের সেরা নির্মাতা</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2 items-center">
            <span className="text-pink-500 font-bold">1</span>
            <div>
              <p className="font-bold text-sm">{adminData["Leaderboard"]||"@kolkataofficial"}</p>
              <p className="text-xs text-gray-500">{adminData["Users"]||"1 ভিডিও • 29 ভিউ"}</p>
            </div>
          </div>
          <span className="text-xs">❤️ 2</span>
        </div>
      </div>

      {/* 2️⃣ HASHTAG + TRENDING FILTER */}
      <div className="mt-4 px-3 overflow-x-auto">
        <div className="flex gap-3 whitespace-nowrap">
          {tags.map(t=>(
            <button
              key={t}
              onClick={()=>handleTagClick(t)}
              className={`text-sm pb-1 ${activeTag===t?'font-bold border-b-2 border-pink-500 text-black':'text-gray-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 3️⃣ TRENDING VIDEOS - এখন Trending চলছে */}
      <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
        {filteredVideos.map(v=>(
          <div key={v.id} onClick={()=>handleVideoClick(v)} className="bg-black rounded-2xl p-2 text-white relative h-40 flex flex-col justify-between cursor-pointer">
            <div className="text-3xl text-center mt-6">{v.thumb}</div>
            <div>
              <p className="text-[11px] font-bold">{v.title}</p>
              <p className="text-[10px] text-yellow-400">{v.hashtag}</p>
              <p className="text-[10px] text-gray-400">{v.user} • {v.views} • ❤️{v.likes}</p>
            </div>
            <div className="absolute top-2 right-2 bg-red-600 text-[8px] px-2 py-1 rounded-full">LIVE TRENDING</div>
          </div>
        ))}
      </div>

      {/* 4️⃣ আরও কিছু Extra */}
      <div className="mx-3 mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div onClick={()=>handleTagClick("#GaneshChaturdashi")} className="bg-orange-100 p-3 rounded-xl">🙏<br/>#Ganesh<br/>ভিডিও</div>
        <div onClick={()=>window.location.href='/groups'} className="bg-blue-100 p-3 rounded-xl">👥<br/>Groups<br/>LIVE</div>
        <div onClick={()=>window.location.href='/admin'} className="bg-green-100 p-3 rounded-xl">⚙️<br/>Admin<br/>22 Plans</div>
      </div>

      {/* BOTTOM NAV - তোমার ছবির মতো */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white flex justify-around py-2 text-[10px] border-t border-zinc-800">
        <div className="text-center" onClick={()=>window.location.href='/'}>🏠<br/>হোম</div>
        <div className="text-center text-red-400">🧭<br/>এক্সপ্লোরার</div>
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-xl">➕</div>
        <div className="text-center">🔔<br/>ইনবক্স</div>
        <div className="text-center">👤<br/>প্রোফাইল</div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({ component: HomeFinal, })