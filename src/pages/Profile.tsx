import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, LogOut, Heart, MessageCircle, Shield, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/queries";

const Profile = () => {
  const { user, profile, isStaff, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

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
    navigate("/", { replace: true });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const meta = (user.user_metadata as any) || {};
  const displayName = profile?.full_name || meta.full_name || meta.name || "Welcome";
  const avatar = profile?.avatar_url || meta.avatar_url || meta.picture;
  const initials = (displayName || user.email || "U").slice(0, 2).toUpperCase();

  const rowClass =
    "flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl border text-left active:bg-muted/30 transition";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-5 py-6 pb-24 lg:pb-10 max-w-xl mx-auto w-full space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border p-6 flex flex-col items-center text-center" style={{ borderColor: "#EDE8E1" }}>
          <Avatar className="h-20 w-20 border-2 border-gold mb-3">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className="bg-charcoal text-ivory text-lg">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="font-serif text-xl text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <Link to="/wishlist" className={rowClass} style={{ borderColor: "#EDE8E1" }}>
            <span className="flex items-center gap-3 text-sm font-medium">
              <Heart className="h-5 w-5 text-gold" /> My Wishlist
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
                <p className="text-xs text-muted-foreground py-3">No enquiries yet.</p>
              ) : (
                enquiries.map((e) => (
                  <div key={e.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{e.product_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString()}
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
          <Link
            to="/admin"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-charcoal text-ivory text-sm font-medium hover:opacity-90"
          >
            <Shield className="h-4 w-4" />
            Admin Panel →
          </Link>
        )}

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
