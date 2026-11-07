import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function UserProfile() {
  const { sotId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [myId, setMyId] = useState("");

  useEffect(() => {
    loadAll();
  }, [sotId]);

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setMyId(user.id);

    // 1. Profile load - Real user
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", sotId).single();
    setProfile(prof);

    // 2. Videos load - Real videos of this user
    const { data: vids } = await supabase.from("videos").select("*").eq("user_id", sotId).order("created_at", { ascending: false });
    setVideos(vids || []);

    // 3. Followers count
    const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", sotId);
    setFollowersCount(count || 0);

    // 4. Am I following?
    if (user) {
      const { data: follow } = await supabase.from("follows").select("*").eq("follower_id", user.id).eq("following_id", sotId).single();
      setIsFollowing(!!follow);
    }

    // 5. Is Live?
    const { data: live } = await supabase.from("live_streams").select("*").eq("host_id", sotId).eq("is_live", true).single();
    setIsLive(!!live);
  }

  async function toggleFollow() {
    if (!myId) return alert("Login koro age");
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", myId).eq("following_id", sotId);
      setIsFollowing(false);
      setFollowersCount(c => c - 1);
    } else {
      await supabase.from("follows").insert({ follower_id: myId, following_id: sotId });
      setIsFollowing(true);
      setFollowersCount(c => c + 1);
    }
  }

  function goMessage() {
    navigate(`/chat/${sotId}`);
  }

  if (!profile) return <div style={{ padding: 20, color: "#fff", background: "#000", height: "100vh" }}>Loading profile...</div>;

  const isMyProfile = myId === sotId;

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 16 }}>
      {/* TOP - Profile Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img src={profile.avatar_url || "https://via.placeholder.com/100"} style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover" }} />
        <div>
          <h2 style={{ margin: 0 }}>{profile.full_name || profile.username}</h2>
          <p style={{ margin: 0, opacity: 0.7 }}>@{profile.username}</p>
          <p style={{ margin: "6px 0" }}>{profile.bio || ""}</p>
          <p style={{ margin: 0, fontWeight: "bold" }}>{followersCount} Followers • {videos.length} Videos</p>
          {isLive && <div style={{ background: "red", display: "inline-block", padding: "4px 10px", borderRadius: 6, marginTop: 6, fontWeight: "bold" }}>● LIVE NOW</div>}
        </div>
      </div>

      {/* BUTTONS - Follow / Message / Live */}
      {!isMyProfile ? (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={toggleFollow} style={{ flex: 1, padding: 12, borderRadius: 10, background: isFollowing ? "#333" : "#ff3b5c", color: "#fff", border: "none", fontWeight: "bold", fontSize: 16 }}>
            {isFollowing ? "Following ✓" : "Follow"}
          </button>
          <button onClick={goMessage} style={{ flex: 1, padding: 12, borderRadius: 10, background: "#222", color: "#fff", border: "1px solid #444", fontWeight: "bold", fontSize: 16 }}>
            Message
          </button>
        </div>
      ) : (
        <button onClick={() => navigate("/profile/edit")} style={{ width: "100%", padding: 12, marginTop: 16, borderRadius: 10, background: "#222", color: "#fff", border: "1px solid #444" }}>Edit Profile</button>
      )}

      {isLive && !isMyProfile && (
        <button onClick={() => navigate(`/live/${sotId}`)} style={{ width: "100%", padding: 14, marginTop: 10, borderRadius: 10, background: "red", color: "#fff", border: "none", fontWeight: "bold", fontSize: 16 }}>
          ▶ Join LIVE
        </button>
      )}

      {/* VIDEOS GRID */}
      <h3 style={{ marginTop: 24 }}>Videos</h3>
      {videos.length === 0 ? (
        <p style={{ opacity: 0.6, textAlign: "center", marginTop: 20 }}>No videos yet</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {videos.map((v: any) => (
            <video key={v.id} src={v.video_url} onClick={() => navigate(`/video/${v.id}`)} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
          ))}
        </div>
      )}
    </div>
  );
}