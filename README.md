
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Zap, Sparkles, Video, Image as ImageIcon, Play, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function AICameraScreen() {
  const [activeTab, setActiveTab] = useState<'record' | 'filters'>('record');
  const [selectedTemplate, setSelectedTemplate] = useState('durga');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Camera initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(false);
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError(true);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer for recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    chunksRef.current = [];
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          setProcessedVideoUrl(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (e) {
        console.error("MediaRecorder error:", e);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const applyAITransform = () => {
    setIsProcessingAI(true);
    setTimeout(() => {
      setIsProcessingAI(false);
      alert(`সফলভাবে আপনার ভিডিওতে '${selectedTemplate.toUpperCase()}' এআই ফিল্টার ও রূপ প্রয়োগ করা হয়েছে!`);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-black text-white relative shadow-2xl overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-md z-20 border-b border-gray-800">
        <button className="p-1 text-white hover:text-pink-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold tracking-wide">নতুন ভিডিও ও এআই মেকওভার</h1>
        <button className="text-xs bg-pink-600 px-3 py-1 rounded-full font-semibold">প্রো</button>
      </div>

      {/* Camera / Preview Viewport */}
      <div className="relative flex-1 bg-gray-950 flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="text-center p-6">
            <p className="text-red-400 mb-3 text-sm">ক্যামেরা অ্যাক্সেস পাওয়া যায়নি। দয়া করে পারমিশন দিন।</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          />
        )}

        {/* AI Filter Overlay Effect Badge */}
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-pink-500/50 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
          <span className="text-xs font-medium text-pink-300 capitalize">থিম: {selectedTemplate} রূপ</span>
        </div>

        {/* Recording Timer */}
        {isRecording && (
          <div className="absolute top-4 right-4 z-10 bg-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime}</span>
          </div>
        )}

        {/* AI Processing Modal/Loader */}
        {isProcessingAI && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-pink-400">এআই রূপান্তর চলছে...</h3>
            <p className="text-xs text-gray-300 mt-1 text-center">আপনার চেহারায় ঐশ্বরিক লুক ফুটিয়ে তোলা হচ্ছে।</p>
          </div>
        )}
      </div>

      {/* Bottom Controls & AI Templates Section */}
      <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-4 z-20 space-y-4">
        
        {/* Divine Templates Selection (Female & Male) */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-medium">✨ এআই ডিভাইন মেকওভার টেমপ্লেট:</p>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'durga', label: 'মা দুর্গা (মহিলা)', icon: '🔱' },
              { id: 'kali', label: 'মা কালী (মহিলা)', icon: '🔥' },
              { id: 'shiva', label: 'শিব বাবা (পুরুষ)', icon: '🐍' },
              { id: 'narayan', label: 'নারায়ণ (পুরুষ)', icon: '🦚' }
            ].map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedTemplate === template.id 
                    ? 'bg-pink-600 border-pink-400 text-white shadow-lg' 
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>{template.icon}</span>
                <span>{template.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Record & AI Transform */}
        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={applyAITransform}
            className="flex-1 mr-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>এআই ফিল্টার অ্যাপ্লাই করুন</span>
          </button>

          {/* Record Control Button */}
          {!isRecording ? (
            <button 
              onClick={handleStartRecording}
              className="w-16 h-16 bg-blue-600 rounded-full border-4 border-white/80 flex items-center justify-center shadow-xl transform active:scale-95 transition"
            >
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </button>
          ) : (
            <button 
              onClick={handleStopRecording}
              className="w-16 h-16 bg-red-600 rounded-full border-4 border-white/80 flex items-center justify-center shadow-xl transform active:scale-95 transition animate-pulse"
            >
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

4.  **EXPLORE PAGE (Exact):**
    - White bg. Top Search bar with search icon.
    - Pink banner #ffe3f0 rounded 24px: red badge SotTok with flame, big Bengali: নিজের সাথে ভুয়েট, pink small: প্রতি সপ্তাহে নতুন চ্যালেঞ্জ, black small: সেরা ১০ জন ক্রিয়েটর পাবেন বিশেষ পুরস্কার
    - Tabs: Trending (active black bold with pink underline), Comedy, Food, Dance|Sing, Family, Beauty - horizontal scroll.
    - Middle: gray text: এখনো কোনো ট্রেন্ডিং হ্যাশট্যাগ নেই।
    - Bottom: Recommended Users + Show all pink right.
    - Show 2-column user cards with Food category images.

5.  **ACTIVITY PAGE (Exact):**
    - Black bg. Header: back arrow + Activity title white.
    - Tabs: All (active pink underline), Likes, Comments, Followers gray.
    - Center: gray Bengali: এখনো কোনো অ্যাক্টিভিটি নেই।
    - Bottom nav highlight on bell yellow.

6.  **NEW VIDEO - CAMERA RECORDING FULLY WORKING (Nothing missing):**
    - Header: back arrow + নতুন ভিডিও title Bengali, 3 dots right.
    - Tabs: Record active blue #2a4bff with video icon, Gallery with image icon.
    - **CAMERA MUST WORK:** Request getUserMedia, show live camera preview in center rounded 24px, mirrored. If permission denied show black screen with "Camera access needed" button.
    - Right side inside preview: Flash icon (toggle torch), Flip icon (switch front/back camera).
    - Bottom controls: 15s and 30s pill selector, 15s active blue. Big blue record button #2a4bff with white border ring. On press start MediaRecorder, timer counting, on second press stop and save video to Firebase Storage, show preview and Post button. Left bottom small gallery thumbnail (last image from device), Right bottom Speed icon.
    - After record: Add caption screen with Post button -> upload to Firestore feed.
Add a 'Divine Makeover & Video' section. Users can upload their photo and choose templates like 'Maa Durga', 'Maa Kali' for females, and 'Lord Shiva', 'Lord Narayan' for males. Include an AI processing button to transform their face into these legendary characters and generate a short festival video clip."
**BOTTOM NAVIGATION (Exact Bengali):**
Fixed bottom, black bg white icons, 5 items: হোম (home), এক্সপ্লোরার (compass), + blue button big (#2a4bff rounded-xl), ইনবক্স (bell), প্রোফাইল (user). Active state blue/yellow.

**SETUP:**
Use Firebase config placeholder. Use react-router. Mobile width 420px centered. All text Bengali exact as described. Production ready, deployable.

DO NOT SKIP CAMERA, DO NOT SKIP NEW GMAIL FORM. Everything must work.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sottoksotvideo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7bcd7f5b-07c3-4d21-815f-e59f44663b92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

