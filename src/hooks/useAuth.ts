import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const checkRole = async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const roles = (data || []).map((r) => r.role);
      setIsAdmin(roles.includes("admin"));
      setIsManager(roles.includes("manager"));
      setRoleChecked(true);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setRoleChecked(false);
        setTimeout(() => checkRole(sess.user.id), 0);
      } else {
        setIsAdmin(false);
        setIsManager(false);
        setRoleChecked(true);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        await checkRole(sess.user.id);
      } else {
        setRoleChecked(true);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, isAdmin, isManager, isStaff: isAdmin || isManager, loading, roleChecked };
};
