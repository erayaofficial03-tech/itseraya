import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isStaff, loading } = useAuth();
  const { data: settings } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (!loading && user) {
      const dest = isStaff ? "/admin" : (from || "/profile");
      navigate(dest, { replace: true });
    }
  }, [user, isStaff, loading, navigate, from]);

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
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email to confirm your account.");
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
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
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead title={`Sign In — ${s(settings, "store_name")}`} />
      <Header />
      <main className="flex-1 px-6 py-8 pb-24 lg:pb-10 max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <img src="/eraya-logo.png" alt="Eraya" className="h-14 mx-auto mb-3 object-contain" />
          <p className="font-serif italic text-gold text-sm mb-4">Adorn Your Story</p>
          <h1 className="font-serif text-2xl text-foreground mb-1">Welcome</h1>
          
        </div>

        <Button
          variant="outline"
          className="w-full mb-4 border-foreground/20 hover:bg-muted"
          onClick={google}
          disabled={busy}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5.06c1.84 0 3.5.68 4.79 1.79l3.36-3.36C18.06 1.45 15.23 0 12 0 7.31 0 3.26 2.69 1.28 6.6l3.99 3.16Z"/><path fill="#34A853" d="M16.04 18.01A7.06 7.06 0 0 1 12 19c-3.06 0-5.66-2-6.6-4.78l-3.99 3.07A11.99 11.99 0 0 0 12 24c2.93 0 5.74-1.05 7.81-3l-3.77-2.99Z"/><path fill="#4A90E2" d="M19.81 21c2.16-2.01 3.55-5 3.55-9 0-.74-.06-1.45-.16-2.13H12v4.51h6.4a5.49 5.49 0 0 1-2.36 3.62l3.77 2.99Z"/><path fill="#FBBC05" d="M5.4 14.22A7.04 7.04 0 0 1 5 12c0-.78.13-1.52.37-2.22L1.38 6.6A12 12 0 0 0 0 12c0 1.94.46 3.76 1.28 5.39l4.12-3.17Z"/></svg>
          Continue with Google
        </Button>

        <div className="relative my-4 text-center">
          <span className="bg-background px-2 text-xs text-muted-foreground relative z-10">or</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-0" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-4">
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-pw">Password</Label>
                <Input id="si-pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign in
              </Button>
              <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-gold underline w-full text-center">
                Forgot password?
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={signUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="su-name">Full name</Label>
                <Input id="su-name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-pw">Password</Label>
                <Input id="su-pw" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-[11px] text-muted-foreground text-center mt-6 px-4">
          Your account is used only to save favourites and enquiry history.
        </p>
        <p className="text-xs text-muted-foreground text-center mt-3">
          <Link to="/" className="hover:text-gold">← Back to store</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
