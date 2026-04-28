import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Check, Edit2, X, AlertTriangle, ArrowRight } from "lucide-react";
// Day 53 night iter 4 (Sasha 2026-04-27): entitlement tier surfacing.
// `SettingsTierBadge` (defined below) wraps `EntitlementBadge` to handle
// the "no tier yet / tasting" case with a friendly placeholder rather
// than blank space, since Settings is one of the few places where users
// expect to see SOMETHING in the field.
import { EntitlementBadge } from "@/components/EntitlementBadge";
import { useEntitlement, tierLabel } from "@/hooks/useEntitlement";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStripePortal } from "@/hooks/use-stripe-portal";
// Day 48 iter 12 (Sasha): shared design language for the landing-CTA
// signature (glass-dark pill + ignite emblem + small-caps + breath).
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";

/**
 * ProfileSettingsSection — extracted from src/pages/Profile.tsx (2026-04-21).
 *
 * Pure content component (no GameShellV2 wrapper, no page header). Renders
 * three cards:
 *   1. Personal Information — name + languages + email (read-only)
 *   2. Billing & Purchases — purchase history + Stripe portal
 *   3. Danger Zone — progress reset
 *
 * Used by the main Settings page at /game/settings (under the Profile tab).
 * Replaces the "Profile Settings" deep link that used to live inside ME.
 */

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    spoken_languages: string[] | null;
}

interface Purchase {
    id: string;
    created_at: string;
    source: string | null;
}

const COMMON_LANGUAGES = [
    "English",
    "Russian",
    "Spanish",
    "German",
    "French",
    "Chinese",
    "Portuguese",
    "Japanese",
    "Korean",
    "Arabic",
];

const ProfileSettingsSection = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    const [isEditing, setIsEditing] = useState(false);
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editLanguages, setEditLanguages] = useState<string[]>([]);
    const [customLanguage, setCustomLanguage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const { openPortal, isLoading: isPortalLoading } = useStripePortal();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // Day 48 (Sasha): guests can land on /game/settings (e.g. via
            // the rail Settings button). Don't kick them to /auth — just
            // render the guest state. The Appearance tab still works for
            // them; Profile tab shows a "Log in to manage" stub.
            setUser(null);
            setIsLoading(false);
            return;
        }
        setUser(user);
        const { data: profileData } = await supabase
            .from("game_profiles")
            .select("id, first_name, last_name, spoken_languages")
            .eq("user_id", user.id)
            .maybeSingle();
        if (profileData) {
            setProfile(profileData);
            setEditFirstName(profileData.first_name || "");
            setEditLastName(profileData.last_name || "");
            setEditLanguages(Array.isArray(profileData.spoken_languages) ? profileData.spoken_languages : []);
        }
        const { data: purchaseData } = await supabase
            .from("ai_boost_purchases")
            .select("id, created_at, source")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        if (purchaseData) setPurchases(purchaseData);
        setIsLoading(false);
    };

    const normalizeLanguage = (value: string) => value.trim().replace(/\s+/g, " ");
    const normalizeKey = (value: string) => normalizeLanguage(value).toLowerCase();

    const handleSaveProfile = async () => {
        if (!profile) return;
        const normalizedLanguages = editLanguages
            .map(normalizeLanguage)
            .filter(Boolean)
            .filter((l, i, list) => list.findIndex(v => normalizeKey(v) === normalizeKey(l)) === i);
        setIsSaving(true);
        const { error } = await supabase
            .from("game_profiles")
            .update({
                first_name: editFirstName.trim() || null,
                last_name: editLastName.trim() || null,
                spoken_languages: normalizedLanguages,
            })
            .eq("id", profile.id);
        if (error) {
            toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
        } else {
            setProfile({
                ...profile,
                first_name: editFirstName.trim() || null,
                last_name: editLastName.trim() || null,
                spoken_languages: normalizedLanguages,
            });
            setIsEditing(false);
            toast({ title: "Profile updated", description: "Your changes have been saved." });
        }
        setIsSaving(false);
    };

    const handleCancelEdit = () => {
        setEditFirstName(profile?.first_name || "");
        setEditLastName(profile?.last_name || "");
        setEditLanguages(Array.isArray(profile?.spoken_languages) ? profile?.spoken_languages : []);
        setCustomLanguage("");
        setIsEditing(false);
    };

    const toggleLanguage = (language: string) => {
        setEditLanguages(prev => {
            const exists = prev.some(item => normalizeKey(item) === normalizeKey(language));
            return exists ? prev.filter(item => normalizeKey(item) !== normalizeKey(language)) : [...prev, language];
        });
    };

    const addCustomLanguage = () => {
        const normalized = normalizeLanguage(customLanguage);
        if (!normalized) return;
        setEditLanguages(prev => {
            const exists = prev.some(item => normalizeKey(item) === normalizeKey(normalized));
            if (exists) return prev;
            return [...prev, normalized];
        });
        setCustomLanguage("");
    };

    const removeLanguage = (language: string) => {
        setEditLanguages(prev => prev.filter(item => normalizeKey(item) !== normalizeKey(language)));
    };

    const customLanguages = editLanguages.filter(
        l => !COMMON_LANGUAGES.some(common => normalizeKey(common) === normalizeKey(l))
    );

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const formatPurchaseSource = (source: string | null) => {
        if (!source) return "Unknown";
        switch (source) {
            case "stripe_checkout": return "Stripe Checkout";
            case "promo_code": return "Promo Code";
            default: return source;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <PremiumLoader size="lg" />
            </div>
        );
    }

    // Day 48 (Sasha): guest state — Settings is public; the Profile tab
    // shows a short "log in" prompt instead of redirecting the visitor.
    //
    // Day 48 iter 12 (Sasha): the default shadcn Button was rendering as
    // a white-on-white pill with invisible label (Aurora token stack
    // + card bg collision). Replaced with the landing primary CTA —
    // glass-dark pill + ignite emblem + small-caps + breath. Now reads
    // as a real call to action that rhymes with every other CTA.
    // Title + description also shifted to Cormorant Garamond so the
    // guest state feels like part of the same book as the landing.
    if (!user) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <CardTitle
                                    className="text-xl"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                    }}
                                >
                                    Profile
                                </CardTitle>
                                <CardDescription
                                    className="mt-1 text-base"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 400,
                                        fontStyle: "italic",
                                    }}
                                >
                                    You're browsing as a guest. Log in to manage your personal information, review purchases, and reset your progress.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <button
                            type="button"
                            onClick={() => navigate("/auth?redirect=/game/settings")}
                            className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2.5 px-6 py-3 whitespace-nowrap text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                                backgroundImage:
                                    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                                boxShadow:
                                    "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                            }}
                        >
                            <img
                                src={igniteLogo}
                                alt=""
                                aria-hidden="true"
                                className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
                                style={{ filter: "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))" }}
                                draggable={false}
                            />
                            <span style={CTA_SMALL_CAPS_STYLE}>Log in or sign up</span>
                            <ArrowRight aria-hidden="true" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Personal Info — shadcn Card uses bg-card/text-foreground which
                respect the skin via the [data-skin="navy-gold"] mirror of the
                dark palette. No more hardcoded Aurora tints. */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <CardTitle
                                    className="text-xl"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                    }}
                                >
                                    Personal Information
                                </CardTitle>
                                <CardDescription
                                    className="text-base mt-0.5"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 400,
                                        fontStyle: "italic",
                                    }}
                                >
                                    Your basic account details.
                                </CardDescription>
                            </div>
                        </div>
                        {!isEditing && (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                <Edit2 className="h-4 w-4 mr-1" />Edit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} placeholder="Jane" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" value={editLastName} onChange={e => setEditLastName(e.target.value)} placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={user?.email || ""} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>
                            {/* Day 53 night iter 4 (Sasha 2026-04-27): tier
                                badge surfaces here so the user always knows
                                what plan they're on without checking Stripe.
                                Silent on default 'tasting' (most users see
                                nothing). For gifted_* tiers, shows
                                "✦ Gifted Builder · gifted by Sasha". */}
                            <div className="space-y-2">
                                <Label>Account tier</Label>
                                <div className="rounded-md border bg-muted px-3 py-2.5">
                                    <SettingsTierBadge />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label>Languages</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_LANGUAGES.map(language => {
                                        const isSelected = editLanguages.some(item => normalizeKey(item) === normalizeKey(language));
                                        return (
                                            <button
                                                key={language}
                                                type="button"
                                                onClick={() => toggleLanguage(language)}
                                                className={`rounded-full border px-3 py-1 text-sm transition ${isSelected
                                                    ? "border-amber-300 bg-amber-50 text-amber-900"
                                                    : "border-border bg-background text-muted-foreground hover:border-border/60"
                                                    }`}
                                                aria-pressed={isSelected}
                                            >
                                                {language}
                                            </button>
                                        );
                                    })}
                                </div>
                                {customLanguages.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {customLanguages.map(language => (
                                            <Badge key={language} variant="secondary" className="gap-2">
                                                <span>{language}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLanguage(language)}
                                                    className="text-xs text-muted-foreground hover:text-foreground"
                                                    aria-label={`Remove ${language}`}
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Input
                                        value={customLanguage}
                                        onChange={e => setCustomLanguage(e.target.value)}
                                        placeholder="Add a language"
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCustomLanguage();
                                            }
                                        }}
                                    />
                                    <Button type="button" variant="outline" onClick={addCustomLanguage}>Add</Button>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving ? (
                                        <><span className="premium-spinner h-4 w-4 mr-2" />Saving...</>
                                    ) : (
                                        <><Check className="h-4 w-4 mr-2" />Save Changes</>
                                    )}
                                </Button>
                                <Button variant="ghost" onClick={handleCancelEdit}>
                                    <X className="h-4 w-4 mr-2" />Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">First Name</p>
                                    <p className="font-medium text-foreground">{profile?.first_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Name</p>
                                    <p className="font-medium text-foreground">{profile?.last_name || "—"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium text-foreground">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Languages</p>
                                {profile?.spoken_languages && profile.spoken_languages.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {profile.spoken_languages.map(language => (
                                            <Badge key={language} variant="secondary">{language}</Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="font-medium text-foreground">—</p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Billing */}
            <Card className="">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <CardTitle
                                className="text-xl text-foreground"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                }}
                            >
                                Billing & Purchases
                            </CardTitle>
                            <CardDescription
                                className="text-base text-muted-foreground mt-0.5"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 400,
                                    fontStyle: "italic",
                                }}
                            >
                                Your purchase history and subscription management.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium mb-3 text-foreground">Purchase History</h4>
                            {purchases.length > 0 ? (
                                <div className="space-y-2">
                                    {purchases.map(purchase => (
                                        <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm text-foreground">AI Intelligence Boost</p>
                                                <p className="text-xs text-muted-foreground">via {formatPurchaseSource(purchase.source)}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{formatDate(purchase.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground py-4 text-center">No purchases yet</p>
                            )}
                        </div>
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium mb-3 text-foreground">Subscription Management</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Manage your active subscriptions, update payment methods, or cancel.
                            </p>
                            <Button variant="outline" onClick={openPortal} disabled={isPortalLoading}>
                                {isPortalLoading ? (
                                    <><span className="premium-spinner h-4 w-4 mr-2" />Opening...</>
                                ) : "Manage Subscription"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                            <CardTitle
                                className="text-xl text-red-900"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                }}
                            >
                                Danger Zone
                            </CardTitle>
                            <CardDescription
                                className="text-base text-red-700 mt-0.5"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 400,
                                    fontStyle: "italic",
                                }}
                            >
                                Irreversible actions regarding your account data.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-red-900">Reset Progress</p>
                            <p className="text-sm text-red-700">
                                Wipe all game progress (XP, levels, snapshots) and start over.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!profile || !confirm("Are you sure? This will wipe ALL your progress, XP, and unlocked upgrades. This cannot be undone.")) return;
                                setIsLoading(true);
                                try {
                                    const { error: profileError } = await supabase
                                        .from('game_profiles')
                                        .update({
                                            last_zog_snapshot_id: null,
                                            last_qol_snapshot_id: null,
                                            xp_total: 0,
                                            level: 1,
                                            current_streak_days: 0,
                                            longest_streak_days: 0,
                                            xp_body: 0,
                                            xp_mind: 0,
                                            xp_emotions: 0,
                                            xp_spirit: 0,
                                            xp_uniqueness: 0,
                                            practice_count: 0,
                                            zone_of_genius_completed: false,
                                            total_quests_completed: 0,
                                            onboarding_completed: false,
                                            onboarding_step: 0
                                        })
                                        .eq('id', profile.id);
                                    if (profileError) throw profileError;
                                    await supabase.from('player_upgrades').delete().eq('profile_id', profile.id);
                                    await supabase.from('vector_progress').delete().eq('profile_id', profile.id);
                                    toast({ title: "Progress Reset", description: "Your journey has been restarted." });
                                    navigate('/');
                                } catch {
                                    toast({
                                        title: "Error",
                                        description: "Failed to reset progress. Please try again.",
                                        variant: "destructive",
                                    });
                                    setIsLoading(false);
                                }
                            }}
                        >
                            Reset My Progress
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * SettingsTierBadge — wraps `EntitlementBadge` for the Settings surface.
 *
 * `EntitlementBadge` is intentionally silent on `tasting` (default tier)
 * across most surfaces — most users see nothing, only paid/gifted users
 * see their tier. But Settings is the one place where users expect a
 * concrete answer: this card asks "what tier am I on?" and a blank
 * answer is confusing. So this wrapper renders a friendly placeholder
 * for the Tasting case while delegating the rest to EntitlementBadge.
 */
function SettingsTierBadge() {
    const { tier, isLoading } = useEntitlement();
    if (isLoading) {
        return <span className="text-xs text-muted-foreground">Loading…</span>;
    }
    if (tier === "tasting") {
        return (
            <span className="inline-flex items-baseline gap-2 text-sm">
                <span className="font-medium text-foreground">{tierLabel(tier)}</span>
                <span className="text-xs italic text-muted-foreground">
                    Free trial · upgrade for save + publish
                </span>
            </span>
        );
    }
    return <EntitlementBadge tier={tier} showOnTasting />;
}

export default ProfileSettingsSection;
