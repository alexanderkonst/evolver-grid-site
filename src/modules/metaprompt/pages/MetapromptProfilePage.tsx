import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useMetapromptAuth as useAuth } from "../hooks/useMetapromptAuth";
import BokehBackground from "../components/BokehBackground";
import { ArrowLeft, LogOut } from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/codex/auth");
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    const { data } = await (supabase as any)
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user!.id)
      .single();

    if (data) {
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user!.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!", duration: 2000 });
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/codex");
  };

  if (authLoading) return null;

  return (
    <>
      <BokehBackground />
      <main
        className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-8"
        style={{ background: "var(--gradient-bg)" }}
      >
        <Card
          className="w-full max-w-sm backdrop-blur-2xl border border-border/30 p-6 sm:p-8"
          style={{
            boxShadow: "var(--shadow-card)",
            background: "hsl(var(--card) / 0.7)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate("/codex")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-light tracking-tight text-foreground">Profile</h1>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Avatar URL</label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </main>
    </>
  );
};

export default Profile;
