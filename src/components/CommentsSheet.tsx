import { useEffect, useRef, useState } from "react";
import { X, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { addComment, deleteComment, fetchComments, timeAgo, type CommentRow } from "@/lib/engagement";

export function CommentsSheet({
  videoId,
  open,
  onClose,
  onCountChange,
}: {
  videoId: string;
  open: boolean;
  onClose: () => void;
  onCountChange: (delta: number) => void;
}) {
  const { user } = useAuth();
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || videoId.startsWith("demo-")) {
      if (open) setRows([]);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchComments(videoId)
      .then((r) => alive && setRows(r))
      .catch(() => alive && setRows([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, videoId]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    if (!user) {
      toast.error("কমেন্ট করতে লগইন করুন");
      return;
    }
    if (videoId.startsWith("demo-")) {
      toast.error("ডেমো ভিডিওতে কমেন্ট করা যাবে না");
      return;
    }
    setSending(true);
    try {
      await addComment(videoId, user.id, content);
      setText("");
      // Optimistic append — no extra round-trip to refetch the whole list.
      setRows((r) => [
        {
          id: `tmp-${Date.now()}`,
          content,
          created_at: new Date().toISOString(),
          user_id: user.id,
          username:
            (user.user_metadata?.user_name as string | undefined) ||
            (user.email ? user.email.split("@")[0] : "") ||
            "sottok",
        },
        ...r,
      ]);
      onCountChange(1);
    } catch {
      toast.error("কমেন্ট পাঠানো যায়নি");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function remove(id: string) {
    try {
      await deleteComment(id);
      setRows((r) => r.filter((c) => c.id !== id));
      onCountChange(-1);
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex max-h-[70vh] w-full max-w-[420px] flex-col rounded-t-[24px] border border-white/10 bg-neutral-950 text-white"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[15px] font-semibold">কমেন্ট ({rows.length})</span>
          <button onClick={onClose} aria-label="বন্ধ করুন">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-2">
          {loading ? (
            <p className="py-8 text-center text-[13px] text-white/50">লোড হচ্ছে…</p>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-white/50">এখনো কোনো কমেন্ট নেই</p>
          ) : (
            rows.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-flame" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-white/60">
                    @{c.username} · {timeAgo(c.created_at)}
                  </p>
                  <p className="break-words text-[14px]">{c.content}</p>
                </div>
                {user?.id === c.user_id && (
                  <button onClick={() => remove(c.id)} aria-label="মুছুন">
                    <Trash2 className="h-4 w-4 text-white/40" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-3">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="কমেন্ট লিখুন…"
            maxLength={300}
            className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand disabled:opacity-40"
            aria-label="পাঠান"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
