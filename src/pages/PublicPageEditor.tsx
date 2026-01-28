import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ExternalLink, Palette } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PRESET_COLORS = [
    "#4F46E5", // Indigo
    "#0EA5E9", // Sky Blue  
    "#10B981", // Emerald
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
    "#EF4444", // Red
    "#06B6D4", // Cyan
];

const STORAGE_KEY = "evolver_public_page";

interface PublicPageData {
    displayName: string;
    title: string;
    bio: string;
    brandColor: string;
    slug: string;
    isPublic: boolean;
}

const PublicPageEditor = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState("");
    const [title, setTitle] = useState("");
    const [bio, setBio] = useState("");
    const [brandColor, setBrandColor] = useState("#4F46E5");
    const [slug, setSlug] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }

            // Load from localStorage (DB persistence coming later)
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data: PublicPageData = JSON.parse(stored);
                setDisplayName(data.displayName || "");
                setTitle(data.title || "");
                setBio(data.bio || "");
                setBrandColor(data.brandColor || "#4F46E5");
                setSlug(data.slug || "");
                setIsPublic(data.isPublic || false);
            } else {
                // Default to email prefix
                setDisplayName(user.email?.split("@")[0] || "");
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 40);
    };

    const handleDisplayNameChange = (value: string) => {
        setDisplayName(value);
        if (!slug) {
            setSlug(generateSlug(value));
        }
    };

    const handleSave = () => {
        if (!displayName.trim()) {
            toast({
                title: "Display name required",
                description: "Please enter a name for your public page.",
                variant: "destructive"
            });
            return;
        }

        if (!slug.trim()) {
            toast({
                title: "URL slug required",
                description: "Please enter a URL for your public page.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            // Save to localStorage
            const data: PublicPageData = {
                displayName,
                title,
                bio,
                brandColor,
                slug,
                isPublic,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            toast({
                title: "Saved!",
                description: isPublic
                    ? `Your page settings are saved. (Note: DB persistence coming soon)`
                    : "Your page settings have been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not save your page. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <PremiumLoader size="lg" />
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="p-4 lg:p-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Your Public Page</h1>
                    <p className="text-[rgba(44,49,80,0.7)]">
                        Customize how you appear to others and manage your creator storefront.
                    </p>
                </div>

                {/* Preview Banner */}
                <div
                    className="h-24 rounded-t-xl mb-4"
                    style={{ backgroundColor: brandColor }}
                />

                {/* Form */}
                <div className="space-y-6">
                    {/* Display Name */}
                    <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => handleDisplayNameChange(e.target.value)}
                            placeholder="Your name"
                            className="mt-1"
                        />
                    </div>

                    {/* Title / Role */}
                    <div>
                        <Label htmlFor="title">Title / Role</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Integral Coach, Transformation Guide..."
                            className="mt-1"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell people about yourself and what you offer..."
                            rows={3}
                            className="mt-1"
                        />
                    </div>

                    {/* Brand Color */}
                    <div>
                        <Label className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Brand Color
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setBrandColor(color)}
                                    className={`w-8 h-8 rounded-full transition-all ${brandColor === color
                                        ? "ring-2 ring-offset-2 ring-slate-900 scale-110"
                                        : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <Input
                                type="color"
                                value={brandColor}
                                onChange={(e) => setBrandColor(e.target.value)}
                                className="w-10 h-8 p-0 border-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* URL Slug */}
                    <div>
                        <Label htmlFor="slug">Page URL</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500">evolver.app/p/</span>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(generateSlug(e.target.value))}
                                placeholder="your-name"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Public Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                        <div>
                            <div className="font-medium text-[#2c3150]">Make Page Public</div>
                            <div className="text-sm text-slate-500">
                                Others can view your page at /p/{slug || "your-slug"}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? "bg-green-500" : "bg-slate-300"
                                }`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-6" : "translate-x-0.5"
                                }`} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1"
                        >
                            {isSaving ? (
                                <span className="premium-spinner w-4 h-4 mr-2" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                        {isPublic && slug && (
                            <Button
                                variant="outline"
                                onClick={() => window.open(`/p/${slug}`, "_blank")}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Preview
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info note */}
                <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Add offers to your page from the{" "}
                        <a href="/genius-offer" className="underline">Genius Offer</a> module.
                        They'll automatically appear on your public page.
                    </p>
                </div>

                {/* Coming soon note */}
                <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Public page data is currently saved locally.
                        Cloud persistence will be added when the database schema is extended.
                    </p>
                </div>
            </div>
        </GameShellV2>
    );
};

export default PublicPageEditor;
