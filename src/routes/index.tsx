import { useRef, useState, useEffect } from "react";

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [followed, setFollowed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    if (!videoRef.current) return;
    try {
      const res = await fetch(videoRef.current.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SOT-TOK-video.mp4";
      a.click();
    } catch {
      window.open(videoRef.current.src, "_blank");
    }
  };

  if (showSplash) {
    return (
      <div className="bg-black h-screen w-screen flex items-center justify-center fixed inset-0 z-[9999]">
        <img src="/splash.png" alt="SOT TOK" className="w-[220px]" />
      </div>
    );
  }

  return (
    <div className="bg-black text-white h-screen w-screen relative overflow-hidden">
      <video
        ref={videoRef}
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        className="w-full h-full object-cover"
        autoPlay loop muted
      />
      <button onClick={() => setFollowed(!followed)} className="absolute top-10 right-4 bg-red-500 px-4 py-1 rounded-full">
        {followed? "Following" : "Follow"}
      </button>
      <button onClick={handleDownload} className="absolute bottom-20 right-4 bg-white text-black px-4 py-2 rounded-full font-bold">
        Download
      </button>
    </div>
  );
}