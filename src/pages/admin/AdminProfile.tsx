import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, LogOut, Eye } from "lucide-react";
import { INDIAN_STATES } from "@/lib/indianStates";
import ConnectedAccounts from "@/components/auth/ConnectedAccounts";

const AdminProfile = () => {
  const { user, profile, signOut, switchMode, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: "", phone: "", city: "", state: "" });
  const [busy, setBusy] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: (profile.phone || "").replace(/\D/g, "").slice(-10),
        city: profile.city || "",
        state: profile.state || "",
      });
    }
  }, [profile]);

  const meta = (user?.user_metadata as Record<string, string | undefined>) || {};
  const displayName = profile?.full_name || meta.full_name || meta.name || "Admin";
  const avatar = profile?.avatar_url || meta.avatar_url || meta.picture;
  const initials = (displayName || user?.email || "A").slice(0, 2).toUpperCase();
  const identities = (user?.identities || []) as { provider: string }[];
  const hasEmail = identities.some((i) => i.provider === "email");

  const save = async () => {
    if (!user) return;
    if (!form.full_name.trim()) return toast.error("Name is required");
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      return toast.error("Enter a valid 10-digit Indian mobile number");
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone || null,
        city: form.city.trim() || null,
        state: form.state || null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Profile updated");
  };

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) return toast.error("Passwords do not match");
    if (pwForm.next.length < 8) return toast.error("Password must be at least 8 characters");
    if (!user?.email) return;
    setPwBusy(true);
    // Verify current password by signing in again
    const { error: vErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: pwForm.current,
    });
    if (vErr) {
      setPwBusy(false);
      return toast.error("Current password is incorrect");
    }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwBusy(false);
    if (error) return toast.error(error.message);
    setPwForm({ current: "", next: "", confirm: "" });
    toast.success("Password updated");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    navigate("/login", { replace: true });
  };

  const switchToCustomer = async () => {
    await switchMode("customer");
    navigate("/");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-background rounded-2xl border border-border p-6 flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 border-2 border-gold mb-3">
          <AvatarImage src={avatar} alt={displayName} />
          <AvatarFallback className="bg-charcoal text-ivory text-lg">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="font-serif text-xl">{displayName}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="bg-background rounded-2xl border border-border p-5 space-y-4">
        <h2 className="font-serif text-lg">Profile Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                +91
              </span>
              <Input
                inputMode="numeric"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
                className="rounded-l-none"
                maxLength={10}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {INDIAN_STATES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={save}
          disabled={busy}
          style={{
            background: "var(--gradient-gold, linear-gradient(135deg, #E0C36B 0%, #C9A84C 100%))",
            color: "hsl(var(--charcoal))",
          }}
        >
          {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <ConnectedAccounts />

      {hasEmail && (
        <div className="bg-background rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-serif text-lg">Security</h2>
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              minLength={8}
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              minLength={8}
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            />
          </div>
          <Button onClick={changePassword} disabled={pwBusy}>
            {pwBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Password
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        onClick={switchToCustomer}
        className="w-full border-gold text-gold hover:bg-gold/10"
      >
        <Eye className="h-4 w-4 mr-2" /> Switch to Customer View
      </Button>

      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
};

export default AdminProfile;
