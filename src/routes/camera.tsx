import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'

export const Route = createFileRoute("/camera")({
  component: Camera,
});

function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [beauty, setBeauty] = useState(50);
  const [showBeauty, setShowBeauty] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;

        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          // এখানে আপনার Supabase upload কোড বসবে
          console.log("Recorded", blob);
        };
        mediaRecorderRef.current = recorder;
      } catch {}
    })();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-screen object-cover" style={{ filter: `brightness(${1 + beauty/300})` }} />

      {/* Top - Clean, No Logo Text */}
      <div className="absolute top-6 right-4 flex gap-3 z-20">
        <button onClick={() => alert("Flash")} className="w-12 h-12 bg-black/50 backdrop-blur rounded-full text-white flex items-center justify-center active:scale-90">⚡</button>
        <button onClick={() => alert("Flip Camera")} className="w-12 h-12 bg-black/50 backdrop-blur rounded-full text-white flex items-center justify-center active:scale-90">🔄</button>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full z-20 text-white text-sm">
        {recording? "🔴 00:15 Recording" : "Ready"}
      </div>

      {/* Left - Effects, Beauty, Filters */}
      <div className="absolute left-4 top-[35%] flex flex-col gap-4 z-20">
        <button onClick={() => alert("Effects")} className="w-16 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white active:scale-90">
          <span className="text-2xl">✨</span><span className="text-[10px] mt-1">Effects</span>
        </button>
        <button onClick={() => setShowBeauty(!showBeauty)} className="w-16 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white active:scale-90">
          <span className="text-2xl">🪄</span><span className="text-[10px] mt-1">Beauty</span>
        </button>
        <button onClick={() => alert("Filters")} className="w-16 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white active:scale-90">
          <span className="text-2xl">○○</span><span className="text-[10px] mt-1">Filters</span>
        </button>
      </div>

      {showBeauty && (
        <div className="absolute bottom-40 left-4 right-4 bg-black/70 p-4 rounded-2xl z-30">
          <p className="text-white text-center text-sm mb-2">Beauty level {beauty}</p>
          <input type="range" min="0" max="100" value={beauty} onChange={(e)=>setBeauty(Number(e.target.value))} className="w-full accent-red-500" />
        </div>
      )}

      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 bg-black/40 px-3 py-1 rounded-full text-white/80 text-xs">
        Ready • Beauty level {beauty}
      </div>

      {/* Bottom Vigo Style */}
      <div className="absolute bottom-0 w-full bg-black/70 backdrop-blur-xl rounded-t-[32px] pt-5 pb-8 px-4 z-20">
        <div className="flex justify-around items-center">
          <button onClick={() => setShowBeauty(true)} className="flex flex-col items-center text-white"><span className="text-2xl">✨</span><span className="text-[11px] mt-1">Beauty</span></button>
          <button onClick={() => alert("Stickers")} className="flex flex-col items-center text-white"><span className="text-2xl">🤩</span><span className="text-[11px] mt-1">Stickers</span></button>
          <button
            onTouchStart={() => { setRecording(true); mediaRecorderRef.current?.start(); }}
            onTouchEnd={() => { setRecording(false); mediaRecorderRef.current?.stop(); }}
            onMouseDown={() => { setRecording(true); mediaRecorderRef.current?.start(); }}
            onMouseUp={() => { setRecording(false); mediaRecorderRef.current?.stop(); }}
            className={`w-20 h-20 rounded-full border-[4px] border-white/30 flex items-center justify-center transition-all ${recording?'scale-110 bg-red-600':'bg-red-500'}`}
          >
            <div className="w-12 h-12 bg-red-600 rounded-full"></div>
          </button>
          <button onClick={() => alert("Music")} className="flex flex-col items-center text-white"><span className="text-2xl">🎵</span><span className="text-[11px] mt-1">Music</span></button>
          <button onClick={() => alert("Timer")} className="flex flex-col items-center text-white"><span className="text-2xl">⏱️</span><span className="text-[11px] mt-1">Timer</span></button>
        </div>
        <p className="text-center text-white/50 text-[11px] mt-4">Hold to record • Release to stop</p>
      </div>
    </div>
  );
}