import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

/**
 * MeGate — entry guard for /game/me.
 *
 * Auth = render the children inside the standard shell.
 * Anonymous = render the shell, but replace pane 3 with a small card
 * that explains, in plain language, why we need an email + password:
 * without them, the next time the user opens the site we can't find
 * their profile and the data is gone. No "create account", no
 * "sign up", no jargon. Just the consequence stated as fact.
 *
 * On success the existing anonymous profile (localStorage
 * `game_profile_id`) is attached to the new user via
 * getOrCreateGameProfileId() — no data lost.
 */
const MeGate = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) setStatus(session ? "authed" : "guest");
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
            if (mounted) setStatus(session ? "authed" : "guest");
        });
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a1a]">
                <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (status === "authed") return <>{children}</>;

    return (
        <GameShellV2>
            <SaveProfileCard
                onSuccess={async () => {
                    // Attach anonymous profile to new user
                    try {
                        await getOrCreateGameProfileId();
                    } catch {
                        // non-fatal — shell will reload profile via auth listener
                    }
                    // Stay on the route they were trying to reach
                    navigate(location.pathname + location.search, { replace: true });
                }}
            />
        </GameShellV2>
    );
};

const SaveProfileCard = ({ onSuccess }: { onSuccess: () => void }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/game/me`,
                    data: { first_name: firstName.trim() || null },
                },
            });
            if (error) throw error;
            // Edge case: signup with an already-registered email returns no
            // error but a fake user with empty identities[] and no session.
            // Tell the user plainly and switch them toward the return tab.
            const identities = (data.user as any)?.identities;
            if (data.user && Array.isArray(identities) && identities.length === 0) {
                toast({
                    title: "Looks like you've been here before",
                    description: "Use the 'Coming back' tab with your password to open your profile.",
                });
                return;
            }
            if (!data.session) {
                toast({
                    title: "Almost there",
                    description: "Check your email for a confirmation link, then come back.",
                });
                return;
            }
            toast({
                title: "Saved.",
                description: "Your profile is now yours to come back to.",
            });
            onSuccess();
        } catch (err: any) {
            toast({
                title: "Couldn't save",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (error) throw error;
            toast({ title: "Welcome back." });
            onSuccess();
        } catch (err: any) {
            toast({
                title: "Couldn't open your profile",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-xl mx-auto">
            <div className="rounded-2xl liquid-glass ring-1 ring-white/10 p-6 sm:p-8">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-[#8460ea]/15 flex items-center justify-center ring-1 ring-white/10 mb-4">
                        <Sparkles className="w-7 h-7 text-[#8460ea]" />
                    </div>
                    <h1 className="text-xl font-semibold text-white mb-2">
                        Save your profile so it's here when you come back
                    </h1>
                    <p className="text-sm text-white/60 leading-relaxed">
                        Right now your result lives only on this device. Give us
                        an email and a password — that's how we know it's you next
                        time. Without them, the next visit starts from zero.
                    </p>
                </div>

                <Tabs defaultValue="save" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5">
                        <TabsTrigger value="save" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                            First time
                        </TabsTrigger>
                        <TabsTrigger value="return" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                            Coming back
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="save" className="mt-5">
                        <form onSubmit={handleSave} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="me-firstname" className="text-white/70 text-xs">Your name</Label>
                                <Input
                                    id="me-firstname"
                                    type="text"
                                    placeholder="What should we call you?"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="me-email" className="text-white/70 text-xs">Email</Label>
                                <Input
                                    id="me-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="me-password" className="text-white/70 text-xs">A password (so only you can open it)</Label>
                                <Input
                                    id="me-password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 text-white"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(135deg, #a06d08 0%, #7a5108 45%, #6b4208 100%)",
                                }}
                            >
                                {loading ? "Saving…" : "Save my profile"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="return" className="mt-5">
                        <form onSubmit={handleReturn} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="me-email-r" className="text-white/70 text-xs">Email</Label>
                                <Input
                                    id="me-email-r"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="me-password-r" className="text-white/70 text-xs">Password</Label>
                                <Input
                                    id="me-password-r"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 text-white"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(135deg, #a06d08 0%, #7a5108 45%, #6b4208 100%)",
                                }}
                            >
                                {loading ? "Opening…" : "Open my profile"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default MeGate;
