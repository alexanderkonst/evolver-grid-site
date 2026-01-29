import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_TYPES, AssetTypeId } from "./data/assetTypes";
import { ASSET_SUB_TYPES } from "./data/assetSubtypes";
import { ASSET_CATEGORIES } from "./data/assetCategories";

type Step = 'type' | 'subtype' | 'category' | 'details' | 'done';

const AssetMappingWizard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/profile";
    const { toast } = useToast();

    // Selection state
    const [step, setStep] = useState<Step>('type');
    const [selectedTypeId, setSelectedTypeId] = useState<AssetTypeId | null>(null);
    const [selectedSubTypeId, setSelectedSubTypeId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // Asset details
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Assets added in this session
    const [addedAssets, setAddedAssets] = useState<{ title: string; type: string }[]>([]);

    // Filtered data
    const subTypes = useMemo(() =>
        selectedTypeId ? ASSET_SUB_TYPES.filter(s => s.typeId === selectedTypeId) : [],
        [selectedTypeId]
    );

    const categories = useMemo(() =>
        selectedSubTypeId ? ASSET_CATEGORIES.filter(c => c.subTypeId === selectedSubTypeId) : [],
        [selectedSubTypeId]
    );

    const selectedType = ASSET_TYPES.find(t => t.id === selectedTypeId);
    const selectedSubType = ASSET_SUB_TYPES.find(s => s.id === selectedSubTypeId);
    const selectedCategory = ASSET_CATEGORIES.find(c => c.id === selectedCategoryId);

    // Handlers
    const handleSelectType = (typeId: AssetTypeId) => {
        setSelectedTypeId(typeId);
        setSelectedSubTypeId(null);
        setSelectedCategoryId(null);
        setStep('subtype');
    };

    const handleSelectSubType = (subTypeId: string) => {
        setSelectedSubTypeId(subTypeId);
        setSelectedCategoryId(null);
        setStep('category');
    };

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setStep('details');
        // Pre-fill title with category name
        const cat = ASSET_CATEGORIES.find(c => c.id === categoryId);
        if (cat) setTitle(cat.title);
    };

    const handleSaveAsset = async () => {
        if (!selectedTypeId || !selectedSubTypeId || !selectedCategoryId || !title.trim()) return;

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "Please sign in", variant: "destructive" });
                return;
            }

            const asset = {
                typeId: selectedTypeId,
                subTypeId: selectedSubTypeId,
                categoryId: selectedCategoryId,
                title: title.trim(),
                description: description.trim() || undefined,
                savedAt: new Date().toISOString(),
            };

            // Save to localStorage (until DB migration is ready)
            const key = `user_assets_${user.id}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(asset);
            localStorage.setItem(key, JSON.stringify(existing));

            setAddedAssets(prev => [...prev, { title: asset.title, type: selectedType?.title || '' }]);

            toast({
                title: "Asset added!",
                description: `${asset.title} saved to your profile.`,
            });

            setStep('done');
        } catch (err) {
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddAnother = () => {
        setStep('type');
        setSelectedTypeId(null);
        setSelectedSubTypeId(null);
        setSelectedCategoryId(null);
        setTitle("");
        setDescription("");
    };

    const handleBack = () => {
        switch (step) {
            case 'subtype': setStep('type'); break;
            case 'category': setStep('subtype'); break;
            case 'details': setStep('category'); break;
            default: break;
        }
    };

    return (
        <div className="min-h-dvh bg-white">
            {/* Header */}
            <div className="border-b border-[#a4a3d0]/20 bg-white sticky top-0 z-above">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BackButton
                                to={returnPath}
                                label="Back"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-[#2c3150]">Asset Mapping</h1>
                                <p className="text-xs text-[#2c3150]/60">Map your resources for collaboration</p>
                            </div>
                        </div>
                        {addedAssets.length > 0 && (
                            <span className="text-sm text-[#2c3150]/60">
                                {addedAssets.length} asset{addedAssets.length > 1 ? 's' : ''} added
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Step: Type Selection */}
                {step === 'type' && (
                    <div>
                        <h2 className="text-xl font-semibold text-[#2c3150] mb-2">What type of asset?</h2>
                        <p className="text-sm text-[rgba(44,49,80,0.7)] mb-6">Select the category that best describes this asset.</p>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {ASSET_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => handleSelectType(type.id)}
                                    className="p-4 rounded-xl border-2 border-[#a4a3d0]/20 hover:border-[#6894d0] hover:bg-[#6894d0]/5 transition-colors text-left"
                                >
                                    <span className="text-2xl mb-2 block">{type.icon}</span>
                                    <h3 className="font-semibold text-[#2c3150]">{type.title}</h3>
                                    <p className="text-sm text-[#2c3150]/60 mt-1">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step: Sub-Type Selection */}
                {step === 'subtype' && selectedType && (
                    <div>
                        <button onClick={handleBack} className="text-sm text-[#2c3150]/60 hover:text-[#2c3150] mb-4">
                            ← Back to types
                        </button>
                        <h2 className="text-xl font-semibold text-[#2c3150] mb-2">
                            {selectedType.icon} {selectedType.title}
                        </h2>
                        <p className="text-sm text-[rgba(44,49,80,0.7)] mb-6">What area within {selectedType.title.toLowerCase()}?</p>

                        <div className="grid gap-2">
                            {subTypes.map(subType => (
                                <button
                                    key={subType.id}
                                    onClick={() => handleSelectSubType(subType.id)}
                                    className="p-3 rounded-lg border border-[#a4a3d0]/20 hover:border-[#6894d0] hover:bg-[#6894d0]/5 transition-colors text-left"
                                >
                                    <span className="font-medium text-[#2c3150]">{subType.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step: Category Selection */}
                {step === 'category' && selectedSubType && (
                    <div>
                        <button onClick={handleBack} className="text-sm text-slate-500 hover:text-[#2c3150] mb-4">
                            ← Back to {selectedType?.title}
                        </button>
                        <h2 className="text-xl font-semibold text-[#2c3150] mb-2">{selectedSubType.title}</h2>
                        <p className="text-sm text-[rgba(44,49,80,0.7)] mb-6">Select the specific type of asset.</p>

                        <div className="grid gap-2">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => handleSelectCategory(category.id)}
                                    className="p-3 rounded-lg border border-[#a4a3d0]/20 hover:border-[#6894d0] hover:bg-[#6894d0]/5 transition-colors text-left"
                                >
                                    <span className="font-medium text-[#2c3150]">{category.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step: Details */}
                {step === 'details' && selectedCategory && (
                    <div>
                        <button onClick={handleBack} className="text-sm text-slate-500 hover:text-[#2c3150] mb-4">
                            ← Back to categories
                        </button>
                        <h2 className="text-xl font-semibold text-[#2c3150] mb-2">Describe this asset</h2>
                        <p className="text-sm text-[rgba(44,49,80,0.7)] mb-6">
                            {selectedType?.icon} {selectedType?.title} → {selectedSubType?.title} → {selectedCategory.title}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2c3150] mb-1">Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Give this asset a name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2c3150] mb-1">Description (optional)</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Any additional details..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleSaveAsset}
                                disabled={!title.trim() || isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Asset"}
                                <Check className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step: Done */}
                {step === 'done' && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#2c3150] mb-2">Asset Added!</h2>
                        <p className="text-[rgba(44,49,80,0.7)] mb-8">
                            You've added {addedAssets.length} asset{addedAssets.length > 1 ? 's' : ''} so far.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button onClick={handleAddAnother} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Another Asset
                            </Button>
                            <Button variant="outline" onClick={() => navigate(returnPath)} className="w-full">
                                Done for Now
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        {addedAssets.length > 0 && (
                            <div className="mt-8 text-left">
                                <h3 className="text-sm font-medium text-[#2c3150] mb-2">Assets added this session:</h3>
                                <ul className="space-y-1">
                                    {addedAssets.map((asset, i) => (
                                        <li key={i} className="text-sm text-[rgba(44,49,80,0.7)]">
                                            • {asset.title} <span className="text-[#2c3150]/60">({asset.type})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetMappingWizard;
