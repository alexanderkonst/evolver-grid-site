import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check, AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

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

        try {
            // Just call onSuccess with results - personality_tests column doesn't exist yet
            // When the column is added, this can be expanded to save to DB
            setSaved(true);
            onSuccess?.(results);

            // Close after brief delay to show success
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || "Failed to save results");
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setResults(null);
        setError(null);
        setSaved(false);
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
                <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <div className="text-lg font-semibold text-purple-300">
                        Type {data.primary_type} - {data.primary_name}
                    </div>
                    <div className="text-sm text-slate-400">Primary Type</div>
                </div>
                <div className="space-y-2">
                    {sortedScores.map(({ type, score }) => (
                        <div key={type} className="flex items-center gap-2 text-sm">
                            <span className="w-20 text-slate-400">Type {type}:</span>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500"
                                    style={{ width: `${(score / 30) * 100}%` }}
                                />
                            </div>
                            <span className="w-8 text-right">{score}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const render16PersonalitiesResults = (data: any) => (
        <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <div className="text-lg font-semibold text-amber-300">
                    {data.type_code} - {data.type_name}
                </div>
                <div className="text-sm text-slate-400">{data.variant} Variant</div>
            </div>
            <div className="space-y-2">
                {Object.entries(data.traits || {}).map(([trait, value]) => (
                    <div key={trait} className="flex items-center gap-2 text-sm">
                        <span className="w-24 text-slate-400 capitalize">{trait}:</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500"
                                style={{ width: `${value as number}%` }}
                            />
                        </div>
                        <span className="w-10 text-right">{value as number}%</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHumanDesignResults = (data: any) => (
        <div className="space-y-2">
            <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <div className="text-lg font-semibold text-blue-300">{data.type}</div>
                <div className="text-sm text-slate-400">Profile {data.profile}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-slate-800">
                    <div className="text-slate-400">Strategy</div>
                    <div className="text-white">{data.strategy}</div>
                </div>
                <div className="p-2 rounded bg-slate-800">
                    <div className="text-slate-400">Authority</div>
                    <div className="text-white">{data.authority}</div>
                </div>
                <div className="p-2 rounded bg-slate-800">
                    <div className="text-slate-400">Definition</div>
                    <div className="text-white">{data.definition}</div>
                </div>
                {data.incarnation_cross && (
                    <div className="p-2 rounded bg-slate-800 col-span-2">
                        <div className="text-slate-400">Incarnation Cross</div>
                        <div className="text-white">{data.incarnation_cross}</div>
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
            <DialogContent className="max-w-md bg-slate-900 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Upload Your {testName} Results
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Upload zone or preview */}
                    {!results ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="relative border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer"
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
                                    <p className="text-sm text-slate-400">Click or drop to change</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-10 h-10 mx-auto text-slate-500" />
                                    <p className="text-slate-400">Drop screenshot here</p>
                                    <p className="text-xs text-slate-500">or click to browse</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-green-400">
                                <Check className="w-5 h-5" />
                                <span className="font-medium">Results Extracted</span>
                            </div>
                            {renderResults()}
                        </div>
                    )}

                    {/* Error display */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 text-red-300">
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
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
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
                                    disabled={saved}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {saved ? (
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
