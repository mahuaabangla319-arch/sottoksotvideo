import { motion } from "framer-motion";
import { User } from "lucide-react";

export function FireRingAvatar({
  src,
  size = 120,
  alt = "প্রোফাইল ছবি",
}: {
  src?: string | null;
  size?: number;
  alt?: string;
}) {
  const ring = 5;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #ff3b00, #ffb300, #facc15, #ff7a00, #ff3b00)",
          filter: "blur(0.2px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: "0 0 26px rgba(255,140,0,0.65)" }}
        animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute overflow-hidden rounded-full bg-black"
        style={{ inset: ring }}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/10">
            <User className="h-1/2 w-1/2 text-white/60" strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
}
