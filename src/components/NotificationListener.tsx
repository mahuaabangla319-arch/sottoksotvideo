import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { notifText, notificationsEnabled } from "@/lib/social";

/** Listens for new notifications for the signed-in user and shows them instantly. */
export function NotificationListener() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        async (payload) => {
          void qc.invalidateQueries({ queryKey: ["notifications", user.id] });
          void qc.invalidateQueries({ queryKey: ["unread", user.id] });
          const n = payload.new as { actor_id: string; type: string; body: string };
          if (n.type === "message") void qc.invalidateQueries({ queryKey: ["chat-list", user.id] });
          if (!notificationsEnabled()) return;
          const { data: actor } = await supabase.from("profiles").select("username").eq("id", n.actor_id).maybeSingle();
          const title = `@${actor?.username || "sottok"} ${notifText[n.type] ?? ""}`;
          const onChatPage = n.type === "message" && window.location.pathname === `/chat/${n.actor_id}`;
          if (onChatPage) return;
          toast(title, { description: n.body || undefined });
          if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
            try {
              new Notification("SOT TOK", { body: `${title}${n.body ? `: ${n.body}` : ""}`, icon: "/icon-192x192.png" });
            } catch {
              /* some mobile browsers only allow notifications from a service worker */
            }
          }
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, qc]);

  return null;
}
