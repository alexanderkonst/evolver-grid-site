import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LinkedInUploadProps {
  userId: string;
  pdfPath?: string | null;
  onUpdate: (path: string | null) => void;
}

const LinkedInUpload = ({ userId, pdfPath, onUpdate }: LinkedInUploadProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: t("linkedinUpload.invalidTypeTitle"), description: t("linkedinUpload.invalidTypeDescription"), variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const filePath = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("linkedin-profiles")
        .upload(filePath, file, { contentType: "application/pdf", upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("game_profiles")
        .update({
          linkedin_pdf_url: filePath,
          linkedin_extracted_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onUpdate(filePath);
      toast({ title: t("linkedinUpload.uploadedTitle") });
    } catch (error: any) {
      toast({
        title: t("linkedinUpload.uploadFailedTitle"),
        description: error.message || t("linkedinUpload.uploadFailedDescription"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleDownload = async () => {
    if (!pdfPath) return;
    const { data, error } = await supabase.storage
      .from("linkedin-profiles")
      .createSignedUrl(pdfPath, 60);

    if (error || !data?.signedUrl) {
      toast({ title: t("linkedinUpload.downloadFailedTitle"), variant: "destructive" });
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async () => {
    if (!pdfPath) return;
    setUploading(true);
    try {
      await supabase.storage.from("linkedin-profiles").remove([pdfPath]);
      await supabase
        .from("game_profiles")
        .update({ linkedin_pdf_url: null })
        .eq("user_id", userId);
      onUpdate(null);
      toast({ title: t("linkedinUpload.removedTitle") });
    } catch (error: any) {
      toast({
        title: t("linkedinUpload.deleteFailedTitle"),
        description: error.message || t("linkedinUpload.deleteFailedDescription"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#a4a3d0]/20 bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-[#a4a3d0]/20">
          <FileText className="w-5 h-5 text-[rgba(44,49,80,0.7)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2c3150]">{t("linkedinUpload.heading")}</h3>
          <p className="text-sm text-[#2c3150]/60">{t("linkedinUpload.subheading")}</p>
        </div>
      </div>

      {pdfPath ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            {t("linkedinUpload.imported")}
          </div>
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={uploading}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {t("linkedinUpload.viewPdf")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {t("linkedinUpload.replace")}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={uploading}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t("linkedinUpload.remove")}
          </Button>
        </div>
      ) : (
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <span className="premium-spinner w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
          {t("linkedinUpload.uploadPdf")}
        </Button>
      )}

      <button
        type="button"
        className="text-xs text-[#2c3150]/60 hover:text-[#2c3150]"
        onClick={() => setShowInstructions((prev) => !prev)}
      >
        {showInstructions ? t("linkedinUpload.hideInstructions") : t("linkedinUpload.showInstructions")}
      </button>

      {showInstructions && (
        <ol className="text-xs text-[rgba(44,49,80,0.7)] list-decimal list-inside space-y-1">
          <li>{t("linkedinUpload.step1")}</li>
          <li>{t("linkedinUpload.step2")}</li>
          <li>{t("linkedinUpload.step3")}</li>
          <li>{t("linkedinUpload.step4")}</li>
        </ol>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default LinkedInUpload;
