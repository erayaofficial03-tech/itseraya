import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import erayaLogo from "@/assets/eraya-logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your inbox for the reset link.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ivory/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/"><img src={erayaLogo} alt="Eraya" className="h-14 mx-auto mb-2" /></Link>
          <CardTitle className="font-serif text-2xl">Reset your password</CardTitle>
          <p className="text-sm text-muted-foreground italic">We'll email you a secure link</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, a reset link is on its way.
              </p>
              <Link to="/login" className="text-gold underline text-sm">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full"
                style={{ background: "var(--gradient-gold)", color: "hsl(var(--charcoal))" }}
              >
                {busy ? "Sending…" : "Send reset link"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-gold underline">Sign in</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
