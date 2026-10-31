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
import { useTranslation } from "react-i18next";
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
    /** Save image only: the caller owns Share and Copy (the Share card has its own, via the one builder). */
    saveOnly?: boolean;
    /** The player's own link (from the one builder); the Telegram target uses it. Default: the site URL. */
    shareUrl?: string;
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
    saveOnly = false,
    shareUrl,
}: CardActionsProps) => {
    const { t } = useTranslation();
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
            toast({ title: t("cardActions.toast.captureFailed"), variant: "destructive" });
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
        //
        // Issue #267 (2026-10-31): the clone-only width mutation above
        // had a flaw. html2canvas sizes + crops the canvas from the LIVE
        // element's box (position and size on the page), then renders
        // its own clone. On desktop the clone was narrowed to 480px and
        // lost its ignored blocks (top shadow, buttons), so it laid out
        // somewhere else inside the page: the crop landed off the card
        // and the page background (plus the flat `backgroundColor`
        // fill) showed as a band down the left, a band across the top
        // and squares in the rounded corners. At 390px the card already
        // fits in 480px, so nothing moved and the image was clean.
        //
        // Fix: capture a STAGED COPY. We copy the card into an
        // off-screen fixed box, apply the final width, drop the
        // ignored blocks and reveal the QR there, then hand THAT
        // element to html2canvas. The box html2canvas measures is now
        // the box it renders, so the canvas is exactly the card. The
        // card carries its own solid fill and its own radius, and the
        // canvas behind it is transparent, so the rounded corners stay
        // clear instead of filling with a page colour.
        const captureToken = captureWidth
            ? `cap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            : null;

        const liveRect = el.getBoundingClientRect();
        const liveStyle = window.getComputedStyle(el);
        const stage = document.createElement("div");
        stage.setAttribute("aria-hidden", "true");
        stage.style.cssText =
            "position:fixed;left:-10000px;top:0;pointer-events:none;" +
            `width:${captureWidth ?? Math.round(liveRect.width)}px;`;
        const target = el.cloneNode(true) as HTMLElement;

        // cloneNode does not copy canvas pixels (the QR code); copy them
        // first, before any block is removed, so the indexes still match.
        const liveCanvases = el.querySelectorAll("canvas");
        const copyCanvases = target.querySelectorAll("canvas");
        liveCanvases.forEach((src, i) => {
            const dst = copyCanvases[i];
            if (!dst) return;
            dst.width = src.width;
            dst.height = src.height;
            dst.getContext("2d")?.drawImage(src, 0, 0);
        });

        // What html2canvas would skip, and what it reveals, is applied
        // here so the staged box is already its final size.
        target.querySelectorAll("[data-html2canvas-ignore]").forEach((n) => n.remove());
        target.querySelectorAll<HTMLElement>("[data-capture-only-qr]").forEach((qr) => {
            // Day 61: capture-only elements (the QR in RevelatoryHero's
            // brand footer) are parked offscreen + hidden in the live page.
            qr.style.position = "static";
            qr.style.visibility = "visible";
            qr.style.left = "auto";
            qr.style.top = "auto";
            qr.style.marginTop = "0.5rem";
        });

        // The card's own fill and radius. The live fill is the page-level
        // gradient + translucent glass, which html2canvas cannot paint, so
        // use the element's computed colour when it is opaque, else the
        // placement default. Never a page background.
        const computedFill = liveStyle.backgroundColor;
        const opaqueFill = /^rgb\(/.test(computedFill) ? computedFill : null;
        target.style.margin = "0";
        target.style.transform = "none";
        target.style.width = `${captureWidth ?? Math.round(liveRect.width)}px`;
        target.style.maxWidth = target.style.width;
        target.style.boxSizing = "border-box";
        target.style.overflow = "hidden";
        target.style.borderRadius = liveStyle.borderRadius;
        target.style.backgroundColor = opaqueFill ?? (darkMode ? "#0a162a" : "#fdf6e3");
        if (captureToken) {
            target.setAttribute("data-capture-token", captureToken);
        }
        stage.appendChild(target);
        // Next to the card, not in <body>: inherited type and the skin
        // tokens set on its ancestors still reach the copy.
        (el.parentElement ?? document.body).appendChild(stage);

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
            // Rendered on demand so Save can retry at a lower scale if the
            // first export comes back empty (see the retry below).
            const captureAtScale = (scale: number) => html2canvas(target, {
                scale,
                useCORS: true,
                logging: false,
                // Issue #267: transparent canvas. The card paints its own
                // fill inside its own rounded corners (set on `target`
                // above); a flat canvas colour filled the corners and any
                // gap around the card with a dark page-like colour.
                backgroundColor: null,
                // The staged box is position:fixed; render it against a
                // zero scroll so the box measured is the box drawn.
                scrollX: 0,
                scrollY: 0,
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
                    // Width, ignored blocks and the QR reveal are applied
                    // to the staged copy before capture (see above), so
                    // nothing here moves the card.
                },
            });
            // Day 62 (Sasha 2026-05-05): switched from data-URL anchor
            // download to Blob + object URL. Large PNGs (scale:2 hero
            // card) produce data URLs in the multi-MB range; Chrome &
            // Safari silently truncate downloads from oversized
            // `href="data:"` anchors → user gets a 0-byte file with no
            // error. Blob URLs have no size cap, so Save reliably
            // produces a real PNG even for tall portrait captures.
            const toBlobOf = (c: HTMLCanvasElement) =>
                new Promise<Blob | null>((resolve) =>
                    c.toBlob((b) => resolve(b), "image/png"),
                );
            // Day ... (2026-10-09, Sasha reported "Canvas produced no image
            // data" on the Top Talent reveal Save). That toast fires when
            // toBlob returns null. The reveal card has no cross-origin image,
            // so it isn't a tainted canvas — on Chrome a null blob here is an
            // OVERSIZED canvas: scale:2 on a long portrait reveal pushes the
            // bitmap past the browser's export limit. Render at scale:2 for
            // quality first; if the export is empty, re-render at scale:1
            // (a quarter of the pixels) so Save still produces a real PNG.
            // Cards that already export are untouched — they succeed on the
            // first pass and never reach the retry.
            let canvas = await captureAtScale(2);
            let blob = await toBlobOf(canvas);
            if (!blob) {
                console.warn(
                    "[CardActions] scale:2 export was empty (likely oversized canvas); retrying at scale:1",
                );
                canvas = await captureAtScale(1);
                blob = await toBlobOf(canvas);
            }
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
            toast({ title: t("cardActions.toast.saved") });
        } catch (err) {
            console.error("[CardActions] save failed:", err);
            toast({
                title: t("cardActions.toast.saveFailed"),
                description: err instanceof Error ? err.message : undefined,
                variant: "destructive",
            });
        } finally {
            // Cleanup: drop the staged copy (it carried the capture
            // token), whether the capture worked or not. The live card
            // was never touched.
            stage.remove();
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            toast({ title: t("cardActions.toast.copied") });
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: t("cardActions.toast.copyFailed"), variant: "destructive" });
        }
    };

    const encodedText = useMemo(() => encodeURIComponent(shareText), [shareText]);
    const siteUrl = encodeURIComponent(shareUrl || "https://findyourtoptalent.com");

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
    // Day 91 (Sasha 2026-06-09): tokenized for Aurum — the light-placement
    // navy inks read the skin ink tokens with the original literals as
    // fallbacks (Lapis pixel-identical; the dark-placement branch already
    // renders white-on-dark and needs no re-tone).
    const idle = darkMode ? "text-white/55" : "text-[color:var(--skin-ink-muted,rgba(26,30,58,0.55))]";
    const hover = darkMode ? "hover:text-white/85" : "hover:text-[color:var(--skin-ink-body,rgba(26,30,58,0.85))]";
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
                /* Issue #48 P2 #10: 11px uppercase tracked read as tiny —
                   bumped to a readable text-sm with lighter tracking. */
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm uppercase tracking-[0.08em] font-medium transition-all duration-200 ${idle} ${hover} ${buttonBg} disabled:opacity-50 disabled:cursor-wait`}
                aria-label={t("cardActions.save.ariaLabel")}
                title={t("cardActions.save.ariaLabel")}
            >
                {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{t("cardActions.save.label")}</span>
            </button>

            {/* divider dot */}
            {!saveOnly && <span aria-hidden="true" className={`text-xs ${idle}`}>·</span>}

            {/* Share Text */}
            {!saveOnly && <button
                ref={shareBtnRef}
                type="button"
                onClick={() => setShareOpen((o) => !o)}
                /* Issue #48 P2 #10: readable size (was text-[11px]). */
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm uppercase tracking-[0.08em] font-medium transition-all duration-200 ${idle} ${hover} ${buttonBg}`}
                aria-label={t("cardActions.share.ariaLabel")}
                aria-expanded={shareOpen}
                aria-haspopup="menu"
                title={t("cardActions.share.title")}
            >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t("cardActions.share.label")}</span>
            </button>}

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
                        background: "var(--skin-card-fill, rgba(255, 255, 255, 0.96))",
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
                            className="flex min-h-[40px] items-center gap-3 px-3 py-2 text-sm text-[color:var(--skin-ink-body,rgba(26,30,58,0.85))] hover:bg-[rgba(26,30,58,0.05)] transition-colors"
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
                        className="flex min-h-[40px] w-full items-center gap-3 px-3 py-2 text-sm text-[color:var(--skin-ink-body,rgba(26,30,58,0.85))] hover:bg-[rgba(26,30,58,0.05)] transition-colors border-t border-[color:var(--skin-hairline,rgba(26,30,58,0.08))]"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        ) : (
                            <Copy className="w-4 h-4 text-[#8460ea]" aria-hidden="true" />
                        )}
                        <span className="font-medium">{copied ? t("cardActions.copy.done") : t("cardActions.copy.label")}</span>
                    </button>
                </div>,
                document.body,
            )}
        </div>
    );
};

export default CardActions;
