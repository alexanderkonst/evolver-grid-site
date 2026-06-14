import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { completeAction } from "@/lib/completeAction";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

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
    const { t } = useTranslation();
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
            setError(err.message || t('personalityUpload.errorAnalyze'));
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
            await completeAction(
                {
                    id: "upgrade:personality_tests_completed",
                    type: "upgrade",
                    loop: "transformation",
                    title: "Complete Personality Tests",
                    source: "lib/upgradeSystem.ts",
                    completionPayload: { sourceId: "personality_tests_completed" },
                },
                { profileId }
            );

            setSaved(true);
            onSuccess?.(results);

            toast({
                title: t('personalityUpload.toastSavedTitle'),
                description: t('personalityUpload.toastSavedDescription'),
            });

            // Close after brief delay to show success
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || t('personalityUpload.errorSave'));
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
                        {t('personalityUpload.enneagramTypeLabel', { type: data.primary_type })} - {data.primary_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('personalityUpload.enneagramPrimaryType')}</div>
                </div>
                <div className="space-y-2">
                    {sortedScores.map(({ type, score }) => (
                        <div key={type} className="flex items-center gap-2 text-sm">
                            <span className="w-20 text-muted-foreground">{t('personalityUpload.enneagramTypeRow', { type })}</span>
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
                <div className="text-sm text-muted-foreground">{t('personalityUpload.variantLabel', { variant: data.variant })}</div>
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
                <div className="text-sm text-muted-foreground">{t('personalityUpload.hdProfileLabel', { profile: data.profile })}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground text-xs">{t('personalityUpload.hdStrategy')}</div>
                    <div className="text-foreground">{data.strategy}</div>
                </div>
                <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground text-xs">{t('personalityUpload.hdAuthority')}</div>
                    <div className="text-foreground">{data.authority}</div>
                </div>
                <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground text-xs">{t('personalityUpload.hdDefinition')}</div>
                    <div className="text-foreground">{data.definition}</div>
                </div>
                {data.incarnation_cross && (
                    <div className="p-2 rounded bg-muted col-span-2">
                        <div className="text-muted-foreground text-xs">{t('personalityUpload.hdIncarnationCross')}</div>
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
                <ErrorBoundary>
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            {t('personalityUpload.dialogTitle', { testName })}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Example section */}
                        {!results && (
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                <p className="text-xs uppercase  text-muted-foreground mb-2">{t('personalityUpload.whatToUpload')}</p>
                                <p className="text-sm text-foreground mb-3">
                                    {testType === 'enneagram' && (
                                        <>{t('personalityUpload.uploadHintEnneagram')}</>
                                    )}
                                    {testType === '16personalities' && (
                                        <>{t('personalityUpload.uploadHint16Personalities')}</>
                                    )}
                                    {testType === 'human_design' && (
                                        <>{t('personalityUpload.uploadHintHumanDesign')}</>
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
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-auto max-h-32 object-cover object-top"
                                    />
                                    <p className="text-[10px] text-muted-foreground text-center py-1 bg-muted/30">{t('personalityUpload.exampleScreenshot')}</p>
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
                                            loading="lazy"
                                            decoding="async"
                                            className="max-h-48 mx-auto rounded"
                                        />
                                        <p className="text-sm text-muted-foreground">{t('personalityUpload.clickOrDropToChange')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                                        <p className="text-foreground">{t('personalityUpload.dropScreenshotHere')}</p>
                                        <p className="text-xs text-muted-foreground">{t('personalityUpload.orClickToBrowse')}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <Check className="w-5 h-5" />
                                    <span className="font-medium">{t('personalityUpload.resultsExtracted')}</span>
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
                                        {t('personalityUpload.cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!file || analyzing}
                                        className="flex-1"
                                    >
                                        {analyzing ? (
                                            <>
                                                <span className="premium-spinner w-4 h-4 mr-2" />
                                                {t('personalityUpload.analyzing')}
                                            </>
                                        ) : (
                                            t('personalityUpload.analyze')
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
                                        {t('personalityUpload.tryAgain')}
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saved || saving}
                                        className="flex-1"
                                    >
                                        {saving ? (
                                            <>
                                                <span className="premium-spinner w-4 h-4 mr-2" />
                                                {t('personalityUpload.saving')}
                                            </>
                                        ) : saved ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                {t('personalityUpload.saved')}
                                            </>
                                        ) : (
                                            t('personalityUpload.saveToProfile')
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </ErrorBoundary>
            </DialogContent>
        </Dialog>
    );
};

export default PersonalityTestUploadModal;
