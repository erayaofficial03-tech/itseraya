import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import erayaLogo from "@/assets/eraya-logo.png";

const ADMIN_EMAIL = "admin@itseraya.in";
const MANAGER_EMAILS = ["erayaofficial03@gmail.com", "erayaoffical03@gmail.com"];

const AuthCallback = () => {
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const finish = async () => {
      const url = new URL(window.location.href);
      if (url.searchParams.get("code")) {
        try { await supabase.auth.exchangeCodeForSession(window.location.href); } catch { /* ignore */ }
      }

      let session = (await supabase.auth.getSession()).data.session;
      for (let i = 0; i < 20 && !session; i++) {
        await new Promise((r) => setTimeout(r, 150));
        session = (await supabase.auth.getSession()).data.session;
      }

      if (!session?.user) {
        toast.error("Sign-in failed. Please try again.");
        navigate("/admin/login", { replace: true });
        return;
      }

      const user = session.user;
      const email = (user.email || "").toLowerCase();

      // Check block status
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_blocked) {
        await supabase.auth.signOut();
        toast.error("Your account has been suspended. Contact Eraya support.");
        navigate("/", { replace: true });
        return;
      }

      // Role based on email (DB trigger also handles this; this is defensive)
      const role: "admin" | "manager" | "customer" =
        email === ADMIN_EMAIL ? "admin" : MANAGER_EMAILS.includes(email) ? "manager" : "customer";

      // Ensure profile row exists
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email!,
        full_name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || null,
        avatar_url: (user.user_metadata?.avatar_url as string) || null,
      }, { onConflict: "id" });

      // Ensure role row exists (DB trigger enforces admin-email rule)
      if (role !== "customer") {
        await supabase.from("user_roles").upsert(
          { user_id: user.id, role },
          { onConflict: "user_id,role" },
        );
      }

      const isStaff = role === "admin" || role === "manager";
      navigate(isStaff ? "/admin" : "/", { replace: true });
    };

    finish();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ivory gap-5">
      <img src={erayaLogo} alt="Eraya" className="h-14 w-auto" />
      <span className="h-8 w-8 rounded-full border-[3px] border-gold border-t-transparent animate-spin" />
      <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Signing you in…</p>
    </div>
  );
};

export default AuthCallback;
