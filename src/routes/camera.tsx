import { useEffect, useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timer, setTimer] = useState("Off");
  const [beauty, setBeauty] = useState(50);
  const [speed, setSpeed] = useState("1x");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log("Camera error:", err);
      }
    }
    startCamera();
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Camera Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute w-full h-full object-cover"
        style={{ filter: `brightness(${100 + beauty * 0.2}%)` }}
      />

      {/* Top Bar - Vigo Original */}
      <div className="absolute top-0 w-full flex justify-between items-center p-4 z-20">
        <button className="text-white text-2xl">✕</button>
        <div className="flex gap-4 items-center">
          <button onClick={() => setFlash(!flash)} className="text-white text-xl">⚡</button>
          <span className="text-white text-sm">Music ♫</span>
        </div>
      </div>

      {/* Right Side Tools - Vigo Style */}
      <div className="absolute right-3 top-20 flex flex-col gap-6 z-20 text-white text-center">
        <button onClick={() => setTimer(timer === "Off"? "3s" : timer === "3s"? "5s" : timer === "5s"? "10s" : "Off")} className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-xs">◷</div>
          <span className="text-[10px] mt-1">{timer}</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">✨</div>
          <span className="text-[10px] mt-1">Beauty</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">🎨</div>
          <span className="text-[10px] mt-1">Filter</span>
        </div>

        <button onClick={() => setSpeed(speed === "1x"? "2x" : speed === "2x"? "0.5x" : "1x")} className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-[10px]">{speed}</div>
          <span className="text-[10px] mt-1">Speed</span>
        </button>
      </div>

      {/* Beauty Slider - Vigo Style */}
      <div className="absolute right-16 top-32 z-20">
        <input
          type="range"
          min="0"
          max="100"
          value={beauty}
          onChange={(e) => setBeauty(Number(e.target.value))}
          className="w-24 rotate-[-90deg]"
        />
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 w-full p-5 z-20 flex flex-col items-center gap-4">
        <div className="flex gap-6 text-white text-sm">
          <span>15s</span>
          <span className="font-bold border-b-2 border-white">60s</span>
          <span>3m</span>
        </div>

        <div className="flex items-center justify-between w-full max-w-[300px]">
          <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
          <button className="w-20 h-20 rounded-full bg-[#ff2d55] border-4 border-white"></button>
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white">↑</div>
        </div>
      </div>
    </div>
  );
}