import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const [gmails, setGmails] = useState<any[]>([]);
  const [showGmails, setShowGmails] = useState(false);
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("shorttok_users") || "[]");
    setGmails(users);
  }, []);

  function openAccount(email: string) {
    localStorage.setItem("shorttok_current", email);
    navigate("/feed");
  }

  function addGmail() {
    const email = prompt("তোমার Gmail লিখো (যেমন: name@gmail.com)");
    if (!email) return;
    const name = prompt("তোমার নাম লিখো") || email.split("@")[0];
    const users = JSON.parse(localStorage.getItem("shorttok_users") || "[]");
    if (!users.find((u: any) => u.email === email)) {
      users.push({ email, name, mobile: "" });
      localStorage.setItem("shorttok_users", JSON.stringify(users));
    }
    openAccount(email);
  }

  function loginWithMobile() {
    const users = JSON.parse(localStorage.getItem("shorttok_users") || "[]");
    const found = users.find((u: any) => u.mobile === mobile);
    if (!found) { alert("এই নম্বর লিঙ্ক করা নেই। আগে Gmail দিয়ে লগইন করে নম্বর লিঙ্ক করো।"); return; }
    openAccount(found.email);
  }

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20, textAlign: "center" }}>
      <h1 style={{ fontSize: 42 }}>Short<span style={{ color: "#fe2c55" }}>Tok</span></h1>
      <p style={{ color: "#aaa" }}>ভিডিও দেখো, ভিডিও বানাও</p>
      <div style={{ marginTop: 60 }}>
        <button onClick={() => { if (gmails.length === 0) addGmail(); else setShowGmails(true); }} style={{ width: "100%", padding: 15, borderRadius: 30, fontWeight: 700, fontSize: 17 }}>🔵 Google দিয়ে লগইন করো</button>
        {showGmails && (
          <div style={{ marginTop: 20, textAlign: "left" }}>
            <b>একটি অ্যাকাউন্ট বেছে নাও</b>
            {gmails.map((u: any) => (
              <div key={u.email} onClick={() => openAccount(u.email)} style={{ background: "#1a1a1a", padding: 15, borderRadius: 15, marginTop: 10 }}>
                <b>{u.name}</b><br /><span style={{ color: "#aaa", fontSize: 13 }}>{u.email}</span><br /><span style={{ color: "#aaa", fontSize: 13 }}>{u.mobile ? "📱 " + u.mobile + " Linked ✓" : "📱 নম্বর লিঙ্ক নেই"}</span>
              </div>
            ))}
            <div onClick={addGmail} style={{ background: "#1a1a1a", padding: 15, borderRadius: 15, marginTop: 10 }}>➕ অন্য অ্যাকাউন্ট ব্যবহার করো</div>
          </div>
        )}
        <div style={{ marginTop: 20, background: "#111", padding: 15, borderRadius: 15 }}>
          <h3>📱 মোবাইল নম্বর দিয়ে লগইন</h3>
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="১০ সংখ্যার মোবাইল নম্বর" style={{ width: "92%", padding: 14, borderRadius: 12, border: "none" }} />
          <button onClick={loginWithMobile} style={{ width: "100%", padding: 15, borderRadius: 30, background: "#fe2c55", color: "#fff", fontWeight: 700, marginTop: 10 }}>লগইন করো</button>
        </div>
      </div>
    </div>
  );
}