import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Image as ImageIcon, Zap, ZapOff, SwitchCamera, Loader2, Music2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { awardVideoCoins } from "@/lib/coins";
import { drawBrand, loadImage, logoUrl, looks, supportedRecordingType } from "@/lib/video-studio";
import { signVideo } from "@/lib/social";
import { CreatorEffects, beautyLooks, funnyLooks } from '@/lib/creator-effects';
import { PhotoReelComposer } from '@/components/PhotoReelComposer';
import { creatorTopics } from '@/lib/creator-topics';

type SourceVideo = { id: string; video_url: string; sound_name: string; caption: string; user_id: string; bucket?: string };
type CreateSearch = { duet?: string | undefined; sound?: string | undefined };
export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>): CreateSearch => ({
    duet: typeof search["duet"] === "string" ? search["duet"] : undefined,
    sound: typeof search["sound"] === "string" ? search["sound"] : undefined,
  }),
  head: () => ({ meta: [
    { title: "নতুন ভিডিও — SOT TOK" },
    { name: "description", content: "SOT TOK ক্যামেরায় সাজ, ডুয়েট ও গান নিয়ে নতুন ভিডিও বানান।" },
    { property: "og:title", content: "নতুন ভিডিও — SOT TOK" },
    { property: "og:description", content: "সাজ, ডুয়েট ও গান নিয়ে ভিডিও বানান।" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const { duet, sound } = Route.useSearch();
  const { user } = useAuth();
  const cameraRef = useRef<HTMLVideoElement>(null);
  const effectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const effectsRef = useRef<CreatorEffects | null>(null);
  const sourceRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const animationRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const sourceObjectRef = useRef<string | null>(null);
  const [mode, setMode] = useState<"record" | "gallery">("record");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [torch, setTorch] = useState(false);
  const [limit, setLimit] = useState<15 | 30>(15);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lookKey, setLookKey] = useState<(typeof looks)[number]["key"]>("original");
  const [source, setSource] = useState<SourceVideo | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceError, setSourceError] = useState(false);
  const [songs, setSongs] = useState<SourceVideo[]>([]);
  const [showSongs, setShowSongs] = useState(false);
  const [showDuets, setShowDuets] = useState(false);
  const [makeup, setMakeup] = useState('');
  const [beauty, setBeauty] = useState(0);
  const [funny, setFunny] = useState('');
  const [effectGroup, setEffectGroup] = useState('original');
  const [faceStatus, setFaceStatus] = useState<'loading'|'ready'|'error'>('loading');
  const [songQuery, setSongQuery] = useState('');
  const [songError, setSongError] = useState(false);
  const [songLoading, setSongLoading] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [category, setCategory] = useState('general');
  const selectedLook = looks.find((l) => l.key === lookKey) ?? looks[0];
  const effectOptions = { makeup, beauty, funny, css: selectedLook.css, mirror: facing === 'user' };
  const optionsRef = useRef(effectOptions);
  optionsRef.current = effectOptions;

  useEffect(() => {
    let alive = true;
    const effects = new CreatorEffects();effectsRef.current = effects;
    void effects.init().then(()=>{if(alive)setFaceStatus('ready');else effects.close();}).catch(()=>{if(alive)setFaceStatus('error');});
    return()=>{alive=false;effects.close();effectsRef.current=null;};
  }, []);
  useEffect(() => {
    let frame=0;
    const draw=()=>{
      const canvas=effectsCanvasRef.current, camera=cameraRef.current, effects=effectsRef.current;
      const ctx=canvas?.getContext('2d');
      if(canvas&&ctx&&camera&&effects)effects.draw(ctx,camera,canvas.width,canvas.height,optionsRef.current);
      frame=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(frame);
  }, [previewUrl, permission, mode]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);
  const stopRecording = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    cancelAnimationFrame(animationRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    sourceRef.current?.pause();
    void audioRef.current?.close();
    audioRef.current = null;
    setRecording(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setPermission("denied"); return; }
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 1280 } }, audio: true });
      streamRef.current = stream;
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        await cameraRef.current.play().catch(() => {});
      }
      setPermission("granted");
    } catch { setPermission("denied"); }
  }, [facing, stopStream]);

  useEffect(() => {
    if (mode === "record" && !previewUrl) void startCamera();
  }, [mode, facing, previewUrl, startCamera]);
  useEffect(() => () => {
    stopStream();
    if (timerRef.current) window.clearInterval(timerRef.current);
    cancelAnimationFrame(animationRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    void audioRef.current?.close();
  }, [stopStream]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => () => { if (sourceObjectRef.current) URL.revokeObjectURL(sourceObjectRef.current); }, []);

  useEffect(() => {
    let alive = true;
    const timer=window.setTimeout(()=>{
      setSongLoading(true);setSongError(false);
      let query=supabase.from('videos').select('id, video_url, sound_name, caption, user_id')
        .eq('visibility','public').eq('is_deleted',false).eq('admin_hidden',false);
      const term=songQuery.trim().replace(/[%,()]/g,'');
      if(term)query=query.or(`sound_name.ilike.%${term}%,caption.ilike.%${term}%`);
      void query.order('created_at',{ascending:false}).limit(150).then(({data,error})=>{
        if(!alive)return;
        setSongError(!!error);setSongs(data??[]);setSongLoading(false);
      });
    },200);
    return () => { alive = false;window.clearTimeout(timer); };
  }, [songQuery]);
  useEffect(() => {
    const id = duet || sound;
    if (!id) return;
    const selected = songs.find((v) => v.id === id);
    if (selected) { setSource(selected); return; }
    let alive = true;
    void supabase.from("videos").select("id, video_url, sound_name, caption, user_id")
      .eq("id", id).eq("visibility", "public").eq("is_deleted", false).eq('admin_hidden',false).maybeSingle()
      .then(({ data }) => { if (alive && data) setSource(data); });
    return () => { alive = false; };
  }, [duet, sound, songs]);
  useEffect(() => {
    let alive = true;
    if (!source) { setSourceUrl(""); setSourceError(false); return; }
    setSourceError(false);
    // A local object URL lets the canvas draw cross-origin storage videos safely.
    void signVideo(source.video_url).then(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("গান লোড করা যায়নি");
      const object = URL.createObjectURL(await res.blob());
      if (!alive) { URL.revokeObjectURL(object); return; }
      if (sourceObjectRef.current) URL.revokeObjectURL(sourceObjectRef.current);
      sourceObjectRef.current = object;
      setSourceUrl(object);
    }).catch(() => { if (alive) { setSourceError(true); toast.error("এই ভিডিওর গান খোলা যায়নি"); } });
    return () => { alive = false; };
  }, [source]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
    if (!caps?.torch || !track) { toast.error("এই ক্যামেরায় ফ্ল্যাশ নেই"); return; }
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch }] } as unknown as MediaTrackConstraints);
      setTorch(!torch);
    } catch { toast.error("ফ্ল্যাশ চালু করা যায়নি"); }
  };

  const startRecording = async () => {
    if (!streamRef.current) await startCamera();
    const camera = cameraRef.current;
    if (!streamRef.current || !camera) return;
    if (sourceError) { toast.error("এই ভিডিওর গান খোলা যায়নি"); return; }
    if (source && !sourceUrl) { toast.error("গান লোড হচ্ছে, আবার চেষ্টা করুন"); return; }
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 540;
      canvas.height = 960;
      const ctx = canvas.getContext("2d");
      if (!ctx || !canvas.captureStream) throw new Error("এই ডিভাইসে ফিল্টার রেকর্ডিং সাপোর্ট করে না");
      const sticker = "image" in selectedLook ? await loadImage(selectedLook.image) : null;
      const audio = new AudioContext();
      audioRef.current = audio;
      const destination = audio.createMediaStreamDestination();
      const microphone = audio.createMediaStreamSource(new MediaStream(streamRef.current.getAudioTracks()));
      microphone.connect(destination);
      const sourceVideo = sourceRef.current;
      if (source && sourceVideo) {
        sourceVideo.currentTime = 0;
        sourceVideo.loop = true;
        const music = audio.createMediaElementSource(sourceVideo);
        music.connect(destination);
        await sourceVideo.play();
      }
      await audio.resume();
      const draw = () => {
        ctx.clearRect(0, 0, 540, 960);
        if (source && duet && sourceVideo?.readyState && sourceVideo.videoWidth) {
          ctx.drawImage(sourceVideo, 0, 0, 270, 960);
          ctx.save();ctx.translate(270,0);
          effectsRef.current?.draw(ctx,camera,270,960,effectOptions);
          ctx.restore();
        } else {
          effectsRef.current?.draw(ctx,camera,540,960,effectOptions);
        }
         if (sticker) ctx.drawImage(sticker, source && duet ? 270 : 150, 80, 240, 240);
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
      const out = canvas.captureStream(30);
      destination.stream.getAudioTracks().forEach((t) => out.addTrack(t));
      const mime = supportedRecordingType();
      const rec = new MediaRecorder(out, mime ? { mimeType: mime } : undefined);
      recorderRef.current = rec;
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        const result = new Blob(chunks, { type: rec.mimeType || "video/webm" });
        if (result.size) { setBlob(result); setPreviewUrl(URL.createObjectURL(result)); }
        else toast.error("রেকর্ডিং সংরক্ষণ করা যায়নি");
        stopStream();
        out.getTracks().forEach((t) => t.stop());
      };
      rec.start(250);
      setRecording(true);
      setElapsed(0);
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setElapsed(seconds);
        if (seconds >= limit) stopRecording();
      }, 1000);
    } catch (error) {
      stopRecording();
      toast.error(error instanceof Error ? error.message : "রেকর্ডিং শুরু করা যায়নি");
    }
  };

  const pickFromGallery = (file: File) => {
    if (!file.type.startsWith("video/")) { toast.error("ভিডিও বেছে নিন"); return; }
    setBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    stopStream();
  };
  const post = async () => {
    if (!blob) return;
    if (!user) { toast.error("পোস্ট করতে সাইন ইন করুন"); navigate({ to: "/login" }); return; }
    setUploading(true);
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("videos").upload(path, blob, { contentType: blob.type || "video/webm" });
      if (upErr) throw upErr;
      const { data: inserted, error } = await supabase.from("videos").insert({
        user_id: user.id, caption, video_url: path, category,
        sound_name: source ? (duet ? `ডুয়েট · ${source.sound_name}` : source.sound_name) : "Original sound - SOT TOK Artist",
      }).select("id").single();
      if (error) throw error;
      toast.success("ভিডিও পোস্ট হয়েছে!");
      if (inserted?.id) {
        const coins = await awardVideoCoins(inserted.id);
        if (coins > 0) toast.success(`🪙 ${coins} কয়েন ওয়ালেটে জমা হয়েছে`);
      }
      navigate({ to: "/feed" });
    } catch (error) { toast.error("পোস্ট করা যায়নি: " + (error instanceof Error ? error.message : "আবার চেষ্টা করুন")); }
    finally { setUploading(false); }
  };

  return (
    <PhoneShell className="dark bg-media text-on-media">
      <header className="flex items-center justify-between px-4 pt-5">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/feed" })} aria-label="পিছনে"><ArrowLeft /></Button>
        <h1 className="text-[17px] font-semibold">নতুন ভিডিও</h1>
        <span className="w-9" />
      </header>
      {previewUrl ? (
        <div className="px-4 pt-5">
          <video src={previewUrl} controls playsInline className="aspect-[9/16] max-h-[65vh] w-full rounded-lg bg-black object-contain" />
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ক্যাপশন লিখুন…" rows={3} className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none" />
          <label className="mt-3 block text-sm">বিষয়<select aria-label="ভিডিওর বিষয়" value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-foreground">{creatorTopics.map(t=><option key={t.key} value={t.key}>{t.key==='general'?'অন্যান্য':t.name}</option>)}</select></label>
          <div className="mt-3 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setBlob(null); setPreviewUrl(null); setCaption(""); setElapsed(0); }}>আবার রেকর্ড</Button>
            <Button onClick={() => void post()} disabled={uploading} className="flex-1 bg-social text-on-media">{uploading && <Loader2 className="animate-spin" />} পোস্ট করুন</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex gap-2 px-4">
            <Button variant={mode === "record" ? "default" : "secondary"} className="flex-1" onClick={() => setMode("record")} disabled={recording}><Camera /> রেকর্ড</Button>
            <Button variant="secondary" className="flex-1" asChild><label className="cursor-pointer"><ImageIcon /> গ্যালারি<input type="file" accept="video/*" className="hidden" onChange={(e) => { setMode("gallery"); const f = e.target.files?.[0]; if (f) pickFromGallery(f); }} /></label></Button>
          </div>
          <Button variant="outline" className="mx-4 mt-3" disabled={recording} onClick={()=>{stopStream();setShowPhotos(true);}}><ImageIcon/> ৩ ছবির রিল</Button>
          <div className="mt-3 flex gap-2 px-4">
            <Button variant="secondary" className="min-w-0 flex-1" onClick={() => setShowSongs(true)} disabled={recording}><Music2 /> <span className="truncate">{source && !duet ? source.sound_name : "গান বাছুন"}</span></Button>
             <Button variant="secondary" className="flex-1" onClick={() => { if (source && duet) { setSource(null); navigate({ to: "/create", search: {} }); } else setShowDuets(true); }} disabled={recording}><Users /> {source && duet ? "ডুয়েট বন্ধ" : "ডুয়েট বাছুন"}</Button>
          </div>
          {source && <p className="mx-4 mt-2 truncate text-xs text-gold">{duet ? "ডুয়েট" : "গান"}: {source.caption || source.sound_name}</p>}
          <div className="relative mx-4 mt-3 aspect-[9/16] max-h-[min(54svh,490px)] overflow-hidden rounded-lg bg-black">
            {permission === "denied" ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"><p>ক্যামেরা ও মাইকের অনুমতি প্রয়োজন</p><Button onClick={() => void startCamera()}>আবার চেষ্টা করুন</Button></div>
            ) : (
              <div className="flex h-full w-full">
                 {source && duet && <video ref={sourceRef} src={sourceUrl} playsInline loop muted className="h-full w-1/2 object-cover" />}
                {source && !duet && <video ref={sourceRef} src={sourceUrl} playsInline loop className="hidden" />}
                <div className="relative h-full flex-1 overflow-hidden">
                  <video ref={cameraRef} autoPlay muted playsInline className="absolute h-full w-full opacity-0" />
                  <canvas ref={effectsCanvasRef} width={540} height={960} className="h-full w-full object-cover" aria-label="ফিল্টার ক্যামেরা" />
                  {"image" in selectedLook && <img src={selectedLook.image} alt="" width={816} height={816} className="pointer-events-none absolute left-1/2 top-[8%] w-2/3 -translate-x-1/2" />}
                </div>
              </div>
            )}
            <div className="absolute right-2 top-2 flex flex-col gap-2">
              <Button variant="secondary" size="icon" onClick={() => void toggleTorch()} disabled={recording} aria-label="ফ্ল্যাশ" title="ফ্ল্যাশ">{torch ? <Zap /> : <ZapOff />}</Button>
              <Button variant="secondary" size="icon" onClick={() => setFacing((f) => f === "user" ? "environment" : "user")} disabled={recording} aria-label="ক্যামেরা ঘোরান" title="ক্যামেরা ঘোরান"><SwitchCamera /></Button>
            </div>
            {recording && <span className="absolute left-3 top-3 rounded bg-destructive px-2 py-1 text-sm font-bold">00:{String(elapsed).padStart(2, "0")}</span>}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 px-4" aria-label="ফিল্টারের ধরন">{[{key:'original',name:'অরিজিনাল ও দেবতা'},{key:'beauty',name:'মেকআপ'},{key:'funny',name:'মজার'}].map(g=><Button key={g.key} size="sm" className="h-auto min-h-9 whitespace-normal" variant={effectGroup===g.key?'default':'secondary'} onClick={()=>setEffectGroup(g.key)} disabled={recording}>{g.name}</Button>)}</div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4" aria-label="ভিডিও ফিল্টার">
            {effectGroup==='original'&&looks.map((look) => <Button key={look.key} variant={look.key === lookKey && !makeup && !funny ? "default" : "secondary"} onClick={() => {setLookKey(look.key);setMakeup('');setFunny('');}} disabled={recording} className="shrink-0">{look.name}</Button>)}
            {effectGroup==='beauty'&&beautyLooks.map(look=><Button key={look.key} variant={makeup===look.key?'default':'secondary'} onClick={()=>{setMakeup(look.key);setFunny('');setLookKey('original');}} disabled={recording||faceStatus!=='ready'} className="shrink-0">{look.name}</Button>)}
            {effectGroup==='funny'&&funnyLooks.map(look=><Button key={look.key} variant={funny===look.key?'default':'secondary'} onClick={()=>{setFunny(look.key);setMakeup('');setLookKey('original');}} disabled={recording} className="shrink-0">{look.name}</Button>)}
          </div>
          {effectGroup==='beauty'&&faceStatus!=='ready'&&<p role="status" className="mt-2 px-4 text-xs text-muted-foreground">{faceStatus==='loading'?'মেকআপ লোড হচ্ছে…':'মেকআপ খোলা যায়নি; অন্য ফিল্টার ব্যবহার করুন'}</p>}
          <label className="mx-4 mt-3 flex items-center gap-3 text-xs">বিউটি <input aria-label="বিউটি লেভেল" type="range" min={0} max={100} value={beauty} disabled={recording} onChange={e=>setBeauty(Number(e.target.value))} className="min-w-0 flex-1 accent-pink"/><output className="w-7 text-right">{beauty}</output></label>
          <div className="mt-3 flex justify-center gap-2">
            {([15, 30] as const).map((s) => <Button key={s} variant={s === limit ? "default" : "secondary"} size="sm" onClick={() => setLimit(s)} disabled={recording}>{s} সেকেন্ড</Button>)}
          </div>
          <div className="my-4 flex justify-center pb-16">
            <Button onClick={() => recording ? stopRecording() : void startRecording()} aria-label={recording ? "রেকর্ড বন্ধ" : "রেকর্ড শুরু"} className="h-[72px] w-[72px] rounded-full border-4 border-white bg-brand text-white" disabled={permission === "denied"}>{recording ? <span className="h-6 w-6 rounded bg-white" /> : <span className="h-12 w-12 rounded-full border border-white" />}</Button>
          </div>
        </>
      )}
      {showSongs && <div className="fixed inset-0 z-[70] mx-auto max-w-[420px] overflow-y-auto bg-background p-4 text-foreground" role="dialog" aria-label="গান বাছুন">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">ভিডিওর গান</h2><Button variant="ghost" size="icon" onClick={() => setShowSongs(false)} aria-label="বন্ধ করুন"><X /></Button></div>
        <input aria-label="গান খুঁজুন" placeholder="গান বা ক্যাপশন খুঁজুন…" value={songQuery} onChange={e=>setSongQuery(e.target.value)} className="mt-4 w-full rounded-lg border border-border bg-muted p-3 text-sm" />
        {songLoading&&<p role="status" className="mt-3 text-sm">লোড হচ্ছে…</p>}{songError&&<p role="alert" className="mt-3 text-sm text-destructive">গান খোলা যায়নি</p>}
        <Button variant="outline" className="mt-4 w-full justify-start" onClick={() => { setSource(null); setShowSongs(false); navigate({ to: "/create", search: {} }); }}>অরিজিনাল অডিও</Button>
        {songs.length ? songs.map((song) => <Button key={song.id} variant="ghost" className="mt-2 h-auto w-full justify-start whitespace-normal py-3 text-left" onClick={() => { setSource(song); setShowSongs(false); navigate({ to: "/create", search: { sound: song.id } }); }}><Music2 /> <span className="min-w-0"><strong className="block truncate">{song.sound_name}</strong><small className="block truncate">{song.caption || "SOT TOK"}</small></span></Button>) : <p className="mt-8 text-center text-muted-foreground">এখনো কোনো প্রকাশিত গান নেই</p>}
      </div>}
       {showPhotos&&<PhotoReelComposer audioUrl={sourceUrl} onClose={()=>{setShowPhotos(false);void startCamera();}} onComplete={result=>{setBlob(result);setPreviewUrl(URL.createObjectURL(result));setShowPhotos(false);}}/>}
       {showDuets && <div className="fixed inset-0 z-[70] mx-auto max-w-[420px] overflow-y-auto bg-background p-4 text-foreground" role="dialog" aria-label="ডুয়েট বাছুন">
         <div className="flex items-center justify-between"><h2 className="text-lg font-bold">ডুয়েটের ভিডিও</h2><Button variant="ghost" size="icon" onClick={() => setShowDuets(false)} aria-label="বন্ধ করুন"><X /></Button></div>
         {songs.length ? songs.map((item) => <Button key={item.id} variant="ghost" className="mt-2 h-auto w-full justify-start whitespace-normal py-3 text-left" onClick={() => { setSource(item); setShowDuets(false); navigate({ to: "/create", search: { duet: item.id } }); }}><Users /> <span className="min-w-0"><strong className="block truncate">{item.caption || "SOT TOK ভিডিও"}</strong><small className="block truncate">{item.sound_name}</small></span></Button>) : <p className="mt-8 text-center text-muted-foreground">এখনো কোনো প্রকাশিত ভিডিও নেই</p>}
       </div>}
      <BottomNav />
    </PhoneShell>
  );
}
