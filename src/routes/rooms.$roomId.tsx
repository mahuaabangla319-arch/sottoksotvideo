import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PhoneShell } from "@/components/PhoneShell";
import type { Room, RoomMessage } from "@/lib/rooms";

export const Route = createFileRoute("/rooms/$roomId")({
  head: () => ({
    meta: [
      { title: "রুম — SOT TOK" },
      { name: "description", content: "SOT TOK রুমে চ্যাট করুন।" },
    ],
  }),
  component: RoomPage,
});

function RoomPage() {
  const { roomId } = Route.useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: r } = await supabase.from("rooms").select("*").eq("id", roomId).maybeSingle();
      if (active) setRoom(r);
      const { data: m } = await supabase
        .from("room_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (active) setMessages(m ?? []);
    })();
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_messages", filter: `room_id=eq.${roomId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as RoomMessage]),
      )
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  const send = async () => {
    const content = text.trim();
    if (!content || !user) return;
    setText("");
    const { error } = await supabase.from("room_messages").insert({ room_id: roomId, user_id: user.id, content });
    if (error) toast.error("মেসেজ পাঠানো যায়নি");
  };

  return (
    <PhoneShell className="bg-background text-foreground" withNavPadding={false}>
      <header className="flex items-center gap-3 px-4 pt-5">
        <Link to="/rooms" aria-label="ফিরে যান"><ArrowLeft className="h-6 w-6" /></Link>
        <h1 className="text-[18px] font-bold">{room?.title ?? "রুম"}</h1>
      </header>
      <div className="space-y-2 px-4 pb-24 pt-4">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-[14px] ${m.user_id === user?.id ? "ml-auto bg-brand text-white" : "bg-white/10"}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-[480px] items-center gap-2 bg-background px-4 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="মেসেজ লিখুন"
          className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-[14px] outline-none"
        />
        <button onClick={send} aria-label="পাঠান" className="rounded-full bg-brand p-2.5 text-white">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </PhoneShell>
  );
}
