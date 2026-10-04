import { useEffect, useRef, useState } from 'react';
import { Images, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { composePhotoReel } from '@/lib/photo-reel';
import { toast } from 'sonner';

export function PhotoReelComposer({audioUrl,onComplete,onClose}:{audioUrl:string;onComplete:(blob:Blob)=>void;onClose:()=>void}){
  const [files,setFiles]=useState<File[]>([]);const [urls,setUrls]=useState<string[]>([]);
  const [template,setTemplate]=useState('zoom');const [progress,setProgress]=useState(0);const [busy,setBusy]=useState(false);
  const abort=useRef<AbortController|null>(null);
  useEffect(()=>{const next=files.map(f=>URL.createObjectURL(f));setUrls(next);return()=>next.forEach(u=>URL.revokeObjectURL(u));},[files]);
  useEffect(()=>()=>abort.current?.abort(),[]);
  const create=async()=>{const controller=new AbortController();abort.current=controller;setBusy(true);try{onComplete(await composePhotoReel(files,template,audioUrl,controller.signal,setProgress));}catch(e){if(e instanceof Error&&e.name!=='AbortError')toast.error(e.message);}finally{setBusy(false);}};
  return <div role="dialog" aria-label="ছবির রিল" className="fixed inset-0 z-[70] mx-auto max-w-[420px] overflow-y-auto bg-background p-4 text-foreground">
    <header className="flex items-center justify-between"><h2 className="text-lg font-bold">৩ ছবির রিল</h2><Button variant="ghost" size="icon" aria-label="বন্ধ করুন" onClick={()=>{abort.current?.abort();onClose();}}><X/></Button></header>
    <div className="mt-6 grid grid-cols-3 gap-2">{[0,1,2].map(i=><div key={i} className="flex aspect-[9/16] items-center justify-center overflow-hidden rounded-lg bg-muted">{urls[i]?<img src={urls[i]} alt={`ছবি ${i+1}`} className="h-full w-full object-cover"/>:<Images className="text-muted-foreground"/>}</div>)}</div>
    <Button asChild variant="outline" className="mt-4 w-full" disabled={busy}><label><Images/> ছবি বাছুন<input type="file" accept="image/*" multiple disabled={busy} className="hidden" onChange={e=>{const selected=Array.from(e.target.files??[]);if(selected.length!==3){toast.error('ঠিক ৩টি ছবি বেছে নিন');return;}setFiles(selected);}}/></label></Button>
    <fieldset className="mt-6"><legend className="mb-2 text-sm font-semibold">টেমপ্লেট</legend><div className="grid grid-cols-3 gap-2">{[{key:'zoom',name:'জুম'},{key:'beat',name:'বিট'},{key:'slide',name:'স্লাইড'}].map(t=><Button key={t.key} variant={template===t.key?'default':'secondary'} aria-pressed={template===t.key} disabled={busy} onClick={()=>setTemplate(t.key)}>{t.name}</Button>)}</div></fieldset>
    {busy&&<div className="mt-5"><progress className="w-full accent-pink" max={100} value={progress}/><p role="status" className="text-center text-sm">{progress}%</p></div>}
    <Button className="bg-social mt-6 w-full text-on-media" disabled={busy||files.length!==3} onClick={()=>void create()}>{busy?<Loader2 className="animate-spin"/>:<Images/>}{busy?'রিল তৈরি হচ্ছে…':'রিল তৈরি করুন'}</Button>
    {busy&&<Button variant="ghost" className="mt-2 w-full" onClick={()=>abort.current?.abort()}>বন্ধ করুন</Button>}
  </div>;
}