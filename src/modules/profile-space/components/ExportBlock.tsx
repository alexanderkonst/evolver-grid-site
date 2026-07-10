import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateProfilePdf } from "@/modules/profile/generateProfilePdf";
import { cardShell, ceremonialPillPrimary, cormorantTitle, sourceSerifBody } from "./styles";

const ExportBlock = () => {
    const { t } = useTranslation();
    const [building, setBuilding] = useState(false);

    const handleDownload = async () => {
        if (building) return;
        setBuilding(true);
        try {
            await generateProfilePdf();
            toast.success(t("profileSpace.export.success"));
        } catch (err) {
            console.error("[ExportBlock] Profile PDF failed:", err);
            toast.error(t("profileSpace.export.failure"));
        } finally {
            setBuilding(false);
        }
    };

    return (
        <section style={cardShell} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Download className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.export.title")}
                </h2>
            </div>
            <p className="mb-4" style={{ ...sourceSerifBody, fontSize: "13px", fontWeight: 500 }}>
                {t("profileSpace.export.subtitle")}
            </p>
            <button
                onClick={handleDownload}
                disabled={building}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-70 disabled:cursor-wait"
                style={ceremonialPillPrimary}
            >
                {building ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {building ? t("profileSpace.export.building") : t("profileSpace.export.cta")}
            </button>
        </section>
    );
};

export default ExportBlock;
