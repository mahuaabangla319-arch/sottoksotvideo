import { loadImage, supportedRecordingType } from './video-studio';

export async function composePhotoReel(files: File[], template: string, audioUrl: string, signal: AbortSignal, progress: (n:number)=>void): Promise<Blob> {
  if(files.length!==3)throw new Error('ঠিক ৩টি ছবি বেছে নিন');
  const urls=files.map(f=>URL.createObjectURL(f));
  let stream: MediaStream | undefined;
  let audio: AudioContext | undefined;
  let music: HTMLAudioElement | undefined;
  let frame=0;
  let recorder: MediaRecorder | undefined;
  try {
    const images=await Promise.all(urls.map(loadImage));
    if(signal.aborted)throw new DOMException('Cancelled','AbortError');
    const canvas=document.createElement('canvas');canvas.width=540;canvas.height=960;
    const ctx=canvas.getContext('2d');if(!ctx||!canvas.captureStream)throw new Error('এই ডিভাইসে ছবির রিল তৈরি হয় না');
    stream=canvas.captureStream(30);
    if(audioUrl){
      music=new Audio(audioUrl);music.crossOrigin='anonymous';music.loop=true;
      audio=new AudioContext();const destination=audio.createMediaStreamDestination();audio.createMediaElementSource(music).connect(destination);
      destination.stream.getAudioTracks().forEach(t=>stream?.addTrack(t));await audio.resume();await music.play();
    }
    const mime=supportedRecordingType();recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
    const chunks:BlobPart[]=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    const finished=new Promise<Blob>((resolve,reject)=>{
      if(!recorder)return;
      recorder.onerror=()=>reject(new Error('রিল তৈরি করা যায়নি'));
      recorder.onstop=()=>signal.aborted?reject(new DOMException('Cancelled','AbortError')):resolve(new Blob(chunks,{type:recorder?.mimeType||'video/webm'}));
    });
    const start=performance.now();
    const draw=()=>{
      const elapsed=(performance.now()-start)/1000;
      const image=images[Math.min(2,Math.floor(elapsed/3))];if(!image)return;
      const phase=(elapsed%3)/3;
      const zoom=template==='zoom'?1+phase*.15:template==='beat'?1+Math.sin(phase*Math.PI*6)*.025:1.06;
      const scale=Math.max(540/image.width,960/image.height)*zoom;
      const w=image.width*scale,h=image.height*scale;
      ctx.drawImage(image,(540-w)/2+(template==='slide'?(phase-.5)*35:0),(960-h)/2,w,h);
      progress(Math.min(100,Math.round(elapsed/9*100)));
      if(elapsed>=9||signal.aborted){recorder?.stop();return;}
      frame=requestAnimationFrame(draw);
    };
    const cancel=()=>{cancelAnimationFrame(frame);if(recorder?.state==='recording')recorder.stop();};
    signal.addEventListener('abort',cancel,{once:true});
    recorder.start(200);draw();
    const blob=await finished;signal.removeEventListener('abort',cancel);
    if(!blob.size)throw new Error('রিল সংরক্ষণ করা যায়নি');return blob;
  } finally {
    cancelAnimationFrame(frame);if(recorder?.state==='recording')recorder.stop();
    music?.pause();stream?.getTracks().forEach(t=>t.stop());if(audio)void audio.close();urls.forEach(u=>URL.revokeObjectURL(u));
  }
}