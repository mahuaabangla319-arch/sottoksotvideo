import { Play } from "lucide-react";

export function SotTokLogo({ size = 92 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <span
        className="pointer-events-none absolute select-none opacity-70 blur-[1px]"
        style={{ fontSize: size * 0.95 }}
        aria-hidden
      >
        🔥
      </span>
      <div
        className="relative flex items-center justify-center bg-flame shadow-flame"
        style={{ width: size * 0.72, height: size * 0.72, borderRadius: 22 }}
      >
        <Play
          className="fill-white text-white"
          style={{ width: size * 0.32, height: size * 0.32 }}
          strokeWidth={1}
        />
      </div>
    </div>
  );
}
