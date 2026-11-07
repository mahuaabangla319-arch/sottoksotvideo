import { useState, useEffect, useRef } from "react";

export default function UserProfile() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(128);
  const [videos, setVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [songStart, setSongStart] = useState(0);
  const [songEnd, setSongEnd] = useState(15);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [searchSong, setSearchSong] = useState("");

  const videoRef = useRef<any>(null);
  const recorderRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const chunksRef = useRef<any[]>([]);

  const myUsername = "@sottok_user";
  const profile = { name: "SOT TOK User", username: myUsername, bio: "Hello, Ami SOT TOK User ❤️", avatar: "https://via.placeholder.com/100" };

  // গানের লিস্ট - এখানে তুমি নিজের গান যোগ করতে পারবে
  const SONGS = [
    { id: 1, name: "Arijit Singh - Tum Se Hi", artist: "Arijit Singh", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: 30, trending: true },
    { id: 2, name: "Neha Kakkar - Dilbar", artist: "Neha Kakkar", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", duration: 30, trending: true },
    { id: 3, name: "Badshah - Genda Phool", artist: "Badshah", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", duration: 30, trending: false },
    { id: 4, name: "Shreya Ghoshal - Sun Raha Hai", artist: "Shreya Ghoshal", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", duration: 30, trending: false },
    { id: 5, name: "KK - Zara Sa", artist: "KK", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", duration: 30, trending: true },
    { id: 6, name: "Atif Aslam - Jeene Laga Hoon", artist: "Atif Aslam", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", duration: 30, trending: false },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("sot_all_videos");
    if (saved) {
      const all = JSON.parse(saved);
      setAllVideos(all);
      setVideos(all.filter((v: any) => v.user === myUsername));
    }
  }, []);

  // গান বাজানো - কেটে নেওয়া অংশ থেকে বাজবে
  function playSong(song: any) {
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(song.url);
    a.currentTime = songStart;
    a.play();
    audioRef.current = a;
    // যতটুকু কেটেছো ততটুকুই বাজবে, তারপর থামবে
    setTimeout(() => { a.pause(); }, (songEnd - songStart) * 1000);
  }

  // ক্যামেরা + গান একসাথে রেকর্ড
  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    if (selectedSong) playSong(selectedSong);

    const rec = new MediaRecorder(stream);
    recorderRef.current = rec;
    chunksRef.current = [];
    rec.ondataavailable = (e: any) => chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedUrl(URL.createObjectURL(blob));
    };
    rec.start();
    setIsRecording(true);
  }

  function stopCamera() {
    recorderRef.current?.stop();
    setIsRecording(false);
    if (audioRef.current) audioRef.current.pause();
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach((t: any) => t.stop());
  }

  function handlePost() {
    if (!recordedUrl) return alert("Age camera theke video koro");
    const saved = localStorage.getItem("sot_all_videos");
    const all = saved ? JSON.parse(saved) : [];
    const newVideo = {
      id: Date.now(), url: recordedUrl, user: myUsername, name: profile.name, avatar: profile.avatar,
      caption: selectedSong ? `🎵 ${selectedSong.name}` : "New Video ✅",
      song: selectedSong ? { ...selectedSong, start: songStart, end: songEnd } : null,
    };
    const updated = [newVideo, ...all];
    localStorage.setItem("sot_all_videos", JSON.stringify(updated));
    setAllVideos(updated);
    setVideos([newVideo, ...videos]);
    setRecordedUrl(""); setSelectedSong(null);
    alert("Post hoye geche ✅ Profile + Home duto tei dekhabe!");
  }

  // 3. অন্যের ভিডিওর গান নিয়ে নিজের ভিডিও বানানো - Use This Sound
  function useThisSound(video: any) {
    if (!video.song) return alert("Ei video te kono gan nei");
    setSelectedSong(video.song);
    setSongStart(video.song.start || 0);
    setSongEnd(video.song.end || 15);
    setShowSongPicker(false);
    alert(`Gan niye nila ✅ Ekhon ei gan diye video banao: ${video.song.name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredSongs = SONGS.filter(s => s.name.toLowerCase().includes(searchSong.toLowerCase()) || s.artist.toLowerCase().includes(searchSong.toLowerCase()));

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "16px" }}>
      {/* PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <img src={profile.avatar} style={{ width: "90px", height: "90px", borderRadius: "50%" }} />
        <div>
          <h2 style={{ margin: "0" }}>{profile.name}</h2>
          <p style={{ margin: "0", opacity: "0.7" }}>{profile.username}</p>
          <p style={{ margin: "6px 0" }}>{profile.bio}</p>
          <p style={{ margin: "0", fontWeight: "bold" }}>{followersCount} Followers • {videos.length} Videos</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        <button onClick={() => { setIsFollowing(!isFollowing); setFollowersCount(isFollowing ? 128 : 129); }} style={{ flex: 1, padding: "13px", borderRadius: "10px", background: isFollowing ? "#333" : "#ff3b5c", color: "#fff", border: "none", fontWeight: "bold" }}>{isFollowing ? "Following ✓" : "Follow"}</button>
        <button style={{ flex: 1, padding: "13px", borderRadius: "10px", background: "#222", color: "#fff", border: "1px solid #444" }}>Message</button>
      </div>

      {/* CAMERA + SONG BOX */}
      <div style={{ background: "#111", padding: "12px", borderRadius: "12px", marginTop: "20px", border: "1px solid #333" }}>
        <h3 style={{ margin: "0 0 10px 0" }}>📹 Camera + 🎵 Gan Diye Video Banao</h3>
        <video ref={videoRef} style={{ width: "100%", height: "220px", background: "#000", borderRadius: "10px", objectFit: "cover" }} />

        {/* SELECTED SONG SHOW */}
        {selectedSong ? (
          <div style={{ background: "#222", padding: "10px", borderRadius: "8px", marginTop: "10px" }}>
            <p style={{ margin: "0", fontWeight: "bold" }}>🎵 {selectedSong.name} - {selectedSong.artist}</p>
            <p style={{ margin: "4px 0", fontSize: "13px", opacity: 0.8 }}>Kata: {songStart}s theke {songEnd}s porjonto ({songEnd - songStart}s)</p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>Start: {songStart}s</span>
              <input type="range" min="0" max="30" value={songStart} onChange={(e) => setSongStart(Number(e.target.value))} style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>End: {songEnd}s</span>
              <input type="range" min="0" max="30" value={songEnd} onChange={(e) => setSongEnd(Number(e.target.value))} style={{ flex: 1 }} />
            </div>
            <button onClick={() => playSong(selectedSong)} style={{ width: "100%", padding: "8px", marginTop: "6px", borderRadius: "6px", background: "#333", color: "#fff", border: "none" }}>▶ Gan Sune Dekho (Kata Ongsho)</button>
            <button onClick={() => setSelectedSong(null)} style={{ width: "100%", padding: "8px", marginTop: "6px", borderRadius: "6px", background: "transparent", color: "#ff3b5c", border: "1px solid #ff3b5c" }}>Gan Remove Koro</button>
          </div>
        ) : (
          <button onClick={() => setShowSongPicker(true)} style={{ width: "100%", padding: "12px", marginTop: "10px", borderRadius: "8px", background: "#222", color: "#fff", border: "1px dashed #666", fontWeight: "bold" }}>🎵 Gan Choice Koro - Nijer Pochondo Moto</button>
        )}

        {/* SONG PICKER */}
        {showSongPicker && (
          <div style={{ background: "#1a1a1a", padding: "10px", borderRadius: "10px", marginTop: "10px", border: "1px solid #444" }}>
            <input value={searchSong} onChange={(e) => setSearchSong(e.target.value)} placeholder="🔍 Gan khujo - Arijit, Neha, Badshah..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#222", color: "#fff", marginBottom: "10px" }} />
            <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>🔥 Trending Gan</p>
            {filteredSongs.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#222", padding: "10px", borderRadius: "8px", marginBottom: "6px" }}>
                <div><p style={{ margin: "0", fontWeight: "bold" }}>{s.name}</p><p style={{ margin: "0", fontSize: "12px", opacity: 0.7 }}>{s.artist} {s.trending ? "• 🔥 Trending" : ""}</p></div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => playSong(s)} style={{ padding: "6px 10px", borderRadius: "6px", background: "#333", color: "#fff", border: "none" }}>▶</button>
                  <button onClick={() => { setSelectedSong(s); setShowSongPicker(false); }} style={{ padding: "6px 12px", borderRadius: "6px", background: "#ff3b5c", color: "#fff", border: "none", fontWeight: "bold" }}>Use</button>
                </div>
              </div>
            ))}
            <button onClick={() => setShowSongPicker(false)} style={{ width: "100%", padding: "8px", background: "transparent", color: "#fff", border: "1px solid #444", borderRadius: "6px" }}>Bondho Koro</button>
          </div>
        )}

        {!isRecording ? (
          <button onClick={startCamera} style={{ width: "100%", padding: "12px", marginTop: "10px", borderRadius: "8px", background: "red", color: "#fff", border: "none", fontWeight: "bold" }}>● Recording Start {selectedSong ? `+ Gan Bajbe` : ""}</button>
        ) : (
          <button onClick={stopCamera} style={{ width: "100%", padding: "12px", marginTop: "10px", borderRadius: "8px", background: "#333", color: "#fff", border: "none", fontWeight: "bold" }}>■ Stop</button>
        )}

        {recordedUrl && (
          <>
            <video src={recordedUrl} controls style={{ width: "100%", height: "220px", marginTop: "10px", borderRadius: "10px" }} />
            <button onClick={handlePost} style={{ width: "100%", padding: "12px", marginTop: "10px", borderRadius: "8px", background: "#ff3b5c", color: "#fff", border: "none", fontWeight: "bold" }}>Post Koro - Profile + Home Duto Tei Jabe ✅</button>
          </>
        )}
      </div>

      {/* AMAR VIDEO */}
      <h3 style={{ marginTop: "24px" }}>Amar Videos ({videos.length})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
        {videos.map((v) => (
          <div key={v.id}><video src={v.url} controls style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }} /><p style={{ fontSize: "11px", margin: "2px 0" }}>{v.caption}</p></div>
        ))}
      </div>

      {/* HOME FEED - SOBAR VIDEO + USE THIS SOUND */}
      <h3 style={{ marginTop: "30px" }}>🏠 Home Feed - Sobar Video ({allVideos.length})</h3>
      {allVideos.map((v) => (
        <div key={v.id} style={{ background: "#111", padding: "10px", borderRadius: "12px", marginBottom: "12px" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>👤 {v.user} • {v.caption}</p>
          <video src={v.url} controls style={{ width: "100%", borderRadius: "10px" }} />
          {v.song && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#222", padding: "8px", borderRadius: "8px", marginTop: "8px" }}>
              <span>🎵 {v.song.name} ({v.song.start}s - {v.song.end}s)</span>
              <button onClick={() => useThisSound(v)} style={{ padding: "8px 12px", borderRadius: "6px", background: "#ff3b5c", color: "#fff", border: "none", fontWeight: "bold" }}>Use This Sound 🎵</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}