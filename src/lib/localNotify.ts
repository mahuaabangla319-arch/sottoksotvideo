// Local (device) video posts + notifications for SOT TOK
export type LocalPost = {
  id: string; ownerId: string; ownerName: string; ownerPic: string; ownerSotId: string;
  videoUrl: string; caption: string; createdAt: number; camera: string;
};
export type LocalNotif = {
  id: string; actorId: string; actorName: string; actorPic: string; actorSotId: string;
  postId: string; videoUrl: string; createdAt: number; read: boolean;
};

const read = <T,>(k: string): T[] => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const localUserId = () =>
  localStorage.getItem("sottok_uid") || localStorage.getItem("vigo_user_id") || "guest";

export const getLocalPosts = () => read<LocalPost>("sottok_camera_posts");

export function saveLocalPost(p: LocalPost) {
  write("sottok_camera_posts", [p, ...getLocalPosts()].slice(0, 30));
  const notif: LocalNotif = {
    id: `n${p.id}`, actorId: p.ownerId, actorName: p.ownerName, actorPic: p.ownerPic,
    actorSotId: p.ownerSotId, postId: p.id, videoUrl: p.videoUrl, createdAt: p.createdAt, read: false,
  };
  // global list + every known user on this device (except owner)
  write("sottok_notifications_all", [notif, ...read<LocalNotif>("sottok_notifications_all")].slice(0, 50));
  const users = read<{ id?: string; email?: string }>("sot_tok_users");
  for (const u of users) {
    const uid = u.id || u.email;
    if (!uid || uid === p.ownerId) continue;
    const k = `sottok_notifications_${uid}`;
    write(k, [notif, ...read<LocalNotif>(k)].slice(0, 50));
  }
  window.dispatchEvent(new Event("sottok-notif"));
}

export function getMyNotifs(): LocalNotif[] {
  const me = localUserId();
  const seen = new Set<string>(read<string>(`sottok_notif_seen_${me}`));
  const map = new Map<string, LocalNotif>();
  for (const n of [...read<LocalNotif>(`sottok_notifications_${me}`), ...read<LocalNotif>("sottok_notifications_all")]) {
    if (n.actorId === me) continue;
    map.set(n.id, { ...n, read: seen.has(n.id) });
  }
  return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function markNotifsRead() {
  const me = localUserId();
  write(`sottok_notif_seen_${me}`, getMyNotifs().map((n) => n.id));
  window.dispatchEvent(new Event("sottok-notif"));
}

export const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(""); r.readAsDataURL(b); });
