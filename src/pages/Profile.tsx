import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";

const Profile = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated.");
  };

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

  const initials = (fullName || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-10 pb-24 lg:pb-10 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16 border-2 border-gold">
            <AvatarImage src={avatarUrl || undefined} alt={fullName} />
            <AvatarFallback className="bg-charcoal text-ivory">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl text-foreground truncate">{fullName || "Your profile"}</h1>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </form>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full mt-8 border-foreground/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
