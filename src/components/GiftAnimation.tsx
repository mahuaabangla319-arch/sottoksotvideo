import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SPARKS = ["✨", "⭐", "💫", "🎁", "🌸"];

/** Glowing gift celebration — a rose rising with sparkles and floating gift boxes. */
export function GiftAnimation({ gift, onDone }: { gift: { emoji: string; name: string } | null; onDone: () => void }) {
  useEffect(() => {
    if (!gift) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [gift, onDone]);

  return (
    <AnimatePresence>
      {gift && (
        <motion.div
          key={gift.name + Date.now()}
          className="pointer-events-none absolute inset-0 z-[80] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* glow halo */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/40 blur-[80px]"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.25, 1], opacity: [0, 0.9, 0.7] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {/* rising gift */}
          <motion.div
            className="absolute left-1/2 top-1/2 text-center"
            initial={{ y: 160, scale: 0.2, opacity: 0 }}
            animate={{ y: [-160, 0, -24, 0], scale: [0.2, 1.35, 1.1, 1], opacity: 1 }}
            transition={{ duration: 1.6, times: [0, 0.55, 0.8, 1], ease: "easeOut" }}
          >
            <div className="text-[96px] leading-none drop-shadow-[0_0_24px_rgba(255,0,128,0.9)]">{gift.emoji}</div>
            <motion.p
              className="mt-2 text-[16px] font-bold text-white drop-shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {gift.name} পাঠানো হয়েছে!
            </motion.p>
          </motion.div>
          {/* sparkles + floating gift boxes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-[22px]"
              style={{ left: `${8 + ((i * 37) % 84)}%`, top: `${15 + ((i * 53) % 65)}%` }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6], y: [-10, -46] }}
              transition={{ duration: 2 + (i % 4) * 0.3, delay: i * 0.12, repeat: 1 }}
            >
              {SPARKS[i % SPARKS.length]}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
