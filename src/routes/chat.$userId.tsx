import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/chat/$userId")({
  head: () => ({
    meta: [
      { title: "মেসেজ — SOT TOK" },
      { name: "description", content: "SOT TOK ইউজারের সাথে ব্যক্তিগত চ্যাট।" },
      { property: "og:title", content: "মেসেজ — SOT TOK" },
      { property: "og:description", content: "SOT TOK ইউজারের সাথে ব্যক্তিগত চ্যাট।" },
    ],
  }),
  component: ChatThread,
});

type Msg = { id: string; sender_id: string; recipient_id: string; content: string; created_at: string };

function ChatThread() {
  const { userId } = useParams({ from: "/chat/$userId" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: other } = useQuery({
    queryKey: ["chat-other", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, username, sottok_id").eq("id", userId).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => alive && setMsgs(data ?? []));
    void supabase
      .from("messages")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .eq("sender_id", userId)
      .eq("read", false)
      .then(() => qc.invalidateQueries({ queryKey: ["chat-list", user.id] }));

    const channel = supabase
      .channel(`chat-${user.id}-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        (p) => {
          const m = p.new as Msg;
          if (m.sender_id !== userId) return;
          setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          void supabase.from("messages").update({ read: true }).eq("id", m.id);
        },
      )
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [user, userId, qc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const content = text.trim();
    if (!user || !content || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, recipient_id: userId, content })
      .select("id, sender_id, recipient_id, content, created_at")
      .single();
    setSending(false);
    if (error || !data) {
      toast.error("মেসেজ পাঠানো যায়নি");
      return;
    }
    setText("");
    setMsgs((prev) => [...prev, data]);
  };

  if (!loading && !user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col items-center justify-center gap-3 bg-black text-white">
        <p className="text-[14px] text-white/50">চ্যাট করতে লগইন করুন।</p>
        <Link to="/login" className="rounded-xl bg-brand px-5 py-2 text-[13px] font-semibold">লগইন</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen max-w-[420px] flex-col bg-black text-white">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <button onClick={() => navigate({ to: "/chat" })} aria-label="পিছনে">
          <ArrowLeft className="h-6 w-6" />
        </button>
        {other?.sottok_id ? (
          <Link to="/id/$sotId" params={{ sotId: other.sottok_id }} className="text-[16px] font-semibold">
            @{other.username || "sottok"}
          </Link>
        ) : (
          <span className="text-[16px] font-semibold">@{other?.username || "sottok"}</span>
        )}
      </header>

      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {msgs.length === 0 && <p className="pt-16 text-center text-[13px] text-white/40">হ্যালো বলে চ্যাট শুরু করুন 👋</p>}
        {msgs.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <span className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[14px] ${mine ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-white/10 text-white"}`}>
                {m.content}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex items-center gap-2 border-t border-white/10 px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="মেসেজ লিখুন…"
          className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-[14px] outline-none placeholder:text-white/40"
        />
        <button type="submit" disabled={!text.trim() || sending} aria-label="পাঠান" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand disabled:opacity-40">
          <Send className="h-5 w-5 text-white" />
        </button>
      </form>
    </div>
  );
}
