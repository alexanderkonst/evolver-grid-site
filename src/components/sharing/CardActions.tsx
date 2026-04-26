import { useEffect, useMemo, useRef, useState } from "react";
import {
    Download,
    Share2,
    Copy,
    Check,
    Linkedin,
    Twitter,
    Send,
    Loader2,
} from "lucide-react";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

interface CardActionsProps {
    /**
     * Ref to the DOM element that should be captured as an image.
     * Usually the card container itself.
     */
    captureRef: React.RefObject<HTMLElement>;
    /** File name (without extension) for the downloaded image. Defaults to "my-top-talent". */
    fileName?: string;
    /** The text that gets shared to socials / copied to clipboard. */
    shareText: string;
    /** Subdued (true) for placement inside light cards; otherwise white-on-dark. */
    darkMode?: boolean;
}

/**
 * CardActions — minimal in-card Save + Share affordance.
 *
 * Replaces the old "Screenshot this. get yours →" prompt on the
 * Appleseed reveal card. Two small icon buttons:
 *
 *   [⬇ Save image]    [⬆ Share text]
 *
 * Save = directly downloads a PNG of the card via html2canvas (already
 * a project dependency, used elsewhere for the PDF flow). Share opens
 * a small popover with WhatsApp / Telegram / LinkedIn / X / Copy Text
 * options. No "expand-then-click" friction — both actions are one click.
 *
 * Sized small + low-opacity by default so it sits inside the card
 * without competing with the genius reveal above. Hover lifts opacity.
 */
const CardActions = ({
    captureRef,
    fileName = "my-top-talent",
    shareText,
    darkMode = false,
}: CardActionsProps) => {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close share popover on outside click
    useEffect(() => {
        if (!shareOpen) return;
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setShareOpen(false);
            }
        };
        // Defer one tick so the click that opened the popover doesn't immediately close it
        const id = window.setTimeout(() => {
            document.addEventListener("mousedown", handler);
        }, 0);
        return () => {
            window.clearTimeout(id);
            document.removeEventListener("mousedown", handler);
        };
    }, [shareOpen]);

    const handleSave = async () => {
        const el = captureRef.current;
        if (!el) {
            toast({ title: "Couldn't capture card — element not found", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null, // preserve transparency
            });
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${fileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Saved to Downloads" });
        } catch (err) {
            console.warn("[CardActions] save failed:", err);
            toast({ title: "Save failed — try again", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            toast({ title: "Copied to clipboard" });
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Copy failed", variant: "destructive" });
        }
    };

    const encodedText = useMemo(() => encodeURIComponent(shareText), [shareText]);
    const siteUrl = encodeURIComponent("https://findyourtoptalent.com");

    const shareLinks = useMemo(
        () => [
            { label: "WhatsApp", icon: Send, href: `https://wa.me/?text=${encodedText}` },
            { label: "Telegram", icon: Send, href: `https://t.me/share/url?url=${siteUrl}&text=${encodedText}` },
            { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}` },
            { label: "X (Twitter)", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodedText}` },
        ],
        [encodedText, siteUrl],
    );

    // Color tokens — adapt to dark/light card placement
    const idle = darkMode ? "text-white/55" : "text-[rgba(26,30,58,0.55)]";
    const hover = darkMode ? "hover:text-white/85" : "hover:text-[rgba(26,30,58,0.85)]";
    const buttonBg = darkMode
        ? "hover:bg-white/10"
        : "hover:bg-[rgba(26,30,58,0.05)]";

    return (
        <div className="relative inline-flex items-center justify-center gap-1">
            {/* Save Image */}
            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] font-medium transition-all duration-200 ${idle} ${hover} ${buttonBg} disabled:opacity-50 disabled:cursor-wait`}
                aria-label="Save card as image"
                title="Save card as image"
            >
                {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>Save</span>
            </button>

            {/* divider dot */}
            <span aria-hidden="true" className={`text-[10px] ${idle}`}>·</span>

            {/* Share Text */}
            <button
                type="button"
                onClick={() => setShareOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] font-medium transition-all duration-200 ${idle} ${hover} ${buttonBg}`}
                aria-label="Share to socials"
                aria-expanded={shareOpen}
                aria-haspopup="menu"
                title="Share text to socials"
            >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Share</span>
            </button>

            {/* Share popover */}
            {shareOpen && (
                <div
                    ref={popoverRef}
                    role="menu"
                    className="absolute top-full mt-2 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-50 min-w-[200px] rounded-xl liquid-glass shadow-lg overflow-hidden"
                    style={{
                        // Always-readable popover regardless of card palette
                        background: "rgba(255, 255, 255, 0.96)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        border: "1px solid rgba(26, 30, 58, 0.12)",
                    }}
                >
                    {shareLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            className="flex min-h-[40px] items-center gap-3 px-3 py-2 text-sm text-[rgba(26,30,58,0.85)] hover:bg-[rgba(26,30,58,0.05)] transition-colors"
                            onClick={() => setShareOpen(false)}
                        >
                            <link.icon className="w-4 h-4 text-[#8460ea]" aria-hidden="true" />
                            <span className="font-medium">{link.label}</span>
                        </a>
                    ))}
                    <button
                        type="button"
                        onClick={handleCopy}
                        role="menuitem"
                        className="flex min-h-[40px] w-full items-center gap-3 px-3 py-2 text-sm text-[rgba(26,30,58,0.85)] hover:bg-[rgba(26,30,58,0.05)] transition-colors border-t border-[rgba(26,30,58,0.08)]"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        ) : (
                            <Copy className="w-4 h-4 text-[#8460ea]" aria-hidden="true" />
                        )}
                        <span className="font-medium">{copied ? "Copied!" : "Copy text"}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default CardActions;
