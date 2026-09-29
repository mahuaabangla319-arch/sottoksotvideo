import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [tab, setTab] = useState("chat");
  const img = "/splash.png";

  return (
    <div style={{ background: "white", minHeight: "100vh", padding: "15px" }}>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <img src={img} style={{ width: "100px", height: "100px", borderRadius: "50%", border: "3px solid #ff0040" }} />
        <h2 style={{ margin: "10px 0 5px" }}>SOT TOK User</h2>
        <p style={{ color: "#777" }}>@sottok_official</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" }}>
          <span><b>1.2M</b> Followers</span>
          <span><b>120</b> Following</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
        <button onClick={() => setTab("chat")} style={btn}>💬 Chatting</button>
        <button onClick={() => setTab("call")} style={btn}>📞 Voice Call</button>
        <button onClick={() => setTab("video")} style={btn}>📹 Video Call</button>
        <button onClick={() => setTab("gift")} style={btn}>🎁 Send Gift</button>
      </div>

      <div style={{ marginTop: "20px", border: "1px solid #eee", borderRadius: "12px", padding: "15px", minHeight: "200px" }}>
        {tab === "chat" && (
          <div>
            <h3>Live Chat</h3>
            <div style={{ background: "#f5f5f5", padding: "10px", borderRadius: "8px", height: "120px", overflowY: "auto" }}>
              <p><b>Chacha:</b> Hi 😍</p>
              <p><b>You:</b> Hello!</p>
            </div>
            <div style={{ display: "flex", marginTop: "10px" }}>
              <input placeholder="Type message..." style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "1px solid #ccc" }} />
              <button style={{ marginLeft: "8px", background: "#ff0040", color: "white", border: "none", borderRadius: "20px", padding: "8px 15px" }}>Send</button>
            </div>
          </div>
        )}
        {tab === "call" && <h3>🎤 Voice Call - Chacha is online</h3>}
        {tab === "video" && <h3>📹 Video Call - Chacha is online</h3>}
        {tab === "gift" && <h3>🎁 Gifts: ❤️ 🌹 💎 🔥</h3>}
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <a href="/" style={{ color: "#ff0040", fontWeight: "700", textDecoration: "none" }}>← Back to Home</a>
      </div>
    </div>
  );
}

const btn = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  background: "white",
  fontWeight: "700",
} as const;