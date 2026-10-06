import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from "react";

function SotTokOriginalCamera(){
  const videoRef = useRef<HTMLVideoElement>(null);
  const [beauty, setBeauty] = useState(70);
  const [filter, setFilter] = useState("sottok");
  const [speed, setSpeed] = useState("1x");
  const [rec, setRec] = useState(false);
  const [timer, setTimer] = useState("off");
  const [mode, setMode] = useState("60s");
  const [showBeauty, setShowBeauty] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [facing, setFacing] = useState("user");
  const [count, setCount] = useState(0);

  const filters = [
    {name:"Normal", id:"normal", f:""},
    {name:"Sweet", id:"sweet", f:"sepia(0.15) saturate(1.5)"},
    {name:"Fresh", id:"fresh", f:"brightness(1.18) saturate(1.35)"},
    {name:"Rosy", id:"rosy", f:"hue-rotate(-8deg) saturate(1.4)"},
    {name:"SOT", id:"sottok", f:"saturate(1.7) contrast(1.15) brightness(1.1)"},
    {name:"B&W", id:"bw", f:"grayscale(1)"},
  ];

  useEffect(()=>{
    const start = async()=>{
      try{
        const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:facing as any}, audio:true});
        if(videoRef.current) videoRef.current.srcObject=s;
      }catch{ alert("Camera Permission দাও দাদা"); }
    };
    start();
    return()=>{ if(videoRef.current?.srcObject){ (videoRef.current.srcObject as MediaStream).getTracks().forEach(t=>t.stop()) } };
  },[facing]);

  useEffect(()=>{
    let i:any; if(rec){ i=setInterval(()=>setCount(c=>c+1),1000); } else setCount(0); return()=>clearInterval(i);
  },[rec]);

  const curF = filters.find(f=>f.id===filter)?.f || "";

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-screen object-cover" style={{filter: `${curF} brightness(${1+beauty/300})`, transform: facing==="user"?"scaleX(-1)":""}} />

      {/* TOP - ONLY SOT TOK NAME - NO VIGO */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center px-4">
        <button onClick={()=>window.history.back()} className="w-9 h-9 rounded-full bg-black/50 text-white">✕</button>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1 rounded-full shadow-[0_0_15px_rgba(255,69,0,0.8)]">
          <span className="text-[11px] text-white font-black">🔥 SOT TOK OFFICIAL 🔥</span>
        </div>
        <button onClick={()=>setFacing(facing==="user"?"environment":"user")} className="w-9 h-9 rounded-full bg-black/50 text-white">🔄</button>
      </div>

      {/* LEFT TOOLS */}
      <div className="absolute left-3 top-24 flex flex-col gap-5">
        <button onClick={()=>{setShowBeauty(true); setShowFilter(false);}} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${showBeauty?'bg-purple-600 border-purple-600':'bg-black/40 border-white/20'}`}>✨</button>
        <button onClick={()=>{setShowFilter(true); setShowBeauty(false);}} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${showFilter?'bg-purple-600 border-purple-600':'bg-black/40 border-white/20'}`}>🎨</button>
        <button className="w-12 h-12 rounded-full bg-black/40 border border-white/20">😍</button>
        <button className="w-12 h-12 rounded-full bg-black/40 border border-white/20">💄</button>
      </div>

      {/* RIGHT TOOLS */}
      <div className="absolute right-3 top-24 flex flex-col gap-4">
        <button className="w-12 h-12 rounded-full bg-black/40 border border-white/20 text-white font-bold">♪</button>
        <button onClick={()=>setSpeed(speed==="1x"?"2x":"1x")} className="w-12 h-12 rounded-full bg-black/40 border border-white/20 text-white text-xs font-bold">{speed}</button>
        <button onClick={()=>setTimer(timer==="off"?"3s":"off")} className={`w-12 h-12 rounded-full border flex items-center justify-center ${timer!=="off"?'bg-purple-600':'bg-black/40 border-white/20'}`}>⏱️</button>
      </div>

      {/* BEAUTY PANEL - ONLY SOT TOK NAME */}
      {showBeauty && (
        <div className="absolute bottom-28 left-0 right-0 bg-black/85 backdrop-blur-xl rounded-t-[28px] p-4 border-t border-white/10">
          <p className="text-center text-[11px] font-black tracking-[3px] text-white">BEAUTY • SOT TOK ORIGINAL</p>
          <div className="mt-4">
            <div className="flex items-center gap-3"><span className="text-xs text-white w-16">Smooth</span><input type="range" min="0" max="100" value={beauty} onChange={e=>setBeauty(Number(e.target.value))} className="flex-1 accent-orange-500" /><span className="text-xs text-white">{beauty}</span></div>
          </div>
        </div>
      )}

      {showFilter && (
        <div className="absolute bottom-28 left-0 right-0 bg-black/85 backdrop-blur-xl rounded-t-[28px] p-4 border-t border-white/10">
          <p className="text-center text-[11px] font-black tracking-[3px] text-white">FILTER • SOT TOK ORIGINAL</p>
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {filters.map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id)} className={`min-w-[60px] h-14 rounded-xl border-2 flex items-center justify-center text-[10px] text-white ${filter===f.id?'border-orange-500 bg-orange-500/20':'border-transparent bg-zinc-800'}`}>{f.name}</button>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM - RECORD - ONLY SOT TOK */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 p-4">
        <div className="flex justify-center gap-6 text-[13px] mb-4">
          {["15s","60s","3m"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} className={`${mode===m?'text-white font-black border-b-2 border-orange-500':'text-white/50'}`}>{m}</button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button className="w-14 h-14 rounded-2xl bg-white/15">🖼️</button>
          <button onClick={()=>setRec(!rec)} className="w-24 h-24 rounded-full border-[5px] border-white flex items-center justify-center">
            <div className={`${rec?'w-8 h-8 bg-white rounded-sm':'w-20 h-20 bg-red-500 rounded-full'}`}></div>
          </button>
          <button className="w-14 h-14 rounded-2xl bg-white/15">✨</button>
        </div>
        {rec && <p className="text-center text-red-400 text-xs mt-2 animate-pulse">● REC {count}s • SOT TOK OFFICIAL</p>}
      </div>

      {/* WATERMARK - ONLY SOT TOK FIRE LOGO - NO VIGO */}
      <div className="absolute bottom-32 left-4 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,100,0,0.7)]">
        <span className="text-white font-black text-xs tracking-wider">🔥 SOT TOK OFFICIAL • ID:96216703 🔥</span>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
        <p className="text-white font-black text-4xl tracking-[6px] rotate-[-12deg]">SOT TOK</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/camera')({ component: SotTokOriginalCamera, })