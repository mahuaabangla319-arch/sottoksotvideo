import type { FaceLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import wasm from '@/assets/face-wasm.asset.json';

export type BeautyLook = { key: string; name: string; lip: string; blush: string; strength: number };
export const beautyLooks: BeautyLook[] = [
  ['rose','রোজ','makeup-rose','makeup-rose',.65], ['cherry','চেরি','makeup-cherry','makeup-rose',.85],
  ['peach','পিচ','makeup-peach','makeup-peach',.6], ['berry','বেরি','makeup-berry','makeup-rose',.8],
  ['natural','ন্যাচারাল','makeup-peach','makeup-rose',.3], ['gloss','গ্লস','makeup-rose','makeup-peach',.5],
  ['bridal','ব্রাইডাল','makeup-cherry','makeup-rose',1], ['soft','সফট','makeup-rose','makeup-peach',.4],
  ['coral','কোরাল','makeup-peach','makeup-peach',.85], ['velvet','ভেলভেট','makeup-berry','makeup-rose',.7],
  ['pink','পিঙ্ক','makeup-rose','makeup-rose',.9], ['plum','প্লাম','makeup-berry','makeup-berry',.85],
  ['sunny','সানি','makeup-peach','makeup-peach',.45], ['date','ডেট','makeup-cherry','makeup-rose',.6],
  ['party','পার্টি','makeup-berry','makeup-rose',1], ['nude','নিউড','makeup-peach','makeup-peach',.25],
  ['fresh','ডিউই','makeup-rose','makeup-peach',.35], ['bold','বোল্ড','makeup-cherry','makeup-berry',1],
  ['doll','ডল','makeup-rose','makeup-rose',.75], ['classic','ক্লাসিক','makeup-cherry','makeup-peach',.75],
].map(([key,name,lip,blush,strength]) => ({key: String(key),name: String(name),lip: String(lip),blush: String(blush),strength: Number(strength)}));
export const funnyLooks = [{key:'wide',name:'চওড়া মুখ'},{key:'mirror',name:'মিরর মজা'},{key:'comic',name:'কমিক'},{key:'upside',name:'উল্টো দুনিয়া'}];
export type EffectOptions = { makeup: string; beauty: number; funny: string; css: string; mirror: boolean };

/** Shared canvas renderer: preview and saved clips use identical face geometry. */
export class CreatorEffects {
  detector: FaceLandmarker | null = null;
  private landmarks: NormalizedLandmark[] = [];
  private lastDetection = 0;
  private colors = new Map<string,string>();
  async init() {
    const { FaceLandmarker } = await import('@mediapipe/tasks-vision');
    this.detector = await FaceLandmarker.createFromOptions({
      wasmLoaderPath: '/face-model/vision_wasm_internal.js', wasmBinaryPath: wasm.url,
    }, { baseOptions: { modelAssetPath: '/face-model/face_landmarker.task', delegate: 'CPU' }, runningMode: 'VIDEO', numFaces: 1 });
  }
  close() { this.detector?.close(); this.detector = null; }
  draw(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, width: number, height: number, options: EffectOptions) {
    if (!video.videoWidth || video.readyState < 2) return;
    const time = performance.now();
    if (options.makeup && this.detector && time - this.lastDetection > 120) {
      this.landmarks = this.detector.detectForVideo(video, time).faceLandmarks[0] ?? [];
      this.lastDetection = time;
    }
    const scale = Math.max(width/video.videoWidth,height/video.videoHeight);
    const dw = video.videoWidth*scale, dh = video.videoHeight*scale;
    const dx = (width-dw)/2, dy=(height-dh)/2;
    ctx.save();
    ctx.beginPath(); ctx.rect(0,0,width,height); ctx.clip();
    if (options.mirror) {ctx.translate(width,0);ctx.scale(-1,1);}
    if (options.funny === 'upside') {ctx.translate(width,height);ctx.rotate(Math.PI);}
    ctx.filter = `${options.css === 'none' ? '' : options.css} brightness(${1+options.beauty*.001}) saturate(${1+options.beauty*.0015})${options.funny === 'comic' ? ' contrast(1.8) saturate(1.8)' : ''}`;
    if (options.funny === 'wide') ctx.drawImage(video,dx-width*.18,dy,dw+width*.36,dh);
    else ctx.drawImage(video,dx,dy,dw,dh);
    ctx.filter='none';
    if (options.funny === 'mirror') {
      ctx.save();ctx.beginPath();ctx.rect(width/2,0,width/2,height);ctx.clip();ctx.translate(width,0);ctx.scale(-1,1);ctx.drawImage(video,dx,dy,dw,dh);ctx.restore();
    }
    const look=beautyLooks.find(l=>l.key===options.makeup);
    if (look && this.landmarks.length) {
      const point=(i:number) => { const p=this.landmarks[i];return p ? {x:dx+p.x*dw,y:dy+p.y*dh} : null; };
      const color=(token:string) => { const stored=this.colors.get(token);if(stored)return stored;const value=getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();this.colors.set(token,value);return value; };
      const path=(ids:number[],fill:boolean) => {
        ctx.beginPath();ids.forEach((id,i)=>{const p=point(id);if(p){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}});if(fill){ctx.closePath();ctx.fill();}else ctx.stroke();
      };
      ctx.globalAlpha=look.strength*.5;ctx.fillStyle=color(look.lip);
      path([61,40,37,0,267,270,291,321,314,17,84,91],true);
      ctx.globalAlpha=look.strength*.5;ctx.strokeStyle=color('makeup-kajal');ctx.lineWidth=Math.max(1,width*.004);
      path([33,7,163,144,145,153,154,155,133],false);path([263,249,390,373,374,380,381,382,362],false);
      ctx.fillStyle=color(look.blush);ctx.globalAlpha=look.strength*.2;
      [50,280].forEach(i=>{const p=point(i);if(p){ctx.beginPath();ctx.ellipse(p.x,p.y,width*.055,height*.021,0,0,Math.PI*2);ctx.fill();}});
    }
    ctx.restore();
  }
}