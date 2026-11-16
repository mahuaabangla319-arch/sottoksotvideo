import { createFileRoute, Link } from "@tanstack/react-router";
import { downloadVideo, fetchFollowingSet, setFollow } from "@/lib/social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music2, Check, Download, Gift as GiftIcon, X, Camera, Image as ImageIcon, Home, Compass, Bell, User, CircleDot, LogOut, ShieldCheck, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GiftSheet as RealGiftSheet } from "@/components/GiftSheet";
import { GiftAnimation as RealGiftAnimation } from "@/components/GiftAnimation";
import { countView, fetchMyLikes, formatCompact, likeVideo, unlikeVideo } from "@/lib/engagement";

const DESC = "ভারতের শর্ট ভিডিও ফিড — ড্যান্স, কমেডি, রান্না আর ফ্যামিলি ভিডিও।";
export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "For You — Short Tok" }, { name: "description", content: DESC }] }),
  component: FeedPage,
});
function SafeWrap({ children }: any) {
  const [err, setErr] = useState<any>(null);
  if (err) return <div className="flex h-screen items-center justify-center bg-black text-white text-center px-6">কিছু একটা আটকে গেছে<br />পেজটা রিফ্রেশ করো<br /><button onClick={() => window.location.reload()} className="mt-3 bg-[#fe2c55] px-4 py-2 rounded-full font-bold">Try Again</button></div>;
  try { return children; } catch (e) { setErr(e); return null; }
}
type FeedItem = { id: string; userId?: string | undefined; sotId?: string | undefined; username: string; caption: string; url: string; sound: string; views: number; likes: number; comments: number; avatar?: string };
const PAGE_SIZE = 6;
const demoVideos: FeedItem[] = [
  { id: "demo-1", username: "@india_kitchen", caption: "আজকের রেসিপি: ঘরোয়া পনির বাটার মশলা 🔥", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", sound: "Original sound - Short Tok Artist", views: 1000000, likes: 4000, comments: 0 },
  { id: "demo-2", username: "@rannaghor", caption: "৫ মিনিটে চিকেন কারি 🍛", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", sound: "Original sound - Short Tok Artist", views: 820000, likes: 3200, comments: 0 },
  { id: "demo-3", username: "@shorttok_food", caption: "গরম গরম পিঠা 😍", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", sound: "Original sound - Short Tok Artist", views: 610000, likes: 2700, comments: 0 },
];
const getLocal = (k: string, d: any) => { try { if (typeof window === "undefined" || !window.localStorage) return d; const v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const setLocal = (k: string, v: any) => { try { if (typeof window !== "undefined" && window.localStorage) window.localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const getLS = (k: string) => { try { return window.localStorage?.getItem(k) || ""; } catch { return ""; } };
const setLS = (k: string, v: string) => { try { window.localStorage?.setItem(k, v); } catch {} };
const myName = () => getLS("shorttok_username") || getLS("shorttok_user_name") || getLS("shorttok_user_email")?.split("@")[0] || "Guest";
const timeAgo = (t: number) => { const d = Date.now() - t; if (d < 60000) return "এখনই"; if (d < 3600000) return `${Math.floor(d / 60000)} মিনিট আগে`; if (d < 86400000) return `${Math.floor(d / 3600000)} ঘণ্টা আগে`; return `${Math.floor(d / 86400000)} দিন আগে`; };
function useSafeAuth() {
  const [authUser, setAuthUser] = useState<any>(null);
  useEffect(() => { let alive = true; (async () => { try { const { data } = await supabase.auth.getSession(); if (alive) setAuthUser(data?.session?.user || null); } catch { if (alive) setAuthUser(null); } })(); let sub: any = null; try { const r = supabase.auth.onAuthStateChange((_e, s) => { if (alive) setAuthUser(s?.user || null); }); sub = r?.data; } catch {} return () => { alive = false; try { sub?.subscription?.unsubscribe(); } catch {} }; }, []);
  return { user: authUser };
}
async function signBatch(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const storagePaths = paths.filter((p) => !p.startsWith("http"));
  paths.filter((p) => p.startsWith("http")).forEach((p) => map.set(p, p));
  if (storagePaths.length) { try { const { data } = await supabase.storage.from("videos").createSignedUrls(storagePaths, 60 * 60 * 8); (data ?? []).forEach((d) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); }); } catch {} }
  return map;
}
function usePersistLogin() {
  const { user } = useSafeAuth();
  const [savedUser, setSavedUser] = useState<any>(() => getLocal("shorttok_persist_login", null));
  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => { (async () => { try { const { data } = await supabase.auth.getSession(); const u = data?.session?.user; if (u) { const info = { id: u.id, email: u.email, name: (u.user_metadata as any)?.full_name || u.email?.split("@")[0] || "User", avatar: (u.user_metadata as any)?.avatar_url || "", at: Date.now() }; setLocal("shorttok_persist_login", info); setLS("shorttok_username", info.name); setLS("shorttok_user_email", info.email || ""); try { window.localStorage.removeItem("shorttok_logged_out"); } catch {} setSavedUser(info); } else { const saved = getLocal("shorttok_persist_login", null); const loggedOut = getLS("shorttok_logged_out"); if (saved && !loggedOut) setSavedUser(saved); } } catch {} })(); }, []);
  const loginWithGoogle = async () => { try { const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/feed", queryParams: { prompt: "select_account" } } }); if (error) throw error; } catch { toast.error("Gmail লগইন হয়নি, আবার চেষ্টা করো"); } };
  const logout = async () => { if (!confirm("Log Out করতে চাও? এরপর আবার Gmail দিয়ে লগইন করতে হবে।")) return; try { await supabase.auth.signOut(); } catch {} try { window.localStorage.setItem("shorttok_logged_out", "1"); window.localStorage.removeItem("shorttok_persist_login"); } catch {} setSavedUser(null); toast.success("Log Out হয়ে গেছে"); window.location.href = "/feed"; };
  const deleteAccount = async () => { if (!confirm("তুমি কি সত্যিই তোমার অ্যাকাউন্ট + সব ভিডিও + Status মুছে ফেলতে চাও? এটা ফেরানো যাবে না।")) return; if (!confirm("আবার কনফার্ম করো - অ্যাকাউন্ট ডিলিট হয়ে যাবে।")) return; try { const uid = savedUser?.id || user?.id; if (uid) { await supabase.from("videos").delete().eq("user_id", uid); await supabase.from("profiles").delete().eq("id", uid); } await supabase.auth.signOut(); } catch {} try { window.localStorage.clear(); } catch {} toast.success("অ্যাকাউন্ট ডিলিট হয়ে গেছে"); window.location.href = "/feed"; };
  return { currentUser: user || savedUser, showLogin, setShowLogin, loginWithGoogle, logout, deleteAccount };
}
function LoginSheet({ onClose, onGoogle }: any) {
  return (<div className="fixed inset-0 z-[140] bg-black/80 flex items-end justify-center" onClick={onClose}><div className="w-full max-w-[420px] bg-white rounded-t-3xl p-5 text-black text-center" onClick={(e) => e.stopPropagation()}><div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-[#fe2c55] to-orange-500 flex items-center justify-center text-2xl font-bold text-white">S</div><b className="block mt-2 text-[18px]">Short Tok এ স্বাগতম</b><p className="text-[12px] text-zinc-500 mt-1">Gmail দিয়ে একবার লগইন করো — এরপর বারবার লগইন করতে হবে না,<br />যতক্ষণ না তুমি Log Out করছো</p><button onClick={onGoogle} className="w-full mt-4 bg-white border-2 border-zinc-200 rounded-full py-3 font-bold">G Gmail দিয়ে লগইন করো</button><button onClick={onClose} className="w-full mt-2 bg-zinc-100 rounded-full py-3 font-bold text-sm">পরে করবো — এমনি দেখবো</button></div></div>);
}
function PrivacySheet({ onClose }: any) {
  return (<div className="fixed inset-0 z-[145] bg-white text-black overflow-y-auto"><div className="sticky top-0 bg-white flex items-center gap-2 px-3 py-3 border-b"><button onClick={onClose} className="bg-zinc-100 p-2 rounded-full"><X className="h-4 w-4" /></button><b>Privacy Policy & Terms — Short Tok</b></div><div className="p-4 text-[13px] leading-relaxed space-y-3"><p><b>1. আমরা কী নিই:</b> তোমার Gmail নাম, ইমেইল, প্রোফাইল ছবি, তুমি যে ভিডিও / Status দাও — শুধু সেটাই।</p><p><b>2. কীভাবে ব্যবহার হয়:</b> তোমার ভিডিও সবাইকে দেখাতে, তোমার নাম ভিডিওতে দেখাতে, আর লাইক / কমেন্ট / গিফট গুনতে।</p><p><b>3. ডাউনলোড:</b> তুমি ডাউনলোড করলে ভিডিওতে SHORT TOK Watermark বসে — এটা আসল মালিককে চিনতে সাহায্য করে।</p><p><b>4. ডিলিট:</b> তুমি চাইলে যেকোনো সময় Status পেজ / প্রোফাইল থেকে <b>Delete Account</b> চাপলে তোমার অ্যাকাউন্ট + ভিডিও + Status মুছে যাবে।</p><p><b>5. বাচ্চাদের জন্য:</b> 13 বছরের নিচে কেউ অ্যাকাউন্ট খুলবে না। খারাপ / নগ্ন / হিংসার ভিডিও দিলে অ্যাকাউন্ট বন্ধ হবে।</p><p className="text-zinc-500">Last updated: 2026 • Short Tok • Made in India</p><button onClick={onClose} className="w-full bg-[#fe2c55] text-white rounded-full py-3 font-bold">বুঝেছি, বন্ধ করো</button></div></div>);
}
// ===== ডাউনলোড - ফুল ভিডিও + সাউন্ড + SHORT TOK ডিজাইন Watermark =====
async function downloadWithWatermark(item: FeedItem) {
  toast("ডাউনলোড হচ্ছে… SHORT TOK ডিজাইন Watermark বসানো হচ্ছে