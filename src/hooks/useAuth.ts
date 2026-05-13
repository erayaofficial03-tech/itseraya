import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const loadUserData = async (userId: string) => {
      const [{ data: roles }, { data: prof }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("profiles").select("id,email,full_name,avatar_url").eq("id", userId).maybeSingle(),
      ]);
      const r = (roles || []).map((x) => x.role);
      setIsAdmin(r.includes("admin"));
      setIsManager(r.includes("manager"));
      setProfile((prof as Profile) || null);
      setRoleChecked(true);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setRoleChecked(false);
        setTimeout(() => loadUserData(sess.user.id), 0);
      } else {
        setIsAdmin(false);
        setIsManager(false);
        setProfile(null);
        setRoleChecked(true);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        await loadUserData(sess.user.id);
      } else {
        setRoleChecked(true);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    session,
    user,
    profile,
    isAdmin,
    isManager,
    isStaff: isAdmin || isManager,
    loading,
    roleChecked,
    signOut,
  };
};
