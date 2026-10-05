import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ADMIN_EMAIL = "mahuaabangla319@gmail.com";
const ADMIN_PASS = "SOT@2026Admin";

export default function Admin() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState("Boost Engine");
  const [users, setUsers] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  const [vidId, setVidId] = useState(""); const [vLikes, setVLikes] = useState(""); const [vViews, setVViews] = useState("");
  const [sotId, setSotId] = useState(""); const [fCount, setFCount] = useState("");
  const [verifyId, setVerifyId] = useState(""); const [tick, setTick] = useState("blue"); const [frameUrl, setFrameUrl] = useState(""); const [frameName, setFrameName] = useState("");
  const [bannerUrl, setBannerUrl] = useState(""); const [songTitle, setSongTitle] = useState(""); const [songUrl, setSongUrl] = useState("");

  useEffect(()=>{ check(); },[]);
  const check = async () => {
    const {data:{user}} = await supabase.auth.getUser();
    if(!user || user.email !== ADMIN_EMAIL){ toast.error("Only Admin"); navigate("/"); return; }
    const {data:u} = await supabase.from("profiles").select("*").limit(50);
    if(u) setUsers(u);
    const {data:v} = await supabase.from("videos").select("*").limit(50);
    if(v) setVideos(v);
  };

  const boostVideo = async () => {
    if(!vidId) return toast.error("Video ID দাও দাদা");
    const {data:vd} = await supabase.from("videos").select("likes,views").eq("id", vidId).single();
    if(!vd) return toast.error("Video পাওয়া যায়নি");
    await supabase.from("videos").update({ likes: (vd.likes||0)+(parseInt(vLikes)||0), views: (vd.views||0)+(parseInt(vViews)||0) }).eq("id", vidId);
    await supabase.from("admin_boost_logs").insert({target_id: vidId, type:"video", likes: parseInt(vLikes)||0, views: parseInt(vViews)||0});
    toast.success(`Done! +${vLikes} Like, +${vViews} View বেড়ে গেছে`);
  };

  const boostUser = async () => {
    if(!sotId) return toast.error("SOT ID দাও");
    const {data:pr} = await supabase.from("profiles").select("followers_count").eq("sot_id", sotId).single();
    if(!pr) return toast.error("User পাওয়া যায়নি");
    await supabase.from("profiles").update({followers_count: (pr.followers_count||0)+(parseInt(fCount)||0)}).eq("sot_id", sotId);
    toast.success(`${sotId} তে +${fCount} Follower Add হয়ে গেছে`);
  };

  const giveTick = async () => {
    if(!verifyId) return toast.error("SOT ID দাও");
    await supabase.from("profiles").update({is_verified:true, verification_type:tick}).eq("sot_id", verifyId);
    await supabase.from("admin_verifications").upsert({user_sot_id: verifyId, tick_type: tick});
    toast.success(`${verifyId} কে ${tick} tick দিয়ে দিলাম`);
  };

  const uploadFrame = async () => {
    if(!frameUrl) return toast.error("Frame Image URL দাও");
    await supabase.from("admin_frames").insert({name: frameName||"Diamond", image_url: frameUrl, type:"diamond"});
    toast.success("Diamond Frame Upload হয়ে গেছে! এখন Verification থেকে দিতে পারবে");
  };

  const addBanner = async () => {
    if(!bannerUrl) return toast.error("Banner URL দাও");
    await supabase.from("admin_banners").insert({image_url: bannerUrl, position:"home_slider", active:true});
    toast.success("Banner Add হয়ে গেছে - Home এ দেখাবে");
  };

  const addSong = async () => {
    if(!songUrl) return toast.error("Song URL দাও");
    await supabase.from("admin_songs").insert({title: songTitle||"New Song", audio_url: songUrl, category:"Trending", trending:true});
    toast.success("গান Add হয়ে গেছে - ইউজারদের ক্যামেরায় চলে আসবে");
  };

  if(!auth) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Card className="bg-zinc-900 border-zinc-800 w-96"><CardHeader><CardTitle className="text-white">God Mode Login</CardTitle><p className="text-xs text-zinc-500">{ADMIN_EMAIL}</p></CardHeader>
      <CardContent className="space-y-3"><Input type="password" placeholder="Password: SOT@2026Admin" value={pass} onChange={e=>setPass(e.target.value)} className="bg-zinc-800 text-white"/><Button className="w-full bg-blue-600" onClick={()=>pass===ADMIN_PASS?setAuth(true):toast.error("Wrong Password")}>Unlock</Button></CardContent></Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 bg-zinc-900 p-4 space-y-2">
        <h1 className="font-bold text-blue-500 mb-4">SOT TOK GOD</h1>
        {["Dashboard","Boost Engine","Verification & Frames","Banners","Music Library","Camera Filters","Users","Videos"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`w-full text-left p-2 rounded text-sm ${tab===t?'bg-blue-600':'bg-zinc-800'}`}>{t}</button>
        ))}
      </aside>
      <main className="flex-1 p-6 space-y-6">
        <h2 className="text-2xl font-bold">{tab}</h2>

        {tab==="Boost Engine" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle>Video ID দিয়ে Like/View বাড়াও</CardTitle></CardHeader><CardContent className="space-y-3">
              <Input placeholder="Video ID paste করো" value={vidId} onChange={e=>setVidId(e.target.value)} className="bg-zinc-800"/>
              <div className="flex gap-2"><Input placeholder="Like e.g. 100" value={vLikes} onChange={e=>setVLikes(e.target.value)} className="bg-zinc-800"/><Input placeholder="View e.g. 100" value={vViews} onChange={e=>setVViews(e.target.value)} className="bg-zinc-800"/></div>
              <Button onClick={boostVideo} className="w-full bg-blue-600">POST - Boost Now</Button>
            </CardContent></Card>
            <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle>SOT ID দিয়ে Follower বাড়াও</CardTitle></CardHeader><CardContent className="space-y-3">
              <Input placeholder="SOT ID e.g. SOT123" value={sotId} onChange={e=>setSotId(e.target.value)} className="bg-zinc-800"/>
              <Input placeholder="Follower e.g. 5000" value={fCount} onChange={e=>setFCount(e.target.value)} className="bg-zinc-800"/>
              <Button onClick={boostUser} className="w-full bg-green-600">POST - Add Followers</Button>
            </CardContent></Card>
          </div>
        )}

        {tab==="Verification & Frames" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle>Blue/Gold/Red Tick দাও</CardTitle></CardHeader><CardContent className="space-y-3">
              <Input placeholder="SOT ID" value={verifyId} onChange={e=>setVerifyId(e.target.value)} className="bg-zinc-800"/>
              <select value={tick} onChange={e=>setTick(e.target.value)} className="w-full bg-zinc-800 p-2 rounded"><option value="blue">Blue Tick</option><option value="gold">Gold Tick</option><option value="red">Red Tick</option></select>
              <Button onClick={giveTick} className="w-full bg-blue-600">Give Verification</Button>
            </CardContent></Card>
            <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle>Diamond Frame Upload</CardTitle></CardHeader><CardContent className="space-y-3">
              <Input placeholder="Frame Name e.g. Diamond Fire" value={frameName} onChange={e=>setFrameName(e.target.value)} className="bg-zinc-800"/>
              <Input placeholder="Frame PNG URL (transparent)" value={frameUrl} onChange={e=>setFrameUrl(e.target.value)} className="bg-zinc-800"/>
              <Button onClick={uploadFrame} className="w-full bg-purple-600">Upload Frame</Button>
              <p className="text-xs text-zinc-500">PNG টা Supabase Storage > admin_assets এ Upload করে URL কপি করে এখানে দাও</p>
            </CardContent></Card>
          </div>
        )}

        {tab==="Banners" && (<Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle>Banner Upload</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder="Banner Image URL" value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} className="bg-zinc-800"/><Button onClick={addBanner} className="bg-blue-600">Add Banner to Home</Button></CardContent></Card>)}
        {tab==="Music Library" && (<Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle>গান Upload - Admin Song</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder="Song Title" value={songTitle} onChange={e=>setSongTitle(e.target.value)} className="bg-zinc-800"/><Input placeholder="MP3 URL" value={songUrl} onChange={e=>setSongUrl(e.target.value)} className="bg-zinc-800"/><Button onClick={addSong} className="bg-blue-600">Upload Song - ক্যামেরায় চলে যাবে</Button></CardContent></Card>)}
        {tab==="Dashboard" && (<div className="grid grid-cols-3 gap-4"><Card className="bg-zinc-900"><CardContent className="p-4">Users: {users.length}</CardContent></Card><Card className="bg-zinc-900"><CardContent className="p-4">Videos: {videos.length}</CardContent></Card></div>)}
      </main>
    </div>
  );
}