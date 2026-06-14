import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, Lock } from "lucide-react";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        // Supabase automatically handles the recovery token from the URL
        // We just need to wait for the session to be established
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSessionReady(true);
            }
        };

        // Listen for auth state changes (recovery link sets up a session)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                setSessionReady(true);
            }
        });

        checkSession();

        return () => subscription.unsubscribe();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: t('resetPassword.toastMismatchTitle'),
                description: t('resetPassword.toastMismatchDescription'),
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: t('resetPassword.toastTooShortTitle'),
                description: t('resetPassword.toastTooShortDescription'),
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setSuccess(true);
            toast({
                title: t('resetPassword.toastSuccessTitle'),
                description: t('resetPassword.toastSuccessDescription'),
            });

            // Redirect to game after a short delay
            setTimeout(() => navigate("/game"), 2000);
        } catch (error: any) {
            toast({
                title: "Failed to reset password",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-dvh flex flex-col bg-background">
                <Navigation />
                <main className="flex-grow flex items-center justify-center px-4 py-24">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">{t('resetPassword.successCardTitle')}</CardTitle>
                            <CardDescription>
                                {t('resetPassword.successCardDescription')}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-dvh flex flex-col bg-background">
            <Navigation />
            <main className="flex-grow flex items-center justify-center px-4 py-24">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{t('resetPassword.formCardTitle')}</CardTitle>
                        <CardDescription>
                            {sessionReady
                                ? t('resetPassword.formCardDescriptionReady')
                                : t('resetPassword.formCardDescriptionVerifying')
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sessionReady ? (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">{t('resetPassword.newPasswordLabel')}</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">{t('resetPassword.confirmPasswordLabel')}</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('resetPassword.passwordHint')}
                                </p>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? t('resetPassword.submitLoading') : t('resetPassword.submit')}
                                </Button>
                            </form>
                        ) : (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default ResetPassword;
