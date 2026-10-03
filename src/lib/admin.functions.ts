import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("is_admin", { _user_id: userId });
  if (data !== true) throw new Error("Access Denied");
}

async function assertNotSuper(admin: any, target: string) {
  const { data } = await admin.from("user_roles").select("id").eq("user_id", target).eq("role", "super_admin").maybeSingle();
  if (data) throw new Error("সুপার অ্যাডমিনকে ব্লক/ডিলিট করা যাবে না");
}

export const adminSetBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), blocked: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertNotSuper(supabaseAdmin, data.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: data.blocked ? "876000h" : "none" });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("profiles").update({ is_blocked: data.blocked }).eq("id", data.userId);
    await supabaseAdmin.from("admin_logs").insert({ admin_id: context.userId, action: data.blocked ? "block_user" : "unblock_user", target: data.userId });
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertNotSuper(supabaseAdmin, data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_logs").insert({ admin_id: context.userId, action: "delete_user", target: data.userId });
    return { ok: true };
  });

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      username: z.string().trim().min(3).max(30).regex(/^[a-z0-9._-]+$/),
      fullName: z.string().trim().min(1).max(80),
      password: z.string().min(6).max(72),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: `${data.username}@sottok.com`,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, username: data.username },
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_logs").insert({ admin_id: context.userId, action: "create_user", target: data.username });
    return { ok: true };
  });
