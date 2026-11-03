import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Loader2, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { artifactName, getModuleArtifact } from "@/data/moduleArtifacts";
import ArtifactShareCard from "@/components/game/ArtifactShareCard";

/**
 * ArtifactShareAction: the quiet «Share» on a module's Final screen (module form §12.5b).
 *
 * Looks the module up in the artifact registry. No entry, no card: it renders nothing and the
 * Final screen is exactly what it was. With an entry, a small text action opens the card; the
 * card renders to a PNG in the browser (html2canvas, no server, no AI call, no database) and
 * leaves by download, or by the native share sheet where the device offers one for files.
 */

type Props = {
  moduleId: string;
  /** The player's one result line. */
  resultLine: string;
};

const CARD_EXPORT_WIDTH = 1080;

const ArtifactShareAction = ({ moduleId, resultLine }: Props) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"save" | "share" | null>(null);

  const artifact = getModuleArtifact(moduleId);
  if (!artifact) return null;

  const name = artifactName(artifact, i18n.language);
  const gameName = t("village.eyebrow", { defaultValue: "The Game of Being You" });
  const fileName = `${artifact.moduleId}-${artifact.name.en.toLowerCase().replace(/\s+/g, "-")}`;

  const render = async (): Promise<Blob> => {
    const el = cardRef.current;
    if (!el) throw new Error("card not mounted");
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, {
      scale: CARD_EXPORT_WIDTH / el.offsetWidth,
      useCORS: true,
      logging: false,
      backgroundColor: "#0a162a",
      imageTimeout: 15000,
    });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("empty image");
    return blob;
  };

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const fail = () => toast({ title: t("artifactCard.failed", { defaultValue: "Could not make the image. Try again." }), variant: "destructive" });

  const save = async () => {
    if (busy) return;
    setBusy("save");
    try {
      download(await render());
    } catch {
      fail();
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    if (busy) return;
    setBusy("share");
    try {
      const blob = await render();
      const file = new File([blob], `${fileName}.png`, { type: "image/png" });
      const data: ShareData = { files: [file], title: name, text: `${name}: ${resultLine}` };
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share(data);
      } else {
        // No native file sharing on this device: the download is the fallback.
        download(blob);
      }
    } catch (err) {
      // The player closing the share sheet is not an error.
      if (!(err instanceof DOMException && err.name === "AbortError")) fail();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <button type="button" className="mf__share" onClick={() => setOpen(true)}>
        <Share2 size={14} aria-hidden="true" />
        {t("artifactCard.share", { defaultValue: "Share" })}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(92vw,400px)] border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:text-white">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("artifactCard.description", { defaultValue: "Your artifact on a card you can save or send." })}
          </DialogDescription>
          <ArtifactShareCard ref={cardRef} artifact={artifact} artifactName={name} resultLine={resultLine} gameName={gameName} />
          <div className="mf__share-row">
            <button type="button" className="mf__share-btn" onClick={save} disabled={busy !== null}>
              {busy === "save" ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Download size={14} aria-hidden="true" />}
              {t("artifactCard.save", { defaultValue: "Save image" })}
            </button>
            <button type="button" className="mf__share-btn" onClick={share} disabled={busy !== null}>
              {busy === "share" ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
              {t("artifactCard.send", { defaultValue: "Send" })}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArtifactShareAction;
