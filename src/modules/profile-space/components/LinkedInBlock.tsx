import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, CheckCircle2, Download, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/i18n/format";
import { cardShell, ceremonialPill, ceremonialPillPrimary, cormorantTitle, sourceSerifBody } from "./styles";

/**
 * LinkedInBlock — Profile Space's own LinkedIn upload UI (Day 119).
 *
 * Fresh UI per spec — does NOT import the legacy
 * src/components/profile/LinkedInUpload.tsx, but reuses its storage
 * contract verbatim: bucket `linkedin-profiles`, path
 * `${userId}/${Date.now()}-${filename}`, columns
 * game_profiles.linkedin_pdf_url + linkedin_extracted_at.
 *
 * The upload date isn't part of the shared ProfileSpaceData contract
 * (types.ts only exposes `linkedinPdfUrl`), so — mirroring the legacy
 * component's own path convention — this reads the leading epoch-ms
 * segment out of the storage path to recover both the original
 * filename and the upload date without a second data source.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

interface LinkedInBlockProps {
    userId: string | null;
    pdfPath: string | null;
    onChange: (path: string | null) => void;
}

function parsePdfPath(pdfPath: string | null): { fileName: string | null; uploadedAt: string | null } {
    if (!pdfPath) return { fileName: null, uploadedAt: null };
    const segment = pdfPath.split("/").pop() ?? pdfPath;
    const match = segment.match(/^(\d+)-(.+)$/);
    if (!match) return { fileName: segment, uploadedAt: null };
    const [, epochMs, rest] = match;
    const timestamp = Number(epochMs);
    return {
        fileName: rest,
        uploadedAt: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null,
    };
}

const LinkedInBlock = ({ userId, pdfPath, onChange }: LinkedInBlockProps) => {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fileName, uploadedAt } = parsePdfPath(pdfPath);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userId) return;
        setError(null);

        if (file.type !== "application/pdf") {
            setError(t("profileSpace.linkedin.errorType"));
            if (inputRef.current) inputRef.current.value = "";
            return;
        }
        if (file.size > MAX_BYTES) {
            setError(t("profileSpace.linkedin.errorSize"));
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        setBusy(true);
        try {
            const filePath = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
            const { error: uploadError } = await supabase.storage
                .from("linkedin-profiles")
                .upload(filePath, file, { contentType: "application/pdf", upsert: true });
            if (uploadError) throw uploadError;

            const { error: updateError } = await supabase
                .from("game_profiles")
                .update({ linkedin_pdf_url: filePath, linkedin_extracted_at: new Date().toISOString() })
                .eq("user_id", userId);
            if (updateError) throw updateError;

            onChange(filePath);
            toast.success(t("profileSpace.linkedin.uploaded"));
        } catch (err) {
            const message = err instanceof Error ? err.message : t("profileSpace.linkedin.errorUpload");
            setError(message);
            toast.error(t("profileSpace.linkedin.errorUpload"));
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleDownload = async () => {
        if (!pdfPath) return;
        setError(null);
        const { data, error: signError } = await supabase.storage
            .from("linkedin-profiles")
            .createSignedUrl(pdfPath, 60);
        if (signError || !data?.signedUrl) {
            setError(t("profileSpace.linkedin.errorDownload"));
            return;
        }
        window.open(data.signedUrl, "_blank");
    };

    const handleDelete = async () => {
        if (!pdfPath || !userId) return;
        setBusy(true);
        setError(null);
        try {
            await supabase.storage.from("linkedin-profiles").remove([pdfPath]);
            const { error: updateError } = await supabase
                .from("game_profiles")
                .update({ linkedin_pdf_url: null, linkedin_extracted_at: null })
                .eq("user_id", userId);
            if (updateError) throw updateError;
            onChange(null);
            toast.success(t("profileSpace.linkedin.removed"));
        } catch (err) {
            const message = err instanceof Error ? err.message : t("profileSpace.linkedin.errorDelete");
            setError(message);
            toast.error(t("profileSpace.linkedin.errorDelete"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <section style={cardShell}>
            <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.linkedin.title")}
                </h2>
            </div>

            <p className="mb-3" style={{ ...sourceSerifBody, fontSize: "13px", fontWeight: 500 }}>
                {t("profileSpace.linkedin.subtitle")}
            </p>

            {pdfPath ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" style={{ color: "rgb(16, 122, 79)" }} />
                        <div className="min-w-0">
                            <p className="truncate" style={{ ...sourceSerifBody, fontSize: "13.5px" }}>
                                {fileName || t("profileSpace.linkedin.fileFallback")}
                            </p>
                            {uploadedAt && (
                                <p style={{ ...sourceSerifBody, fontSize: "11.5px", fontWeight: 400, opacity: 0.7 }}>
                                    {t("profileSpace.linkedin.uploadedOn", {
                                        date: formatDate(uploadedAt, { month: "long", day: "numeric", year: "numeric" }),
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleDownload}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50"
                            style={ceremonialPillPrimary}
                        >
                            <Download className="w-3 h-3" />
                            {t("profileSpace.linkedin.download")}
                        </button>
                        <button
                            onClick={() => inputRef.current?.click()}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50"
                            style={ceremonialPill}
                        >
                            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            {t("profileSpace.linkedin.replace")}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50"
                            style={ceremonialPill}
                        >
                            <Trash2 className="w-3 h-3" />
                            {t("profileSpace.linkedin.remove")}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={busy || !userId}
                    className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50"
                    style={ceremonialPillPrimary}
                >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                    {busy ? t("profileSpace.linkedin.uploading") : t("profileSpace.linkedin.upload")}
                </button>
            )}

            {error && (
                <p className="mt-2" style={{ ...sourceSerifBody, fontSize: "12px", fontWeight: 500, color: "rgb(155, 40, 40)" }}>
                    {error}
                </p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
            />
        </section>
    );
};

export default LinkedInBlock;
