import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [position, setPosition] = useState("top");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    if (data) setBanners(data);
  };
  useEffect(() => { fetchBanners(); }, []);

  const handleUpload = async () => {
    if (!image) return toast.error("ছবি সিলেক্ট করো দাদা");
    setLoading(true);
    const fileName = `${Date.now()}-${image.name}`;
    const { error: upErr } = await supabase.storage.from("banners").upload(fileName, image);
    if (upErr) { toast.error(upErr.message); setLoading(false); return; }
    const { data } = supabase.storage.from("banners").getPublicUrl(fileName);
    const { error } = await supabase.from("banners").insert({
      title, link_url: link, position, image_url: data.publicUrl, is_active: true
    });
    if (error) toast.error(error.message);
    else { toast.success("ব্যানার Live হয়ে গেছে!"); setTitle(""); setLink(""); setImage(null); fetchBanners(); }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">SOT TOK - Super Admin</h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-bold text-lg">নতুন ব্যানার যোগ করো (0 Coin লাগবে)</h2>
        <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
        <input placeholder="ব্যানারের নাম - যেমন Kotalpur Offer" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        <input placeholder="WhatsApp Link - ক্লিক করলে কোথায় যাবে" value={link} onChange={(e) => setLink(e.target.value)} className="w-full border p-2 rounded" />
        <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border p-2 rounded">
          <option value="top">Top - সবার উপরে</option>
          <option value="middle">Middle - 3 ভিডিও পর পর</option>
          <option value="bottom">Bottom - নিচে</option>
        </select>
        <button onClick={handleUpload} disabled={loading} className="w-full bg-black text-white p-3 rounded font-bold">
          {loading? "আপলোড হচ্ছে..." : "ব্যানার সবাইকে দেখাও"}
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-3">Live ব্যানার গুলো</h3>
        <div className="space-y-2">
          {banners.map((b) => (
            <div key={b.id} className="flex justify-between items-center border p-2 rounded">
              <img src={b.image_url} className="w-20 h-12 object-cover rounded" />
              <div><p className="font-bold text-sm">{b.title}</p><p className="text-xs">{b.position}</p></div>
              <button onClick={async () => { await supabase.from("banners").delete().eq("id", b.id); fetchBanners(); toast.success("Delete হয়েছে"); }} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Delete</button>
            </div>
          ))}
          {banners.length===0 && <p className="text-sm text-gray-500">এখনো কোনো ব্যানার নেই</p>}
        </div>
      </div>
    </div>
  );
}