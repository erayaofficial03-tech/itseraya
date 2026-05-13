import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  profile_complete: boolean;
  current_mode: "customer" | "admin";
}

export type AppMode = "customer" | "admin";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleChecked, setRoleChecked] = useState(false);

  const loadUserData = useCallback(async (userId: string) => {
    const [{ data: roles }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("profiles")
        .select("id,email,full_name,avatar_url,phone,city,state,profile_complete,current_mode")
        .eq("id", userId)
        .maybeSingle(),
    ]);
    const r = (roles || []).map((x) => x.role);
    setIsAdmin(r.includes("admin"));
    setIsManager(r.includes("manager"));
    setProfile((prof as Profile) || null);
    setRoleChecked(true);
  }, []);

  useEffect(() => {
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
  }, [loadUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const switchMode = useCallback(
    async (mode: AppMode) => {
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({ current_mode: mode })
        .eq("id", user.id);
      if (!error) {
        setProfile((p) => (p ? { ...p, current_mode: mode } : p));
      }
      return error;
    },
    [user],
  );

  const refreshProfile = useCallback(async () => {
    if (user) await loadUserData(user.id);
  }, [user, loadUserData]);

  const isStaff = isAdmin || isManager;
  const currentMode: AppMode = profile?.current_mode === "admin" ? "admin" : "customer";

  return {
    session,
    user,
    profile,
    isAdmin,
    isManager,
    isStaff,
    currentMode,
    switchMode,
    refreshProfile,
    loading,
    roleChecked,
    signOut,
  };
};
