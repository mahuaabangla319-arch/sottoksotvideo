import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Crown, Eye, EyeOff, Film, Loader2, Music2, Pin, Play, Search, Settings2, ShieldAlert, Sparkles, Trash2, Upload, Users, LayoutDashboard, Download, Pause } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { signVideo, signSong, downloadVideo } from "@/lib/social";
import { formatCount } from "@/lib/profile";
import { adminCreateUser, adminDeleteUser, adminSetBlocked } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Panel — SOT TOK" },
      { name: "description", content: "SOT TOK সুপার অ্যাডমিন কন্ট্রোল প্যানেল।" },
      { property: "og:title", content: "Admin Panel — SOT TOK" },
      { property: "og:description", content: "SOT TOK সুপার অ্যাডমিন কন্ট্রোল প্যানেল।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "dash" | "users" | "videos" | "music" | "filters" | "reports" | "settings";
const TABS: { key: Tab; label: string; icon: ReactNode }[] = [
  { key: "dash", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { key: "videos", label: "Videos", icon: <Film className="h-4 w-4" /> },
  { key: "music", label: "Music", icon: <Music2 className="h-4 w-4" /> },
  { key: "filters", label: "Filters", icon: <Sparkles className="h-4 w-4" /> },
  { key: "reports", label: "Reports", icon: <ShieldAlert className="h-4 w-4" /> },
  { key: "settings", label: "App Settings", icon: <Settings2 className="h-4 w-4" /> },
];
const CATEGORIES = ["Trending", "Bengali", "Hindi", "English", "Devotional"];

async function logAction(adminId: string, action: string, target = "") {
  await supabase.from("admin_logs").insert({ admin_id: adminId, action, target });
}

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dash");

  const { data: access, isLoading } = useQuery({
    queryKey: ["admin-access", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: roles }, { data: me }] = await Promise.all([
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("profiles").select("username, sottok_id").eq("id", user!.id).maybeSingle(),
      ]);
      const mine = (roles ?? []).filter((r) => r.user_id === user!.id);
      return { ok: mine.length > 0, superIds: new Set((roles ?? []).filter((r) => r.role === "super_admin").map((r) => r.user_id)), adminIds: new Set((roles ?? []).map((r) => r.user_id)), me };
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!user || (access && !access.ok)) {
      toast.error("Access Denied");
      navigate({ to: "/feed" });
    }
  }, [loading, user, access, navigate]);

  if (loading || isLoading || !access?.ok || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-black text-white"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-black/95 px-4 py-3">
        <button onClick={() => navigate({ to: "/settings" })} aria-label="পিছনে"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <p className="text-[15px] font-bold">SOT TOK Admin</p>
          <p className="text-[11px] text-[#FFD700]">Logged as @{access.me?.username} (Super Admin)</p>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
        <nav className="flex gap-1 overflow-x-auto border-b border-white/10 p-2 md:w-52 md:flex-col md:border-b-0 md:border-r">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${tab === t.key ? "bg-[#fe2c55] text-white" : "text-white/70 hover:bg-white/5"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <main className="min-w-0 flex-1 p-4">
          {tab === "dash" && <Dashboard superIds={access.superIds} />}
          {tab === "users" && <UsersPanel adminId={user.id} superIds={access.superIds} adminIds={access.adminIds} />}
          {tab === "videos" && <VideosPanel adminId={user.id} />}
          {tab === "music" && <MusicPanel adminId={user.id} />}
          {tab === "filters" && <FiltersPanel adminId={user.id} />}
          {tab === "reports" && <ReportsPanel adminId={user.id} />}
          {tab === "settings" && <SettingsPanel adminId={user.id} />}
        </main>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl bg-white/5 p-4"><p className="text-[11px] text-white/50">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}
function GoldBadge() {
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD700] px-2 py-0.5 text-[10px] font-bold text-black"><Crown className="h-3 w-3" />SUPER ADMIN</span>;
}

function Dashboard({ superIds }: { superIds: Set<string> }) {
  const { data } = useQuery({
    queryKey: ["admin-dash"],
    queryFn: async () => {
      const [u, v, s, likes, admins, logs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase.from("songs").select("id", { count: "exact", head: true }),
        supabase.from("video_likes").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id, username, sottok_id, followers_count, likes_count, avatar_url").in("id", [...superIds]),
        supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      return { users: u.count ?? 0, videos: v.count ?? 0, songs: s.count ?? 0, likes: likes.count ?? 0, admins: admins.data ?? [], logs: logs.data ?? [] };
    },
  });
  if (!data) return <Loader2 className="h-5 w-5 animate-spin" />;
  const nameOf = (id: string) => data.admins.find((a) => a.id === id)?.username ?? id.slice(0, 8);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Total Users" value={formatCount(data.users)} />
        <Card label="Total Videos" value={formatCount(data.videos)} />
        <Card label="Total Songs" value={formatCount(data.songs)} />
        <Card label="Total Likes" value={formatCount(data.likes)} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.admins.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl border border-[#FFD700]/60 bg-[#FFD700]/5 p-3">
            <img src={a.avatar_url || "/icon-192x192.png"} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-[#FFD700]" />
            <div className="flex-1"><p className="font-semibold">@{a.username} <GoldBadge /></p><p className="text-[12px] text-white/60">ID {a.sottok_id} • {formatCount(a.followers_count)} followers • {formatCount(a.likes_count)} likes</p></div>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Recent activity</p>
        <div className="divide-y divide-white/5 rounded-xl bg-white/5">
          {data.logs.length ? data.logs.map((l) => (
            <p key={l.id} className="px-3 py-2 text-[12px]"><span className="text-[#FFD700]">@{nameOf(l.admin_id)}</span> {l.action} <span className="text-white/50">{l.target}</span> <span className="float-right text-white/40">{new Date(l.created_at).toLocaleString("bn-IN")}</span></p>
          )) : <p className="p-3 text-[12px] text-white/50">এখনো কোনো অ্যাক্টিভিটি নেই</p>}
        </div>
      </div>
    </div>
  );
}

const input = "w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-[#fe2c55]";

function UsersPanel({ adminId, superIds, adminIds }: { adminId: string; superIds: Set<string>; adminIds: Set<string> }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [viewVideos, setViewVideos] = useState<string | null>(null);
  const setBlocked = useServerFn(adminSetBlocked);
  const delUser = useServerFn(adminDeleteUser);
  const createUser = useServerFn(adminCreateUser);
  const { data: users, refetch } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
      const t = q.trim().replace(/^@/, "");
      if (t) query = query.or(`sottok_id.ilike.%${t}%,username.ilike.%${t}%`);
      return (await query).data ?? [];
    },
  });
  const { data: total } = useQuery({ queryKey: ["admin-users-total"], queryFn: async () => (await supabase.from("profiles").select("id", { count: "exact", head: true })).count ?? 0 });
  const { data: roleSet, refetch: refetchRoles } = useQuery({
    queryKey: ["admin-roleset"], initialData: adminIds,
    queryFn: async () => new Set(((await supabase.from("user_roles").select("user_id")).data ?? []).map((r) => r.user_id)),
  });

  const patch = async (id: string, values: Record<string, unknown>, action: string) => {
    const { error } = await supabase.from("profiles").update(values as never).eq("id", id);
    if (error) { toast.error(error.message); return false; }
    await logAction(adminId, action, id);
    toast.success("সেভ হয়েছে");
    void refetch();
    return true;
  };
  const toggleAdmin = async (id: string) => {
    const isA = roleSet.has(id);
    const { error } = isA
      ? await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin")
      : await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
    if (error) { toast.error(error.message); return; }
    await logAction(adminId, isA ? "remove_admin" : "make_admin", id);
    toast.success(isA ? "অ্যাডমিন সরানো হয়েছে" : "অ্যাডমিন করা হয়েছে");
    void refetchRoles();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SOT ID বা @username দিয়ে খুঁজুন" className={`${input} pl-9`} /></div>
        <span className="text-[12px] text-white/60">মোট {total ?? 0} ইউজার</span>
        <button onClick={() => setAdding(true)} className="rounded-lg bg-[#fe2c55] px-3 py-2 text-sm font-semibold">+ New User</button>
      </div>
      <div className="space-y-2">
        {(users ?? []).map((u) => {
          const isSuper = superIds.has(u.id);
          return (
            <div key={u.id} className={`rounded-xl p-3 ${isSuper ? "border border-[#FFD700]/60 bg-[#FFD700]/5" : "bg-white/5"}`}>
              <div className="flex items-center gap-3">
                <img src={u.avatar_url || "/icon-192x192.png"} alt="" className={`h-11 w-11 rounded-full object-cover ${u.golden_frame ? "ring-2 ring-[#FFD700]" : ""}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">@{u.username} {u.verified && <span className="text-sky-400">✔</span>} {u.crown_badge && "👑"} {isSuper && <GoldBadge />} {u.is_blocked && <span className="text-[10px] text-red-400">BLOCKED</span>}</p>
                  <p className="truncate text-[11px] text-white/50">ID {u.sottok_id} • {formatCount(u.followers_count)} followers • Lv {u.level} • {new Date(u.created_at).toLocaleDateString("bn-IN")}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <Chip onClick={() => setEditing(u)}>Edit</Chip>
                <Chip on={u.verified} onClick={() => void patch(u.id, { verified: !u.verified }, "toggle_verified")}>Blue Tick</Chip>
                <Chip on={u.golden_frame} onClick={() => void patch(u.id, { golden_frame: !u.golden_frame }, "toggle_golden_frame")}>Golden Frame</Chip>
                <Chip on={u.crown_badge} onClick={() => void patch(u.id, { crown_badge: !u.crown_badge }, "toggle_crown")}>Crown</Chip>
                <Chip on={u.level_badge} onClick={() => void patch(u.id, { level_badge: !u.level_badge }, "toggle_level_badge")}>Level Badge</Chip>
                <Chip onClick={() => setViewVideos(u.id)}>Videos</Chip>
                {!isSuper && <>
                  <Chip on={roleSet.has(u.id)} onClick={() => void toggleAdmin(u.id)}>{roleSet.has(u.id) ? "Remove Admin" : "Make Admin"}</Chip>
                  <Chip danger onClick={async () => { try { await setBlocked({ data: { userId: u.id, blocked: !u.is_blocked } }); toast.success(u.is_blocked ? "আনব্লক হয়েছে" : "ব্লক হয়েছে"); void refetch(); } catch (e) { toast.error((e as Error).message); } }}>{u.is_blocked ? "Unblock" : "Block"}</Chip>
                  <Chip danger onClick={async () => { if (!confirm(`@${u.username} কে স্থায়ীভাবে ডিলিট করবেন?`)) return; try { await delUser({ data: { userId: u.id } }); toast.success("ডিলিট হয়েছে"); void refetch(); void qc.invalidateQueries({ queryKey: ["admin-users-total"] }); } catch (e) { toast.error((e as Error).message); } }}>Delete</Chip>
                </>}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={`Edit @${editing.username}`}>
          <EditUserForm u={editing} onSave={async (vals) => { if (await patch(editing.id, vals, "edit_user")) setEditing(null); }} />
        </Modal>
      )}
      {adding && (
        <Modal onClose={() => setAdding(false)} title="Add New User">
          <form className="space-y-2" onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              await createUser({ data: { fullName: String(f.get("fullName")), username: String(f.get("username")).toLowerCase(), password: String(f.get("password")) } });
              toast.success("ইউজার তৈরি হয়েছে"); setAdding(false); void refetch();
            } catch (err) { toast.error((err as Error).message); }
          }}>
            <input name="fullName" placeholder="পুরো নাম" className={input} required />
            <input name="username" placeholder="username (a-z, 0-9)" className={input} required />
            <input name="password" type="password" placeholder="পাসওয়ার্ড (min 6)" className={input} required minLength={6} />
            <button className="w-full rounded-lg bg-[#fe2c55] py-2 font-semibold">Create</button>
          </form>
        </Modal>
      )}
      {viewVideos && <Modal onClose={() => setViewVideos(null)} title="User videos"><VideosPanel adminId={adminId} userId={viewVideos} /></Modal>}
    </div>
  );
}

function EditUserForm({ u, onSave }: { u: any; onSave: (v: Record<string, unknown>) => void }) {
  const [v, setV] = useState({ username: u.username, sottok_id: u.sottok_id, bio: u.bio, avatar_url: u.avatar_url ?? "", level: u.level, followers_count: u.followers_count, likes_count: u.likes_count });
  const f = (k: keyof typeof v, type = "text") => (
    <label className="block text-[11px] text-white/60">{k}
      <input type={type} value={v[k] as string | number} onChange={(e) => setV({ ...v, [k]: type === "number" ? Number(e.target.value) : e.target.value })} className={input} />
    </label>
  );
  return (
    <div className="space-y-2">
      {f("username")}{f("sottok_id")}{f("bio")}{f("avatar_url")}{f("level", "number")}{f("followers_count", "number")}{f("likes_count", "number")}
      <button onClick={() => onSave({ ...v, level: Math.min(50, Math.max(1, v.level)) })} className="w-full rounded-lg bg-[#fe2c55] py-2 font-semibold">Save</button>
    </div>
  );
}

function Chip({ children, onClick, on, danger }: { children: ReactNode; onClick: () => void; on?: boolean; danger?: boolean }) {
  return <button onClick={onClick} className={`rounded-full px-2.5 py-1 ${danger ? "bg-red-500/15 text-red-400" : on ? "bg-[#fe2c55] text-white" : "bg-white/10 text-white/80"}`}>{children}</button>;
}
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-neutral-900 p-4 md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><p className="font-semibold">{title}</p><button onClick={onClose} className="text-white/60">✕</button></div>
        {children}
      </div>
    </div>
  );
}

function VideosPanel({ adminId, userId }: { adminId: string; userId?: string }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const { data, refetch } = useQuery({
    queryKey: ["admin-videos", userId],
    queryFn: async () => {
      let q = supabase.from("videos").select("*").eq("is_deleted", false).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(60);
      if (userId) q = q.eq("user_id", userId);
      const rows = (await q).data ?? [];
      const ids = [...new Set(rows.map((r) => r.user_id))];
      const { data: profs } = ids.length ? await supabase.from("profiles").select("id, username").in("id", ids) : { data: [] };
      const map = new Map((profs ?? []).map((p) => [p.id, p.username]));
      return rows.map((r) => ({ ...r, username: map.get(r.user_id) ?? "" }));
    },
  });
  const upd = async (id: string, vals: Record<string, unknown>, action: string) => {
    const { error } = await supabase.from("videos").update(vals as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logAction(adminId, action, id); toast.success("সেভ হয়েছে"); void refetch();
  };
  const del = async (id: string) => {
    if (!confirm("ভিডিওটি ডিলিট করবেন?")) return;
    const { error } = await supabase.from("videos").update({ is_deleted: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logAction(adminId, "delete_video", id); toast.success("ডিলিট হয়েছে"); void refetch();
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(data ?? []).map((v) => (
          <div key={v.id} className="overflow-hidden rounded-xl bg-white/5">
            <VideoThumb v={v} playing={playing === v.id} onPlay={() => setPlaying(playing === v.id ? null : v.id)} />
            <div className="p-2 text-[11px]">
              <p className="truncate font-semibold">@{v.username} {v.is_pinned && "📌"} {v.admin_hidden && <span className="text-red-400">hidden</span>}</p>
              <p className="text-white/50">{formatCount(v.views)} views • {formatCount(v.likes)} likes • {new Date(v.created_at).toLocaleDateString("bn-IN")}</p>
              <div className="mt-1.5 flex gap-2">
                <button aria-label="Pin" onClick={() => void upd(v.id, { is_pinned: !v.is_pinned }, v.is_pinned ? "unpin_video" : "pin_video")}><Pin className={`h-4 w-4 ${v.is_pinned ? "text-[#FFD700]" : ""}`} /></button>
                <button aria-label="Hide" onClick={() => void upd(v.id, { admin_hidden: !v.admin_hidden }, v.admin_hidden ? "show_video" : "hide_video")}>{v.admin_hidden ? <EyeOff className="h-4 w-4 text-red-400" /> : <Eye className="h-4 w-4" />}</button>
                <button aria-label="Download" onClick={async () => void downloadVideo(await signVideo(v.video_url), `sottok-${v.id}`)}><Download className="h-4 w-4" /></button>
                <button aria-label="Delete" onClick={() => void del(v.id)}><Trash2 className="h-4 w-4 text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data && !data.length && <p className="text-sm text-white/50">কোনো ভিডিও নেই</p>}
    </div>
  );
}

function VideoThumb({ v, playing, onPlay }: { v: any; playing: boolean; onPlay: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => { if (playing && !url) void signVideo(v.video_url).then(setUrl); }, [playing, url, v.video_url]);
  return (
    <div className="relative aspect-[9/14] bg-black">
      {playing && url ? <video src={url} autoPlay controls playsInline className="h-full w-full object-cover" /> : (
        <button onClick={onPlay} className="flex h-full w-full items-center justify-center">
          {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
          <Play className="relative h-8 w-8" />
        </button>
      )}
    </div>
  );
}

function MusicPanel({ adminId }: { adminId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [meta, setMeta] = useState({ title: "", artist: "", category: "Trending" });
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: songs, refetch } = useQuery({
    queryKey: ["admin-songs"],
    queryFn: async () => {
      const rows = (await supabase.from("songs").select("*").order("created_at", { ascending: false })).data ?? [];
      const ids = [...new Set(rows.map((r) => r.uploaded_by).filter(Boolean) as string[])];
      const { data: profs } = ids.length ? await supabase.from("profiles").select("id, sottok_id").in("id", ids) : { data: [] };
      const m = new Map((profs ?? []).map((p) => [p.id, p.sottok_id]));
      return rows.map((r) => ({ ...r, uploader: r.uploaded_by ? m.get(r.uploaded_by) ?? "" : "" }));
    },
  });

  const uploadFile = async (file: File, folder: string) => {
    const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("songs").upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  };

  const submit = async () => {
    if (!files.length) return;
    setBusy(true);
    try {
      const coverUrl = cover ? await uploadFile(cover, "covers") : null;
      for (const file of files) {
        const audio = await uploadFile(file, "audio");
        const title = files.length === 1 && meta.title.trim() ? meta.title.trim() : file.name.replace(/\.[^.]+$/, "");
        const { error } = await supabase.from("songs").insert({ title, artist: meta.artist.trim(), category: meta.category, audio_url: audio, cover_url: coverUrl, uploaded_by: adminId });
        if (error) throw error;
        await logAction(adminId, "upload_song", title);
      }
      toast.success(`${files.length}টি গান আপলোড হয়েছে — সবাই দেখতে পাবে`);
      setFiles([]); setCover(null); setMeta({ title: "", artist: "", category: "Trending" });
      void refetch();
    } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  const play = async (s: any) => {
    if (playingId === s.id) { audioRef.current?.pause(); setPlayingId(null); return; }
    audioRef.current?.pause();
    try {
      const a = new Audio(await signSong(s.audio_url));
      a.onended = () => setPlayingId(null);
      await a.play();
      audioRef.current = a;
      setPlayingId(s.id);
    } catch { toast.error('গান খোলা যায়নি'); }
  };
  useEffect(() => () => audioRef.current?.pause(), []);

  const upd = async (id: string, vals: Record<string, unknown>, action: string) => {
    const { error } = await supabase.from("songs").update(vals as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logAction(adminId, action, id); toast.success("সেভ হয়েছে"); void refetch();
  };

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#fe2c55]/60 py-6 text-sm font-semibold text-[#fe2c55]">
        <Upload className="h-5 w-5" /> Upload Music from Gallery
        <input type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      </label>
      {files.length > 0 && (
        <div className="space-y-2 rounded-xl bg-white/5 p-3">
          <p className="text-[12px] text-white/60">{files.length}টি ফাইল বাছাই হয়েছে{files.length > 1 ? " — ফাইলের নামই গানের নাম হবে" : ""}</p>
          {files.length === 1 && <input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="Song Name" className={input} />}
          <input value={meta.artist} onChange={(e) => setMeta({ ...meta, artist: e.target.value })} placeholder="Artist" className={input} />
          <select value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} className={input}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <label className="block text-[12px] text-white/60">Cover Image <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} className="mt-1 block text-[12px]" /></label>
          <button disabled={busy} onClick={() => void submit()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fe2c55] py-2 font-semibold disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Upload</button>
        </div>
      )}
      <div className="space-y-2">
        {(songs ?? []).map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
            {s.cover_url ? <img src={s.cover_url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fe2c55]/20"><Music2 className="h-5 w-5" /></div>}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.title} {s.is_hidden && <span className="text-[10px] text-red-400">hidden</span>}</p>
              <p className="truncate text-[11px] text-white/50">{s.artist || "—"} • {s.category} • by {s.uploader} • {s.plays} plays</p>
              {playingId === s.id && <div className="mt-1 flex h-4 items-end gap-0.5">{Array.from({ length: 24 }).map((_, i) => <span key={i} className="w-1 animate-pulse rounded bg-[#fe2c55]" style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${i * 60}ms` }} />)}</div>}
            </div>
            <button aria-label="Play" onClick={() => play(s)}>{playingId === s.id ? <Pause className="h-5 w-5 text-[#fe2c55]" /> : <Play className="h-5 w-5" />}</button>
            <button onClick={() => setEditing(s)} className="text-[11px] text-white/70">Edit</button>
            <button aria-label="Hide" onClick={() => void upd(s.id, { is_hidden: !s.is_hidden }, s.is_hidden ? "show_song" : "hide_song")}>{s.is_hidden ? <EyeOff className="h-4 w-4 text-red-400" /> : <Eye className="h-4 w-4" />}</button>
            <button aria-label="Delete" onClick={async () => { if (!confirm("গানটি ডিলিট করবেন?")) return; const { error } = await supabase.from("songs").delete().eq("id", s.id); if (error) { toast.error(error.message); return; } await logAction(adminId, "delete_song", s.title); void refetch(); }}><Trash2 className="h-4 w-4 text-red-400" /></button>
          </div>
        ))}
        {songs && !songs.length && <p className="text-sm text-white/50">এখনো কোনো গান নেই</p>}
      </div>
      {editing && (
        <Modal title="Edit song" onClose={() => setEditing(null)}>
          <div className="space-y-2">
            <input defaultValue={editing.title} onChange={(e) => (editing.title = e.target.value)} className={input} />
            <input defaultValue={editing.artist} onChange={(e) => (editing.artist = e.target.value)} className={input} />
            <select defaultValue={editing.category} onChange={(e) => (editing.category = e.target.value)} className={input}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <button onClick={async () => { await upd(editing.id, { title: editing.title, artist: editing.artist, category: editing.category }, "edit_song"); setEditing(null); }} className="w-full rounded-lg bg-[#fe2c55] py-2 font-semibold">Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FiltersPanel({ adminId }: { adminId: string }) {
  const [name, setName] = useState("");
  const [css, setCss] = useState("");
  const { data, refetch } = useQuery({ queryKey: ["admin-filters"], queryFn: async () => (await supabase.from("app_filters").select("*").order("sort")).data ?? [] });
  const add = async () => {
    if (!name.trim() || !css.trim()) return;
    const { error } = await supabase.from("app_filters").insert({ name: name.trim(), css: css.trim(), sort: (data?.length ?? 0) });
    if (error) { toast.error(error.message); return; }
    await logAction(adminId, "add_filter", name); setName(""); setCss(""); void refetch();
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-xl bg-white/5 p-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Filter name" className={`${input} md:w-40`} />
        <input value={css} onChange={(e) => setCss(e.target.value)} placeholder="CSS filter e.g. sepia(0.6) contrast(1.2)" className={`${input} flex-1`} />
        <button onClick={() => void add()} className="rounded-lg bg-[#fe2c55] px-4 py-2 text-sm font-semibold">Add</button>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {(data ?? []).map((f) => (
          <div key={f.id} className="rounded-xl bg-white/5 p-2">
            <div className="h-16 rounded-lg bg-gradient-to-br from-[#fe2c55] via-[#FFD700] to-sky-500" style={{ filter: f.css }} />
            <div className="mt-2 flex items-center justify-between text-[12px]">
              <span className="font-semibold">{f.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={async () => { await supabase.from("app_filters").update({ enabled: !f.enabled }).eq("id", f.id); await logAction(adminId, f.enabled ? "disable_filter" : "enable_filter", f.name); void refetch(); }} className={`rounded-full px-2 py-0.5 ${f.enabled ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/50"}`}>{f.enabled ? "ON" : "OFF"}</button>
                <button aria-label="Delete" onClick={async () => { await supabase.from("app_filters").delete().eq("id", f.id); void refetch(); }}><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPanel({ adminId }: { adminId: string }) {
  const { data, refetch } = useQuery({ queryKey: ["admin-reports"], queryFn: async () => (await supabase.from("video_reports").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [] });
  const act = async (r: any, status: string, hide: boolean) => {
    await supabase.from("video_reports").update({ status }).eq("id", r.id);
    if (hide) await supabase.from("videos").update({ admin_hidden: true }).eq("id", r.video_id);
    await logAction(adminId, `report_${status}`, r.video_id); toast.success("সেভ হয়েছে"); void refetch();
  };
  return (
    <div className="space-y-2">
      {(data ?? []).map((r) => (
        <div key={r.id} className="rounded-xl bg-white/5 p-3 text-[12px]">
          <p><b>{r.reason}</b> <span className="text-white/50">• {r.status} • {new Date(r.created_at).toLocaleString("bn-IN")}</span></p>
          {r.details && <p className="mt-1 text-white/70">{r.details}</p>}
          <div className="mt-2 flex gap-2">
            <Chip danger onClick={() => void act(r, "resolved", true)}>Hide video</Chip>
            <Chip onClick={() => void act(r, "dismissed", false)}>Dismiss</Chip>
          </div>
        </div>
      ))}
      {data && !data.length && <p className="text-sm text-white/50">কোনো রিপোর্ট নেই</p>}
    </div>
  );
}

function SettingsPanel({ adminId }: { adminId: string }) {
  const { data, refetch } = useQuery({ queryKey: ["app-settings"], queryFn: async () => (await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle()).data });
  const [v, setV] = useState<any>(null);
  useEffect(() => { if (data) setV(data); }, [data]);
  const ready = useMemo(() => !!v, [v]);
  if (!ready) return <Loader2 className="h-5 w-5 animate-spin" />;
  const save = async () => {
    const { error } = await supabase.from("app_settings").upsert({ id: 1, app_name: v.app_name, logo_url: v.logo_url || null, theme_color: v.theme_color, maintenance_mode: v.maintenance_mode, announcement: v.announcement, updated_at: new Date().toISOString() });
    if (error) { toast.error(error.message); return; }
    await logAction(adminId, "update_app_settings"); toast.success("সেভ হয়েছে"); void refetch();
  };
  return (
    <div className="max-w-md space-y-3">
      <label className="block text-[12px] text-white/60">App name<input value={v.app_name} onChange={(e) => setV({ ...v, app_name: e.target.value })} className={input} /></label>
      <label className="block text-[12px] text-white/60">Logo URL<input value={v.logo_url ?? ""} onChange={(e) => setV({ ...v, logo_url: e.target.value })} className={input} /></label>
      <label className="block text-[12px] text-white/60">Theme color<input type="color" value={v.theme_color} onChange={(e) => setV({ ...v, theme_color: e.target.value })} className="mt-1 block h-10 w-20 rounded" /></label>
      <label className="block text-[12px] text-white/60">Announcement banner<textarea value={v.announcement} onChange={(e) => setV({ ...v, announcement: e.target.value })} className={input} rows={3} /></label>
      <button onClick={() => setV({ ...v, maintenance_mode: !v.maintenance_mode })} className={`w-full rounded-lg py-2 text-sm font-semibold ${v.maintenance_mode ? "bg-red-500/20 text-red-400" : "bg-white/10"}`}>Maintenance mode: {v.maintenance_mode ? "ON" : "OFF"}</button>
      <button onClick={() => void save()} className="w-full rounded-lg bg-[#fe2c55] py-2 font-semibold">Save settings</button>
    </div>
  );
}
