import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: KaliSplash,
});

function KaliSplash() {
  return (
    <div 
      onClick={() => window.location.href = "/home"}
      style={{ 
        minHeight: "100vh", 
        background: "#000",
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        cursor: "pointer"
      }}>
      <img 
        src="/kali.jpg" 
        alt="Maa Kali" 
        style={{ width: "100%", maxWidth: "450px", height: "100vh", objectFit: "cover" }} 
      />
      <div style={{ position: "absolute", bottom: "30px", background: "rgba(0,0,0,0.7)", padding: "15px 25px", borderRadius: "30px", border: "1px solid gold", textAlign: "center" }}>
        <p style={{ color: "gold", fontWeight: "bold", margin: "0" }}>SOT TOK - Happy Diwali</p>
        <p style={{ color: "white", fontSize: "12px", margin: "5px 0 0 0" }}>ট্যাপ করে Trending দেখো 🪔</p>
      </div>
    </div>
  );
}