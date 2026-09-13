import { useRef, useState } from "react";
import { Camera, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FireRingAvatar } from "@/components/FireRingAvatar";
import type { Profile } from "@/lib/profile";

const chips = ["ড্যান্স", "ফান", "কমেডি", "রান্না", "লাইফস্টাইল", "বাংলাদেশ"];

export function EditProfileSheet({
  open,
  onOpenChange,
  profile,
  avatarUrl,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: Profile;
  avatarUrl: string | null;
  onSaved: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(profile.username ?? "");
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const addChip = (c: string) => {
    if (bio.includes(c)) return;
    const next = bio ? `${bio} • ${c}` : c;
    if (next.length > 80) {
      toast.error("বায়ো সর্বোচ্চ ৮০ অক্ষর।");
      return;
    }
    setBio(next);
  };

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const handle = username.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
    if (handle.length < 3) {
      toast.error("ইউজারনেম অন্তত ৩ অক্ষরের হতে হবে।");
      return;
    }
    setSaving(true);

    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", handle)
      .neq("id", profile.id)
      .maybeSingle();
    if (taken) {
      setSaving(false);
      toast.error("এই ইউজারনেম আগে থেকেই নেওয়া হয়েছে।");
      return;
    }

    let avatarPath = profile.avatar_url;
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) {
        setSaving(false);
        toast.error("ছবি আপলোড করা যায়নি।");
        return;
      }
      avatarPath = path;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: handle,
        full_name: fullName.trim(),
        bio: bio.trim(),
        gender: gender || null,
        birth_date: birthDate || null,
        avatar_url: avatarPath,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      toast.error("সেভ করা যায়নি। আবার চেষ্টা করুন।");
      return;
    }
    toast.success("প্রোফাইল আপডেট হয়েছে");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-t-[24px] border-white/10 bg-neutral-950 text-white"
      >
        <SheetHeader>
          <SheetTitle className="text-white">প্রোফাইল এডিট করুন</SheetTitle>
        </SheetHeader>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-[13px] font-semibold text-gold">SOT ID: {profile.sottok_id}</p>
            <p className="text-[11px] text-white/50">
              এটি আপনার স্থায়ী SOT TOK আইডি, কখনো পরিবর্তন হবে না
            </p>
          </div>
          <button
            type="button"
            aria-label="আইডি কপি করুন"
            onClick={() => {
              void navigator.clipboard.writeText(profile.sottok_id);
              toast.success("ID কপি হয়েছে");
            }}
            className="rounded-lg border border-white/15 p-2"
          >
            <Copy className="h-4 w-4 text-white/70" />
          </button>
        </div>

        <form onSubmit={save} className="mt-4 space-y-3 pb-8">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative"
              aria-label="প্রোফাইল ছবি বদলান"
            >
              <FireRingAvatar src={preview} size={96} />
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand">
                <Camera className="h-4 w-4 text-white" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </div>

          <label className="block text-[12px] text-white/60">ইউজারনেম (@)</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="sottok_star"
          />

          <label className="block text-[12px] text-white/60">নাম</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="আপনার নাম"
          />

          <label className="block text-[12px] text-white/60">বায়ো</label>
          <textarea
            value={bio}
            maxLength={80}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="নিজের সম্পর্কে লিখুন"
          />
          <p className="text-right text-[11px] text-white/40">{bio.length}/80</p>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => addChip(c)}
                className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-white/80"
              >
                {c}
              </button>
            ))}
          </div>

          <label className="block text-[12px] text-white/60">লিঙ্গ</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand"
          >
            <option value="">নির্বাচন করুন</option>
            <option value="male">পুরুষ</option>
            <option value="female">নারী</option>
            <option value="other">অন্যান্য</option>
          </select>

          <label className="block text-[12px] text-white/60">জন্মতারিখ</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand"
          />

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
