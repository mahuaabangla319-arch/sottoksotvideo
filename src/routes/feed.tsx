// ---------- VIDEO CREATOR : গ্যালারি ভিডিও + গ্যালারি গান + পোস্ট - পুরনোটার সাথে জোড়া ----------
function CreateVideoSheet({ onClose, onPosted, currentUser, user, sounds }: any) {
  const [step, setStep] = useState(1);
  const [songName, setSongName] = useState("Original sound - Short Tok Artist");
  const [songUrl, setSongUrl] = useState("");
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(15);
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<any>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<any>(null);
  const mediaRef = useRef<any>(null);

  const presets = [15, 30, 60];
  const playTrimmed = () => { const a = audioRef.current; if (!a || !songUrl) return toast.error("আগে গ্যালারি থেকে গান চয়েস করো"); a.currentTime = start; a.play(); setTimeout(() => { try { a.pause(); } catch {} }, duration * 1000); };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCountdown(3);
      let c = 3; const iv = setInterval(() => { c--; setCountdown(c); if (c <= 0) { clearInterval(iv); setCountdown(0); doRecord(stream); } }, 1000);
    } catch { toast.error("ক্যামেরা খুলছে না, অনুমতি দাও"); }
  };
  const doRecord = (stream: any) => {
    setIsRecording(true); if (audioRef.current && songUrl) { audioRef.current.currentTime = start; audioRef.current.play(); }
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" }); const chunks: any[] = [];
    rec.ondataavailable = (e: any) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => { const blob = new Blob(chunks, { type: "video/webm" }); const f = new File([blob], "lipsync-" + Date.now() + ".webm", { type: "video/webm" }); setVideoFile(f); setVideoPreview(URL.createObjectURL(blob)); setIsRecording(false); try { stream.getTracks().forEach((t: any) => t.stop()); } catch {} try { audioRef.current?.pause(); } catch {} setStep(3); };
    rec.start(); mediaRef.current = rec;
    setTimeout(() => { try { rec.stop(); } catch {} }, duration * 1000);
  };
  const stopRecording = () => { try { mediaRef.current?.stop(); } catch {} };

  // পোস্ট - হোম (পাবলিক) + প্রোফাইল দুই জায়গায় যাবে, পুরনো ভিডিও রেখে
  const doUpload = async () => {
    if (!videoFile) return toast.error("আগে ভিডিও রেকর্ড করো বা গ্যালারি থেকে নাও");
    if (!currentUser && !user) return toast.error("আগে লগইন করো");
    setUploading(true); toast("আপলোড হচ্ছে... সাথে সাথে সবাই দেখবে");
    try {
      const uid = user?.id || currentUser?.id || "local-" + Date.now();
      const path = `${uid}/${Date.now()}-${videoFile.name}`;
      let publicUrl = videoPreview;
      try { const { error } = await sb.storage.from("videos").upload(path, videoFile); if (!error) { const { data } = sb.storage.from("videos").getPublicUrl(path); publicUrl = data?.publicUrl || publicUrl; await sb.from("videos").insert({ user_id: uid, video_url: path, caption: caption || "নতুন ভিডিও 🎬", sound_name: songName + ` • ${start}s-${start + duration}s`, visibility: "public" } as any); } } catch {}
      const newItem: FeedItem = { id: "local-" + Date.now(), userId: uid, sotId: currentUser?.name || myName(), username: "@" + (currentUser?.name || myName()), caption: caption || "নতুন ভিডিও 🎬", url: publicUrl, sound: songName, views: 0, likes: 0, comments: 0, avatar: currentUser?.avatar || "" };
      // পুরনো সব রেখে নতুনটা জুড়ে দেওয়া - ৩ জায়গায় সেভ যাতে হোম + প্রোফাইল দুইটাতেই আসে
      const oldMine = getLocal("shorttok_my_videos", []); setLocal("shorttok_my_videos", [newItem, ...oldMine]);
      const feedOld = getLocal("shorttok_feed_extra", []); setLocal("shorttok_feed_extra", [newItem, ...feedOld]);
      const allOld = getLocal("sottok_videos", []); setLocal("sottok_videos", [newItem, ...allOld]);
      await notifyAllFollowers(uid, currentUser?.name || myName(), newItem.id, newItem.caption);
      const allN = getLocal("shorttok_notifications_all", []); setLocal("shorttok_notifications_all", [{ id: "nt-" + Date.now(), actor_name: currentUser?.name || myName(), type: "video", video_id: newItem.id, message: `🎬 ${currentUser?.name || myName()} নতুন ভিডিও পোস্ট করেছে`, created_at: Date.now(), is_read: false }, ...allN].slice(0, 100));
      toast.success("পোস্ট হয়ে গেছে ✅ হোমে আর প্রোফাইলে দেখাবে");
      onPosted(newItem); onClose();
    } catch { toast.error("আপলোড হয়নি, আবার চেষ্টা করো"); }
    setUploading(false);
  };

  return (<div className="fixed inset-0 z-[150] bg-white text-black overflow-y-auto pb-10"><div className="sticky top-0 bg-white flex items-center gap-2 px-3 py-3 border-b"><button onClick={onClose} className="text-2xl px-1">←</button><b>🎬 ভিডিও বানাও</b><span className="ml-auto text-[11px] bg-[#fe2c55] text-white px-2 py-1 rounded-full">Step {step}/3</span></div>
  <audio ref={audioRef} src={songUrl} preload="auto" />
  {step === 1 && (<div className="p-4 space-y-3"><p className="font-bold">🎵 ১. গান চয়েস করো</p><label className="block bg-zinc-100 rounded-2xl p-4 text-center cursor-pointer"><p className="text-3xl">🎵</p><p className="font-bold text-sm mt-1">{songUrl ? "গান চয়েস হয়ে গেছে ✅ - " + songName : "গ্যালারি থেকে গান নাও (MP3)"}</p><input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSongUrl(URL.createObjectURL(f)); setSongName(f.name.replace(".mp3", "")); } }} /></label><p className="text-[12px] text-zinc-500 text-center">অথবা নিচে থেকে ট্রেন্ডিং গান নাও 👇</p><div className="flex gap-2 overflow-x-auto no-scrollbar">{(sounds || []).map(([s, cnt]: any) => (<button key={s} onClick={() => { setSongName(s); setSongUrl(""); }} className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-bold ${songName === s ? "bg-[#fe2c55] text-white" : "bg-zinc-100"}`}>🎵 {s}</button>))}</div><button onClick={() => setStep(2)} className="w-full bg-[#fe2c55] text-white rounded-full py-3 font-bold">পরের ধাপ → গান কাটো ✂️</button></div>)}
  {step === 2 && (<div className="p-4 space-y-3"><p className="font-bold">✂️ ২. গান কাটো — কতটুকু নেবে?</p><div className="bg-zinc-100 rounded-2xl p-4"><p className="text-sm font-bold">🎵 {songName}</p><p className="text-[12px] text-zinc-500 mt-1">শুরু: {start} সেকেন্ড থেকে • চলবে: {duration} সেকেন্ড</p><div className="flex gap-2 mt-3">{presets.map((d) => (<button key={d} onClick={() => setDuration(d)} className={`flex-1 py-2 rounded-full font-bold text-sm ${duration === d ? "bg-black text-white" : "bg-white"}`}>{d} sec</button>))}</div><label className="block mt-3 text-[12px] font-bold">শুরু কোথা থেকে? {start}s</label><input type="range" min={0} max={120} value={start} onChange={(e) => setStart(Number(e.target.value))} className="w-full accent-[#fe2c55]" /><label className="block text-[12px] font-bold">কতটুকু? {duration}s</label><input type="range" min={5} max={60} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-[#fe2c55]" /><button onClick={playTrimmed} className="w-full mt-2 bg-white border rounded-full py-2 font-bold text-sm">▶️ কাটা গানটা শুনে দেখো</button></div><div className="flex gap-2"><button onClick={() => setStep(1)} className="flex-1 bg-zinc-100 rounded-full py-3 font-bold">← পিছে</button><button onClick={() => setStep(3)} className="flex-1 bg-[#fe2c55] text-white rounded-full py-3 font-bold">ভিডিও বানাও → 👄</button></div></div>)}
  {step === 3 && (<div className="p-4 space-y-3"><p className="font-bold">👄 ৩. ভিডিও বানাও</p><p className="text-[12px] bg-zinc-100 rounded-full px-3 py-2">🎵 {songName} • {start}s থেকে {duration}s পর্যন্ত বাজবে</p>{countdown > 0 && <div className="text-center text-6xl font-black text-[#fe2c55]">{countdown}</div>}{isRecording && <p className="text-center text-red-600 font-bold animate-pulse">🔴 রেকর্ড হচ্ছে... {duration} সেকেন্ড • গান বাজছে</p>}{videoPreview ? <video src={videoPreview} controls className="w-full rounded-2xl bg-black aspect-[9/16] object-cover" /> : <div className="w-full aspect-[9/16] bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-center p-4">📹 ক্যামেরা দিয়ে রেকর্ড করো<br />অথবা গ্যালারি থেকে ভিডিও নাও</div>}<div className="flex gap-2"><button onClick={startRecording} className="flex-1 bg-red-600 text-white rounded-full py-3 font-bold">🔴 ক্যামেরা রেকর্ড</button>{isRecording && <button onClick={stopRecording} className="flex-1 bg-black text-white rounded-full py-3 font-bold">⏹️ থামাও</button>}</div><label className="block bg-zinc-100 rounded-2xl py-3 text-center font-bold text-sm cursor-pointer">📁 গ্যালারি থেকে ভিডিও নাও<input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setVideoFile(f); setVideoPreview(URL.createObjectURL(f)); } }} /></label><input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ক্যাপশন লিখো... 🎬" className="w-full bg-zinc-100 rounded-2xl px-4 py-3 text-sm outline-none" /><button onClick={doUpload} disabled={uploading} className="w-full bg-[#fe2c55] text-white rounded-full py-3 font-bold">{uploading ? "আপলোড হচ্ছে... ⏳" : "🚀 পোস্ট করো → হোমে আর প্রোফাইলে দেখাবে"}</button><button onClick={() => setStep(2)} className="w-full bg-zinc-100 rounded-full py-2 text-sm font-bold">← গান আবার কাটো</button></div>)}
  </div>);
}