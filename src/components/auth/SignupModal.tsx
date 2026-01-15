import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { migrateGuestDataToProfile } from "@/modules/zone-of-genius/saveToDatabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Sparkles } from "lucide-react";

interface SignupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (userId: string) => void;
    title?: string;
    description?: string;
}

/**
 * SignupModal - Reusable auth modal for signup/login
 * Triggers on guest actions like "Save to My Profile"
 */
const SignupModal = ({
    open,
    onOpenChange,
    onSuccess,
    title = "Save Your Genius",
    description = "Create an account to save your Zone of Genius and unlock your profile",
}: SignupModalProps) => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Get referral ID from URL or localStorage
    const getInviterId = (): string | null => {
        const refParam = searchParams.get("ref");
        if (refParam) {
            // Store in localStorage for persistence
            localStorage.setItem("inviter_id", refParam);
            return refParam;
        }
        return localStorage.getItem("inviter_id");
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const inviterId = getInviterId();

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/game`,
                    data: {
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        inviter_id: inviterId,
                    },
                },
            });

            if (error) throw error;

            const displayName = firstName.trim() || "Friend";
            toast({
                title: `Welcome, ${displayName}!`,
                description: "Your genius is now saved forever.",
            });

            // Migrate any guest data from localStorage to database (silent)
            await migrateGuestDataToProfile();

            onOpenChange(false);

            // Call onSuccess with user ID
            if (data.user && onSuccess) {
                onSuccess(data.user.id);
            }
        } catch (error: any) {
            toast({
                title: "Sign up failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast({
                title: "Welcome back!",
                description: "Your genius awaits",
            });

            onOpenChange(false);

            if (data.user && onSuccess) {
                onSuccess(data.user.id);
            }
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] border-[#a4a3d0]/30">
                <DialogHeader className="text-center pb-2">
                    <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[#8460ea] to-[#29549f] flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-[#2c3150]">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-[#a4a3d0]">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="signup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[#a4a3d0]/20">
                        <TabsTrigger
                            value="signup"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#8460ea]"
                        >
                            Sign Up
                        </TabsTrigger>
                        <TabsTrigger
                            value="login"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#8460ea]"
                        >
                            Log In
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signup" className="mt-4">
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="signup-firstname" className="text-[#2c3150]">First Name</Label>
                                    <Input
                                        id="signup-firstname"
                                        type="text"
                                        placeholder="Jane"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="bg-white/80"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="signup-lastname" className="text-[#2c3150]">Last Name</Label>
                                    <Input
                                        id="signup-lastname"
                                        type="text"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="bg-white/80"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="signup-email" className="text-[#2c3150]">Email</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="signup-password" className="text-[#2c3150]">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-white/80"
                                />
                                <p className="text-xs text-[#a4a3d0]">
                                    At least 6 characters
                                </p>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#8460ea] to-[#29549f] hover:opacity-90"
                                disabled={loading}
                            >
                                <User className="w-4 h-4 mr-2" />
                                {loading ? "Creating..." : "Create Account & Save"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="login" className="mt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="login-email" className="text-[#2c3150]">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="login-password" className="text-[#2c3150]">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/80"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#8460ea] to-[#29549f] hover:opacity-90"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Log In & Save"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default SignupModal;
