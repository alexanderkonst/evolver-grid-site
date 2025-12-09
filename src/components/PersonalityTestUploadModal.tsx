import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check, AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { completeUpgrade } from "@/lib/upgradeSystem";
import { useToast } from "@/hooks/use-toast";

interface PersonalityTestUploadModalProps {
    open: boolean;
    onClose: () => void;
    testType: "enneagram" | "16personalities" | "human_design";
    testName: string;
    onSuccess?: (results: any) => void;
}

const PersonalityTestUploadModal = ({
    open,
    onClose,
    testType,
    testName,
    onSuccess,
}: PersonalityTestUploadModalProps) => {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setResults(null);
            setSaved(false);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type.startsWith("image/")) {
            setFile(droppedFile);
            setError(null);
            setResults(null);
            setSaved(false);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(droppedFile);
        }
    }, []);

    const handleAnalyze = async () => {
        if (!file || !preview) return;

        setAnalyzing(true);
        setError(null);

        try {
            // Convert to base64 (remove data:image/xxx;base64, prefix)
            const base64 = preview.split(",")[1];

            const { data, error: fnError } = await supabase.functions.invoke(
                "analyze-personality-test",
                {
                    body: { testType, imageBase64: base64 },
                }
            );

            if (fnError) throw fnError;
            if (data?.error) throw new Error(data.error);

            setResults(data.results);
        } catch (err: any) {
            console.error("Analysis error:", err);
            setError(err.message || "Failed to analyze image");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!results) return;

        setSaving(true);
        setError(null);

        try {
            const profileId = await getOrCreateGameProfileId();
            
            // Get existing personality tests from profile
            const { data: profile, error: fetchError } = await supabase
                .from('game_profiles')
                .select('personality_tests')
                .eq('id', profileId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // Merge with existing tests
            const existingTests = (profile?.personality_tests as Record<string, any>) || {};
            const updatedTests = {
                ...existingTests,
                [testType]: results
            };
            
            // Save to database
            const { error: updateError } = await supabase
                .from('game_profiles')
                .update({ personality_tests: updatedTests })
                .eq('id', profileId);
            
            if (updateError) throw updateError;
            
            // Complete the upgrade if this is the first test (or any test)
            await completeUpgrade(profileId, 'personality_tests_completed');
            
            setSaved(true);
            onSuccess?.(results);
            
            toast({
                title: "Results saved!",
                description: "+20 XP for exploring your inner landscape.",
            });

            // Close after brief delay to show success
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || "Failed to save results");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setResults(null);
        setError(null);
        setSaved(false);
        setSaving(false);
        setAnalyzing(false);
        onClose();
    };

    const renderEnneagramResults = (data: any) => {
        const sortedScores = Object.entries(data.scores || {})
            .map(([key, value]) => ({
                type: parseInt(key.replace("type_", "")),
                score: value as number,
            }))
            .sort((a, b) => b.score - a.score);

        return (
            <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-lg font-semibold text-foreground">
                        Type {data.primary_type} - {data.primary_name}
                    </div>
                    <div className="text-sm text-muted-foreground">Primary Type</div>
                </div>
                <div className="space-y-2">
                    {sortedScores.map(({ type, score }) => (
                        <div key={type} className="flex items-center gap-2 text-sm">
                            <span className="w-20 text-muted-foreground">Type {type}:</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${(score / 30) * 100}%` }}
                                />
                            </div>
                            <span className="w-8 text-right text-foreground">{score}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const render16PersonalitiesResults = (data: any) => (
        <div className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-lg font-semibold text-foreground">
                    {data.type_code} - {data.type_name}
                </div>
                <div className="text-sm text-muted-foreground">{data.variant} Variant</div>
            </div>
            <div className="space-y-2">
                {Object.entries(data.traits || {}).map(([trait, value]) => (
                    <div key={trait} className="flex items-center gap-2 text-sm">
                        <span className="w-24 text-muted-foreground capitalize">{trait}:</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${value as number}%` }}
                            />
                        </div>
                        <span className="w-10 text-right text-foreground">{value as number}%</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHumanDesignResults = (data: any) => (
        <div className="space-y-2">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-lg font-semibold text-foreground">{data.type}</div>
                <div className="text-sm text-muted-foreground">Profile {data.profile}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground text-xs">Strategy</div>
                    <div className="text-foreground">{data.strategy}</div>
                </div>
                <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground text-xs">Authority</div>
                    <div className="text-foreground">{data.authority}</div>
                </div>
                <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground text-xs">Definition</div>
                    <div className="text-foreground">{data.definition}</div>
                </div>
                {data.incarnation_cross && (
                    <div className="p-2 rounded bg-muted col-span-2">
                        <div className="text-muted-foreground text-xs">Incarnation Cross</div>
                        <div className="text-foreground">{data.incarnation_cross}</div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderResults = () => {
        if (!results) return null;

        switch (testType) {
            case "enneagram":
                return renderEnneagramResults(results);
            case "16personalities":
                return render16PersonalitiesResults(results);
            case "human_design":
                return renderHumanDesignResults(results);
            default:
                return <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Upload Your {testName} Results
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Example section */}
                    {!results && (
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What to upload</p>
                            <p className="text-sm text-foreground mb-3">
                                {testType === 'enneagram' && (
                                    <>Screenshot showing your Enneagram type with all 9 type scores (e.g., from Truity, Eclectic Energies, or similar). Should display bars/percentages for each type.</>
                                )}
                                {testType === '16personalities' && (
                                    <>Screenshot showing your 4-letter type code (e.g., INTJ-A), type name, and trait percentages for Mind, Energy, Nature, Tactics, and Identity.</>
                                )}
                                {testType === 'human_design' && (
                                    <>Screenshot showing your Human Design Type, Strategy, Authority, Profile, and Definition (e.g., from myBodyGraph or Jovian Archive).</>
                                )}
                            </p>
                            <div className="rounded-lg overflow-hidden border border-border">
                                <img 
                                    src={
                                        testType === 'enneagram' ? 'https://i.imgur.com/IQMLKiz.jpeg' :
                                        testType === '16personalities' ? 'https://i.imgur.com/kxjODNb.jpeg' :
                                        'https://i.imgur.com/oHYAq89.jpeg'
                                    }
                                    alt={`Example ${testType} result`}
                                    className="w-full h-auto max-h-32 object-cover object-top"
                                />
                                <p className="text-[10px] text-muted-foreground text-center py-1 bg-muted/30">Example screenshot</p>
                            </div>
                        </div>
                    )}

                    {/* Upload zone or preview */}
                    {!results ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="relative border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {preview ? (
                                <div className="space-y-2">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="max-h-48 mx-auto rounded"
                                    />
                                    <p className="text-sm text-muted-foreground">Click or drop to change</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                                    <p className="text-foreground">Drop screenshot here</p>
                                    <p className="text-xs text-muted-foreground">or click to browse</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Check className="w-5 h-5" />
                                <span className="font-medium">Results Extracted</span>
                            </div>
                            {renderResults()}
                        </div>
                    )}

                    {/* Error display */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        {!results ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!file || analyzing}
                                    className="flex-1"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Analyze →"
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setResults(null);
                                        setFile(null);
                                        setPreview(null);
                                    }}
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saved || saving}
                                    className="flex-1"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : saved ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Saved!
                                        </>
                                    ) : (
                                        "Save to Profile"
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PersonalityTestUploadModal;
