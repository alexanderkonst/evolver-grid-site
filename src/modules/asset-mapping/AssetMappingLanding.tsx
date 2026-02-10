import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Brain, ListChecks, Clipboard, Check, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_TYPES } from "./data/assetTypes";
import { ASSET_SUB_TYPES } from "./data/assetSubtypes";
import { ASSET_CATEGORIES } from "./data/assetCategories";
import { ASSET_MAPPING_PROMPT } from "@/prompts";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Step = "choice" | "has-ai" | "paste-response" | "matched";
type MatchedAsset = {
    typeTitle: string;
    subTypeTitle?: string;
    categoryTitle?: string;
    categoryId?: string;
    title: string;
    description?: string;
    leverageScore?: number;
    leverageReason?: string;
};

// Map category strings to our taxonomy
const CATEGORY_MAP: Record<string, string> = {
    'expertise': 'Expertise',
    'experiences': 'Life Experiences',
    'life experiences': 'Life Experiences',
    'networks': 'Networks',
    'resources': 'Material Resources',
    'material resources': 'Material Resources',
    'ip': 'Intellectual Property',
    'intellectual property': 'Intellectual Property',
    'influence': 'Influence'
};

const normalizeText = (value?: string) => value?.trim().toLowerCase() || "";

// AI matching function
const fetchAssetMatches = async (text: string): Promise<MatchedAsset[] | null> => {
    try {
        const { data, error } = await supabase.functions.invoke("match-assets", {
            body: { text, limit: 8 },
        });
        if (error || !data?.matches) return null;
        const matches = (data.matches as Array<{ asset_id: string; score: number; type?: string; subType?: string; title?: string }>)
            .map((match) => ({
                typeTitle: match.type || 'Unknown',
                subTypeTitle: match.subType,
                categoryTitle: match.title,
                categoryId: match.asset_id,
                title: match.title || 'Unknown Asset',
                leverageScore: Math.round(match.score * 10),
            }))
            .filter(m => m.typeTitle !== 'Unknown');
        return matches.length > 0 ? matches : null;
    } catch (err) {
        return null;
    }
};

const AssetMappingLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/me";

    const [step, setStep] = useState<Step>("choice");
    const [aiResponse, setAiResponse] = useState("");
    const [copied, setCopied] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [matchedAssets, setMatchedAssets] = useState<MatchedAsset[]>([]);
    const { toast } = useToast();

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(ASSET_MAPPING_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGoToWizard = () => {
        navigate(`/asset-mapping/wizard?from=game&return=${encodeURIComponent(returnPath)}`);
    };

    const handleSaveAssets = async () => {
        if (matchedAssets.length === 0) return;
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "Please sign in", variant: "destructive" });
                return;
            }

            const key = `user_assets_${user.id}`;
            const existing = JSON.parse(localStorage.getItem(key) || "[]");
            const existingTitles = new Set(
                existing.map((asset: { title?: string }) => normalizeText(asset.title))
            );

            let savedCount = 0;
            let skippedCount = 0;

            for (const asset of matchedAssets) {
                const type = ASSET_TYPES.find(
                    (item) => normalizeText(item.title) === normalizeText(asset.typeTitle)
                );
                if (!type) {
                    skippedCount += 1;
                    continue;
                }

                const subType = asset.subTypeTitle
                    ? ASSET_SUB_TYPES.find(
                        (item) => normalizeText(item.title) === normalizeText(asset.subTypeTitle)
                    )
                    : ASSET_SUB_TYPES.find((item) => item.typeId === type.id);

                const category = asset.categoryTitle
                    ? ASSET_CATEGORIES.find(
                        (item) => normalizeText(item.title) === normalizeText(asset.categoryTitle)
                    )
                    : subType
                        ? ASSET_CATEGORIES.find((item) => item.subTypeId === subType.id)
                        : undefined;

                const title = asset.title.trim();
                const normalizedTitle = normalizeText(title);
                if (!normalizedTitle || existingTitles.has(normalizedTitle)) {
                    skippedCount += 1;
                    continue;
                }

                existing.push({
                    typeId: type.id,
                    subTypeId: subType?.id,
                    categoryId: category?.id,
                    title,
                    description: asset.description?.trim() || undefined,
                    savedAt: new Date().toISOString(),
                    source: "ai",
                });
                existingTitles.add(normalizedTitle);
                savedCount += 1;
            }

            localStorage.setItem(key, JSON.stringify(existing));

            setHasSaved(true);
            toast({
                title: "Assets saved",
                description: `Saved ${savedCount} assets${skippedCount ? `, skipped ${skippedCount}` : ""}.`,
            });
        } catch (err) {
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // Parse response and extract assets - tries AI matching first, then falls back to parsing
    const handleMatchAssets = async () => {
        setIsMatching(true);

        // First, try AI matching via edge function
        const aiMatches = await fetchAssetMatches(aiResponse);
        if (aiMatches && aiMatches.length > 0) {
            setIsMatching(false);
            setMatchedAssets(aiMatches);
            setStep("matched");
            return;
        }

        // Fallback: Parse the response manually
        const extracted: MatchedAsset[] = [];

        try {
            const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*?\}\s*\]/);

            if (jsonMatch) {
                const assets = JSON.parse(jsonMatch[0]);
                for (const asset of assets) {
                    // Map the 3-level taxonomy: type → subtype → category
                    // type: "Expertise", "Life Experiences", "Networks", etc.
                    // subtype: "Business & Economics", "Cultural Immersion", etc.
                    // category: "Entrepreneurship", "Language Acquisition", etc.
                    const rawType = (asset.type || '').trim();
                    const typeTitle = CATEGORY_MAP[rawType.toLowerCase()] || rawType || 'Unknown';
                    const subTypeTitle = (asset.subtype || asset.subcategory || '').trim() || undefined;
                    const categoryTitle = (asset.category || '').trim() || undefined;
                    const name = asset.name || asset.asset || asset.title || 'Unnamed Asset';

                    extracted.push({
                        typeTitle,
                        subTypeTitle,
                        categoryTitle,
                        title: name,
                        description: asset.description || asset.details || asset.summary || undefined,
                        leverageScore: asset.leverage_score || asset.leverageScore || undefined,
                        leverageReason: asset.leverage_reason || asset.leverageReason || undefined,
                    });
                }
            } else {
                // Parse markdown format
                const assetBlocks = aiResponse.split(/(?=\*\s*\*\*Category:\*\*|\n\d+\)\s*\*\*Category:\*\*)/);

                for (const block of assetBlocks) {
                    if (!block.trim()) continue;
                    const categoryMatch = block.match(/\*\*Category:\*\*\s*([^\n*]+)/i);
                    const assetMatch = block.match(/\*\*(?:Asset|Name|Title):\*\*\s*([^\n]+)/i);
                    const descMatch = block.match(/\*\*(?:Description|Details|Summary):\*\*\s*([^\n]+)/i);
                    const valueMatch = block.match(/\*\*Why it'?s valuable:?\*\*\s*([^\n]+)/i);

                    if (assetMatch) {
                        let typeTitle = 'Unknown';
                        if (categoryMatch) {
                            const rawCat = categoryMatch[1].trim().toLowerCase();
                            typeTitle = CATEGORY_MAP[rawCat] || categoryMatch[1].trim();
                        }
                        extracted.push({
                            typeTitle,
                            title: assetMatch[1].trim(),
                            description: descMatch ? descMatch[1].trim() : undefined,
                            leverageReason: valueMatch ? valueMatch[1].trim() : undefined,
                        });
                    }
                }

                // If still no matches, try section-based parsing (## 1) Expertise, etc.)
                if (extracted.length === 0) {
                    const sections = aiResponse.split(/(?=##\s*\d+\)\s*)/);

                    for (const section of sections) {
                        const sectionHeader = section.match(/##\s*\d+\)\s*(\w+)/);
                        if (!sectionHeader) continue;

                        const rawCat = sectionHeader[1].toLowerCase();
                        const typeTitle = CATEGORY_MAP[rawCat] || sectionHeader[1];

                        // Find all bullet items in this section
                        const items = section.split(/(?=\*\s+\*\*)/);

                        for (const item of items) {
                            const assetMatch = item.match(/\*\*(?:Asset|Name|Title):\*\*\s*([^\n]+)/i);
                            const descMatch = item.match(/\*\*(?:Description|Details|Summary):\*\*\s*([^\n]+)/i);
                            const valueMatch = item.match(/\*\*Why it'?s valuable:?\*\*\s*([^\n]+)/i);

                            if (assetMatch) {
                                extracted.push({
                                    typeTitle,
                                    title: assetMatch[1].trim(),
                                    description: descMatch ? descMatch[1].trim() : undefined,
                                    leverageReason: valueMatch ? valueMatch[1].trim() : undefined,
                                });
                            }
                        }
                    }
                }
            }
        } catch (e) {
        }

        setIsMatching(false);
        const sorted = extracted.sort((a, b) => (b.leverageScore || 0) - (a.leverageScore || 0));
        setMatchedAssets(sorted.slice(0, 50));
        setStep("matched");
    };

    return (
        <div className="min-h-dvh bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f0f4ff] mb-4">
                        <Boxes className="w-8 h-8 text-[#2c3150]" />
                    </div>
                    <h1 className="text-4xl font-bold font-display aurora-text mb-3">Asset Mapping</h1>
                    <p className="text-lg text-[rgba(44,49,80,0.7)]">Map your resources for collaboration</p>
                </div>

                {/* Step: Choice */}
                {step === "choice" && (
                    <div className="space-y-4">
                        <p className="text-center text-lg text-[#2c3150] mb-6">
                            How would you like to map your assets?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setStep("has-ai")}
                                className="p-6 rounded-xl border-2 border-[#a4a3d0]/20 hover:border-[#6894d0] hover:bg-[#6894d0]/5 transition-colors text-left"
                            >
                                <Brain className="w-6 h-6 text-[#6894d0] mb-3" />
                                <h3 className="font-semibold text-[#2c3150] mb-1">Use AI to extract</h3>
                                <p className="text-sm text-[#2c3150]/60">I have an AI that knows me</p>
                            </button>

                            <button
                                onClick={handleGoToWizard}
                                className="p-6 rounded-xl border-2 border-[#a4a3d0]/20 hover:border-[#6894d0] hover:bg-[#6894d0]/5 transition-colors text-left"
                            >
                                <ListChecks className="w-6 h-6 text-[#6894d0] mb-3" />
                                <h3 className="font-semibold text-[#2c3150] mb-1">Add manually</h3>
                                <p className="text-sm text-[#2c3150]/60">Go through the categories</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Has AI */}
                {step === "has-ai" && (
                    <div className="space-y-6">
                        <div className="bg-[#f0f4ff]/50 rounded-xl p-4 border border-[#a4a3d0]/20">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-[#2c3150] text-sm">Prompt for your AI</h3>
                                    <p className="text-xs text-[#2c3150]/60">Copy this and ask your AI model</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleCopyPrompt} className="shrink-0">
                                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Clipboard className="w-4 h-4 mr-1" />}
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                            <pre className="text-xs whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#a4a3d0]/20 max-h-32 overflow-y-auto prompt-barely-visible">
                                {ASSET_MAPPING_PROMPT}
                            </pre>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2c3150] mb-2">
                                Paste AI's response here
                            </label>
                            <Textarea
                                value={aiResponse}
                                onChange={(e) => setAiResponse(e.target.value)}
                                placeholder="Paste the AI's list of your assets..."
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep("choice")}>
                                ← Back
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleMatchAssets}
                                disabled={!aiResponse.trim() || isMatching}
                            >
                                {isMatching ? "Matching..." : "Extract Assets"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        <div className="text-center">
                            <button onClick={handleGoToWizard} className="text-sm text-[#2c3150]/60 hover:text-[#2c3150]">
                                Or add assets manually →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Matched */}
                {step === "matched" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-[#2c3150]">
                                {matchedAssets.length > 0 ? `Found ${matchedAssets.length} assets` : "No exact matches"}
                            </h2>
                            <p className="text-base text-[rgba(44,49,80,0.7)]">
                                {matchedAssets.length > 0
                                    ? "Review and save these to your profile."
                                    : "Try adding assets manually using the wizard."}
                            </p>
                        </div>

                        {matchedAssets.length > 0 && (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {matchedAssets.map((asset, i) => (
                                    <div key={i} className="p-4 rounded-lg border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0f4ff] text-[rgba(44,49,80,0.7)]">
                                                    {asset.typeTitle}
                                                </span>
                                                {asset.subTypeTitle && (
                                                    <span className="text-xs text-[#2c3150]/60">
                                                        → {asset.subTypeTitle}
                                                    </span>
                                                )}
                                                {asset.categoryTitle && (
                                                    <span className="text-xs text-[#2c3150]/60">
                                                        → {asset.categoryTitle}
                                                    </span>
                                                )}
                                            </div>
                                            {asset.leverageScore && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-help ${asset.leverageScore >= 8 ? 'bg-green-100 text-green-700' :
                                                                asset.leverageScore >= 5 ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-[#f0f4ff] text-[rgba(44,49,80,0.7)]'
                                                                }`}>
                                                                ⚡ {asset.leverageScore}/10
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" className="max-w-[200px]">
                                                            <p className="text-xs"><strong>Asset Strength</strong><br />How developed and leveraged this asset currently is (1-10)</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <p className="font-semibold text-[#2c3150]">{asset.title}</p>
                                        {asset.description && (
                                            <p className="text-sm text-[rgba(44,49,80,0.7)] mt-1">{asset.description}</p>
                                        )}
                                        {asset.leverageReason && (
                                            <p className="text-xs text-[#2c3150]/60 mt-2 italic">{asset.leverageReason}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" onClick={() => setStep("has-ai")}>Back</Button>
                            {matchedAssets.length > 0 && (
                                hasSaved ? (
                                    <Button onClick={() => navigate(returnPath)} className="flex-1">
                                        Return to Profile
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSaveAssets} disabled={isSaving} className="flex-1">
                                        {isSaving ? "Saving..." : "Save to Profile"}
                                    </Button>
                                )
                            )}
                            <Button variant="ghost" onClick={handleGoToWizard} className="text-[#2c3150]/60">
                                Add more manually
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetMappingLanding;
