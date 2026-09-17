import { useState } from "react";
import { EyeOff, Flag, LogOut, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  hidden: boolean;
  onChanged: () => void;
  onSignOut: () => void;
};

/** One place for account settings: প্রোফাইল হাইড, রিপোর্ট, অ্যাকাউন্ট ডিলিট, লগ আউট। */
export function AccountSettingsSheet({ open, onClose, userId, hidden, onChanged, onSignOut }: Props) {
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!open) return null;

  const toggleHidden = async () => {
    if (!userId) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ is_hidden: !hidden }).eq("id", userId);
    setBusy(false);
    if (error) {
      toast.error("সেটিং সেভ করা যায়নি।");
      return;
    }
    toast.success(hidden ? "প্রোফাইল আবার সবাই দেখতে পাবে" : "প্রোফাইল হাইড করা হয়েছে");
    onChanged();
  };

  const deleteAccount = async () => {
    if (!userId) return;
    setBusy(true);
    await supabase.from("videos").update({ is_deleted: true }).eq("user_id", userId);
    const { error } = await supabase
      .from("profiles")
      .update({ is_hidden: true, bio: "", avatar_url: null })
      .eq("id", userId);
    setBusy(false);
    if (error) {
      toast.error("অ্যাকাউন্ট ডিলিট করা যায়নি।");
      return;
    }
    toast.success("অ্যাকাউন্ট ডিলিট হয়েছে");
    onSignOut();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-t-[24px] border border-white/10 bg-neutral-950 p-4 text-white"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">সেটিং</h2>
          <button onClick={onClose} aria-label="বন্ধ করুন">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="space-y-2 pb-3">
          <button
            onClick={() => void toggleHidden()}
            disabled={busy}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              <EyeOff className="h-4 w-4 text-gold" /> প্রোফাইল হাইড
            </span>
            <span
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${hidden ? "bg-brand" : "bg-white/20"}`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition-transform ${hidden ? "translate-x-5" : ""}`}
              />
            </span>
          </button>
          <p className="px-1 text-[11px] text-white/45">
            হাইড করলে আপনার প্রোফাইল সার্চ ও রেকমেন্ডেশনে দেখাবে না।
          </p>

          <div className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/70">
            <Flag className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>
              ভিডিও ডাউনলোড, প্রাইভেট, ডিলিট বা রিপোর্ট করতে নিচের ভিডিও গ্রিডে যেকোনো ভিডিওতে ট্যাপ করুন।
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px]"
          >
            <LogOut className="h-4 w-4" /> লগ আউট
          </button>

          {confirmDelete ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
              <p className="text-[13px] text-red-300">
                অ্যাকাউন্ট ডিলিট করলে আপনার সব ভিডিও মুছে যাবে ও প্রোফাইল লুকিয়ে যাবে। নিশ্চিত?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-lg border border-white/15 py-2 text-[13px]"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => void deleteAccount()}
                  disabled={busy}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-[13px] font-semibold disabled:opacity-60"
                >
                  হ্যাঁ, ডিলিট
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[14px] text-red-400"
            >
              <Trash2 className="h-4 w-4" /> অ্যাকাউন্ট ডিলিট
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
