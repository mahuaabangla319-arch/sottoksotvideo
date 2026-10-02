import durga from "@/assets/durga-filter.png";
import kali from "@/assets/kali-filter.png";
import ganesh from "@/assets/ganesh-filter.png";
import krishna from "@/assets/krishna-filter.png";
import shiva from "@/assets/shiva-filter.png";
import logo from "@/assets/sottok-logo.png.asset.json";

export const looks = [
  { key: "original", name: "অরিজিনাল", css: "none" },
  { key: "fresh", name: "ফ্রেশ", css: "brightness(1.1) saturate(1.12)" },
  { key: "durga", name: "মা দুর্গা", css: "brightness(1.07) saturate(1.2)", image: durga },
  { key: "kali", name: "মা কালী", css: "contrast(1.08) saturate(1.2)", image: kali },
  { key: "ganesh", name: "গণেশ", css: "sepia(.3) saturate(1.4)", image: ganesh },
  { key: "krishna", name: "কৃষ্ণ", css: "hue-rotate(22deg) saturate(1.2)", image: krishna },
  { key: "shiva", name: "শিব", css: "contrast(1.15) saturate(.7)", image: shiva },
] as const;
export type Look = (typeof looks)[number];

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ছবি লোড করা যায়নি"));
    img.src = url;
  });
}

export function drawBrand(ctx: CanvasRenderingContext2D, width: number, height: number, id: string, icon?: HTMLImageElement) {
  const unit = width / 360;
  const y = height - 34 * unit;
  ctx.save();
  ctx.shadowColor = "#facc15";
  ctx.shadowBlur = 12 * unit;
  ctx.font = `bold ${15 * unit}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  if (icon) ctx.drawImage(icon, 15 * unit, y - 16 * unit, 36 * unit, 36 * unit);
  ctx.fillText(`SOT TOK  •  ID: ${id}`, icon ? 58 * unit : 15 * unit, y);
  ctx.restore();
}

export const logoUrl = logo.url;

export function supportedRecordingType() {
  if (typeof MediaRecorder === "undefined") throw new Error("এই ডিভাইসে ভিডিও রেকর্ডিং সাপোর্ট করে না");
  return ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
    .find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Renders a real, branded recording, not just a visual preview overlay. */
export async function downloadBrandedVideo(source: string, id: string, name: string) {
  if (!id) throw new Error("এই ভিডিওর SOT ID পাওয়া যায়নি");
  const response = await fetch(source);
  if (!response.ok) throw new Error("ভিডিও লোড করা যায়নি");
  const input = URL.createObjectURL(await response.blob());
  const video = document.createElement("video");
  video.src = input;
  video.playsInline = true;
  video.muted = false;
  video.preload = "auto";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx || !canvas.captureStream) { URL.revokeObjectURL(input); throw new Error("এই ডিভাইসে ওয়াটারমার্ক ভিডিও তৈরি হয় না"); }
  const icon = await loadImage(logoUrl).catch(() => undefined);
  let frame = 0;
  let stream: MediaStream | undefined;
  let audio: AudioContext | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      if (video.readyState >= 1) { resolve(); return; }
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("ভিডিও খোলা যায়নি"));
    });
    canvas.width = Math.min(720, video.videoWidth || 360);
    canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
    if (!Number.isFinite(canvas.height) || !canvas.height) throw new Error("ভিডিওর মাপ পাওয়া যায়নি");
    stream = canvas.captureStream(30);
    audio = new AudioContext();
    const audioSource = audio.createMediaElementSource(video);
    const audioDestination = audio.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    audioDestination.stream.getAudioTracks().forEach((track) => stream?.addTrack(track));
    const mime = supportedRecordingType();
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
     const finished = new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error("ডাউনলোড ভিডিও তৈরি করা যায়নি"));
       recorder.onstop = () => {
         const result = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
         if (!result.size) reject(new Error("ভিডিও তৈরি করা যায়নি"));
         else resolve(result);
       };
    });
    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      drawBrand(ctx, canvas.width, canvas.height, id, icon);
      if (!video.ended) frame = requestAnimationFrame(draw);
    };
     await audio.resume();
     await video.play();
     recorder.start(250);
    draw();
    await new Promise<void>((resolve, reject) => {
       if (video.ended) { resolve(); return; }
       video.onended = () => resolve();
      video.onerror = () => reject(new Error("ভিডিও চালানো যায়নি"));
    });
    cancelAnimationFrame(frame);
    recorder.stop();
    const output = await finished;
    saveBlob(output, `${name}.${output.type.includes("mp4") ? "mp4" : "webm"}`);
  } finally {
    cancelAnimationFrame(frame);
    video.pause();
    stream?.getTracks().forEach((track) => track.stop());
    if (audio) void audio.close();
    URL.revokeObjectURL(input);
  }
}
