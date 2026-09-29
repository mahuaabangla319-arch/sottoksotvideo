import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Crown, Sparkles, Video, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { awardVideoCoins } from "@/lib/coins";

export const Route = createFileRoute("/create")({
  component: AICreatePage,
});

function AICreatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [look, setLook] = useState("durga_mukut");
  const [isRecording, setIsRecording] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        toast.error("ক্যামেরা চালু হচ্ছে না");
      }
    }
    startCamera();
  }, []);

  // AI Filter - মুখ অরিজিনাল, সাজ শুধু Canvas এ বসবে
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas ||!ctx) return;
    let anim: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // AI Durga Look - মুখের উপর বসবে, অরিজিনাল মুখ ঢাকবে না
      if (look === "durga_mukut") {
        ctx.font = "80px serif";
        ctx.fillText("👑", 130, 70); // মুকুট
        ctx.font = "30px serif";
        ctx.fillText("🔴", 185, 125); // তৃতীয় নয়ন / সিঁদুর
        ctx.fillText("✨", 110, 160);
        ctx.fillText("✨", 270, 160);
      } else if (look === "durga_saree") {
        ctx.font = "22px sans-serif";
        ctx.fillStyle = "#FFD700";
        ctx.fillText("🌺 মহালয়া লাল-সাদা সাজ 🌺", 60, canvas.height - 30);
        ctx.font = "30px serif";
        ctx.fillText("🔴", 185, 120);
      } else if (look === "durga_trishul") {
        ctx.font = "60px serif";
        ctx.fillText("🔱", 20, 350);
        ctx.fillText("🪷", 320, 350);
        ctx.fillText("👑", 130, 70);
      }
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [look]);

  const handleUpload = async () => {
    toast.success("মহালয়া লুকে ভিডিও আপলোড হলো! 🕉️ #DurgaLook");
    if (user) await awardVideoCoins(user.id, 10);
  };

  return (
    <PhoneShell>
      <div className="bg-black text-white min-h-screen flex flex-col">
        <div className="flex justify-between items-center p-4">
          <h1 className="font-bold flex items-center gap-2"><Crown className="text-yellow-400"/> AI Star Camera</h1>
          <SwitchCamera className="w-6 h-6" />
        </div>

        <p className="text-[11px] text-center text-zinc-400 px-4">AI দিয়ে মুখ 100% অরিজিনাল থাকবে, শুধু দুর্গা সাজটা বসবে</p>

        <div className="relative flex-1 flex justify-center items-center bg-zinc-950 m-2 rounded-2xl overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} width={400} height={650} className="absolute top-0 left-0 w-full h-full" />

          <div className="absolute bottom-20 flex gap-2">
            <button onClick={() => setLook("durga_mukut")} className={`px-3 py-2 rounded-full text-[11px] font-bold ${look==="durga_mukut"?"bg-orange-500 text-white":"bg-zinc-800"}`}>👑 মুকুট</button>
            <button onClick={() => setLook("durga_saree")} className={`px-3 py-2 rounded-full text-[11px] font-bold ${look==="durga_saree"?"bg-orange-500 text-white":"bg-zinc-800"}`}>🌺 মহালয়া সাজ</button>
            <button onClick={() => setLook("durga_trishul")} className={`px-3 py-2 rounded-full text-[11px] font-bold ${look==="durga_trishul"?"bg-orange-500 text-white":"bg-zinc-800"}`}>🔱 ত্রিশূল</button>
          </div>
        </div>

        <div className="p-4 flex flex-col items-center">
          <button
            onClick={() => { setIsRecording(!isRecording); if(!isRecording) toast("15s রেকর্ড শুরু..."); else handleUpload(); }}
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${isRecording?"bg-red-600 border-red-300 animate-pulse":"bg-white border-zinc-600"}`}
          >
            <Video className={`w-8 h-8 ${isRecording?"text-white":"text-black"}`} />
          </button>
          <p className="text-xs mt-2 text-zinc-400">{isRecording? "রেকর্ড হচ্ছে... চাপলে আপলোড হবে" : "চেপে মহালয়ার ভিডিও করো"}</p>
        </div>
        <BottomNav />
      </div>
    </PhoneShell>
  );
}