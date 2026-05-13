import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
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
import erayaLogo from "@/assets/eraya-logo.png";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { INDIAN_STATES } from "@/lib/indianStates";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(1, "State is required"),
});

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, isStaff, loading, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.profile_complete) {
      navigate(isStaff ? "/admin" : "/", { replace: true });
    }
    if (profile) {
      const meta = (user?.user_metadata as Record<string, string | undefined>) || {};
      setForm({
        full_name: profile.full_name || meta.full_name || meta.name || "",
        phone: (profile.phone || "").replace(/^\+?91/, "").replace(/\D/g, "").slice(0, 10),
        city: profile.city || "",
        state: profile.state || "",
      });
    }
  }, [profile, user, isStaff, navigate]);

  const handlePhone = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: digits }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message;
      toast.error(first || "Please fix the errors");
      return;
    }
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        city: parsed.data.city,
        state: parsed.data.state,
        profile_complete: true,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile saved");
    navigate(isStaff ? "/admin" : "/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-5 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={erayaLogo} alt="Eraya" draggable={false} className="brand-logo h-14 mx-auto object-contain" />
          <h1 className="font-serif text-2xl text-charcoal mt-4">Complete Your Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Just a few details to get started.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-background rounded-2xl border border-border p-6 space-y-4 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="cp-name">Full Name *</Label>
            <Input
              id="cp-name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-phone">Mobile Number *</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="cp-phone"
                inputMode="numeric"
                placeholder="10-digit number"
                value={form.phone}
                onChange={(e) => handlePhone(e.target.value)}
                className="rounded-l-none"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-city">City *</Label>
            <Input
              id="cp-city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              maxLength={80}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>State *</Label>
            <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-charcoal text-ivory hover:opacity-90"
          >
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save & Continue
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
