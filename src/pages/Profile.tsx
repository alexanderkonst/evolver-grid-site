import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Loader2, Check, Edit2, X, AlertTriangle } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStripePortal } from "@/hooks/use-stripe-portal";

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

const Profile = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editLanguages, setEditLanguages] = useState<string[]>([]);
    const [customLanguage, setCustomLanguage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Stripe portal hook
    const { openPortal, isLoading: isPortalLoading } = useStripePortal();

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

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate("/auth?redirect=/profile");
            return;
        }

        setUser(user);

        // Fetch profile
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

        // Fetch purchases
        const { data: purchaseData } = await supabase
            .from("ai_boost_purchases")
            .select("id, created_at, source")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (purchaseData) {
            setPurchases(purchaseData);
        }

        setIsLoading(false);
    };

    const handleSaveProfile = async () => {
        if (!profile) return;

        const normalizedLanguages = editLanguages
            .map((language) => normalizeLanguage(language))
            .filter(Boolean)
            .filter((language, index, list) => list.findIndex((value) => normalizeKey(value) === normalizeKey(language)) === index);

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
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } else {
            setProfile({
                ...profile,
                first_name: editFirstName.trim() || null,
                last_name: editLastName.trim() || null,
                spoken_languages: normalizedLanguages,
            });
            setIsEditing(false);
            toast({
                title: "Profile updated",
                description: "Your changes have been saved.",
            });
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

    const normalizeLanguage = (value: string) => value.trim().replace(/\s+/g, " ");
    const normalizeKey = (value: string) => normalizeLanguage(value).toLowerCase();

    const toggleLanguage = (language: string) => {
        setEditLanguages((prev) => {
            const exists = prev.some((item) => normalizeKey(item) === normalizeKey(language));
            if (exists) {
                return prev.filter((item) => normalizeKey(item) !== normalizeKey(language));
            }
            return [...prev, language];
        });
    };

    const addCustomLanguage = () => {
        const normalized = normalizeLanguage(customLanguage);
        if (!normalized) return;
        setEditLanguages((prev) => {
            const exists = prev.some((item) => normalizeKey(item) === normalizeKey(normalized));
            if (exists) return prev;
            return [...prev, normalized];
        });
        setCustomLanguage("");
    };

    const removeLanguage = (language: string) => {
        setEditLanguages((prev) => prev.filter((item) => normalizeKey(item) !== normalizeKey(language)));
    };

    const customLanguages = editLanguages.filter(
        (language) => !COMMON_LANGUAGES.some((common) => normalizeKey(common) === normalizeKey(language))
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatPurchaseSource = (source: string | null) => {
        if (!source) return "Unknown";
        switch (source) {
            case "stripe_checkout":
                return "Stripe Checkout";
            case "promo_code":
                return "Promo Code";
            default:
                return source;
        }
    };

    if (isLoading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="min-h-dvh bg-gradient-to-br from-[#e7e9e5] via-[#dcdde2] to-[#e7e9e5]">
                <div className="container mx-auto max-w-3xl px-4 py-6">

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">
                            <BoldText>PROFILE</BoldText>
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your account settings and subscriptions
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Personal Info Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <CardTitle>Personal Information</CardTitle>
                                            <CardDescription>Your basic account details</CardDescription>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
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
                                                <Input
                                                    id="firstName"
                                                    value={editFirstName}
                                                    onChange={(e) => setEditFirstName(e.target.value)}
                                                    placeholder="Jane"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={editLastName}
                                                    onChange={(e) => setEditLastName(e.target.value)}
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={user?.email || ""} disabled className="bg-muted" />
                                            <p className="text-xs text-muted-foreground">
                                                Email cannot be changed
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Languages</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMON_LANGUAGES.map((language) => {
                                                    const isSelected = editLanguages.some(
                                                        (item) => normalizeKey(item) === normalizeKey(language)
                                                    );
                                                    return (
                                                        <button
                                                            key={language}
                                                            type="button"
                                                            onClick={() => toggleLanguage(language)}
                                                            className={`rounded-full border px-3 py-1 text-sm transition ${isSelected
                                                                    ? "border-amber-300 bg-amber-50 text-amber-900"
                                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
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
                                                    {customLanguages.map((language) => (
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
                                                    onChange={(e) => setCustomLanguage(e.target.value)}
                                                    placeholder="Add a language"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            addCustomLanguage();
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" onClick={addCustomLanguage}>
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button onClick={handleSaveProfile} disabled={isSaving}>
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="ghost" onClick={handleCancelEdit}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">First Name</p>
                                                <p className="font-medium">{profile?.first_name || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Last Name</p>
                                                <p className="font-medium">{profile?.last_name || "—"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium">{user?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Languages</p>
                                            {profile?.spoken_languages && profile.spoken_languages.length > 0 ? (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {profile.spoken_languages.map((language) => (
                                                        <Badge key={language} variant="secondary">
                                                            {language}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="font-medium">—</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Billing Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <CardTitle>Billing & Purchases</CardTitle>
                                        <CardDescription>
                                            Your purchase history and subscription management
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Purchases List */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-3">Purchase History</h4>
                                        {purchases.length > 0 ? (
                                            <div className="space-y-2">
                                                {purchases.map((purchase) => (
                                                    <div
                                                        key={purchase.id}
                                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-sm">AI Intelligence Boost</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                via {formatPurchaseSource(purchase.source)}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDate(purchase.created_at)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground py-4 text-center">
                                                No purchases yet
                                            </p>
                                        )}
                                    </div>

                                    {/* Subscription Management */}
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-3">Subscription Management</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Manage your active subscriptions, update payment methods, or cancel.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={openPortal}
                                            disabled={isPortalLoading}
                                        >
                                            {isPortalLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Opening...
                                                </>
                                            ) : (
                                                "Manage Subscription"
                                            )}
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
                                        <CardTitle className="text-red-900">Danger Zone</CardTitle>
                                        <CardDescription className="text-red-700">
                                            Irreversible actions regarding your account data
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
                                                // 1. Reset profile stats
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
                                                        total_quests_completed: 0
                                                    })
                                                    .eq('id', profile.id);

                                                if (profileError) throw profileError;

                                                // 2. Delete player upgrades (if permissions allow)
                                                // interactive error handling if table doesn't exist or blocks delete
                                                const { error: upgradeError } = await supabase
                                                    .from('player_upgrades')
                                                    .delete()
                                                    .eq('profile_id', profile.id);


                                                // 3. Clear vector progress (for growth paths)
                                                const { error: vectorError } = await supabase
                                                    .from('vector_progress')
                                                    .delete()
                                                    .eq('profile_id', profile.id);


                                                toast({
                                                    title: "Progress Reset",
                                                    description: "Your journey has been restarted.",
                                                });

                                                // Navigate home to restart onboarding
                                                navigate('/game');
                                            } catch (error) {
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
                </div>
            </div>
        </GameShellV2>
    );
};

export default Profile;
