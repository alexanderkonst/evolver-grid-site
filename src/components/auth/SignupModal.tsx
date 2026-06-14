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
import { useTranslation } from "react-i18next";
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
    title,
    description,
}: SignupModalProps) => {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t("signupModal.defaultTitle");
    const resolvedDescription = description ?? t("signupModal.defaultDescription");
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

            const displayName = firstName.trim() || t("signupModal.defaultName");
            toast({
                title: t("signupModal.signupSuccessTitle", { name: displayName }),
                description: t("signupModal.signupSuccessDescription"),
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
                title: t("signupModal.signupErrorTitle"),
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
                title: t("signupModal.loginSuccessTitle"),
                description: t("signupModal.loginSuccessDescription"),
            });

            onOpenChange(false);

            if (data.user && onSuccess) {
                onSuccess(data.user.id);
            }
        } catch (error: any) {
            toast({
                title: t("signupModal.loginErrorTitle"),
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center pb-2">
                    <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[#8460ea] to-[#29549f] flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-foreground">
                        {resolvedTitle}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {resolvedDescription}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="signup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="signup"
                            className="data-[state=active]:bg-background data-[state=active]:text-primary"
                        >
                            {t("signupModal.tabSignup")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="login"
                            className="data-[state=active]:bg-background data-[state=active]:text-primary"
                        >
                            {t("signupModal.tabLogin")}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signup" className="mt-4">
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="signup-firstname" className="text-foreground">{t("signupModal.firstNameLabel")}</Label>
                                    <Input
                                        id="signup-firstname"
                                        type="text"
                                        placeholder={t("signupModal.firstNamePlaceholder")}
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="bg-background/80"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="signup-lastname" className="text-foreground">{t("signupModal.lastNameLabel")}</Label>
                                    <Input
                                        id="signup-lastname"
                                        type="text"
                                        placeholder={t("signupModal.lastNamePlaceholder")}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="bg-background/80"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="signup-email" className="text-foreground">{t("signupModal.emailLabel")}</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder={t("signupModal.emailPlaceholder")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-background/80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="signup-password" className="text-foreground">{t("signupModal.passwordLabel")}</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-background/80"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t("signupModal.passwordHint")}
                                </p>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#8460ea] to-[#29549f] hover:opacity-90"
                                disabled={loading}
                            >
                                <User className="w-4 h-4 mr-2" />
                                {loading ? t("signupModal.signupButtonLoading") : t("signupModal.signupButton")}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="login" className="mt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="login-email" className="text-foreground">{t("signupModal.emailLabel")}</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder={t("signupModal.emailPlaceholder")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-background/80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="login-password" className="text-foreground">{t("signupModal.passwordLabel")}</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-background/80"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#8460ea] to-[#29549f] hover:opacity-90"
                                disabled={loading}
                            >
                                {loading ? t("signupModal.loginButtonLoading") : t("signupModal.loginButton")}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default SignupModal;
