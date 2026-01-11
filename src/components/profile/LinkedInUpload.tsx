import { useRef, useState } from "react";
import { FileText, Loader2, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LinkedInUploadProps {
  userId: string;
  pdfPath?: string | null;
  onUpdate: (path: string | null) => void;
}

const LinkedInUpload = ({ userId, pdfPath, onUpdate }: LinkedInUploadProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file type", description: "Please upload a PDF file.", variant: "destructive" });
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
      toast({ title: "LinkedIn profile uploaded" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Unable to upload LinkedIn PDF.",
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
      toast({ title: "Unable to download file", variant: "destructive" });
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
      toast({ title: "LinkedIn profile removed" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Unable to remove LinkedIn PDF.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-slate-100">
          <FileText className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Add Your LinkedIn Profile</h3>
          <p className="text-sm text-slate-500">Upload a PDF export from LinkedIn.</p>
        </div>
      </div>

      {pdfPath ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            LinkedIn imported
          </div>
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={uploading}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
            Replace
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={uploading}>
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
      ) : (
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          Upload PDF
        </Button>
      )}

      <button
        type="button"
        className="text-xs text-slate-500 hover:text-slate-700"
        onClick={() => setShowInstructions((prev) => !prev)}
      >
        {showInstructions ? "Hide instructions" : "How to get your LinkedIn PDF"}
      </button>

      {showInstructions && (
        <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1">
          <li>Go to linkedin.com/in/your-profile</li>
          <li>Click the "More" button</li>
          <li>Select "Save to PDF"</li>
          <li>Upload the downloaded file here</li>
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
