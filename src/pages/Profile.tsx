import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
import {
  Loader2,
  LogOut,
  Heart,
  MessageCircle,
  Shield,
  ChevronRight,
  Settings as Cog,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { formatINR, useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { INDIAN_STATES } from "@/lib/indianStates";
import ConnectedAccounts from "@/components/auth/ConnectedAccounts";

const Profile = () => {
  const { user, profile, isStaff, loading, signOut, switchMode, refreshProfile } = useAuth();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: "", phone: "", city: "", state: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

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

  const { data: enquiries = [] } = useQuery({
    queryKey: ["my-enquiries", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("id, product_name, product_price, created_at")
        .eq("customer_email", user!.email!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    navigate("/login", { replace: true });
  };

  const goAdmin = async () => {
    await switchMode("admin");
    navigate("/admin");
  };

  const saveProfile = async () => {
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
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile updated");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const meta = (user.user_metadata as Record<string, string | undefined>) || {};
  const displayName = profile?.full_name || meta.full_name || meta.name || "Welcome";
  const avatar = profile?.avatar_url || meta.avatar_url || meta.picture;
  const initials = (displayName || user.email || "U").slice(0, 2).toUpperCase();

  const rowClass =
    "flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl border text-left active:bg-muted/30 transition";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead title={`My Profile — ${s(settings, "store_name")}`} />
      <Header />
      <main className="flex-1 px-5 py-6 pb-24 lg:pb-10 max-w-xl mx-auto w-full space-y-6">
        <div
          className="bg-white rounded-2xl border p-6 flex flex-col items-center text-center"
          style={{ borderColor: "#EDE8E1" }}
        >
          <Avatar className="h-20 w-20 border-2 border-gold mb-3">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className="bg-charcoal text-ivory text-lg">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="font-serif text-xl text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {profile?.profile_complete && (
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-green-700">
              <CheckCircle2 className="h-3 w-3" /> Verified profile
            </span>
          )}
        </div>

        {/* Edit profile */}
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: "#EDE8E1" }}>
          <h2 className="font-serif text-lg">Edit Profile</h2>
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
                placeholder="10-digit number"
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
          <Button
            onClick={saveProfile}
            disabled={busy}
            className="w-full"
            style={{
              background:
                "var(--gradient-gold, linear-gradient(135deg, #E0C36B 0%, #C9A84C 100%))",
              color: "hsl(var(--charcoal))",
            }}
          >
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>

        <ConnectedAccounts />

        {/* Quick links */}
        <div className="space-y-3">
          <Link to="/track" className={rowClass} style={{ borderColor: "#EDE8E1" }}>
            <span className="flex items-center gap-3 text-sm font-medium">
              <MapPin className="h-5 w-5 text-gold" /> Track Enquiry
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <details className="bg-white rounded-xl border" style={{ borderColor: "#EDE8E1" }}>
            <summary className={`${rowClass} list-none cursor-pointer`} style={{ borderColor: "#EDE8E1" }}>
              <span className="flex items-center gap-3 text-sm font-medium">
                <MessageCircle className="h-5 w-5 text-gold" /> My Enquiries
                {enquiries.length > 0 && (
                  <span className="text-xs text-muted-foreground">({enquiries.length})</span>
                )}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </summary>
            <div className="px-4 pb-3 divide-y" style={{ borderColor: "#EDE8E1" }}>
              {enquiries.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">
                  No enquiries yet. Tap 💛 I Love It on any product to enquire.
                </p>
              ) : (
                enquiries.slice(0, 10).map((e) => (
                  <div key={e.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{e.product_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {e.product_price != null && (
                      <span className="text-xs font-semibold text-gold shrink-0">
                        {formatINR(Number(e.product_price))}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </details>
        </div>

        {isStaff && (
          <>
            <Link
              to="/admin"
              onClick={(e) => {
                e.preventDefault();
                goAdmin();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-charcoal text-ivory text-sm font-medium hover:opacity-90"
            >
              <Shield className="h-4 w-4" /> Admin Panel →
            </Link>
            <Button
              variant="outline"
              onClick={goAdmin}
              className="w-full border-gold text-gold hover:bg-gold/10"
            >
              <Cog className="h-4 w-4 mr-2" /> Switch to Admin Mode
            </Button>
          </>
        )}

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
