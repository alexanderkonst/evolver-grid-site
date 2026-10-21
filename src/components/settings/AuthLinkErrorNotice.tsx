import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { localizedOrigin } from "@/i18n/localeScope";
import { parseAuthLinkError, type AuthLinkError } from "@/lib/authLinkError";

/**
 * AuthLinkErrorNotice — shown at the top of /game/settings when an email link
 * lands here with an error in the URL fragment
 * (`#error=access_denied&error_code=otp_expired`). Before this, the page
 * rendered only the guest stub and the user had no idea the link had failed.
 *
 * Expired links get a "Resend confirmation email" action. If the visitor is
 * already signed in we never touch their session (the client skips URL
 * session detection for error links — see integrations/supabase/client.ts).
 */
const AuthLinkErrorNotice = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [linkError, setLinkError] = useState<AuthLinkError | null>(() =>
        typeof window === "undefined"
            ? null
            : parseAuthLinkError(window.location.hash) ?? parseAuthLinkError(window.location.search),
    );
    const [sessionEmail, setSessionEmail] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // Drop the error params from the address bar so a reload doesn't replay
    // the notice (the parsed error lives in state).
    useEffect(() => {
        if (!linkError || typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        ["error", "error_code", "error_description"].forEach((key) => params.delete(key));
        const search = params.toString();
        window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}${search ? `?${search}` : ""}`,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!linkError) return;
        supabase.auth
            .getSession()
            .then(({ data }) => setSessionEmail(data.session?.user?.email ?? null))
            .catch(() => setSessionEmail(null));
    }, [linkError]);

    if (!linkError) return null;

    const targetEmail = (sessionEmail ?? email).trim();

    const handleResend = async () => {
        if (!targetEmail) {
            toast({
                title: t("auth.emailRequiredTitle"),
                description: t("auth.emailRequiredDesc"),
                variant: "destructive",
            });
            return;
        }
        setSending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: targetEmail,
                options: { emailRedirectTo: `${localizedOrigin()}/game/settings` },
            });
            if (error) throw error;
            setSent(true);
            toast({
                title: t("authLinkError.resentTitle"),
                description: t("authLinkError.resentDescription", { email: targetEmail }),
            });
        } catch (err) {
            toast({
                title: t("authLinkError.resendFailedTitle"),
                description: err instanceof Error ? err.message : t("auth.tryAgain"),
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            role="alert"
            className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
        >
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" aria-hidden="true" />
                <div className="min-w-0 flex-1 space-y-3">
                    <div>
                        <h2
                            className="text-xl leading-tight"
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                        >
                            {linkError.expired ? t("authLinkError.expiredTitle") : t("authLinkError.failedTitle")}
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed">
                            {linkError.expired
                                ? t("authLinkError.expiredDescription")
                                : linkError.description || t("authLinkError.failedDescription")}
                        </p>
                        {sessionEmail && (
                            <p className="mt-1 text-sm leading-relaxed">
                                {t("authLinkError.stillSignedIn", { email: sessionEmail })}
                            </p>
                        )}
                    </div>

                    {sent ? (
                        <p className="text-sm font-medium">
                            {t("authLinkError.resentDescription", { email: targetEmail })}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {!sessionEmail && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="auth-link-resend-email">{t("authLinkError.emailLabel")}</Label>
                                    <Input
                                        id="auth-link-resend-email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t("authLinkError.emailPlaceholder")}
                                        className="bg-white"
                                    />
                                </div>
                            )}
                            <Button type="button" onClick={handleResend} disabled={sending || !targetEmail}>
                                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                                {sending ? t("authLinkError.resending") : t("authLinkError.resendButton")}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthLinkErrorNotice;
