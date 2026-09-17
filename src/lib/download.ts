import { supabase } from "@/integrations/supabase/client";

/** Returns a playable URL for a stored video path (or the path itself if it's already a URL). */
export async function videoSrc(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  const { data } = await supabase.storage.from("videos").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Plain download (no re-encode) — fastest, keeps original quality and sound. */
async function downloadRaw(src: string, filename: string) {
  const res = await fetch(src);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * Re-renders the video onto a canvas with a "SOT TOK @user" watermark, keeping the
 * original audio track, and downloads the result. Falls back to a plain download
 * when the browser can't capture canvas/audio streams.
 */
export async function downloadWatermarked(
  path: string,
  username: string,
  onProgress?: (pct: number) => void,
): Promise<"watermarked" | "raw"> {
  const src = await videoSrc(path);
  if (!src) throw new Error("no-src");
  const filename = `SOTTOK_${username || "video"}_${Date.now()}.webm`;

  try {
    if (typeof MediaRecorder === "undefined") throw new Error("no-recorder");

    const res = await fetch(src);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const video = document.createElement("video");
    video.src = objectUrl;
    video.muted = false;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("load-failed"));
    });

    const w = video.videoWidth || 720;
    const h = video.videoHeight || 1280;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no-ctx");

    const canvasStream = canvas.captureStream(30);

    // Keep the original sound quality by piping the element audio into the recording.
    const AudioCtor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    let audioCtx: AudioContext | null = null;
    if (AudioCtor) {
      audioCtx = new AudioCtor();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
    }

    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";
    const chunks: BlobPart[] = [];
    const rec = new MediaRecorder(canvasStream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

    const done = new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
    });

    const label = `SOT TOK · @${username}`;
    let raf = 0;
    const draw = () => {
      ctx.drawImage(video, 0, 0, w, h);
      const fs = Math.max(18, Math.round(w * 0.045));
      ctx.font = `bold ${fs}px sans-serif`;
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = fs * 0.4;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(label, fs * 0.8, h - fs * 1.4);
      ctx.fillStyle = "rgba(250,204,21,0.95)";
      ctx.font = `bold ${Math.round(fs * 0.7)}px sans-serif`;
      ctx.fillText("sottok", fs * 0.8, h - fs * 0.45);
      ctx.shadowBlur = 0;
      if (video.duration) onProgress?.(Math.min(99, (video.currentTime / video.duration) * 100));
      raf = requestAnimationFrame(draw);
    };

    rec.start(200);
    await video.play();
    draw();

    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });
    cancelAnimationFrame(raf);
    rec.stop();
    await done;
    await audioCtx?.close().catch(() => {});
    URL.revokeObjectURL(objectUrl);

    const out = new Blob(chunks, { type: mime });
    if (out.size < 1000) throw new Error("empty");
    const url = URL.createObjectURL(out);
    triggerDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    onProgress?.(100);
    return "watermarked";
  } catch {
    await downloadRaw(src, filename.replace(/\.webm$/, ".mp4"));
    onProgress?.(100);
    return "raw";
  }
}
