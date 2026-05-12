import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import erayaLogo from "@/assets/eraya-logo.png";

const ADMIN_EMAIL = "admin@itseraya.in";

const AuthCallback = () => {
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const finish = async () => {
      // If a PKCE code is present, exchange it. Otherwise the Lovable broker
      // / supabase detectSessionInUrl will already have set the session.
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch {
          /* ignore — fall through to session check */
        }
      }

      // Wait briefly for the session to settle.
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

      const email = session.user.email?.toLowerCase();
      if (email === ADMIN_EMAIL) {
        await supabase
          .from("user_roles")
          .upsert(
            { user_id: session.user.id, role: "admin" },
            { onConflict: "user_id,role" },
          );
        navigate("/admin", { replace: true });
      } else {
        await supabase.auth.signOut();
        toast.error("Access restricted to authorised admin only.");
        navigate("/", { replace: true });
      }
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
