import { supabase } from "@/integrations/supabase/client";

export type AdminLogEntry = {
  action: string;
  entity: string;
  entity_id?: string | null;
  details?: Record<string, any>;
};

export async function logAdminActivity(entry: AdminLogEntry) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_activity_log" as any).insert({
      user_id: user.id,
      user_email: user.email ?? null,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id ?? null,
      details: entry.details ?? {},
    });
  } catch (e) {
    // Silent — logging must never break the action
    console.warn("admin log failed", e);
  }
}
