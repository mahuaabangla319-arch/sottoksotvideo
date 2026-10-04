import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Admin() {
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
    if (!image) return alert("ছবি সিলেক্ট করো দাদা");
    setLoading(true);
    const fileName = `${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage.from("banners").upload(fileName, image);
    if (uploadError) { alert(uploadError.message); setLoading(false); return; }
    const { data: urlData } = supabase.storage.from("banners").getPublicUrl(fileName);

    const { error } = await supabase.from("banners").insert({
      title, link_url: link, position, image_url: urlData.publicUrl, is_active: true
    });
    if (error) alert(error.message);
    else { alert("ব্যানার সবার App এ চলে গেছে!"); setTitle(""); setLink(""); setImage(null); fetchBanners(); }
    setLoading(false);
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    fetchBanners();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">SottoK Sotto - Admin Panel</h1>

      <Card>
        <CardHeader><CardTitle>নতুন ব্যানার যোগ করো</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          <Input placeholder="ব্যানারের নাম - যেমন Kotalpur Offer" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="ক্লিক করলে কোথায় যাবে - WhatsApp Link" value={link} onChange={(e) => setLink(e.target.value)} />
          <select className="w-full border p-2 rounded" value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="top">Top - সবার উপরে</option>
            <option value="middle">Middle - 3 ভিডিও পর পর</option>
            <option value="bottom">Bottom - নিচে</option>
          </select>
          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading? "আপলোড হচ্ছে..." : "ব্যানার সবাইকে দেখাও"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>সব ব্যানার</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center justify-between border p-2 rounded">
              <img src={b.image_url} className="w-20 h-12 object-cover rounded" />
              <div><p className="font-bold">{b.title}</p><p className="text-xs">{b.position}</p></div>
              <Button variant="destructive" size="sm" onClick={() => deleteBanner(b.id)}>Delete</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}