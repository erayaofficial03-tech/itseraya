import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import SeoHead from "@/components/providers/SeoHead";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import erayaLogo from "@/assets/eraya-logo.png";

type Mode = "signin" | "signup";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isStaff, profile, currentMode, loading } = useAuth();
  const { data: settings } = useSettings();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (loading || !user) return;
    if (profile && !profile.profile_complete) {
      navigate("/complete-profile", { replace: true });
      return;
    }
    const wantsAdmin = currentMode === "admin";
    const dest = isStaff && wantsAdmin ? "/admin" : from || "/";
    navigate(dest, { replace: true });
  }, [user, profile, isStaff, currentMode, loading, navigate, from]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. Check your email to confirm.");
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (result.error) {
      toast.error("Google sign-in failed.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
  };

  const reset = async () => {
    if (!email) return toast.info("Enter your email first.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent.");
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center px-5 py-8">
      <SeoHead title={`Sign In — ${s(settings, "store_name")}`} />
      <Link
        to="/"
        className="self-start inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to store
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={erayaLogo} alt="Eraya" draggable={false} className="brand-logo h-14 mx-auto object-contain" />
          <p className="font-serif italic text-gold text-sm mt-3">
            {s(settings, "tagline")}
          </p>
          <span className="block mx-auto mt-3 h-px w-10 bg-gold/70" />
        </div>

        <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
          {mode === "signin" ? (
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="si-email">Email</Label>
                <Input
                  id="si-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-pw">Password</Label>
                <div className="relative">
                  <Input
                    id="si-pw"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full rounded-full"
                style={{
                  background:
                    "var(--gradient-gold, linear-gradient(135deg, #E0C36B 0%, #C9A84C 100%))",
                  color: "hsl(var(--charcoal))",
                }}
              >
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign In →
              </Button>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted-foreground hover:text-gold underline w-full text-center"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={signUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="su-name">Full Name</Label>
                <Input
                  id="su-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-email">Email</Label>
                <Input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-pw">Password</Label>
                <div className="relative">
                  <Input
                    id="su-pw"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-cpw">Confirm Password</Label>
                <Input
                  id="su-cpw"
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full rounded-full"
                style={{
                  background:
                    "var(--gradient-gold, linear-gradient(135deg, #E0C36B 0%, #C9A84C 100%))",
                  color: "hsl(var(--charcoal))",
                }}
              >
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Account →
              </Button>
            </form>
          )}

          <div className="relative my-5 text-center">
            <span className="bg-background px-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground relative z-10">
              or
            </span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-0" />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={google}
            disabled={busy}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-5">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-gold hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-gold hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
