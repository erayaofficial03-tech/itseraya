import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "role_change"
  | "user_blocked"
  | "user_unblocked"
  | "user_deleted";

export async function logAudit(params: {
  action: AuditAction;
  target_id?: string | null;
  target_email?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: params.action,
      target_id: params.target_id ?? null,
      target_email: params.target_email ?? null,
      details: params.details ?? {},
    });
  } catch (err) {
    // non-fatal
    console.warn("audit log failed", err);
  }
}
