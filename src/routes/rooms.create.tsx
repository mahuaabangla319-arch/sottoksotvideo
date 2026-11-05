import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImagePlus, MessagesSquare, Mic } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PhoneShell } from "@/components/PhoneShell";
import type { RoomKind } from "@/lib/rooms";

export const Route = createFileRoute("/rooms/create")({
  validateSearch: (s: Record<string, unknown>): { kind?: RoomKind } => ({ kind: s.kind === "audio" ? "audio" : "group" }),
  head: () => ({
    meta: [
      { title: "নতুন রুম তৈরি — SOT TOK" },
      { name: "description", content: "SOT TOK-এ নিজের গ্রুপ চ্যাট বা অডিও রুম তৈরি করুন।" },
      { property: "og:title", content: "নতুন রুম তৈরি — SOT TOK" },
      { property: "og:description", content: "গ্রুপ চ্যাট বা অডিও রুম তৈরি করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreateRoom,
});

function CreateRoom() {
  const search = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState<RoomKind>(search.kind ?? "group");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && !user) {
    return (
      <PhoneShell className="flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <p>রুম তৈরি করতে লগইন করুন</p>
        <Link to="/login" className="rounded-full bg-brand px-6 py-2 font-semibold text-white">লগইন</Link>
      </PhoneShell>
    );
  }

  const create = async () => {
    if (!user) return;
    if (!title.trim()) return toast.error("রুমের নাম দিন");
    setBusy(true);
    let cover: string | null = null;
    if (file) {
      const path = `${user.id}/room-${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
      if (!error) cover = path;
    }
    const { data, error } = await supabase
      .from("rooms")
      .insert({ kind, title: title.trim().slice(0, 60), description: desc.trim().slice(0, 300), cover_url: cover, owner_id: user.id })
      .select("id")
      .single();
    setBusy(false);
    if (error || !data) return toast.error("রুম তৈরি হয়নি, আবার চেষ্টা করুন");
    toast.success("রুম তৈরি হয়েছে!");
    navigate({ to: "/rooms/$roomId", params: { roomId: data.id } });
  };

  return (
    <PhoneShell className="bg-background text-foreground" withNavPadding={false}>
      <header className="flex items-center gap-3 px-4 pt-5">
        <Link to="/rooms" search={{ kind }} aria-label="ফিরে যান"><ArrowLeft className="h-6 w-6" /></Link>
        <h1 className="text-[18px] font-bold">নতুন রুম তৈরি</h1>
      </header>
      <div className="space-y-4 px-4 pt-5">
        <div className="grid grid-cols-2 gap-2">
          {(["group", "audio"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`flex flex-col items-center gap-1 rounded-2xl border py-4 ${kind === k ? "border-brand bg-brand/20" : "border-white/10 bg-white/5"}`}
            >
              {k === "group" ? <MessagesSquare className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span className="text-[13px] font-semibold">{k === "group" ? "গ্রুপ চ্যাট" : "অডিও রুম (৮ সিট)"}</span>
            </button>
          ))}
        </div>
        <label className="flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5">
          {file ? (
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-white/50"><ImagePlus className="h-7 w-7" />কভার ছবি</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="রুমের নাম"
          className="w-full rounded-xl bg-white/5 px-4 py-3 outline-none" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} rows={3} placeholder="রুমের বিবরণ"
          className="w-full rounded-xl bg-white/5 px-4 py-3 outline-none" />
        <button disabled={busy} onClick={create} className="w-full rounded-full bg-brand py-3 font-bold text-white disabled:opacity-50">
          {busy ? "তৈরি হচ্ছে…" : "রুম তৈরি করুন"}
        </button>
      </div>
    </PhoneShell>
  );
}
