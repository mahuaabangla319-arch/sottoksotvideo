import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: DiwaliPage,
});

function DiwaliPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#1a1033", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "360px", background: "#2d1b69", border: "2px solid #FFD700", borderRadius: "24px", padding: "24px", textAlign: "center" }}>
        <h1 style={{ color: "#FFD700", fontSize: "38px", fontWeight: "900", margin: "0" }}>SOT TOK</h1>
        <p style={{ color: "#ffeaa7", fontSize: "14px", marginTop: "5px" }}>Happy Diwali Special Offer 2026</p>
        <h2 style={{ color: "white", fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
          দীপাবলি স্পেশাল কনটেস্ট<br/>নিজের ক্যামেরায় ভিডিও বানাও
        </h2>
        <div style={{ marginTop: "20px", background: "#FFD700", color: "black", padding: "12px", borderRadius: "30px", fontWeight: "bold" }}>
          SOT TOK OFFICIAL
        </div>
        <div style={{ marginTop: "20px" }}>
          <a href="/create" style={{ background: "#ff6a00", color: "white", padding: "12px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", display: "block" }}>📹 ভিডিও বানাও</a>
          <a href="/home" style={{ background: "white", color: "black", padding: "12px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", display: "block", marginTop: "10px" }}>Trending দেখো</a>
        </div>
      </div>
    </div>
  );
}