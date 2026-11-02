import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: DiwaliPage,
});

function DiwaliPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#1a1033", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "360px", background: "linear-gradient(135deg, #2d1b69, #1a1033)", border: "2px solid #FFD700", borderRadius: "24px", padding: "24px", textAlign: "center" }}>
        <h1 style={{ color: "#FFD700", fontSize: "38px", fontWeight: "900", margin: "0" }}>SOT TOK</h1>
        <p style={{ color: "#ffeaa7", fontSize: "14px", marginTop: "5px" }}>Happy Diwali Special Offer 2026</p>
        
        <h2 style={{ color: "white", fontSize: "20px", fontWeight: "bold", marginTop: "20px", lineHeight: "1.4" }}>
          দীপাবলি স্পেশাল কনটেস্ট<br/>নিজের ক্যামেরায় ভিডিও বানাও<br/>
          <span style={{ color: "#FFD700" }}>- জিতে নাও বিশেষ পুরস্কার</span>
        </h2>

        <div style={{ fontSize: "24px", marginTop: "15px" }}>🪔 ✨ 🪔 ✨ 🪔</div>

        <div style={{ marginTop: "20px", background: "#FFD700", color: "black", padding: "12px", borderRadius: "30px", fontWeight: "bold" }}>
          SOT TOK OFFICIAL
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <a href="/create" style={{ background: "#ff6a00", color: "white", padding: "12px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", display: "block" }}>
            📹 ভিডিও বানাও
          </a>
          <a href="/home" style={{ background: "white", color: "black", padding: "12px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", display: "block" }}>
            Trending দেখো
          </a>
        </div>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginTop: "15px" }}>
          #HappyDiwali2026 #DiwaliOffer #SOTTOKDIWALI
        </p>
      </div>
    </div>
  );
}