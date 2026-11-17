import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [gmails, setGmails] = useState<any[]>([]);
  const [showGmails, setShowGmails] = useState(false);

  // নতুন ফর্ম - অর্ডার: নাম -> মোবাইল -> Gmail -> PIN -> Confirm PIN
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gmail, setGmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("shorttok_users") || "[]");
    setGmails(users);
  }, []);

  function openAccount(email: string) {
    localStorage.setItem("shorttok_current", email);
    navigate("/feed");
  }

  // পুরনো addGmail - যেমন ছিলো তেমনই রাখলাম
  function addGmail() {
    const email = prompt("তোমার Gmail লিখো (যেমন: name@gmail.com)");
    if (!email) return;
    const name = prompt("তোমার নাম লিখো") || email.split("@")[0];
    const users = JSON.parse(localStorage.getItem("shorttok_users") || "[]");
    if (!users.find((u: any) => u.email === email)) {
      users.push({ email, name, mobile: "", pin: "" });
      localStorage.setItem("shorttok_users", JSON.stringify(users));
      setGmails(users);
    }
    openAccount(email);
  }

  // --- নতুন: লিংক / সাইনআপ ---
  function handleSignup() {
    if (!name.trim()) return alert("আগে মোবাইলের নাম দাও");
    if (mobile.trim().length !== 10) return alert("সঠিক ১০ সংখ্যার মোবাইল নম্বর দাও");
    if (!gmail.includes("@gmail.com")) return alert("সঠিক Gmail দাও - পুরনো Gmail টা দাও");
    if (pin.length < 4) return alert("PIN কমপক্ষে ৪ সংখ্যার হতে হবে");
    if (pin !== confirmPin) return alert("PIN আর Confirm PIN মিলছে না, আবার দাও");

    const users = JSON.parse(localStorage.getItem("shorttok_users") || "[]");

    // ১. এই মোবাইল দিয়ে আগেই লিংক আছে কিনা?
    const byMobile = users.find((u: any) => u.mobile === "+91" + mobile);
    if (byMobile) { alert("এই মোবাইল আগেই লিংক আছে, লগইন করো"); setTab("login"); return; }

    // ২. পুরনো Gmail দিয়ে অ্যাকাউন্ট আছে কিনা? - এটাই আসল লিংক
    const oldIndex = users.findIndex((u: any) => u.email === gmail.trim());
    if (oldIndex !== -1) {
      // ✅ পুরনো অ্যাকাউন্ট পাওয়া গেছে - নতুন বানাবো না, পুরনোতেই মোবাইল + PIN জুড়ে দিলাম
      // তাই পুরনো ভিডিও, লাইক, ফলোয়ার সব একই থাকবে কারণ email / id একই থাকলো
      users[oldIndex] = { ...users[oldIndex], name: name.trim(), mobile: "+91" + mobile, pin: pin };
      localStorage.setItem("shorttok_users", JSON.stringify(users));
      setGmails(users);
      alert("হয়ে গেছে ✅ পুরনো Gmail এর সব ভিডিও মোবাইলের সাথে লিংক হয়ে গেছে");
      setTab("login");
      return;
    }

    // ৩. একদম নতুন মানুষ - নতুন অ্যাকাউন্ট
    users.push({ email: gmail.trim(), name: name.trim(), mobile: "+91" + mobile, pin: pin });
    localStorage.setItem("shorttok_users", JSON.stringify(users));
    setGmails(users);
    alert("নতুন অ্যাকাউন্ট হয়ে গেছে ✅ এবার মোবাইল + PIN দিয়ে লগইন করতে পারবে");
    setTab("login");
  }

  // --- লগইন: মোবাইল + PIN ---
  function handleLogin() {
    if (mobile.trim().length !== 10) return alert("মোবাইল নম্বর দাও");
    if (!pin) return alert("PIN দাও");
    const users = JSON.parse(localStorage.getItem("shorttok_users") || "[]");
    const found = users.find((u: any) => u.mobile === "+91" + mobile);
    if (!found) return alert("এই মোবাইল লিংক নেই, আগে সাইনআপ করে লিংক করো");
    if (found.pin !== pin) return alert("মোবাইল বা PIN ভুল");
    // মোবাইল + PIN মিললেই পুরনো Gmail এর অ্যাকাউন্ট খুলবে
    openAccount(found.email);
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 16, background: "#fff", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>📱 SOT TOK</h2>
      <p style={{ textAlign: "center", fontSize: 12, color: "#888" }}>পুরনো Gmail + মোবাইল লিংক হবে • ভিডিও ডিলিট হবে না</p>

      <div style={{ display: "flex", background: "#f1f1f1", borderRadius: 999, padding: 4, marginTop: 16 }}>
        <button onClick={() => setTab("signup")} style={{ flex: 1, padding: 10, borderRadius: 999, border: "none", background: tab === "signup" ? "#fe2c55" : "transparent", color: tab === "signup" ? "#fff" : "#000", fontWeight: "bold" }}>লিংক / সাইনআপ</button>
        <button onClick={() => setTab("login")} style={{ flex: 1, padding: 10, borderRadius: 999, border: "none", background: tab === "login" ? "#fe2c55" : "transparent", color: tab === "login" ? "#fff" : "#000", fontWeight: "bold" }}>লগইন</button>
      </div>

      {tab === "signup" && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <label><b>১. 👤 মোবাইলের নাম</b></label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="যেমন: Somnath Roy" style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
          <label><b>২. 📱 মোবাইল নম্বর</b></label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #ddd", borderRadius: 12, padding: "0 12px" }}><b>+91</b><input value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="১০ সংখ্যার নম্বর" inputMode="numeric" style={{ flex: 1, padding: 12, border: "none", outline: "none" }} /></div>
          <label><b>৩. 📧 পুরনো Gmail</b></label>
          <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="পুরনো Gmail টা দাও" style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
          <label><b>৪. 🔑 PIN বানাও</b></label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="৪ সংখ্যার PIN" inputMode="numeric" style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
          <label><b>৫. 🔑 Confirm PIN</b></label>
          <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="আবার একই PIN" inputMode="numeric" style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
          {pin && confirmPin && <p style={{ fontSize: 12, fontWeight: "bold", color: pin === confirmPin ? "green" : "red" }}>{pin === confirmPin ? "✅ PIN মিলে গেছে" : "❌ PIN মিলছে না"}</p>}
          <button onClick={handleSignup} style={{ background: "#fe2c55", color: "#fff", border: "none", padding: 14, borderRadius: 999, fontWeight: "bold" }}>✅ লিংক করো / সাইনআপ করো</button>
        </div>
      )}

      {tab === "login" && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <label><b>📱 মোবাইল নম্বর</b></label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #ddd", borderRadius: 12, padding: "0 12px" }}><b>+91</b><input value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="১০ সংখ্যার নম্বর" inputMode="numeric" style={{ flex: 1, padding: 12, border: "none", outline: "none" }} /></div>
          <label><b>🔑 PIN</b></label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="তোমার PIN" inputMode="numeric" style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
          <button onClick={handleLogin} style={{ background: "#fe2c55", color: "#fff", border: "none", padding: 14, borderRadius: 999, fontWeight: "bold" }}>📱 মোবাইল + PIN দিয়ে লগইন</button>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />
      <button onClick={() => setShowGmails(!showGmails)} style={{ width: "100%", padding: 12, borderRadius: 999, border: "1px solid #ddd", background: "#fff", fontWeight: "bold" }}>📧 পুরনো Gmail দিয়ে খুলো ({gmails.length}টা)</button>
      {showGmails && gmails.map((u: any) => (
        <button key={u.email} onClick={() => openAccount(u.email)} style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#f9f9f9", textAlign: "left" }}>
          <b>{u.name || u.email}</b><br /><span style={{ fontSize: 12, color: "#888" }}>{u.email} {u.mobile ? `• ${u.mobile} লিংক আছে ✅` : ""}</span>
        </button>
      ))}
      <button onClick={addGmail} style={{ width: "100%", marginTop: 10, padding: 12, borderRadius: 999, border: "none", background: "#000", color: "#fff", fontWeight: "bold" }}>+ নতুন Gmail যোগ করো</button>
    </div>
  );
}