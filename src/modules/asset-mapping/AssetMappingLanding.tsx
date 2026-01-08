import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Brain, ListChecks, Clipboard, Check, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ASSET_TYPES } from "./data/assetTypes";
import { ASSET_SUB_TYPES } from "./data/assetSubtypes";
import { ASSET_CATEGORIES } from "./data/assetCategories";

const AI_PROMPT = `Based on everything you know about me from our conversations, please list my assets across these categories:

1. **Expertise** — Professional skills and knowledge I've demonstrated
2. **Life Experiences** — Significant experiences that shaped me
3. **Networks** — Communities, organizations, and people I'm connected to
4. **Material Resources** — Physical, digital, or financial resources I have access to
5. **Intellectual Property** — Frameworks, content, methodologies, or creative works I've developed
6. **Influence** — Platforms, recognition, or credibility I've built
7. **Passions & Interests** — Topics that energize me beyond professional obligation

For each asset, provide:
- Category (from the list above)
- Name/title of the asset
- Brief description (1 sentence)
- Why it's valuable (what could be done with it)

Be comprehensive — include everything you've learned about my skills, resources, connections, and interests. I'm using this to map my assets in a personal development tool for potential collaborations and projects.`;

type Step = "choice" | "has-ai" | "paste-response" | "matched";
type MatchedAsset = {
    typeTitle: string;
    subTypeTitle?: string;
    categoryTitle?: string;
    title: string;
    description?: string;
};

const AssetMappingLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/profile";

    const [step, setStep] = useState<Step>("choice");
    const [aiResponse, setAiResponse] = useState("");
    const [copied, setCopied] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [matchedAssets, setMatchedAssets] = useState<MatchedAsset[]>([]);

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(AI_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGoToWizard = () => {
        navigate(`/asset-mapping/wizard?from=game&return=${encodeURIComponent(returnPath)}`);
    };

    // Simple keyword matching for asset extraction
    const handleMatchAssets = async () => {
        setIsMatching(true);

        // Parse the AI response and try to match to our taxonomy
        const lines = aiResponse.split('\n').filter(l => l.trim());
        const extracted: MatchedAsset[] = [];

        // Look for type keywords in the response
        for (const type of ASSET_TYPES) {
            const typeRegex = new RegExp(type.title, 'gi');
            if (typeRegex.test(aiResponse)) {
                // Found this type mentioned - try to extract specific assets
                const subTypes = ASSET_SUB_TYPES.filter(s => s.typeId === type.id);

                for (const subType of subTypes) {
                    if (aiResponse.toLowerCase().includes(subType.title.toLowerCase())) {
                        const categories = ASSET_CATEGORIES.filter(c => c.subTypeId === subType.id);

                        for (const category of categories) {
                            if (aiResponse.toLowerCase().includes(category.title.toLowerCase())) {
                                extracted.push({
                                    typeTitle: type.title,
                                    subTypeTitle: subType.title,
                                    categoryTitle: category.title,
                                    title: category.title,
                                });
                            }
                        }

                        // If no category matched, add the subtype
                        if (!categories.some(c => aiResponse.toLowerCase().includes(c.title.toLowerCase()))) {
                            extracted.push({
                                typeTitle: type.title,
                                subTypeTitle: subType.title,
                                title: subType.title,
                            });
                        }
                    }
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsMatching(false);
        setMatchedAssets(extracted.slice(0, 12)); // Cap at 12 for display
        setStep("matched");
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                        <Boxes className="w-8 h-8 text-slate-700" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Asset Mapping</h1>
                    <p className="text-slate-600">Map your resources for collaboration</p>
                </div>

                {/* Step: Choice */}
                {step === "choice" && (
                    <div className="space-y-4">
                        <p className="text-center text-slate-700 mb-6">
                            How would you like to map your assets?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setStep("has-ai")}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                            >
                                <Brain className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-slate-900 mb-1">Use AI to extract</h3>
                                <p className="text-sm text-slate-500">I have an AI that knows me</p>
                            </button>

                            <button
                                onClick={handleGoToWizard}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                            >
                                <ListChecks className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-slate-900 mb-1">Add manually</h3>
                                <p className="text-sm text-slate-500">Go through the categories</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Has AI */}
                {step === "has-ai" && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">Prompt for your AI</h3>
                                    <p className="text-xs text-slate-500">Copy this and ask your AI model</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleCopyPrompt} className="shrink-0">
                                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Clipboard className="w-4 h-4 mr-1" />}
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                            <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto">
                                {AI_PROMPT}
                            </pre>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            <button onClick={handleGoToWizard} className="text-sm text-slate-500 hover:text-slate-700">
                                Or add assets manually →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Matched */}
                {step === "matched" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {matchedAssets.length > 0 ? `Found ${matchedAssets.length} assets` : "No exact matches"}
                            </h2>
                            <p className="text-sm text-slate-600">
                                {matchedAssets.length > 0
                                    ? "Review and save these to your profile."
                                    : "Try adding assets manually using the wizard."}
                            </p>
                        </div>

                        {matchedAssets.length > 0 && (
                            <div className="space-y-2">
                                {matchedAssets.map((asset, i) => (
                                    <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                {asset.typeTitle}
                                            </span>
                                            {asset.subTypeTitle && (
                                                <span className="text-xs text-slate-400">
                                                    → {asset.subTypeTitle}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-slate-900">{asset.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" onClick={() => setStep("has-ai")}>Back</Button>
                            <Button onClick={handleGoToWizard}>
                                {matchedAssets.length > 0 ? "Add More in Wizard" : "Open Wizard"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetMappingLanding;
