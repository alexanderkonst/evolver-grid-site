import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, CreditCard, Loader2, Check, Edit2, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
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
    const [isSaving, setIsSaving] = useState(false);

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
            .select("id, first_name, last_name")
            .eq("user_id", user.id)
            .maybeSingle();

        if (profileData) {
            setProfile(profileData);
            setEditFirstName(profileData.first_name || "");
            setEditLastName(profileData.last_name || "");
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

        setIsSaving(true);

        const { error } = await supabase
            .from("game_profiles")
            .update({
                first_name: editFirstName.trim() || null,
                last_name: editLastName.trim() || null,
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
        setIsEditing(false);
    };

    const handleManageSubscription = async () => {
        toast({
            title: "Coming Soon",
            description: "Subscription management will be available soon.",
        });
        // TODO: Implement Stripe Customer Portal integration
    };

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
            <div className="min-h-screen">
                <Navigation />
                <div className="pt-24 flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-3xl">
                    {/* Back link */}
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <BoldText>BACK</BoldText>
                    </button>

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
                                        <Button variant="outline" onClick={handleManageSubscription}>
                                            Manage Subscription
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
