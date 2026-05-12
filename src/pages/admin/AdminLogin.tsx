import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import erayaLogo from "@/assets/eraya-logo.png";
import { useEffect } from "react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, roleChecked } = useAuth();

  useEffect(() => {
    if (!user || !roleChecked) return;
    if (isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, roleChecked, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/admin");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={erayaLogo} alt="Eraya" className="h-14 mx-auto mb-2" />
          <CardTitle className="font-serif text-2xl">Admin</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to manage your store" : "Create your account"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@itseraya.in"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full" style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {mode === "signin" ? "First time? " : "Already registered? "}
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold underline">
                {mode === "signin" ? "Create account" : "Sign in"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
