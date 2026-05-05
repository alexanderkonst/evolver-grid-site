import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    /**
     * Day 61 (Sasha 2026-05-04 17:45): force a fixed pixel width on
     * the captured element during PNG export → produces a portrait
     * 9:16-ish PNG appropriate for Stories / Reels / TikTok regardless
     * of viewport. Without this, the captured card adopts whatever
     * width the live page provides (wide on desktop, narrow on mobile),
     * yielding inconsistent share artifacts. Recommended value: 480px.
     * Width is restored after capture in a try/finally — there's a
     * brief on-screen flash during the capture moment, acceptable for
     * the consistency win.
     */
    captureWidth?: number;
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
    captureWidth,
}: CardActionsProps) => {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const shareBtnRef = useRef<HTMLButtonElement>(null);
    // Day 51 night fix #1 (Sasha): the popover used to render inside the
    // captured card, which has overflow:hidden + rounded-3xl — that
    // clipped the menu to the bottom edge of the card so all the user
    // could see was a sliver of white. We now portal the popover to
    // document.body and position it via the share button's bounding rect.
    const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

    useLayoutEffect(() => {
        if (!shareOpen) {
            setPopoverPos(null);
            return;
        }
        const update = () => {
            const btn = shareBtnRef.current;
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            setPopoverPos({
                top: rect.bottom + 8,
                left: rect.left + rect.width / 2,
            });
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [shareOpen]);

    // Close share popover on outside click
    useEffect(() => {
        if (!shareOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (popoverRef.current && popoverRef.current.contains(target)) return;
            if (shareBtnRef.current && shareBtnRef.current.contains(target)) return;
            setShareOpen(false);
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

        // Day 61 (Sasha 2026-05-04 18:15): clone-only width mutation.
        //
        // Previous approach mutated the LIVE element's width during
        // capture — produced a brief on-screen "flash" as the card
        // briefly snapped to 480px and back. This version tags the
        // live element with a unique data attribute, then uses
        // html2canvas's onclone callback to find the CLONED version
        // (rendered offscreen, invisible to the user) and mutate the
        // clone's width. The live element's CSS is never touched —
        // no flash, no layout shift on screen. The data attribute is
        // removed from the live element after capture (cleanup).
        const captureToken = captureWidth
            ? `cap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            : null;
        if (captureToken) {
            el.setAttribute("data-capture-token", captureToken);
        }

        try {
            // Day 51 night fix #2 (Sasha): html2canvas was throwing on
            // `backdrop-filter` (used by `breathing-card backdrop-blur-md`)
            // and on running animations / transitions in the captured tree.
            // The onclone pass scrubs both in the cloned DOM (which is
            // discarded after capture — original card is untouched).
            // Solid background so the PNG isn't transparent on socials
            // that render PNGs over black (X/Twitter, dark Telegram).
            //
            // Day 61 (Sasha 2026-05-04 17:15): hard kill on Save —
            // "Failed to execute 'addColorStop' on 'CanvasGradient':
            // The provided double value is non-finite." This is
            // html2canvas choking on a gradient stop calculation.
            // Hypothesis: the brand torus's `filter: drop-shadow(...)`
            // (added Day 61 12:45 for the in-card brand footer) is
            // cascading into a NaN in html2canvas's filter+gradient
            // rasterization path. Extending the scrubber to ALSO strip
            // `filter` and `-webkit-filter` in the cloned DOM. Visual
            // cost: the captured PNG loses the soft glow on the brand
            // torus. Visual gain: every user who hits Save actually
            // gets a PNG instead of a destructive-toast dead-end.
            // Trade is correct — Save MUST work.
            //
            // SHIPPED, AWAITING SASHA VERIFICATION. If the addColorStop
            // error persists after deploy, the cause is NOT the torus
            // drop-shadow and we need to escalate to stripping more
            // (transforms, box-shadow, gradient backgrounds on
            // zero-sized elements). Test path: take quiz → reveal →
            // click Save → PNG downloads cleanly to ~/Downloads.
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: darkMode ? "#0a162a" : "#fdf6e3",
                imageTimeout: 15000,
                onclone: (clonedDoc) => {
                    const styleTag = clonedDoc.createElement("style");
                    styleTag.textContent = `
                        *, *::before, *::after {
                            animation: none !important;
                            transition: none !important;
                            backdrop-filter: none !important;
                            -webkit-backdrop-filter: none !important;
                            filter: none !important;
                            -webkit-filter: none !important;
                        }
                        /* Day 62 (Sasha 2026-05-05 10:30): html2canvas v1.4.1
                           crashes on any gradient where it can't resolve a
                           finite stop position — radial-gradient(ellipse at …)
                           without an explicit size, or a linear-gradient on a
                           pseudo-element whose layout box measures zero on a
                           given axis (NaN → addColorStop). Earlier pass only
                           stripped Tailwind arbitrary bg-gradient utility
                           classes; CSS-defined gradients on .liquid-glass-strong
                           ::before (border ring) and similar surfaces still
                           reached the rasterizer and aborted Save. Nuke
                           background-image on every descendant + every pseudo-
                           element within the captured subtree. Live page is
                           untouched (this only runs in the cloned DOM). */
                        [data-capture-token],
                        [data-capture-token] *,
                        [data-capture-token]::before,
                        [data-capture-token]::after,
                        [data-capture-token] *::before,
                        [data-capture-token] *::after {
                            background-image: none !important;
                            mask-image: none !important;
                            -webkit-mask-image: none !important;
                        }
                    `;
                    clonedDoc.head.appendChild(styleTag);

                    // Apply forced width to the CLONED element only
                    // (offscreen, invisible to user) → no on-screen
                    // flash, vertical PNG output preserved.
                    if (captureToken && captureWidth) {
                        const clonedEl = clonedDoc.querySelector(
                            `[data-capture-token="${captureToken}"]`,
                        ) as HTMLElement | null;
                        if (clonedEl) {
                            clonedEl.style.width = `${captureWidth}px`;
                            clonedEl.style.maxWidth = `${captureWidth}px`;
                        }
                    }

                    // Day 61 (Sasha 2026-05-04 19:45): reveal
                    // capture-only elements (e.g., QR code in
                    // RevelatoryHero brand footer). These elements
                    // live in the DOM positioned offscreen +
                    // visibility-hidden so they don't show in the
                    // live page, but ARE rendered with full layout
                    // (so html2canvas can capture them after this
                    // reset). Resetting position/visibility brings
                    // them back into the inline flow inside the
                    // captured clone — they appear in the saved PNG,
                    // never on the live page.
                    const captureOnlyEls = clonedDoc.querySelectorAll(
                        "[data-capture-only-qr]",
                    );
                    captureOnlyEls.forEach((el) => {
                        const html = el as HTMLElement;
                        html.style.position = "static";
                        html.style.visibility = "visible";
                        html.style.left = "auto";
                        html.style.top = "auto";
                        html.style.marginTop = "0.5rem";
                    });
                },
            });
            // Day 62 (Sasha 2026-05-05): switched from data-URL anchor
            // download to Blob + object URL. Large PNGs (scale:2 hero
            // card) produce data URLs in the multi-MB range; Chrome &
            // Safari silently truncate downloads from oversized
            // `href="data:"` anchors → user gets a 0-byte file with no
            // error. Blob URLs have no size cap, so Save reliably
            // produces a real PNG even for tall portrait captures.
            const blob: Blob | null = await new Promise((resolve) =>
                canvas.toBlob((b) => resolve(b), "image/png"),
            );
            if (!blob) {
                throw new Error("Canvas produced no image data");
            }
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `${fileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Revoke after the browser has had a tick to start the download.
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            toast({ title: "Saved to Downloads" });
        } catch (err) {
            console.error("[CardActions] save failed:", err);
            toast({
                title: "Save failed — try again",
                description: err instanceof Error ? err.message : undefined,
                variant: "destructive",
            });
        } finally {
            // Cleanup: remove the capture-token marker from the live
            // element regardless of capture success/failure. The
            // attribute is benign (empty data-* with no styling
            // attached) but tidiness matters.
            if (captureToken) {
                el.removeAttribute("data-capture-token");
            }
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
                ref={shareBtnRef}
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

            {/* Share popover — portaled to <body> so the card's
                overflow:hidden + rounded-3xl can't clip it. */}
            {shareOpen && popoverPos && createPortal(
                <div
                    ref={popoverRef}
                    role="menu"
                    className="z-[9999] min-w-[200px] rounded-xl shadow-lg overflow-hidden"
                    style={{
                        position: "fixed",
                        top: popoverPos.top,
                        left: popoverPos.left,
                        transform: "translateX(-50%)",
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
                </div>,
                document.body,
            )}
        </div>
    );
};

export default CardActions;
