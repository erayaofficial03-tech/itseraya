import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

const ConnectedAccounts = () => {
  const { user } = useAuth();
  const identities = (user?.identities || []) as { provider: string }[];
  const hasGoogle = identities.some((i) => i.provider === "google");
  const hasEmail = identities.some((i) => i.provider === "email");

  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const linkGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (result.error) toast.error("Could not link Google");
  };

  const addPassword = async () => {
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPw("");
    toast.success("Password set. You can now sign in with email + password.");
  };

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: "#EDE8E1" }}>
      <h2 className="font-serif text-lg">Connected Accounts</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            G
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">Google</p>
            <p className="text-xs text-muted-foreground truncate">
              {hasGoogle ? user?.email : "Not connected"}
            </p>
          </div>
        </div>
        {hasGoogle ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Connected
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={linkGoogle}>
            Connect
          </Button>
        )}
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email / Password</p>
              <p className="text-xs text-muted-foreground">
                {hasEmail ? "Sign in with your email and password" : "Add a password to your account"}
              </p>
            </div>
          </div>
          {hasEmail && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          )}
        </div>

        {!hasEmail && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="link-pw" className="sr-only">
                New password
              </Label>
              <Input
                id="link-pw"
                type="password"
                placeholder="New password (min 8 chars)"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                minLength={8}
              />
            </div>
            <Button onClick={addPassword} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Password
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectedAccounts;
