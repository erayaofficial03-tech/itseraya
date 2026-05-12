import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Mail, Calendar, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Account = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/account", { replace: true });
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      setSigningOut(false);
      return;
    }
    toast.success("You've been signed out.");
    navigate("/", { replace: true });
  };

  if (loading || !user) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading your account…</p>
        </main>
        <Footer />
      </>
    );
  }

  const initials = user.email?.[0]?.toUpperCase() || "U";
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <span className="h-16 w-16 rounded-full bg-gold/20 text-charcoal text-xl font-semibold flex items-center justify-center">
            {initials}
          </span>
          <div>
            <h1 className="font-serif text-3xl">My Account</h1>
            <p className="text-sm text-muted-foreground">Welcome back to Eraya.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Profile details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email || "—"} />
            <Row icon={<Calendar className="h-4 w-4" />} label="Member since" value={joined} />
            <Row
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Role"
              value={isAdmin ? "Administrator" : "Customer"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Account actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/forgot-password">Reset password</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="outline" className="w-full sm:w-auto sm:ml-2">
                <Link to="/admin">Open admin dashboard</Link>
              </Button>
            )}
            <div className="pt-2">
              <Button onClick={handleSignOut} disabled={signingOut} variant="destructive" className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
};

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border last:border-0 pb-3 last:pb-0">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-sm font-medium text-foreground text-right break-all">{value}</span>
  </div>
);

export default Account;
